# SCHR-043 Schedule R e-file error

## Error

```
Schedule R, Line 33 [NetBeforeContributions] must equal the sum of Line 18b [NetApportionedToCA], Line 27 [NetAllocableToCA], Line 31 [TotalApportionedToCA], and Line 32 [PostApportionedAllocatedNetting].
```

## Cause

The **NONE** that is flowing to Side 1 Line 18 as well as Side 2, Line 32 is causing the reject. System is expecting a value since the checkbox is checked to apportion using Sch R.

## Solution

- In the **Organizer**, go to **States**.
- Go to **California**, **General Information**, **General Information**, then uncheck **Corporation apportioning income using Sch R**.
- Select **Tax Forms**, **States**, **California**, **Schedule R-Apportionment and Allocation**, **Sch R Side 3** (single factor) tab, then **Sch A line 2 has no apportionment**.
- Do a Full Recompute, recreate the electronic file, and resubmit the return.