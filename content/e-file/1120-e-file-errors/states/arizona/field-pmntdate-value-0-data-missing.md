# Error: The field 'PmntDate' with value '0' data is missing

This validation error occurs on Arizona Form 120 when a payment date field contains '0' instead of a valid date during e-file creation.

## Error message

```
Validation failed on [FILE_ID]:

Form: Form120[1] SchTxPaymnts[1]/TaxPaymntsTab[1]/PmntDate[1]
Description: Payment Date
LineNumber: Column (c)
Requirement: Base type for a date
Error: The field 'PmntDate' with value '0', data is missing.

Element Name: PmntDate
XPath: /ReturnState[1]/ReturnDataState[1]/Form120[1]/SchTxPaymnts[1]/TaxPaymntsTab[1]/PmntDate[1]
XML Fragment: 0
Field Key: 103,611,130,0,0,0,0,0,0
Error Code: [CODE]
Error Reason: Error parsing '0' as date datatype.
The element '{http://www.irs.gov/efile}PmntDate' with value '0' failed to parse.
```

## Solution

You'll get this error when a payment amount exists but the corresponding date field is empty or contains an invalid value. Enter the date based on your payment type.

**For extension payments:**

- Go to 

  **Organizer****States****Common State****Estimates and Extensions****Estimates and Extensions****Extension Tab**

  .
- Enter the date in Column D.
- Do a full recompute, then recreate the e-file.

**For prior-year overpayments:**

- Go to 

  **Organizer****States****Arizona****General Information**

  .
- On the **Prior year overpayment date (for Schedule F)** line, enter the date.
- Do a full recompute, then recreate the e-file.

**For estimated tax payments:**

- Go to 

  **Organizer****States****Common State****Estimates and Extensions****Estimates and Extensions****Payments of tax tab**

  .
- Enter the payment date under Column E for the quarter.
- Do a full recompute, then recreate the e-file.