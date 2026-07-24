# Error: The field 'Loss' with value 'NONE', data format is not correct

This error occurs when the Loss field on California Form 565 or Form 568 Schedule EO contains an invalid value such as "NONE" instead of a valid decimal format. The California e-file schema requires loss percentages to be between 0% and 100%, entered as a decimal with up to 6 digits and 4 required fraction digits.

## Error message

```
Validation failed on [FILE_ID]:

Form: CAForm565ScheduleEO[1][@documentId='CAForm565ScheduleEO] PartialOwnership[1]/Loss[1]
Description: Loss Percentage
LineNumber: Part I
Requirement: CA type for a non-negative decimal that allows up to 6 digits and 4 required fraction digits
Error: The field 'Loss' with value 'NONE', data format is not correct.

Element Name: Loss
XPath: //CAForm565ScheduleEO[@documentId='CAForm565ScheduleEO']/PartialOwnership[1]/Loss[1]
XML Fragment: NONE
Field Key: 85,15661,132,0,0,0,0,0,0
Error Code: [CODE]
Error Reason: 'NONE' violates pattern constraint of '[0-9]?[0-9]?.[0-9][0-9][0-9][0-9]'.
The element '{http://www.ftb.ca.gov/efile}Loss' with value 'NONE' failed to parse.
```

## Solution

- Go to 

  **Organizer****States****California****Other State Forms****Schedule EO****Part I - Partial Ownership of less than 100%**

  .
- Remove the NONE value from the **Loss** column. If there's no percentage or 0%, leave the field blank.
- Run a full recompute and create the e-file.

note

The percentages for partners can't be less than 0 or greater than 100% as per California's e-filing schema. Enter all ratios as fractions (for example, enter 23% as .23).