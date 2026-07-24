# E-file error: 'CreditDetails' is unexpected

```
Form: SchPTEK1[1] K1TaxCredits[1]/CreditDetails[21]
Error: Field 'CreditDetails' is unexpected
```

You get this error when element 'CreditDetails' is unexpected in the content model of the parent element.

## Solution

- Go to Tax Forms, 

  **States****Kentucky****Sch K-1****Partner name****Sch K-1, Page 2**

   then line 13 hyperlink **Tax credits details**.
- Remove the NONE values from all partners here and lines 14,15 and 16 remove NONE values from all partners.
- Do a full re-compute, recreate the e-file, then resubmit.