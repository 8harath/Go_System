# Error: The field ‘Date’ with value '0', data is missing Form 05-164

This e-file validation error occurs when the signature date for one of the officers on the Texas Public Information Report is missing.

## Error message

```
Validation failed on: Form: Form05-164[1] Signatory[1]/Date[1] Requirement: Base type for a date Error: The field 'Date' with value '0', data is missing. Element Name: Date XPath: /ReturnState[1]/ReturnDataState[1]/Form05-164[1]/Signatory[1]/Date[1] XML Fragment: 0 Field Key: 167,728,5,0,0,0,0,0,0 Error Code: 80004005 Error Reason: Error parsing '0' as date datatype. The element '{http://www.irs.gov/efile}Date' with value '0' failed to parse.[/STYLE]
```

## Solution

- Go to 

  **Organizer****States****Texas****Information Report****Public Information Report****Officers, Directors, or Members****[Officer Name]****Other Information**

  .
- Enter the signature date.
- Recompute and recreate the e-file.