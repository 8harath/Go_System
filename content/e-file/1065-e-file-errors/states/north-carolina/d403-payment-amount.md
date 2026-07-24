# E-file diagnostic: NC D403 Payment Amount

```
* NC D403 Payment Amount: The Financial Transaction payment amount does not equal the Tax Due Amount. Go to Organizer > States > Common State > General Information > Bank Information, enter the tax amount for Form D-403 Return Row North Carolina. Perform a full re-compute. Create North Carolina e-file.
```

This happens when the Financial Transaction payment amount does not equal to the form D-403, Page 1, Payment Due amount.

## Solution

- In Organizer, select **States**, then**Common State**, then**General Information**.
- Select **Bank Information**, then **Direct Debit**.
- In the North Carolina row, adjust the Column H amount. It should be equal to the amount in the next steps.
- Select Tax Forms, then **States**, then **North Carolina**.
- Select **D-403**, and then go to D-403, Page 1.
- Verify the **Payment Due** amount.
- To populate the **Payment Due** amount, go to Organizer.
- Select **States**, then **North Carolina**.
- Select **State Adjustments**, then go to the **Overrides** section.
- In line **Total tax due for nonresident partners** enter the amount and allocation code.
- Do a full recompute.
- Recreate the e-file.

  note

  If the amount on Page 1, Part 1, line 8 has been specially allocated in Federal, this will affect the numbers and calculations for North Carolina, therefore, you need to do the same thing at the State level. Line 10 will now be calculated using the allocated amounts for each partner instead of per its instructions (Percentage from line 4 times amount on Part 1, line 8). To enter an amount and a Special Allocation code to recompute line 10, follow the next steps.
- In Organizer, select **States**, then **North Carolina**.
- Select **State Adjustments**, then go to the Overrides section.
- Go to the**Net distributive partnership income** sub section.
- In line **To be apportioned to North Carolina** enter an amount and allocation code.
- Do a full recompute.
- Recreate the e-file.