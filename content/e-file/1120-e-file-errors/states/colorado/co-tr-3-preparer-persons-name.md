# E-file diagnostic: Preparer person's name is required field for Colorado

```
CO TR 3: Preparer person's name is required field for Colorado state e-file. Please enter the preparer's name in Organizer\State\Common State\G Information\Paid Preparer Information\Preparer Information
```

This happens when the State of Colorado mandates that if a return is e-filed by a paid preparer, the preparer's name must be included in the electronic file. This field is empty.

## Solution 1

- In Organizer, select **State**, then **Common State**, then **General Information**.
- Select the **Paid Preparer Information** tab.
- Select **State** and make sure all information is populated in all the columns.
- Some states require that you complete the **Paid Preparer** field even though the return is prepared in-house. Colorado is one of those states.
- Enter the paid preparer information.
- Do a full recompute and recreate the e-file.

## Solution 2

- In Organizer, select **States**, then **Common State** , then **Paid Preparer Information**.
- Select the **Firm Information** tab.
- In Column B, for Colorado, remove the selection from **Suppress Paid Preparer Information**.
- Do a full recompute and recreate e-file.