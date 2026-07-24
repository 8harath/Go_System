# ILSCHUB-18300-1 e-file error

```
Schedule UB (Rule ILSCHUB-18300-1): If the result of the sum of all occurrences of Step 3 Line 2 minus Line 2 Col D is zero or greater than zero, then Step 3 Line 9 Col E must equal the result of all occurrences of Step 3 Line 9 minus Line 9 Col D.
```

This happens when there's an override for Step 3, line 4 in the TopCon.

## Solution

- Go to **Tax Forms**, and the **States** folder.
- Go to **Illinois**, then **Combined Report**, and the **Sch UB-Combined Apportionment for UBG** folder.
- Select **Sch UB, Combined Apportionment**, and go to the **Sch UB Page 3 - Step 3**.
- If there is an override on **Line 2 Net operating loss deduction from Step 2, Line 29a** or the lines leading up to it, clear the overrides.

Instead of overriding:

- In the members, go to **Organizer**, **States**, **Illinois**, **State Adjustments**, and then **State Adjustments**.
- In the **Additions** section, enter 

  NONE

   for **Illinois income and repl. tax (added to accrual if selected)**.
- Perform a full re-compute and re-create the e-file.