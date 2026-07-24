# SCHR-053 e-file error

## Error

```
If Schedule R-1 Part A [StandardMethod] is present, then Line 2 column (c) [SalesApportionmentPercentage] must equal Line 1 column (b) [TotalSales] divided by Line 1 column (a) [TotalSales] multiplied by 100. Exception: If column (a) [TotalSales] and column (b) [TotalSales] are zero, then column (c) [SalesApportionmentPercentage] must be zero. (SCHR-053)
```

## Cause

There is most likely an override for an allocation and apportionment amount on Schedule R, Side 3, Part A.

## Solution

- In the **Organizer**, go to **States**.
- Select **California**, then **Allocation and Apportionment**.
- Go to **Overrides**, then **Apportionment percentage**. Remove any overrides so the form calculates as intended.
- You can change the amounts on line 1 in columns A and B so that the computation will equal the apportionment percentage override amount.
- Do a Full Recompute, recreate the electronic file, and resubmit the return.

For combined returns, Schedule R-7 must have at least 2 electing members.

- In the **Organizer**, go to **States**.
- Select**California**, then **Combined Return Information**.
- In the 

  Combined Information

   screen, go to the section for Schedule R-7 Information.
- Mark **Electing member is incorporated, organized, qualified, or registered to do business in California** and/or **Electing member has property, payroll, or sales in California**.
- At the same location within the Parent return, mark **Member is the Key Corporation**.


  - Don’t mark **Check to exclude this member from Part I, Section A** if they are an electing member.
  - You'll need to make these changes in the parent/subsidiary locators, then full recompute in the member locators.
  - Consolidate in the TopCon, recreate the California E-File and resubmit the return.