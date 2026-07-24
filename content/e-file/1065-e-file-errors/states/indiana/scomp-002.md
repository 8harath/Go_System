# SCOMP-002 e-file error

```
For the Schedule Composite, the sum of all column G amounts 'PtrShrhldrTaxDueAmt' must equal line 15 Total tax, 'TotalTaxPtrShrhldrBeneficiaryAmt'.This happens when sum of the amounts on Column G for each Partner doesn’t equal to Line 15
```

This happens when sum of the amounts on Column G for each Partner isn't equal to Line 15.

- Go to **Tax Forms**, **States**, **Indiana** folder.
- Select **Schedule Composite**, then **Composite partner detail**.
- Make sure the sum of the **Column G** amounts for each partner must equal **Line 15 Total tax (13F+14F)**.
- Go to **Organizer**, **States**, **Common State, General Information** folder.
- Select **Basic Return Information**, then go to the **Filling Status** tab.
- Mark **Column E** in the **Indiana** row.
- Go to **Organizer**, **States**, **Indiana** folder.
- Select **Composite return**, then go to the **Composite Information** section.
- Make sure partners must have an **X** in **Column X**.
- Do a full recompute and recreate the e-file.

note

If you are using a K-1 Aggregation file, make the necessary changes in the K-1 Aggregation file, re -attach it.