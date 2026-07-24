# ILSCHUB-19800-1 e-file error

```
Schedule UB (Rule ILSCHUB-19800-1): If the result of the sum of all occurrences of Step 3 Line 2 minus Line 2 Col D is zero or greater than zero, then Step 3 Line 23 Col E must equal the result of all occurrences of Step 3 Line 23 minus Line
```

This happens when there's an incorrect value in the Schedule UB Step 3, line 2 in the TopCon of Illinois, usually from an override.

## Solution

- Go to **Tax Forms**, and the **States** folder.
- Go to **Illinois**, **Combined Report**, and the **Sch UB-Combined Apportionment for UBG** folder.
- Select **Sch UB, Combined Apportionment**, and go to the **Sch UB Page 3 - Step 3**.
- If there is an override on **Line 2 Net operating loss deduction from Step 2, Line 29a** or the lines leading up to it, clear the overrides.

Instead of overriding:

- In the members, go to **Organizer**, **States**, **Illinois**, **State Adjustments**, and then **State Adjustments**.
- In the **Additions** section, enter NONE or a value for **Net operating loss**.
- Perform a full re-compute and re-create the e-file.