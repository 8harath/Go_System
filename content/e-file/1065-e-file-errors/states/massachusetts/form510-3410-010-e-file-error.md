# FORM510-3410-010 e-file error

```
State MDSeverity RejectData Value Math ErrorState Record FORM510-03410Record Name MD510Form Occurrence No 0Field Seq No 0Page No 1Reject Code FORM510-03410-010Rule Number FORM510-03410-010XML Path //ReturnDataState/Form510/ScheduleA/StateApportionmentFactorError Message Schedule A, Line 4 Maryland apportionment factor - If Maryland special apportionment factor checkbox is not checked, it must be equal to Line 1h3.
```

This happens when you are missing information that's required by the state for the apportionment factor. Page 4 of the MD 510 Schedule A line 4 must equal to line 1h column 3 but cannot be less than .000001.

## Solution

- Go to the 

  **Organizer****States****Allocation and Apportionment**

   folder.
- Go to **Options**, then the **Optional Methods** folder.
- Go to the Maryland section.
- Select the box for **Compute using special apportionment formula**.
- Do a full recompute then recreate the e-file