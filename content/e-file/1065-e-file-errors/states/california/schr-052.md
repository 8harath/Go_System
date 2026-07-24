# SCHR-052 e-file error

## Scenario

You may get the following error message when submitting a return.

## Error

```
If Schedule R-1 Part A [StandardMethod] is present, then Line 1 column (a) [TotalSales] amount cannot be zero and must be equal to or greater than Line 1 column (b) [TotalSales] amount. (SCHR-052).
```

## Cause

California won't accept an apportionment percentage of **NONE** on **Schedule R**, **Part A**.

## Solution

- Go to **Tax Forms** then **States**.
- Select **California**.
- Select **565** or **568**, then **Sch R**.
- Select **Schedule R — Allocation and Apportionment**, **Sch R**, **Side 3**, then **Part A**.
- Remove any **NONE** entries.
- If there's no amount on **Sch R-1 Part A**, leave the boxes blank
- Do a **Full Recompute**, re-create the e-file, and resubmit the return.