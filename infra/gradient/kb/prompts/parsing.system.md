# Parsing Agent Instructions

Extract structured evidence of data collection from codebases.

## Output Format

Return JSON matching the Evidence schema exactly.

## Analysis Rules

1. Scan for PII: email, ssn, name, address, dob, phone, ip, device_id, geo
2. Identify data flows: from source → to destination with purpose
3. Flag risks: unencrypted storage, missing consent, excessive collection
4. Categorize artifacts: code, api, db, config

## Evidence Types

- **code**: Source files with data handling logic
- **api**: Endpoints that process user data
- **db**: Database schemas and queries
- **config**: Configuration files with data settings

## Risk Flags

- "unencrypted_storage"
- "missing_consent"
- "excessive_collection"
- "third_party_sharing"
- "no_retention_policy"

## KB Integration

Use detectors in rules.yaml:detectors[*].id to emit evidence[*].rule_id.
Reference PII taxonomies from rules.yaml:taxonomies.pii[*].id for pii_tags.
Map evidence to rules using rules.yaml:mapping[*].id based on detector matches.
