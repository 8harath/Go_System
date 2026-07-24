# Error: The field 'PIN' with value '0', data is missing

This validation error appears when the Practitioner PIN field contains an invalid value. The PIN must be a five-digit number.

## Error message

```
Validation failed on: Form: ReturnHeaderState Requirement: Type for Practitioner PIN, Self-Select PIN and Third Party Designee PIN Error: The field 'PIN' with value '0', data is missing. Element Name: PIN XPath: /ReturnState[1]/ReturnHeaderState[1]/Originator[1]/PractitionerPIN[1]/PIN[1] XML Fragment: 0 Field Key: 0,588,7,0,0,0,0,0,0 Error Code: 80004005 Error Reason: '0' violates pattern constraint of '[0-9]{5}'. The element '{http://www.irs.gov/efile}PIN' with value '0' failed to parse
```

## Solution

- Go to 

  **Organizer****Federal E-file****Signature Authorization**

  .
- Enter a five-digit PIN in the **Practitioner PIN** and **Self-Select PIN** fields (for example, 12345).
- Do a full recompute and recreate the e-file.