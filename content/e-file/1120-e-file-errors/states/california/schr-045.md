# SCHR-045 e-file error

```
Schedule R: Rule Number SCHR-045 Schedule R, Line 35 [NetCAIncomeLoss] must equal the sum of Line 33 [NetBeforeContributions] and Line 34 [ContributionsAdjustment] unless Form Form 100/100W, (Combined, Parent, or Subsidiary) Schedule Q, Question T [CaliforniaREMIC] is marked "Yes".
```

This happens when in California Schedule R side 2 line 33,34,35 are populated with NONE.

## Solution

- Go to 

  **Tax Forms****States****California**

  .
- Select **Schedule R-Apportionment and Allocation**.
- Go to **Side 2**. Remove **NONE** from lines 33,34,35.
- Do a full recompute and recreate the e-file.