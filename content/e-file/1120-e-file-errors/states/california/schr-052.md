# SCHR-052 e-file error

## Error

```
If Schedule R-1 Part A [StandardMethod] is present, then Line 1 column (a) [TotalSales] amount cannot be zero and must be equal to or greater than Line 1 column (b) [TotalSales] amount. (SCHR-052)
```

## Cause

California is expecting an apportionment percentage other than "NONE" on Schedule R, Part A.

## Solution

California doesn't allow **NONE** using Single Factor.

- Go to **Tax Forms** and select **States**.
- Select **California 565** or **California 568**, then **Sch R**.
- Select **Schedule R - Allocation and Apportionment**, then **Sch R**, **Side 3**, **Part A**.
- Remove any **NONE** entries.

  note

  If there is no amount on Sch R-1 Part A, fields should be left blank instead of using **NONE**.
- Do a Full Recompute, recreate the electronic file, and resubmit the return.