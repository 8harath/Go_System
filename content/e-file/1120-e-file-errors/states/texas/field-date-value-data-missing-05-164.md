# Error: The field 'Date' with value '0', data is missing form 05-164

This e-file validation error appears when the Signature Date field on Texas Form 05-164 is missing or contains an invalid value. The e-file validation can't parse "0" as a valid date, which blocks e-file creation.

## Error message

```
Validation failed on CXXXXXXX5.itx: Form: Form05-164\[1] Signatory\[1]/Date\[1] Requirement: Base type for a date Error: The field 'Date' with value '0', data is missing. Element Name: Date XPath: /ReturnState\[1]/ReturnDataState\[1]/Form05-164\[1]/Signatory\[1]/Date\[1] XML Fragment: 0 Field Key: 152,688,5,0,0,0,0,0,0 Error Code: 80004005 Error Reason: Error parsing '0' as date datatype. The element '{http://www.irs.gov/efile}Date' with value '0' failed to parse
```

## Solution

- Go to 

  **Organizer****State Franchise Tax****Texas Franchise****Information Report****Common Information****Signatory Information Section**
- Enter the Signature Date and select **Transfer to Parent and Subs**.
- Run a full recompute by selecting 

  **Compute****Full Compute**

   from the menu
- Reconsolidate the return.
- Recreate the e-file.

tip

Transfer to Parent and Subs copies the signature date to all related entities in a consolidated return.