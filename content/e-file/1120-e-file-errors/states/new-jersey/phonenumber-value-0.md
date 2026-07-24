# Error: the field ‘PhoneNumber’ with value '0', data is missing

This error occurs when the contact person information is not filled out for New Jersey.

## Error message

```
Validation failed on: Form: Header Requirement: Used for a phone no. - 10 digits Error: The field 'PhoneNumber' with value '0', data is missing. Element Name: PhoneNumber XPath: /ReturnState[1]/ReturnHeaderState[1]/Header[1]/PhoneNumber[1] XML Fragment: 0 Field Key: 24,906,19,0,0,0,0,0,0 Error Code: 80004005 Error Reason: '0' violates pattern constraint of '[0-9]{10}'. The element '{http://www.irs.gov/efile}PhoneNumber' with value '0' failed to parse.[/STYLE]
```

## Solution

Complete these steps to resolve the PhoneNumber validation error:

- Go to 

  **Organizer****States****Common State****General Information****Books and Records****Contact Person**

   tab.
- On the **New Jersey** row, complete **Column B**, **Column C**, and **Column F**.
- Do a full recompute and recreate the e-file.