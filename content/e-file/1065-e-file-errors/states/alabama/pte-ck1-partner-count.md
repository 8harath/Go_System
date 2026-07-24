# E-file diagnostic: PTE-CK1- Partner Count

```
Rule Number: PTE-CK1- Partner Count
Description: Form PTE-C, Number of non-resident partners value entered is = X,
Number of ScheduleK1 elements included in the XML file= X.
```

You can get this error when the number of partners on Form PTE-C don't match. You'll need to review data entry for the K-1.

## Solution 1

If nonresident partners don't have income, they shouldn't file the composite return. Per Alabama Instructions: If a Nonresident Owner/Shareholder has a LOSS, do not include him/her on Form PTE-C unless the loss is used to offset guaranteed payment(s)". It means only partners with positive income on Column (G) "Total Income" will be printing on this form. To make sure they have income check the following:

- In **Tax Forms**, select **States**.
- Select **Alabama**, then **Composite Return**.
- Select **PTE-C Page 3**, then open the **Partner Detail**.
- Under PTE-CK1, LINE E CALCULATION - SCHEDULE K-1 AMOUNTS, make sure the partner has a positive amount.

If there isn't an amount, remove the Composite return for that nonresident partner:

- Go to **Organizer** and select **Partner Information**, then **Partner by Partner Data**.
- Select the partner's name, then **Partner Information**.
- Select the **State Partner Information** tab and clear the checkbox for the Alabama composite return.
- In the **Partner by Partner Data** folder, select **Columnar Partner Entry**.
- Go to the **Partners State Composites** tab and remove any partners from the AL composite return that do not meet filing requirement.
- Make sure you don't have any overrides in 

  **Organizer****States****Alabama****Composite Return****Number of non-resident partners included in composite filing (Override)**

   field.
- Do a full re-compute and e-file the return.

## Solution 2

If filing the Alabama Composite:

- Go to 

  **Tax Forms****States****Alabama****Composite Return**

   folder.
- Select **PTE-CK1 Page 1**, then the **detail link** and make sure there is a value on Line G.
- Do a Full Recompute.
- Go to 

  **Organizer****Partner Information****Partner by Partner Data**

   folder.
- Select the folder for the partner, then **Partner Information**, then **State Partner Information**.
- Select the **Include nonresident partner in Schedule NRC** checkbox.
- Do a full Recompute.
- Recreate the E-file.