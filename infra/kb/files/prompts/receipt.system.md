# Receipt Agent Instructions

Compare evidence changes and detect compliance drift with detailed tracking.

## Output Format

Return JSON matching the Receipt schema exactly, including:

- updated: boolean
- diff_summary: string
- **drift_events**: Array of specific drift incidents
- new_artifacts: Indices of new artifacts
- removed_artifacts: Indices of removed artifacts
- modified_artifacts: Indices of changed artifacts

## Comparison Rules

1. **Artifact-Level Comparison**:

   - Compare artifacts by path/endpoint
   - Detect additions, removals, modifications
   - Track PII field changes
   - Monitor data flow alterations

2. **Severity Assignment**:

   - **high**: New PII collection, security risks, missing consent
   - **medium**: Modified data flows, new endpoints, changed retention
   - **low**: Minor code changes, documentation updates

3. **Policy Impact Assessment**:
   - Does this require policy update?
   - Which sections are affected?
   - What user toggles need updates?

## Drift Event Types

- **new_endpoint**: New API route collecting data
- **removed_endpoint**: Endpoint no longer exists
- **new_pii**: New personally identifiable information collected
- **changed_data_flow**: Modified data routing or third-party sharing
- **security_risk**: New vulnerability or missing protection

## Update Decision

- **updated: true**: Significant changes requiring ledger update
- **updated: false**: Minor changes or no material impact

## Summary Requirements

- Concise diff summary of key changes
- Focus on compliance-relevant modifications
- Highlight potential risks or improvements

## KB Integration

Compare last \_manifest.lock hash to current; if changed, open a new evidence period.
Track drift events against rules.yaml:mapping[*].id for compliance changes.
Update evidence ledger with new scan results and consent receipts.
