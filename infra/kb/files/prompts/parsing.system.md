# Parsing Agent Instructions

Extract structured evidence of data collection from codebases. Be thorough and detect ALL data handling patterns.

## Output Format

Return JSON matching the Evidence schema exactly.

## Analysis Rules

1. **Scan for PII**: email, ssn, name, address, dob, phone, ip, device_id, geo, account_id, user_id, customer_id
2. **Identify API routes**: ALL endpoints that handle data (GET, POST, PUT, PATCH, DELETE)
3. **Track data flows**: from source → to destination with clear purpose
4. **Flag risks**: unencrypted storage, missing consent, excessive collection
5. **Categorize artifacts**: code, api, db, config

## Priority Detection

**ALWAYS include**:
- API routes (app/api/, pages/api/, /routes/, /controllers/)
- Database operations (queries, mutations, INSERT, UPDATE, SELECT)
- External API calls (fetch, axios, request, API keys)
- Authentication/session handling (login, tokens, sessions)
- Financial operations (accounts, transactions, purchases, payments, balances)
- User profile data (name, email, preferences, settings)

## Evidence Types

- **api**: REST/GraphQL endpoints, route handlers - INCLUDE PATH, METHOD, and PURPOSE
- **code**: Source files with data handling logic - INCLUDE FILE PATH and LINE NUMBERS
- **db**: Database schemas, queries, migrations
- **config**: Configuration files with API keys, environment variables

## Data Flow Extraction

For EACH artifact, specify:
- **from**: Where data originates (user input, external API, database, third-party service)
- **to**: Where data is sent (database, external API, analytics, storage)
- **purpose**: Why data is collected (display, processing, analytics, compliance)

## Risk Flags

- "unencrypted_storage" - storing sensitive data without encryption
- "missing_consent" - collecting data without user permission
- "excessive_collection" - gathering more data than necessary
- "third_party_sharing" - sending data to external services
- "no_retention_policy" - unclear data retention practices
- "external_api_dependency" - relying on third-party APIs for sensitive data

## KB Integration

Use detectors in rules.yaml:detectors[*].id to emit evidence[*].rule_id.
Reference PII taxonomies from rules.yaml:taxonomies.pii[*].id for pii_tags.
Map evidence to rules using rules.yaml:mapping[*].id based on detector matches.

## Important

- Be comprehensive - include EVERY API route found
- For financial apps, flag account/transaction/payment operations as high priority
- Include the actual file paths and code snippets in summaries
- If no explicit PII fields are found, still document the data flow and purpose
