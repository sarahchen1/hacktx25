// Local Answer Agent
// Local RAG over compiled Policy + privacy_policies.yaml

import { KBLoader } from "../loaders/kb";
import { LocalRAGSearch } from "../loaders/search";

export interface AnswerResult {
  answer: string;
  sources: string[];
  confidence: number;
}

export class LocalAnswerAgent {
  private kb: any;
  private kbLoader: KBLoader;
  private search: LocalRAGSearch;

  constructor(kbPath: string) {
    this.kbLoader = new KBLoader(kbPath);
    this.search = new LocalRAGSearch();
  }

  async initialize(): Promise<void> {
    this.kb = await this.kbLoader.load();
    this.search.loadFromKB(this.kb);
  }

  async answerQuestion(question: string, context?: any): Promise<AnswerResult> {
    // Search for relevant information
    const searchResults = this.search.search(question, 5);

    if (searchResults.length === 0) {
      return {
        answer:
          "I don't have enough information to answer that question. Please contact our privacy team for assistance.",
        sources: [],
        confidence: 0.1,
      };
    }

    // Generate answer based on search results
    const answer = this.generateAnswer(question, searchResults, context);
    const sources = searchResults.map((r) => r.id);
    const confidence = this.calculateConfidence(searchResults);

    return {
      answer,
      sources,
      confidence,
    };
  }

  private generateAnswer(
    question: string,
    searchResults: any[],
    context?: any
  ): string {
    const questionLower = question.toLowerCase();

    // Handle specific question types
    if (
      questionLower.includes("what data") ||
      questionLower.includes("collect")
    ) {
      return this.answerDataCollection(question, searchResults);
    }

    if (
      questionLower.includes("how do you use") ||
      questionLower.includes("purpose")
    ) {
      return this.answerDataUsage(question, searchResults);
    }

    if (
      questionLower.includes("share") ||
      questionLower.includes("third party")
    ) {
      return this.answerDataSharing(question, searchResults);
    }

    if (
      questionLower.includes("rights") ||
      questionLower.includes("access") ||
      questionLower.includes("delete")
    ) {
      return this.answerUserRights(question, searchResults);
    }

    if (
      questionLower.includes("security") ||
      questionLower.includes("protect")
    ) {
      return this.answerSecurity(question, searchResults);
    }

    if (questionLower.includes("retention") || questionLower.includes("keep")) {
      return this.answerRetention(question, searchResults);
    }

    // Generic answer based on search results
    return this.generateGenericAnswer(question, searchResults);
  }

  private answerDataCollection(question: string, searchResults: any[]): string {
    const policyResults = searchResults.filter((r) => r.type === "policy");
    const dataTypes = this.kb.policies.placeholders?.data_types || [];

    let answer = "We collect the following types of information:\n\n";

    for (const dataType of dataTypes) {
      answer += `• ${dataType}\n`;
    }

    if (policyResults.length > 0) {
      answer +=
        "\nThis information is collected through direct user input, API calls, and automated data collection processes.";
    }

    return answer;
  }

  private answerDataUsage(question: string, searchResults: any[]): string {
    const policyResults = searchResults.filter((r) => r.type === "policy");
    const purposes = this.kb.policies.placeholders?.purposes || [];

    let answer = "We use your information for the following purposes:\n\n";

    for (const purpose of purposes) {
      answer += `• ${purpose}\n`;
    }

    if (question.toLowerCase().includes("transaction")) {
      answer +=
        "\nSpecifically for transaction data, we use it to provide budgeting insights, categorize your spending, and help you track your financial goals. You can control this usage through the settings in your account.";
    }

    return answer;
  }

  private answerDataSharing(question: string, searchResults: any[]): string {
    return "We do not sell your personal information. We may share your information with trusted service providers who help us operate our platform, payment processors for transaction processing, and legal authorities when required by law. All data sharing is done under strict data protection agreements.";
  }

  private answerUserRights(question: string, searchResults: any[]): string {
    const rights = this.kb.policies.placeholders?.rights_list || [];

    let answer =
      "You have the following rights regarding your personal information:\n\n";

    for (const right of rights) {
      answer += `• ${right}\n`;
    }

    answer +=
      "\nTo exercise these rights, please contact us at privacy@openledger.com. We will respond to your request within 30 days.";

    return answer;
  }

  private answerSecurity(question: string, searchResults: any[]): string {
    const securityMeasures =
      this.kb.policies.placeholders?.security_measures || [];

    let answer =
      "We implement the following security measures to protect your data:\n\n";

    for (const measure of securityMeasures) {
      answer += `• ${measure}\n`;
    }

    answer +=
      "\nAll data is encrypted both in transit and at rest, and we regularly conduct security audits and penetration testing.";

    return answer;
  }

  private answerRetention(question: string, searchResults: any[]): string {
    return "We retain personal data only as long as necessary for the purposes for which it was collected. Account data is retained until account deletion or 3 years of inactivity. Transaction data is retained for 7 years for tax and regulatory compliance. Analytics data is retained for 2 years in aggregated form.";
  }

  private generateGenericAnswer(
    question: string,
    searchResults: any[]
  ): string {
    if (searchResults.length === 0) {
      return "I don't have specific information about that topic. Please contact our privacy team for more details.";
    }

    // Use the most relevant search result
    const bestResult = searchResults[0];

    if (bestResult.type === "policy") {
      return `Based on our privacy policy: ${bestResult.content}`;
    }

    if (bestResult.type === "compliance") {
      return `According to our compliance framework: ${bestResult.content}`;
    }

    return `Based on our records: ${bestResult.content}`;
  }

  private calculateConfidence(searchResults: any[]): number {
    if (searchResults.length === 0) return 0.1;

    // Base confidence on search result scores and number of results
    const avgScore =
      searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length;
    const resultCount = Math.min(searchResults.length, 5);

    // Normalize score (assuming BM25 scores are typically 0-10)
    const normalizedScore = Math.min(avgScore / 10, 1);

    // Combine with result count factor
    const countFactor = resultCount / 5;

    return Math.min(normalizedScore * 0.7 + countFactor * 0.3, 1.0);
  }

  // Specialized search methods
  async searchPolicies(query: string): Promise<AnswerResult> {
    const results = this.search.searchPolicies(query, 3);

    if (results.length === 0) {
      return {
        answer: "No relevant policy information found.",
        sources: [],
        confidence: 0.1,
      };
    }

    const answer = results.map((r) => r.content).join("\n\n");
    const sources = results.map((r) => r.id);
    const confidence = this.calculateConfidence(results);

    return { answer, sources, confidence };
  }

  async searchCompliance(query: string): Promise<AnswerResult> {
    const results = this.search.searchCompliance(query, 3);

    if (results.length === 0) {
      return {
        answer: "No relevant compliance information found.",
        sources: [],
        confidence: 0.1,
      };
    }

    const answer = results.map((r) => r.content).join("\n\n");
    const sources = results.map((r) => r.id);
    const confidence = this.calculateConfidence(results);

    return { answer, sources, confidence };
  }

  // Get FAQ-style answers
  getFAQAnswer(question: string): AnswerResult {
    const faqAnswers: Record<string, string> = {
      "how do you use my transaction data":
        "We use your transaction data to provide budgeting insights, categorize your spending, and help you track your financial goals. You can control this usage through the settings in your account.",
      "can i delete my account":
        "Yes, you can delete your account at any time. We will securely delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.",
      "do you sell my personal information":
        "No, we do not sell your personal information. We only share your data with trusted service providers who help us operate our platform, and only under strict data protection agreements.",
      "how do you protect my data":
        "We use industry-standard encryption, regular security audits, and strict access controls to protect your data. All data is encrypted both in transit and at rest.",
      "can i export my data":
        "Yes, you have the right to receive a copy of your personal data in a structured, machine-readable format. You can request this through your account settings or by contacting us.",
    };

    const questionKey = question.toLowerCase().trim();

    for (const [key, answer] of Object.entries(faqAnswers)) {
      if (questionKey.includes(key)) {
        return {
          answer,
          sources: ["faq"],
          confidence: 0.9,
        };
      }
    }

    return this.answerQuestion(question);
  }
}
