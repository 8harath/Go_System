# ILSCHUB-12700-1 e-file error

```
Schedule UB (Rule ILSCHUB-12700-1): Sch UB Step 3 Line 9 must equal Sch UB Step 2 Line 30 plus the sum of Sch UB Step 3 Line 2 through Sch UB Step 3 Line 8.
```

The Schedule UB amounts listed in the diagnostic aren't equal.

## Solution 1

- Complete these steps at all the subsidiary levels (not the parent):


  - In **Organizer**, go to **General Information**, then **Questions**.
  - Select **Schedule K**.
  - For Question **3 Subsidiary in an Affiliated Group**, select **Yes** and enter **Parent EIN** and **Parent Name**.

    note

    The subsidiary FEIN needs to match the TopCon.
  - Do a full recompute for members.
  - Reconsolidate the TopCon: go to 

    **Organizer****Consolidated Returns****Step 5 – Consolidate!****Consolidate**

    .
- Recreate the e-file.

## Solution 2

- In **Organizer**, go to **State Combined Returns**.
- Select **State Consolidation Steps** and go to Item 6 to the **Delete previously transferred state data** hyperlink
- Select **Illinois**.
- Reconsolidate the return: go to 

  **Organizer****Consolidated Returns****Step 5 – Consolidate!****Consolidate**

  .
- Recreate the e-file.