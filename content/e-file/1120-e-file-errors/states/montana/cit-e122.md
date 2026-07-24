# CIT-E122 e-file error

## Error

```
Total Montana Receipts (page 11 Schedule K Combined line 3k Column B) must equal page 5 Schedule K Total Receipts Value Column B. (CIT-E122)
```

## Cause

The total receipts for consolidated members that have activities in Montana doesn’t equal the apportionment factor.

## Solution

- In the **Tax Forms**, go to **States**.
- Select **Montana**, then **CIT - Corporation Income Tax Return**.
- Open **Combined/Consolidated Return information**, and go to the **Members of a U.S. Consolidated Group (Sch M Page 6)** section.
- Right-click on **Have any activities in Montana** and mark the checkbox for members that should be included in the Montana XML.
- Consolidate TopCon, recreate the XML, and resubmit the return.

If all members are properly marked and you still receive this rejection, check the following:

- In the **Tax Forms**, go to **States**.
- Select **Montana**, then **CIT - Combined**.
- Go to **Sch K Combined** and check the Schedule K for the parent and all subsidiaries.


  - If there is a Montana Numerator amount, there must be an entry on Line 5(a) – Separate Entity Apportionment Factor.
  - If there isn't, this means that the factor is too small to fit within the prescribed number of decimal places that Montana allows. You will have to enter an override on line 5(a) of “NONE”.