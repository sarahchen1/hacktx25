// Knowledge Base Loader
// Loads YAML files, validates with schema.json, builds in-memory index

import { promises as fs } from "fs";
import path from "path";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export interface KBIndex {
  byId: Map<string, any>;
  byTag: Map<string, Set<string>>;
  byType: Map<string, Set<string>>;
}

export interface LoadedKB {
  rules: any;
  compliance: any;
  policies: any;
  schema: any;
  index: KBIndex;
}

export class KBLoader {
  private kbPath: string;
  private schema: any;

  constructor(kbPath: string) {
    this.kbPath = kbPath;
  }

  async load(): Promise<LoadedKB> {
    // Load schema first
    const schemaPath = path.join(this.kbPath, "schema.json");
    const schemaContent = await fs.readFile(schemaPath, "utf-8");
    this.schema = JSON.parse(schemaContent);

    // Load all YAML files
    const [rules, compliance, policies] = await Promise.all([
      this.loadYAML("rules.yaml"),
      this.loadYAML("compliance_frameworks.yaml"),
      this.loadYAML("privacy_policies.yaml"),
    ]);

    // Validate against schema
    this.validate(rules, "rules");
    this.validate(compliance, "compliance");
    this.validate(policies, "policies");

    // Build index
    const index = this.buildIndex(rules, compliance, policies);

    return {
      rules,
      compliance,
      policies,
      schema: this.schema,
      index,
    };
  }

  private async loadYAML(filename: string): Promise<any> {
    const filePath = path.join(this.kbPath, filename);
    const content = await fs.readFile(filePath, "utf-8");
    return yaml.load(content);
  }

  private validate(data: any, type: string): void {
    // Create a schema for the specific type
    let schema: any;

    switch (type) {
      case "rules":
        schema = {
          type: "object",
          properties: {
            version: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            taxonomies: this.schema.definitions?.taxonomies || {},
            detectors: this.schema.definitions?.detectors || {},
            mapping: this.schema.definitions?.mapping || {},
            examples: this.schema.definitions?.examples || {},
          },
          required: ["version", "created_at"],
        };
        break;
      case "compliance":
        schema = {
          type: "object",
          properties: {
            version: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            frameworks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  jurisdiction: { type: "string" },
                  version: { type: "string" },
                  controls: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        evidence_requirements: { type: "array" },
                        severity: {
                          type: "string",
                          enum: ["low", "medium", "high", "critical"],
                        },
                        weight: { type: "number" },
                      },
                      required: [
                        "id",
                        "name",
                        "description",
                        "severity",
                        "weight",
                      ],
                    },
                  },
                  scoring: {
                    type: "object",
                    properties: {
                      method: { type: "string" },
                      thresholds: { type: "object" },
                    },
                  },
                },
                required: ["id", "name", "jurisdiction", "controls", "scoring"],
              },
            },
          },
          required: ["version", "created_at", "frameworks"],
        };
        break;
      case "policies":
        schema = {
          type: "object",
          properties: {
            version: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            templates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  jurisdictions: { type: "array" },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        placeholders: { type: "array" },
                        content: { type: "string" },
                      },
                      required: ["id", "name", "content"],
                    },
                  },
                },
                required: ["id", "name", "sections"],
              },
            },
            placeholders: { type: "object" },
          },
          required: ["version", "created_at", "templates"],
        };
        break;
      default:
        throw new Error(`Unknown type: ${type}`);
    }

    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      console.error(`Validation errors for ${type}:`, validate.errors);
      throw new Error(
        `Invalid ${type} data: ${JSON.stringify(validate.errors)}`
      );
    }
  }

  private buildIndex(rules: any, compliance: any, policies: any): KBIndex {
    const byId = new Map<string, any>();
    const byTag = new Map<string, Set<string>>();
    const byType = new Map<string, Set<string>>();

    // Index rules
    if (rules.taxonomies?.pii) {
      for (const pii of rules.taxonomies.pii) {
        byId.set(pii.id, pii);
        this.addToTypeIndex(byType, "PII", pii.id);
        this.addToTagIndex(byTag, pii.sensitivity, pii.id);
      }
    }

    if (rules.detectors) {
      for (const detector of rules.detectors) {
        byId.set(detector.id, detector);
        this.addToTypeIndex(byType, "DETECTOR", detector.id);
        this.addToTagIndex(byTag, detector.type, detector.id);
        for (const piiTag of detector.pii_tags || []) {
          this.addToTagIndex(byTag, piiTag, detector.id);
        }
      }
    }

    if (rules.mapping) {
      for (const rule of rules.mapping) {
        byId.set(rule.id, rule);
        this.addToTypeIndex(byType, "RULE", rule.id);
        this.addToTagIndex(byTag, rule.purpose, rule.id);
        this.addToTagIndex(byTag, rule.data_category, rule.id);
      }
    }

    if (rules.examples) {
      for (const example of rules.examples) {
        byId.set(example.id, example);
        this.addToTypeIndex(byType, "EXAMPLE", example.id);
        this.addToTagIndex(byTag, example.rule_id, example.id);
      }
    }

    // Index compliance frameworks
    if (compliance.frameworks) {
      for (const framework of compliance.frameworks) {
        byId.set(framework.id, framework);
        this.addToTypeIndex(byType, "FRAMEWORK", framework.id);
        this.addToTagIndex(byTag, framework.jurisdiction, framework.id);

        for (const control of framework.controls) {
          byId.set(control.id, control);
          this.addToTypeIndex(byType, "CONTROL", control.id);
          this.addToTagIndex(byTag, framework.id, control.id);
          this.addToTagIndex(byTag, control.severity, control.id);
        }
      }
    }

    // Index policy templates
    if (policies.templates) {
      for (const template of policies.templates) {
        byId.set(template.id, template);
        this.addToTypeIndex(byType, "TEMPLATE", template.id);
        for (const jurisdiction of template.jurisdictions || []) {
          this.addToTagIndex(byTag, jurisdiction, template.id);
        }

        for (const section of template.sections) {
          byId.set(section.id, section);
          this.addToTypeIndex(byType, "SECTION", section.id);
          this.addToTagIndex(byTag, template.id, section.id);
        }
      }
    }

    return { byId, byTag, byType };
  }

  private addToTypeIndex(
    byType: Map<string, Set<string>>,
    type: string,
    id: string
  ): void {
    if (!byType.has(type)) {
      byType.set(type, new Set());
    }
    byType.get(type)!.add(id);
  }

  private addToTagIndex(
    byTag: Map<string, Set<string>>,
    tag: string,
    id: string
  ): void {
    if (!byTag.has(tag)) {
      byTag.set(tag, new Set());
    }
    byTag.get(tag)!.add(id);
  }

  // Query methods
  getById(id: string): any {
    return this.index?.byId.get(id);
  }

  getByType(type: string): string[] {
    return Array.from(this.index?.byType.get(type) || []);
  }

  getByTag(tag: string): string[] {
    return Array.from(this.index?.byTag.get(tag) || []);
  }

  findDetectorsForPII(piiTag: string): string[] {
    return this.getByTag(piiTag).filter((id) => id.startsWith("DETECTOR."));
  }

  findRulesForPurpose(purpose: string): string[] {
    return this.getByTag(purpose).filter((id) => id.startsWith("RULE."));
  }

  findControlsForFramework(frameworkId: string): string[] {
    return this.getByTag(frameworkId).filter(
      (id) =>
        id.startsWith("GDPR.") ||
        id.startsWith("CCPA.") ||
        id.startsWith("GLBA.")
    );
  }
}
