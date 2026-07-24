# OH-PTE-017 e-file error

```
TotalApportionmentRatio does not equal the sum of PropertyWeightedRatio, PayrollWeightedRatio and SalesWeightedRatio. Please correct and retransmit.
```

This happens when the Total Apportionment Ratio calculated doesn’t match the sum of the individual components: PropertyWeightedRatio, PayrollWeightedRatio, and SalesWeightedRatio.

**Solution**

- Go to **Organizer**, **States**, then **Ohio**.
- Select **IT 1140**, then **Allocation and Apportionment**.
- Check the values entered in lines 21c, 22, and 23, and ensure that their sum equals the value in Line 24.
- Do a full recompute and recreate the e-file.
- Change Line 24 so that it equals 100% or 1.00000. Adjust the ratios for 21c, 22, and 23 so that the sum of these 3 lines is equal to 100%. All lines should ensure that Line 24 equals the sum of 21c, 22, and 23.

  note

  Line 24 should equal the sum of 21c, 22, and 23.
- Do a full recompute and recreate the e-file.