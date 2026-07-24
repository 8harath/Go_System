# SCHR-110 e-file error

## Error

```
If the Schedule R-7 Part 1 Section A [SingleUnitaryElectionList] is present, then [IsKeyCorporation] must be checked Yes for one and only one corporation. (SCHR-110)
```

## Cause

Schedule R-7 must have at least 2 electing members.

## Solution

- In the **Organizer**, go to **States**.
- Select **California**, then **Combined Return Information**.
- In the 

  Combined Information

   screen, go to the section for **Schedule R-7 Information**.
- 2 members need to have either the**Electing member is incorporated, organized, qualified, or registered to do business in California** and/or **Electing member has property, payroll, or sales in California**selected.
- At the same location within the parent return, mark **Member is the Key Corporation**. Don’t mark **Check to exclude this member from Part I, Section A** if they're an electing member.
- Make these changes in the parent/subsidiary locators, then full recompute in the member locators.
- Consolidate in the TopCon, recreate the California e-file, and resubmit the return.