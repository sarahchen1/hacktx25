export const EvidenceSchema = `{
  "repo_url": "string",
  "artifacts": [
    {
      "type": "code|api|db|config",
      "path": "string",
      "summary": "string",
      "pii": ["email|ssn|name|address|dob|phone|ip|device_id|geo"],
      "data_flows": [{"from":"string","to":"string","purpose":"string"}],
      "risk_flags": ["string"]
    }
  ]
}`;

export const AuditSchema = `{
  "compliance_score": 0,
  "framework_breakdown": [
    {"framework":"GDPR|CCPA|GLBA","score":0,"passed":["string"],"failed":[{"id":"string","title":"string","why":"string","evidence_refs":[0]}]}
  ],
  "recommended_fixes": [{"title":"string","change":"string","impact":"low|med|high"}],
  "current_policy": {
    "file_path": "string",
    "content": "string",
    "last_modified": "string",
    "compliance_score": 0
  },
  "new_policy": {
    "content": "string",
    "changes_summary": "string",
    "compliance_score": 0,
    "requires_approval": true
  },
  "drift_events": [
    {
      "id": "string",
      "severity": "low|medium|high",
      "type": "new_endpoint|removed_endpoint|new_pii|changed_data_flow|security_risk|policy_violation",
      "file": "string",
      "endpoint": "string",
      "description": "string",
      "evidence_refs": [0],
      "policy_update_required": true,
      "recommended_action": "string"
    }
  ],
  "user_toggles": [
    {
      "id": "string",
      "name": "string",
      "category": "demographic_data|transaction_data|location_data|device_data|behavioral_data",
      "description": "string",
      "implementation": {
        "file": "string",
        "language": "typescript|javascript|python|go",
        "diff": "string",
        "instructions": "string"
      },
      "affected_endpoints": ["string"],
      "policy_impact": "string"
    }
  ]
}`;

export const QASchema = `{
  "answer":"string",
  "citations":[{"source":"policy|kb|evidence","ref":"string"}]
}`;

