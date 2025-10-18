# OpenLedger Demo Guide

## Overview

The OpenLedger demo showcases how fintech applications can automatically match code evidence with privacy disclosures and enforce user consent in real-time.

## Demo Features

### 1. Live Data Usage Controls

- **Location**: Left column of `/demo` page
- **Features**:
  - Toggle transaction categorization on/off
  - Toggle account profile data usage
  - Real-time status updates
  - Download consent receipts

### 2. Live Feature Demo

- **Location**: Center column of `/demo` page
- **Features**:
  - Budget view that changes based on consent settings
  - Category charts disappear when categorization is disabled
  - Instant visual feedback
  - Spending insights that respect user choices

### 3. Evidence-Backed Disclosures

- **Location**: Right column of `/demo` page
- **Features**:
  - Plain-language privacy explanations
  - "Why?" buttons that show actual code evidence
  - File and line number references
  - Data field transparency

### 4. Consent Receipts

- **Location**: Bottom of demo page
- **Features**:
  - Signed JSON receipts with timestamps
  - Commit hash references
  - Evidence hash for integrity
  - Downloadable audit trail

## Keyboard Shortcuts

- **D**: Toggle transaction categories
- **R**: Download latest receipt
- **F**: Inject new drift event (demo)
- **?**: Show help modal

## Demo Scenarios

### Scenario 1: User Disables Categories

1. Go to `/demo`
2. Toggle "Transaction Categories" to OFF
3. Watch the budget view change instantly
4. Category charts disappear
5. Only totals are shown with privacy notice

### Scenario 2: View Code Evidence

1. Click "Why?" on any disclosure
2. See the evidence drawer with:
   - Actual file names and line numbers
   - API endpoints being called
   - Data fields being used
   - Timestamps of evidence collection

### Scenario 3: Download Receipt

1. Make a consent change
2. Click "Download Receipt" button
3. Get a signed JSON file with:
   - Your choice and timestamp
   - Commit hash reference
   - Evidence hash for verification
   - Receipt ID for tracking

### Scenario 4: Admin Drift Detection

1. Go to `/admin`
2. See compliance score and drift events
3. Click "Inject Drift" to simulate new code
4. Watch drift detection in action
5. Resolve drift events

## Technical Implementation

### Mock Data

The demo uses mock data when Supabase/Gradient are not configured:

- `public/mock/gates.json` - User consent states
- `public/mock/evidence.json` - Code evidence
- `public/mock/ui-copy-*.json` - Generated disclosures
- `public/mock/receipt-*.json` - Consent receipts
- `public/mock/drift.json` - Drift events

### API Endpoints

All demo functionality works through REST APIs:

- `GET/POST /api/gates` - Consent management
- `GET /api/ui-copy` - Disclosure text
- `GET /api/evidence` - Code evidence
- `GET/POST /api/receipt` - Receipt management
- `GET/POST /api/drift` - Drift detection
- `POST /api/ai/*` - AI agent calls

### Real-time Updates

- Consent changes update UI instantly
- Features respond immediately to toggles
- Receipts are generated on-demand
- Drift detection runs continuously

## Demo Value Proposition

### For Judges

- **Technical Depth**: Multi-agent AI system with real code analysis
- **Visual Impact**: Instant feedback and live policy enforcement
- **Business Value**: Solves real fintech compliance problems
- **Innovation**: Novel approach to privacy transparency

### For Users

- **Transparency**: See exactly how data is used
- **Control**: Instant toggles with immediate effect
- **Evidence**: Code-level proof of data usage
- **Trust**: Signed receipts for audit trails

### For Developers

- **Automation**: No manual privacy policy writing
- **Compliance**: Automated drift detection
- **Integration**: Easy to add to existing apps
- **Scalability**: Works with any codebase size

## Troubleshooting

### Demo Not Working

1. Check browser console for errors
2. Verify mock data files exist in `public/mock/`
3. Ensure all API routes are accessible
4. Check network tab for failed requests

### Missing Features

1. Verify all components are imported correctly
2. Check that hooks are properly configured
3. Ensure mock data matches expected format
4. Validate API response structures

### Performance Issues

1. Check for infinite re-renders in React components
2. Verify API calls are not being made repeatedly
3. Ensure proper loading states are implemented
4. Check for memory leaks in useEffect hooks

## Next Steps

After the demo, consider:

1. Setting up real Supabase database
2. Configuring DigitalOcean Gradient AI
3. Adding more sophisticated code scanning
4. Implementing real-time drift detection
5. Adding more compliance frameworks
