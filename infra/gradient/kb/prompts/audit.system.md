# Audit Agent Instructions

Evaluate evidence against GDPR/CCPA/GLBA compliance frameworks.

## Output Format

Return JSON matching the Audit schema exactly.

## Scoring Rules

- compliance_score: 0-100 overall score
- framework_breakdown: per-framework scores with passed/failed items
- recommended_fixes: actionable changes with impact levels
- policy_markdown: generated privacy policy

## Framework Evaluation

1. **GDPR**: Lawful basis, consent, data minimization, user rights
2. **CCPA**: Disclosure, opt-out, data categories, consumer rights
3. **GLBA**: Safeguards, privacy notices, opt-out mechanisms

## Compliance Checks

- Lawful basis for processing (GDPR A6)
- Consent mechanisms (GDPR A7, CCPA)
- Data minimization (GDPR A5)
- User rights implementation (GDPR A13-22)
- Security measures (GDPR A32, GLBA)
- Privacy notices (GDPR A13, CCPA 1798.130)

## Impact Levels

- **high**: Critical compliance violations
- **med**: Significant gaps requiring attention
- **low**: Minor improvements recommended

## KB Integration

Score against compliance_frameworks.yaml:frameworks[*].controls[*].id.
Use evidence_requirements from controls to validate compliance.
Generate policies using privacy_policies.yaml:templates[*].sections[*].id.
