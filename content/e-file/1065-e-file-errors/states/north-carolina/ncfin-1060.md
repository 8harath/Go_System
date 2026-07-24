# NCFIN-1060 e-file error

This error happens during North Carolina 1065 extension e-file when payment contact information is missing or when overrides on Form D-410P Lines 1 and 2 cause a mismatch between the calculated balance due and the bank information payment amount.

## Error message

```
NCFIN-1060: [Financial] Payment contact name and phone number must be provided
```

## Solution

- Go to 

  **Organizer****States****Common State****General Information****Bank Information**

  .
- Confirm you've entered the payment contact name and phone number fields.
- Go to 

  **Tax Forms****States****North Carolina****D-410P**

  .
- Check Lines **1** and **2** for overrides. Overrides on these fields cause incorrect balance due calculations
- Clear the overrides on Lines **1** and **2**.
- Confirm the balance due on Line **3** (Total amount due) matches the payment amount entered on the bank information screen.
- Do a full recompute and recreate the e-file.
- If you still have the diagnostic, go to 

  **Organizer****States****Common State****General Information****Basic Information****Signature Information**

  .
- Make sure the **Name** and **Telephone number** is filled out.
- You can pay when you e-file your return or extension. For more information, visit the [NC Department of Revenue website](https://www.ncdor.gov/file-pay/efile-resources-taxpayers/efile-businesses#PayingYourTaxes-9706).