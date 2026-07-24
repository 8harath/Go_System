# SCHR-053 e-file error

## Scenario

You may get the following error message when submitting a return.

## Error

```
If Schedule R-1 Part A [StandardMethod] is present, then Line 2 column (c) [SalesApportionmentPercentage] must equal Line 1 column (b) [TotalSales] divided by Line 1 column (a) [TotalSales] multiplied by 100. Exception: If column (a) [TotalSales] and column (b) [TotalSales] are zero, then column (c) [SalesApportionmentPercentage] must be zero. (SCHR-053).
```

## Cause

There's most likely an override for an allocation and apportionment amount on Schedule R, Side 3, Part A. You can take the following steps to check this:

- Go to **Tax Forms**then select**States**.
- Select **California** then **565** or **568**.
- Select **Schedule R** then **Schedule R — Allocation and Apportionment**.
- Select **Sch R, Side 3 Part A**.

## Solution

- Go to **Organizer** then **States**.
- Select **California** then **Allocation and Apportionment**.
- Make either of the following changes:


  - Delete any overrides so the form calculates as intended.
  - Change line 1 in columns A and B so the computation equals the apportionment percentage override amount.
- Do a **Full Recompute**, re-create the e-file, and resubmit the return.