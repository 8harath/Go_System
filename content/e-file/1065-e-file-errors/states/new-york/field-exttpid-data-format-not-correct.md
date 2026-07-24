# Error: Field 'EXT\_TP\_ID' data format is not correct

You'll get this error if you file a New York extension or Form IT-204-LL at the same time as a regular return.

## Error Message

```
Form: FilingKeys
Line: Field: EXT_TP_ID
Description: External Taxpayer ID 
:
Requirement: Type for External TP ID
Error: The field 'EXT_TP_ID' with value 'XX-XXXXXXX', data format is not correct. Element Name: EXT_TP_ID
XPath: /ReturnState[1]/ReturnDataState[1]/processBO[1]/filingKeys[1]/EXT_TP_ID[1]
XML Fragment: XX-XXXXXXX
Error Code: c00ce169
Error Reason: 'XX-XXXXXXX' violates pattern constraint of '(TF NY CT TN \d\d){1}[0-9]{7}'. The element 'EXT_TP_ID' with value 'XX-XXXXXXX' failed to parse
```

## Solution

- Go to 

  **Organizer****General Information****Basic Return Information****Entity Information**

   tab.
- Verify the EIN is entered correctly. New York requires an EIN to e-file the partnership return.
- If you're filing the return, make sure the NY extension isn't enabled at the same time:


  - Go to 

    **Organizer****States****State E-file****Enable/Create Extensions**

     and unmark the **New York extension**.
  - Go to 

    **Organizer****States****State E-file****Enable/Create Returns**

     and mark the checkbox for New York.
- Do a full recompute, then recreate the e-file.
- Go to 

  **Organizer****State****Common State****General Information****Basic Return Information**

  .
- In the **Filing status for NY** on Column B, select the partnership type.
- Do a full recompute, then recreate the e-file.