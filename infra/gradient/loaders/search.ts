// Simple BM25 search over prompts and policy templates for local RAG

interface Document {
  id: string;
  content: string;
  type: string;
  metadata?: Record<string, any>;
}

interface SearchResult {
  id: string;
  score: number;
  content: string;
  type: string;
  metadata?: Record<string, any>;
}

export class LocalRAGSearch {
  private documents: Document[] = [];
  private termFrequencies: Map<string, Map<string, number>> = new Map();
  private documentFrequencies: Map<string, number> = new Map();
  private documentLengths: Map<string, number> = new Map();
  private averageDocumentLength: number = 0;

  constructor() {
    // Initialize with empty corpus
  }

  addDocument(
    id: string,
    content: string,
    type: string,
    metadata?: Record<string, any>
  ): void {
    const doc: Document = { id, content, type, metadata };
    this.documents.push(doc);
    this.updateIndex(doc);
  }

  addDocuments(docs: Document[]): void {
    for (const doc of docs) {
      this.addDocument(doc.id, doc.content, doc.type, doc.metadata);
    }
  }

  private updateIndex(doc: Document): void {
    const terms = this.tokenize(doc.content);
    const termCounts = new Map<string, number>();

    // Count term frequencies
    for (const term of terms) {
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    }

    // Update term frequencies
    this.termFrequencies.set(doc.id, termCounts);

    // Update document frequencies
    for (const term of new Set(terms)) {
      this.documentFrequencies.set(
        term,
        (this.documentFrequencies.get(term) || 0) + 1
      );
    }

    // Update document length
    this.documentLengths.set(doc.id, terms.length);

    // Update average document length
    this.averageDocumentLength =
      Array.from(this.documentLengths.values()).reduce((a, b) => a + b, 0) /
      this.documentLengths.size;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length > 2);
  }

  search(query: string, limit: number = 10, type?: string): SearchResult[] {
    const queryTerms = this.tokenize(query);
    const scores = new Map<string, number>();

    for (const doc of this.documents) {
      if (type && doc.type !== type) continue;

      let score = 0;
      const docTerms = this.termFrequencies.get(doc.id) || new Map();
      const docLength = this.documentLengths.get(doc.id) || 0;

      for (const term of queryTerms) {
        const tf = docTerms.get(term) || 0;
        const df = this.documentFrequencies.get(term) || 0;

        if (df === 0) continue;

        // BM25 formula
        const k1 = 1.2;
        const b = 0.75;
        const idf = Math.log((this.documents.length - df + 0.5) / (df + 0.5));
        const tfScore =
          (tf * (k1 + 1)) /
          (tf + k1 * (1 - b + b * (docLength / this.averageDocumentLength)));

        score += idf * tfScore;
      }

      if (score > 0) {
        scores.set(doc.id, score);
      }
    }

    // Sort by score and return top results
    return Array.from(scores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id, score]) => {
        const doc = this.documents.find((d) => d.id === id)!;
        return {
          id,
          score,
          content: doc.content,
          type: doc.type,
          metadata: doc.metadata,
        };
      });
  }

  // Specialized search methods
  searchPolicies(query: string, limit: number = 5): SearchResult[] {
    return this.search(query, limit, "policy");
  }

  searchPrompts(query: string, limit: number = 5): SearchResult[] {
    return this.search(query, limit, "prompt");
  }

  searchCompliance(query: string, limit: number = 5): SearchResult[] {
    return this.search(query, limit, "compliance");
  }

  // Load from KB
  loadFromKB(kb: any): void {
    // Load policy templates
    if (kb.policies?.templates) {
      for (const template of kb.policies.templates) {
        for (const section of template.sections) {
          this.addDocument(section.id, section.content, "policy", {
            template_id: template.id,
            section_name: section.name,
          });
        }
      }
    }

    // Load compliance frameworks
    if (kb.compliance?.frameworks) {
      for (const framework of kb.compliance.frameworks) {
        for (const control of framework.controls) {
          this.addDocument(
            control.id,
            `${control.name}: ${control.description}`,
            "compliance",
            {
              framework_id: framework.id,
              severity: control.severity,
              evidence_requirements: control.evidence_requirements,
            }
          );
        }
      }
    }

    // Load prompts
    const promptFiles = [
      "parsing.system.md",
      "audit.system.md",
      "answer.system.md",
      "receipt.system.md",
      "classifier.system.md",
      "copywriter.system.md",
    ];

    for (const promptFile of promptFiles) {
      // In a real implementation, you'd load these from the file system
      // For now, we'll add placeholder content
      this.addDocument(
        `prompt.${promptFile.replace(".system.md", "")}`,
        `System prompt for ${promptFile}`,
        "prompt",
        { filename: promptFile }
      );
    }
  }

  // Get document by ID
  getDocument(id: string): Document | undefined {
    return this.documents.find((doc) => doc.id === id);
  }

  // Get all documents of a type
  getDocumentsByType(type: string): Document[] {
    return this.documents.filter((doc) => doc.type === type);
  }

  // Get corpus statistics
  getStats(): {
    totalDocuments: number;
    averageLength: number;
    uniqueTerms: number;
  } {
    return {
      totalDocuments: this.documents.length,
      averageLength: this.averageDocumentLength,
      uniqueTerms: this.documentFrequencies.size,
    };
  }
}
