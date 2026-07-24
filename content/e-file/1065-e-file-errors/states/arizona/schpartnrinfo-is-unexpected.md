# E-file error: Field ‘SchPartnrInfo’ is unexpected

```
Field 'SchPartnrInfo' is unexpected
```

## Cause

Form 1065: Prepare a schedule that lists each partner's name, address, taxpayer identification number and pro rata share of the amount.

Schedule D: the following fields are expected:

* Original Return Refund - OrigReturnRefund
* Total Payments - TotPaymnts
* Galance Of Tax Due - BalOfTaxDue
* Over Payment of PTI - OvrPaymentofPTE

## Solution

- Go to **Tax Forms**, then **States**, then **Arizona**, then **165**.
- Enter none for the following lines if they are blank.


  - 165 Page 2 line 25 (**Total PTE tax due by partnership**)
  - 165 Page 2 line 32 (**Balance of tax due, prior to penalties / estimates applied**)
  - 165 Page 3 line 37 **(total amount due, post penalties applied)**
- Do a full re-compute and re-create the e-file.