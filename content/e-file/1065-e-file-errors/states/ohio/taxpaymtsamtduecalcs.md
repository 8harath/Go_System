# E-file error: Element name TaxPaymtsAmtDueCalcs

```
Form: FormIT4708[1][@documentId='FormIT4708] FormDetail[1]/TaxPaymtsAmtDueCalcs[1]
Requirement: Expecting IntPenOnUnderpdEstimPymts, TaxableYear4708UPCPymts, Transferred1140And4738UPCPymts, PymtsTransfTo1140AndOverPymts, CurrYrTotalNetEstimPymts, VerifiedEstPayments, PriorYearCreditCarryOver, TotalRefundableBusCredits, TotalPymtsAndCredits, Overpaid, Underpaid
Error: Content for field 'TaxPaymtsAmtDueCalcs' is incomplete
```

You get this error when the TaxPaymtsAmtDueCalcs is incomplete.

## Solution

- Go to **Organizer** and select **States**.
- Select **Ohio**, then **IT 4708**.
- Select **Taxable Income and Deductions** and in the **Tax, Payments and Net Tax Calculation** section, enter 

  NONE

   for **Net Tax Due (Override)** and **Overpayment (Override)** since there is no tax due or enter any overpayment amount.
- Perform a Full Recompute then recreate the XML.