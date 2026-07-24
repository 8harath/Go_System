# Error: The field 'EIN' with value '0', data is missing.

A locator is missing an EIN.

## Error Message

```
Validation failed on:
Form: SchUM[2][@documentId='SchUM12345OC1] MembersNameFID[1]/FID[1]/EIN[1]
Requirement: Type for Employer Identification No. - 9 digits
Error: The field 'EIN' with value '0', data is missing.
Element Name: EIN
XPath: //SchUM[@documentId='SchUM12345OC1']/MembersNameFID[1]/FID[1]/EIN[1]
XML Fragment: <EIN xmlns="http://www.irs.gov/efile">0</EIN>
Error Code: c00ce169
Error Reason: '0' violates pattern constraint of '[0-9]{9}'.
The element '{http://www.irs.gov/efile}EIN' with value '0' failed to parse.
```

## Solution

- Go to 

  **Organizer****General Information****Basic Return Information****Entity Information tab**

   . When the elimination doesn't have an EIN, 99-9999999 is commonly used.
- Add an EIN for the top consolidated locator and all lower members, including the eliminations.
- Do a full recompute, reconsolidate, and recreate the e-file.