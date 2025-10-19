// Factory pattern for easy provider switching
// Single factory per agent that later swaps: local | gradient

export type LLMProvider = "local" | "gradient";
export type RAGProvider = "localKb" | "gradientKb";

export interface AgentFactory {
  createParsingAgent(): any;
  createAuditAgent(): any;
  createAnswerAgent(): any;
  createReceiptAgent(): any;
}

export interface ParsingAgent {
  parseCodebase(repoPath: string, config: any, metadata: any): Promise<any>;
}

export interface AuditAgent {
  auditCompliance(evidence: any[], frameworks?: string[]): Promise<any>;
}

export interface AnswerAgent {
  answerQuestion(question: string, context?: any): Promise<any>;
}

export interface ReceiptAgent {
  processReceiptsAndDrift(timeRange?: any): Promise<any>;
}

export class LocalAgentFactory implements AgentFactory {
  private kbPath: string;

  constructor(kbPath: string) {
    this.kbPath = kbPath;
  }

  createParsingAgent(): ParsingAgent {
    const { LocalParsingAgent } = require("./agents/parsing");
    return new LocalParsingAgent(this.kbPath);
  }

  createAuditAgent(): AuditAgent {
    const { LocalAuditAgent } = require("./agents/audit");
    return new LocalAuditAgent(this.kbPath);
  }

  createAnswerAgent(): AnswerAgent {
    const { LocalAnswerAgent } = require("./agents/answer");
    return new LocalAnswerAgent(this.kbPath);
  }

  createReceiptAgent(): ReceiptAgent {
    const { LocalReceiptAgent } = require("./agents/receipt");
    return new LocalReceiptAgent(this.kbPath);
  }
}

export class GradientAgentFactory implements AgentFactory {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string = "https://api.gradient.ai") {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  createParsingAgent(): ParsingAgent {
    const { GradientParsingAgent } = require("./agents/gradient-parsing");
    return new GradientParsingAgent(this.apiKey, this.apiUrl);
  }

  createAuditAgent(): AuditAgent {
    const { GradientAuditAgent } = require("./agents/gradient-audit");
    return new GradientAuditAgent(this.apiKey, this.apiUrl);
  }

  createAnswerAgent(): AnswerAgent {
    const { GradientAnswerAgent } = require("./agents/gradient-answer");
    return new GradientAnswerAgent(this.apiKey, this.apiUrl);
  }

  createReceiptAgent(): ReceiptAgent {
    const { GradientReceiptAgent } = require("./agents/gradient-receipt");
    return new GradientReceiptAgent(this.apiKey, this.apiUrl);
  }
}

// Configuration-based factory selector
export class AgentFactorySelector {
  static createFactory(
    llmProvider: LLMProvider,
    ragProvider: RAGProvider,
    config: {
      kbPath?: string;
      gradientApiKey?: string;
      gradientApiUrl?: string;
    }
  ): AgentFactory {
    if (llmProvider === "local" && ragProvider === "localKb") {
      if (!config.kbPath) {
        throw new Error("kbPath is required for local provider");
      }
      return new LocalAgentFactory(config.kbPath);
    }

    if (llmProvider === "gradient" && ragProvider === "gradientKb") {
      if (!config.gradientApiKey) {
        throw new Error("gradientApiKey is required for gradient provider");
      }
      return new GradientAgentFactory(
        config.gradientApiKey,
        config.gradientApiUrl
      );
    }

    throw new Error(
      `Unsupported provider combination: ${llmProvider} + ${ragProvider}`
    );
  }
}

// Environment-based factory creation
export function createAgentFactory(): AgentFactory {
  const llmProvider = (process.env.LLM_PROVIDER as LLMProvider) || "local";
  const ragProvider = (process.env.RAG_PROVIDER as RAGProvider) || "localKb";

  const config = {
    kbPath: process.env.KB_PATH || "./infra/gradient/kb",
    gradientApiKey: process.env.GRADIENT_API_KEY,
    gradientApiUrl: process.env.GRADIENT_API_URL || "https://api.gradient.ai",
  };

  return AgentFactorySelector.createFactory(llmProvider, ragProvider, config);
}

// Agent manager for easy access
export class AgentManager {
  private factory: AgentFactory;
  private agents: {
    parsing?: ParsingAgent;
    audit?: AuditAgent;
    answer?: AnswerAgent;
    receipt?: ReceiptAgent;
  } = {};

  constructor(factory: AgentFactory) {
    this.factory = factory;
  }

  getParsingAgent(): ParsingAgent {
    if (!this.agents.parsing) {
      this.agents.parsing = this.factory.createParsingAgent();
    }
    return this.agents.parsing;
  }

  getAuditAgent(): AuditAgent {
    if (!this.agents.audit) {
      this.agents.audit = this.factory.createAuditAgent();
    }
    return this.agents.audit;
  }

  getAnswerAgent(): AnswerAgent {
    if (!this.agents.answer) {
      this.agents.answer = this.factory.createAnswerAgent();
    }
    return this.agents.answer;
  }

  getReceiptAgent(): ReceiptAgent {
    if (!this.agents.receipt) {
      this.agents.receipt = this.factory.createReceiptAgent();
    }
    return this.agents.receipt;
  }

  async initializeAll(): Promise<void> {
    const initPromises = [];

    if (
      this.agents.parsing &&
      typeof this.agents.parsing.initialize === "function"
    ) {
      initPromises.push(this.agents.parsing.initialize());
    }

    if (
      this.agents.audit &&
      typeof this.agents.audit.initialize === "function"
    ) {
      initPromises.push(this.agents.audit.initialize());
    }

    if (
      this.agents.answer &&
      typeof this.agents.answer.initialize === "function"
    ) {
      initPromises.push(this.agents.answer.initialize());
    }

    if (
      this.agents.receipt &&
      typeof this.agents.receipt.initialize === "function"
    ) {
      initPromises.push(this.agents.receipt.initialize());
    }

    await Promise.all(initPromises);
  }
}

// Convenience function for getting agent manager
export function getAgentManager(): AgentManager {
  const factory = createAgentFactory();
  return new AgentManager(factory);
}

// Type-safe agent access
export interface AgentRegistry {
  parsing: ParsingAgent;
  audit: AuditAgent;
  answer: AnswerAgent;
  receipt: ReceiptAgent;
}

export function createAgentRegistry(): AgentRegistry {
  const manager = getAgentManager();

  return {
    parsing: manager.getParsingAgent(),
    audit: manager.getAuditAgent(),
    answer: manager.getAnswerAgent(),
    receipt: manager.getReceiptAgent(),
  };
}
