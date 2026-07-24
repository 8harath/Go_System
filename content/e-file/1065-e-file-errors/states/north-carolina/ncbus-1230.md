# NCBus-1230 e-file error

```
* NCBus-1230: [NC K-1 Supplemental Schedule-D403 NC K1] If D-403 NC K-1 line 2 (Additions) is greater than zero, then Line 2 must equal NC K-1 Supplemental Schedule Part A line 16 from Column A.
```

This happens when North Carolina Form D-403 NC K-1 Line 2 is greater than zero but Line 2 doesn't equal the Schedule NC K-1 Supplemental Schedule Part A line 16 from Column A.

## Solution

- In Tax Forms, select **States**, then **North Carolina**.
- Go to **Sch NC K-1** and select a partner.
- In the specific partner’s Form Sch NC K-1 line 2, if it has a value greater than zero then this value needs to equal the data in the Form Sch NC K-1 Supp, Page 1 Part A, line 16 of Column A.
- Review this information for all the partners. Correct the value if it's not equal to Form Sch NC K-1 Supp, Page 1 Part A, line 16 of Column A.
- Do a full recompute and recreate the e-file.

  note

  If you are using an aggregation file for NC Schedule K-1, the data must be corrected on the aggregation file then reattach it and recreate the e-file.