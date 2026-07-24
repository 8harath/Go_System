# S3-0003 e-file error

```
* S3-0003: GrandTotal (GrTotPaidWithReturnAmt Column C) must equal the total of all CorpFilingReturn(PaidWithReturnAmt) ParentCorp(PaidWithReturnAmt) and Subsidiary(PaidWithReturnAmt) elements (listed in Column C).
```

This happens when the amounts on Column C of the 1120N sch III don’t equal the total at the bottom of the form.

## Solution

- Go to the 

  **Tax Forms****States****Nebraska****1120N – Corporate Income Tax Return**

  .
- Go to the **1120N Sch III** tab.
- In **Column C Amount Paid with this Return**, the amounts from all the subsidiaries need to add up to the total amount of **Column C**.
- Make any corrections at the lower members.
- Do a full recompute, reconsolidate, and recreate the e-file.