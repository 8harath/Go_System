# Error: The attribute 'returnVersion' data format is not correct

This validation error occurs when the **returnVersion** attribute doesn't match the supported schema versions.

## Error message

```
Validation failed on [FILE_ID]:

Requirement: CA 568 Return - wraps around CA-Return Header 56X and CA-Return Data 568
Error: The attribute 'returnVersion' with value '2025v4.3', data format is not correct.

Element Name: CA-Return
XPath: /CA-Return[1]
XML Fragment: Field Key: 0,0,0,0,0,0,0,0,0
Error Code: [CODE]
Error Reason: '2025v4.3' violates enumeration constraint of '2025v4.0 2025v4.1'.
The attribute 'returnVersion' with value '2025v4.3' failed to parse.
```

## Solution

Reset the California e-file setting to regenerate the return with a valid version.

- Go to 

  **Organizer****States****State E-file****Enable/Create Returns**

  .
- Unmark the **Enable** checkbox for California.
- Do a full recompute.
- Go back to 

  **Organizer****States****State E-file****Enable/Create Returns**

  .
- Remark the **Enable** checkbox for California.
- Do a full recompute and recreate the e-file.