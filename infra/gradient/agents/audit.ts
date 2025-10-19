// Local Audit Agent
// Consumes Evidence[], maps to controls, emits Findings[] and Score

import { KBLoader } from "../loaders/kb";

export interface Finding {
  id: string;
  control_id: string;
  evidence_ids: string[];
  severity: "low" | "medium" | "high" | "critical";
  rationale: string;
}

export interface Score {
  framework_id: string;
  total: number;
  breakdown: Array<{
    control_id: string;
    score: number;
    weight: number;
  }>;
}

export interface AuditResult {
  findings: Finding[];
  scores: Score[];
  policy_generated?: string;
}

export class LocalAuditAgent {
  private kb: any;
  private kbLoader: KBLoader;

  constructor(kbPath: string) {
    this.kbLoader = new KBLoader(kbPath);
  }

  async initialize(): Promise<void> {
    this.kb = await this.kbLoader.load();
  }

  async auditCompliance(
    evidence: any[],
    frameworks: string[] = ["GDPR", "CCPA", "GLBA"]
  ): Promise<AuditResult> {
    const findings: Finding[] = [];
    const scores: Score[] = [];

    for (const frameworkId of frameworks) {
      const framework = this.kb.compliance.frameworks.find(
        (f: any) => f.id === frameworkId
      );
      if (!framework) continue;

      const frameworkFindings = this.auditFramework(evidence, framework);
      findings.push(...frameworkFindings);

      const score = this.calculateScore(frameworkFindings, framework);
      scores.push(score);
    }

    const policyGenerated = this.generatePolicy(evidence, findings);

    return {
      findings,
      scores,
      policy_generated: policyGenerated,
    };
  }

  private auditFramework(evidence: any[], framework: any): Finding[] {
    const findings: Finding[] = [];

    for (const control of framework.controls) {
      const controlFindings = this.auditControl(evidence, control, framework);
      findings.push(...controlFindings);
    }

    return findings;
  }

  private auditControl(
    evidence: any[],
    control: any,
    framework: any
  ): Finding[] {
    const findings: Finding[] = [];
    const relevantEvidence = this.findRelevantEvidence(evidence, control);

    if (relevantEvidence.length === 0) {
      // No evidence found - this could be a finding if the control is critical
      if (control.severity === "critical" || control.severity === "high") {
        findings.push({
          id: `FINDING.${control.id}.NO_EVIDENCE`,
          control_id: control.id,
          evidence_ids: [],
          severity: control.severity,
          rationale: `No evidence found for required control: ${control.name}`,
        });
      }
      return findings;
    }

    // Check if evidence meets requirements
    const complianceStatus = this.checkCompliance(control, relevantEvidence);

    if (!complianceStatus.compliant) {
      findings.push({
        id: `FINDING.${control.id}.NON_COMPLIANT`,
        control_id: control.id,
        evidence_ids: relevantEvidence.map((e: any) => e.id),
        severity: this.determineSeverity(control, complianceStatus),
        rationale: complianceStatus.rationale,
      });
    }

    return findings;
  }

  private findRelevantEvidence(evidence: any[], control: any): any[] {
    const relevant: any[] = [];

    for (const ev of evidence) {
      // Check if evidence is relevant to this control
      if (this.isEvidenceRelevant(ev, control)) {
        relevant.push(ev);
      }
    }

    return relevant;
  }

  private isEvidenceRelevant(evidence: any, control: any): boolean {
    // Map control IDs to evidence types
    const controlMappings: Record<string, string[]> = {
      "GDPR.A6": ["PII.EMAIL", "PII.PHONE", "PII.NAME", "PII.SSN"],
      "GDPR.A7": ["PII.SSN", "PII.FINANCIAL"],
      "GDPR.A25": ["PII.EMAIL", "PII.PHONE", "PII.NAME"],
      "GDPR.A32": ["localStorage", "sessionStorage"],
      "GDPR.A13": ["PII.EMAIL", "PII.PHONE", "PII.NAME"],
      "GDPR.A17": ["PII.EMAIL", "PII.PHONE", "PII.NAME"],
      "GDPR.A20": ["PII.EMAIL", "PII.PHONE", "PII.NAME"],
      "CCPA.1798.100": ["PII.EMAIL", "PII.PHONE", "PII.NAME"],
      "CCPA.1798.105": ["PII.EMAIL", "PII.PHONE", "PII.NAME"],
      "CCPA.1798.120": ["PII.EMAIL", "PII.PHONE", "PII.NAME"],
      "CCPA.1798.130": ["PII.EMAIL", "PII.PHONE", "PII.NAME"],
      "GLBA.6802": ["PII.FINANCIAL", "PII.SSN"],
      "GLBA.6803": ["PII.FINANCIAL", "PII.SSN"],
      "GLBA.6801": ["PII.FINANCIAL", "PII.SSN"],
    };

    const relevantTags = controlMappings[control.id] || [];

    // Check if evidence has relevant PII tags
    for (const tag of evidence.pii_tags || []) {
      if (relevantTags.includes(tag)) {
        return true;
      }
    }

    // Check if evidence has relevant data sinks
    for (const sink of evidence.data_sinks || []) {
      if (relevantTags.includes(sink)) {
        return true;
      }
    }

    return false;
  }

  private checkCompliance(
    control: any,
    evidence: any[]
  ): { compliant: boolean; rationale: string } {
    // Check evidence requirements
    const requirements = control.evidence_requirements || [];

    for (const requirement of requirements) {
      const hasRequirement = this.checkRequirement(requirement, evidence);
      if (!hasRequirement) {
        return {
          compliant: false,
          rationale: `Missing requirement: ${requirement}`,
        };
      }
    }

    // Check for specific compliance issues
    if (control.id === "GDPR.A6") {
      // Check for lawful basis
      const hasLawfulBasis = evidence.some(
        (e: any) =>
          e.snippet.includes("consent") || e.snippet.includes("contract")
      );
      if (!hasLawfulBasis) {
        return {
          compliant: false,
          rationale: "No documented lawful basis for processing personal data",
        };
      }
    }

    if (control.id === "GDPR.A32") {
      // Check for security measures
      const hasSecurity = evidence.some(
        (e: any) => e.snippet.includes("encrypt") || e.snippet.includes("hash")
      );
      if (!hasSecurity) {
        return {
          compliant: false,
          rationale:
            "No evidence of appropriate security measures for personal data",
        };
      }
    }

    if (control.id === "GDPR.A7") {
      // Check for consent mechanisms
      const hasConsent = evidence.some(
        (e: any) =>
          e.snippet.includes("consent") || e.snippet.includes("opt-in")
      );
      if (!hasConsent) {
        return {
          compliant: false,
          rationale:
            "No evidence of proper consent mechanisms for sensitive data",
        };
      }
    }

    return {
      compliant: true,
      rationale: "Evidence meets compliance requirements",
    };
  }

  private checkRequirement(requirement: string, evidence: any[]): boolean {
    const requirementLower = requirement.toLowerCase();

    for (const ev of evidence) {
      const snippetLower = ev.snippet.toLowerCase();

      if (
        requirementLower.includes("consent") &&
        snippetLower.includes("consent")
      ) {
        return true;
      }
      if (
        requirementLower.includes("encryption") &&
        snippetLower.includes("encrypt")
      ) {
        return true;
      }
      if (
        requirementLower.includes("access control") &&
        snippetLower.includes("auth")
      ) {
        return true;
      }
      if (
        requirementLower.includes("privacy notice") &&
        snippetLower.includes("privacy")
      ) {
        return true;
      }
    }

    return false;
  }

  private determineSeverity(
    control: any,
    complianceStatus: any
  ): "low" | "medium" | "high" | "critical" {
    // Base severity on control severity and compliance status
    if (complianceStatus.rationale.includes("No documented lawful basis")) {
      return "critical";
    }
    if (
      complianceStatus.rationale.includes("No evidence of appropriate security")
    ) {
      return "critical";
    }
    if (complianceStatus.rationale.includes("No evidence of proper consent")) {
      return "critical";
    }

    return control.severity as "low" | "medium" | "high" | "critical";
  }

  private calculateScore(findings: Finding[], framework: any): Score {
    const breakdown: Array<{
      control_id: string;
      score: number;
      weight: number;
    }> = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const control of framework.controls) {
      const controlFindings = findings.filter(
        (f) => f.control_id === control.id
      );
      const hasFindings = controlFindings.length > 0;

      let score = 100; // Start with perfect score

      if (hasFindings) {
        // Deduct points based on severity of findings
        for (const finding of controlFindings) {
          switch (finding.severity) {
            case "critical":
              score -= 50;
              break;
            case "high":
              score -= 30;
              break;
            case "medium":
              score -= 15;
              break;
            case "low":
              score -= 5;
              break;
          }
        }
      }

      score = Math.max(0, score); // Don't go below 0

      breakdown.push({
        control_id: control.id,
        score,
        weight: control.weight,
      });

      totalWeightedScore += score * control.weight;
      totalWeight += control.weight;
    }

    const total =
      totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

    return {
      framework_id: framework.id,
      total,
      breakdown,
    };
  }

  private generatePolicy(evidence: any[], findings: Finding[]): string {
    const template = this.kb.policies.templates.find(
      (t: any) => t.id === "POLICY.TEMPLATE.STANDARD"
    );
    if (!template) {
      return "No policy template found";
    }

    // Extract data types from evidence
    const dataTypes = new Set<string>();
    const purposes = new Set<string>();

    for (const ev of evidence) {
      for (const tag of ev.pii_tags || []) {
        const pii = this.kb.rules.taxonomies?.pii?.find(
          (p: any) => p.id === tag
        );
        if (pii) {
          dataTypes.add(pii.name);
        }
      }

      const rule = this.kb.rules.mapping?.find((r: any) => r.id === ev.rule_id);
      if (rule) {
        purposes.add(rule.purpose);
      }
    }

    // Generate policy sections
    let policy = "# Privacy Policy\n\n";

    for (const section of template.sections) {
      policy += `## ${section.name}\n\n`;

      let content = section.content;

      // Replace placeholders
      if (section.id === "POLICY.SECTION.DATA_COLLECTION") {
        content = content.replace(
          "{data_types}",
          Array.from(dataTypes).join(", ")
        );
        content = content.replace(
          "{collection_methods}",
          "Direct user input, API calls, and automated data collection"
        );
        content = content.replace(
          "{legal_basis}",
          "Legitimate interest for service provision and user consent"
        );
      } else if (section.id === "POLICY.SECTION.DATA_USAGE") {
        content = content.replace(
          "{purposes}",
          Array.from(purposes).join(", ")
        );
        content = content.replace(
          "{retention_periods}",
          "Account data: until deletion, Transaction data: 7 years for compliance"
        );
      } else if (section.id === "POLICY.SECTION.USER_RIGHTS") {
        content = content.replace(
          "{rights_list}",
          this.kb.policies.placeholders?.rights_list?.join(", ") ||
            "Standard privacy rights"
        );
        content = content.replace("{contact_info}", "privacy@openledger.com");
        content = content.replace("{response_time}", "30 days");
      }

      policy += content + "\n\n";
    }

    return policy;
  }
}
