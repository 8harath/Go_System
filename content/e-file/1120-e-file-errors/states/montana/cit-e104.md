# CIT-E104 e-file error

```
* CIT-E104: If page 1, Part I question 3 is Yes and Part I question 6 is checked no and there is a value on line 8, then Schedule NOL must be included. If no box is checked, then Schedule NOL must be attached if a value on line 8 exists.
```

This happens when NOL information is entered in the TopCon and not the member returns, or when you are missing information that is required by the state.

## Solution 1

- Go to **Organizer**, **States**, **Montana**, then **Net Operating Loss**.

  tip

  In this screen, you can right-click and select Subview to check which members have NOL information entered.
- Enter NOL information for each member return.
- For these members in TopCon:


  - Go to **Tax Forms**, **States**, **Montana**, **CIT Combined**, **Sch NOL Combined, Sch NOL (Parent) and/or Sch NOL (Sub) Line 5 Taxable Period of NOL** must be completed.
  - **Line 12 Total separate corporation NOL carryforward to year (Add column B lines 5 through 11)** must be completed. NONE is accepted.
- Perform a full recompute, recreate, and resubmit the e-file.

## Solution 2

- Go to 

  **Tax Forms****States****Montana**

   folder.
- Select the **CIT Combined, Sch NOL Combined** folder.
- Select **Sch NOL (Parent)** or **SCH NOL(Sub)**.
- Populate **Line 5 Taxable Period of NOL**.
- Populate **Line 12 Total separate corporation NOL carryforward to year** (Add column B lines 5 through 11). Enter **NONE** if there are no amounts in the **Parent or Subsidiary**.
- Enter the **NOL Year Date** and **Date of Incorporation**. Don't enter any negative values. This will populate NOL in the XML.
- Do a full recompute in the subsidiary.
- Consolidate the Topcon.
- Recreate and resubmit the e-file.