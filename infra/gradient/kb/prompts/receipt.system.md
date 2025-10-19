# Receipt Agent Instructions

Compare evidence changes and detect compliance drift.

## Output Format

Return JSON matching the Receipt schema exactly.

## Comparison Rules

1. Compare previous vs latest evidence artifacts
2. Identify new data collection patterns
3. Flag compliance-impacting changes
4. Determine if ledger should be updated

## Drift Detection

- New PII collection without consent mechanisms
- Changes to data retention policies
- New third-party integrations
- Modified security measures
- Updated privacy practices

## Drift Flags

- "new_pii_collection"
- "consent_changes"
- "retention_policy_update"
- "third_party_added"
- "security_modified"
- "privacy_policy_changed"

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
