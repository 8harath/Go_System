# F512-009 e-file error

```
F512-009: Form 512, Part 1, line 30, Column B(TaxableIncome, StateAmount) should equal line 11, Column B(TotalIncome, StateAmount) minus line 27, Column B (TotalDeductions, StateAmount) minus line 29a
```

This happens when in the state Oklahoma F512-009 is that the value on **Form 512, Part 1, line 30, Column B (Taxable Income, State Amount)** doesn’t correctly result from the required calculation.

## Solution

- In Organizer, select **States**, then **Oklahoma**.
- Select **Return Options**, then**COMPUTE OPTIONS**.
- Clear the 2nd checkbox for line **Income is derived from the conduct of business in more than one state (unitary) (Part 2)**.
- Do a full recompute.
- Then mark the 1st checkbox for line **All income is within Oklahoma for corporations domesticated in Oklahoma**.
- Do a full recompute, and recreate the e-file.