# E-file diagnostic: ALPTEC-006: If Form PTEC Page 1 Line 1

```
ALPTEC-006: If Form PTEC Page 1 Line 1 (Amount of Tax Due) is populated (MUST have the same amount as Schedule PTE-CK1 Page 1 Line 15) then Line 4 (Total Tax) must equal the sum of Line 1 (Amount of Tax Due) plus Line 2 (Interest Due) and Line 3 (Penalty Due).
```

This happens when the amount on the PTE-C, page 1, line 1 does not match the amount on the PTE-C, page 3, line 15 .

## Solution

- Select **Tax Forms**, then the **States** folder.
- Select **Alabama**,then **Composite Return**, then the **PTE-C, Page 1** folder.
- Go to **line 1** and make note of the amount.
- Go to the **PTE-C, Page 3** folder.
- Go to **line 15** and check the amount. This amount needs to match the amount that's in **line 1** (found in step 3).
- If you need to make a correction to the total, select **Organizer** then the **States** folder.
- Select **Alabama** then the **Composite Return** folder.
- Select the **Composite Return** tab then go to the **Composite Options** section.
- Fill out the amount on the **Amount of tax due (override)** line.
- Run a full recompute, then recreate the E-file.

note

If you imported the K-1 on the return, make sure that all entries are correct from your imported file.