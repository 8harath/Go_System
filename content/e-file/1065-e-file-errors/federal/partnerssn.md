# E-file error: PartnerSSN

```
Form: IRS1065ScheduleK1[12][@documentId='IRS1065ScheduleK1N11] PartnerSSN[1]
Description: Partner's SSN
LineNumber: Schedule K-1 Part II Line E
Requirement: Type for Social Security No. - 9 digits
Error: The field 'PartnerSSN' with value 'XXXXXXXXX', data format is not correct.
```

You can get this error when the SSN or EIN isn't properly formatted.

## Solution

- Go to **Organizer** and select **Partner Information**, then **Partner by Partner Data**.
- Select the partner's name that is causing the error. You can tell what partner it is from the error. Their SSN  or EIN is in the "Error: The field 'PartnerSSN' with value 'XXXXXXXXX', data format is not correct." portion of the error.
- Select **Partner Information**.
- In the 

  SSN \ EIN

   section, review what is selected in the 

  Options

   area.


  - If **SSN \ EIN (Default)** is selected, make sure the **SSN \ EIN (No other entry allowed)** field has a 9 digit number that isn't all 9s or 0s, and the hyphens are in the correct place.
  - If **Applied for** or **Foreign US Partner** is selected, then **SSN \ EIN (No other entry allowed)** should be empty.
- Do a full re-compute and re-create the e-file.