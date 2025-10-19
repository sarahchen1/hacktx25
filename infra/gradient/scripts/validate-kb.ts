#!/usr/bin/env tsx
// KB Validation Script
// Validates all YAML files against schema.json

import { promises as fs } from "fs";
import path from "path";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: any[];
}

async function validateKB(): Promise<void> {
  const kbPath = path.join(__dirname, "../kb");
  const schemaPath = path.join(kbPath, "schema.json");

  console.log("🔍 Validating Knowledge Base...");

  // Load schema
  const schemaContent = await fs.readFile(schemaPath, "utf-8");
  const schema = JSON.parse(schemaContent);

  // Files to validate
  const files = [
    "rules.yaml",
    "compliance_frameworks.yaml",
    "privacy_policies.yaml",
  ];

  const results: ValidationResult[] = [];

  for (const file of files) {
    const filePath = path.join(kbPath, file);
    const result = await validateFile(filePath, schema);
    results.push(result);
  }

  // Print results
  let hasErrors = false;

  for (const result of results) {
    if (result.valid) {
      console.log(`✅ ${result.file} is valid`);
    } else {
      console.log(`❌ ${result.file} has errors:`);
      for (const error of result.errors) {
        console.log(`   - ${error.message}`);
        if (error.dataPath) {
          console.log(`     Path: ${error.dataPath}`);
        }
      }
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.log("\n❌ Validation failed");
    process.exit(1);
  } else {
    console.log("\n✅ All files are valid");
  }
}

async function validateFile(
  filePath: string,
  schema: any
): Promise<ValidationResult> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const data = yaml.load(content);

    // Create specific schema for each file type
    let fileSchema: any;
    const fileName = path.basename(filePath);

    if (fileName === "rules.yaml") {
      fileSchema = {
        type: "object",
        properties: {
          version: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          taxonomies: schema.definitions?.taxonomies || {},
          detectors: schema.definitions?.detectors || {},
          mapping: schema.definitions?.mapping || {},
          examples: schema.definitions?.examples || {},
        },
        required: ["version", "created_at"],
      };
    } else if (fileName === "compliance_frameworks.yaml") {
      fileSchema = {
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
    } else if (fileName === "privacy_policies.yaml") {
      fileSchema = {
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
    } else {
      throw new Error(`Unknown file type: ${fileName}`);
    }

    const validate = ajv.compile(fileSchema);
    const valid = validate(data);

    return {
      file: fileName,
      valid,
      errors: validate.errors || [],
    };
  } catch (error) {
    return {
      file: path.basename(filePath),
      valid: false,
      errors: [{ message: error.message }],
    };
  }
}

// Run validation if called directly
if (require.main === module) {
  validateKB().catch((error) => {
    console.error("Validation failed:", error);
    process.exit(1);
  });
}
