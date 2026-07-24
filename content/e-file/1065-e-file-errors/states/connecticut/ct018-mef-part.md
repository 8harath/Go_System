# CT018-MEF-PART e-file error

```
Invalid or missing CT-AB (CT018-MEF-PART)
```

An entry for each partner is missing from Schedule CT-AB, Section 3, Column I.

## Solution

- Go to **Organizer**, then **States** and select the **Connecticut** folder.
- Select **General Information**, then go to the 

  General Information

   section.
- If you have selected **Alternative Basis** then Form CT-AB needs to be populated and included in the XML. Form CT-AB will populate in the e-file if a value exists in:


  - **Tax Forms****States****Connecticut**
  - Select **Sch CT-AB**, then go to Page 1, Section 1, Line 1.
  - If the value is zero, you will need to enter an override of "NONE".
- Do a Full Recompute, re-create the e-file, and resubmit the return.