# ILM-2000-1 e-file error

```
Illinois Schedule M and Schedules K-1-P and K-1-T: For all occurrences of the Schedule K1P and/or Schedule K1T, Schedule M Step 3 Line 14 "PartnerScorpEstateTrustLoss" must not be greater than the total amount of Schedule K1P Step 5 Line 38a Col A "InterestUSTreasuryBus" through Schedule K1P Step 5 Line 47 Col A "OtherSubtractions" and Schedule K1T Step 5 Line 36 Col A "InterestUSTreasuryBus" through Step 5 Line 45 Col A "OtherSubtractions." (Business Rule ILM-2000-1)
```

This happens when Schedule M, Page 2, line 14 amount doesn't equal the sum of partners of Schedule K-1-P or Schedule K-1-T.

## Solution

To resolve:

- Go to **Tax Forms**, **States**, **Illinois**, **Part-year Resident (or) Nonresident**, **Sch M - Additions and Subtractions**, and then **Page 2**. Make note of the amount on line 14.
- Now go to **Organizer**, **States**, **Illinois**, and then **Schedule K-1-P Addition/Subtraction** (or K-1-T).
- Select each name and review the sum of all K-1s lines 38a, column A through line 47, column A.

  note

  If there's any overrides for these amounts, remove the overrides (such as NONE or even a spacebar override) on the tax forms.
- Perform a full re-compute, re-create the e-file, then re-submit.