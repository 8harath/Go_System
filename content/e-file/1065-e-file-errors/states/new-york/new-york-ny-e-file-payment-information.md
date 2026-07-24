# E-file diagnostic: New York NY e-file: Payment information has been entered for the IT-204-LL

```
NY E-File: Payment information has been entered for the IT-204-LL but the "Authorize Direct Debit Payment" is not selected. Either remove the payment information or enable the Authorize Direct Debit Payment
```

This diagnostic happens if the checkbox was not check for direct debit.

## Solution

- Go to 

  **Organizer****State****Common State**

  .
- Go to the **General Information** section.
- Open **Bank information**, then select **Direct Debit**.
- Mark the **NY IT-204-LL** checkbox on column B to authorize direct debit payment and enter the bank information.
- Alternatively, if there's no payment you can select **None Selected** under column D and J column type.
- Initiate a full recompute of the return, then recreate the e-file.