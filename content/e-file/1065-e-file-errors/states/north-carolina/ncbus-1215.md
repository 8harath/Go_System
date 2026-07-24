# NCBus-1215 e-file error

```
* NCBus-1215 - Associated K-1's received - Column A: [NC K-1 Supplemental Schedule - CD401S/D403/D407] Part B Line 41 must equal the sum of lines 17 through 22, 23f, 24f and 25 through 40 for Column A (Amount from All Sources) and Column B (Amount of Column A from N.C. Sources).
```

This happens when the K-1 information entered for the partnership is missing amounts for Total Additions and Total Deductions. The software can't automatically calculate these fields. You'll need to enter values to match manually the received K-1 information.

**Solution 1**

- In Organizer, select **States**, then the **North Carolina** folder.
- Then go to **Additional K-1 Information**, and then **Other Partnership**.
- Select **Add new NCK-1 from Partnership**.
- Enter bonus depreciation from Schedule NC K-1 Supp, Page 2 line 23 and enter a number or NONE for the IRC section 179 Expense if there are no amounts.
- Perform a full recompute.
- Recreate the e-file.

**Solution 2**

- If using an aggregation file in Organizer, select **States**, then **North Carolina** folder.
- Select 

  **E-File****Attachments****K-1****Aggregation****Summary**

  .
- Select **Attach K-1 Aggregation XML File** and check the file thoroughly.
- Identify the missing lines in the aggregation file and add the missing information to the aggregation file.
- Reattach the updated aggregation file to the return.
- Perform a full recompute.
- Recreate the e-file.