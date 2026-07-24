# Error: PaymentMethod ActionNeeded: Field 'PaymentMethod' cannot be empty

This error occurs when the bank information for Minnesota isn't filled out completely.

## Error message

```
1. Validation failed on: Form: FormM4[1] PaymentMethod[1] Error: PaymentMethod ActionNeeded: Field 'PaymentMethod' cannot be empty Element Name: PaymentMethod EXPath: /ReturnState[1]/ReturnDataState[1]/FormM4[1]/PaymentMethod[1] XML Fragment: Field Key: 126,122,16,0,0,0,0,0,0 Error Code: c00ce011 Error Reason: Element '{http://www.irs.gov/efile}PaymentMethod' cannot be empty according to the DTD/Schema.[/STYLE]
```

## Solution

To fix this error, you'll need to enter your payment method and bank information, then recompute and recreate the e-file.

- Go to 

  **Organizer****States****Common State**

  .
- Select 

  **General Information****Bank Information**

  .
- Go to the **Direct Debit** tab, then the row for **Minnesota**.
- Mark the **Authorization to Debit Funds** checkbox in column B.
- Select a **Tax Payment Method** in column C.
- Select an **Account Type** in column D.
- Enter a **Routing number** and **Account number** in columns E and F.
- Do a full recompute and recreate the e-file.