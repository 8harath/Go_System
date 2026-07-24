# Error: WI Form 3 Expecting: PTERepresentative

Complete the Pass-Through Representative information to resolve this Wisconsin Form 3 Partnership Return validation error.

## Error message

```
Validation failed on [FILE_ID]:

Form: Form3[1]
Requirement: WI Form 3 - Wisconsin Partnership Return
Error: Expecting: PTERepresentative.

Element Name: Form3
XPath: /ReturnState[1]/ReturnDataState[1]/Form3[1]
XML Fragment:
******
Error Code: 80004005
Error Reason: Content for element '{http://www.irs.gov/efile}Form3' is incomplete according to the DTD/Schema.
Expecting: {http://www.irs.gov/efile}PTERepresentative.
```

## Solution 1

- Go to 

  **Organizer****States****Wisconsin****General Information****THIRD PARTY DESIGNEE**

   section.
- Fill out the Name, address, phone, and email fields.
- Perform a full recompute and recreate the e-file.

## Solution 2

- Go to 

  **Organizer****States****Wisconsin****General Information****PASS-THROUGH REPRESENTATIVE**

   section.
- Enter the Name, phone number, and PIN, ensuring the PIN is in the correct 5-digit format with no letters.
- Perform a full recompute and recreate the e-file.