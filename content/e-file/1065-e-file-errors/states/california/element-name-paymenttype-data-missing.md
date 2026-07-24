# E-file error: element name PaymentType data missing

```
Form: CA-Payment[1][@documentId='Payment] PaymentType[1]
Requirement: Defines CA LLC payment types
Error: The field 'PaymentType' with value '0', data is missing.
```

This happens when the PaymentType field data is missing.

## Solution

- Go to 

  **Organizer****States****Common State****General Information****Bank Information****Direct Debit**

   tab, then California LLC.
- Enter information for California LLC since **Authorization to debit funds** is selected. Make sure to include Date and Amount to be Debited.
- If not payment is due then clear the **Authorization to debit funds** checkbox.
- Do a full recompute and recreate the e-file.