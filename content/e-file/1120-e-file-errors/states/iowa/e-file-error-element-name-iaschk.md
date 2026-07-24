# E-file error: Element Name IASchK is unexpected

## Scenario

You may get the following error message when completing Iowa 1120S.

**Error message**

```
Form: FormIA1120S[1][@documentId='FormIA1120S] IASchK[1]
Description: Iowa Schedule K – Distributive Share Items
Requirement: Expecting PTETElection, GrossIowaPTET, FranchiseTaxCredit, ElectToPayFromAudit, CompositePTETCredits, ScheduleC, TentativeAmtDueOrOverpmt, Interest, LatePaymentPenalty, LateFilingPenalty, TotalAmtDue, Overpayment
Error: Field 'IASchK' is unexpected
```

## Solution

Select **Tax Forms**.

Go to 

**States****Iowa****IA 1120S S Corporation****IA 1120S S Corporation, Page 5**

 then find Line 51.

Enter **NONE** as the amount.

Do a Full Recompute and recreate e-file.