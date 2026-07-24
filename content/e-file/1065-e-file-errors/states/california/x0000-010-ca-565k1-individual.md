# X0000-010 e-file error xpath /CA-Return/CA-ReturnData/CAForm 565ScheduleK-1/PartnerInformation/Individual

## Error

```
Your State submission does not match the latest published FTB Schema or is not well formed. You must contact your software provider to resolve this error.
```

## Cause

This return has missing or incorrect partner information.

## Solutions

```
/CA-Return/CA-ReturnData/CAForm565ScheduleK-1/PartnerInformation/Individual/

IdNumber
```

- Go to **Organizer**, **Partner Information**, **Partner by Partner Data**, then **Columnar Partner Entry**.
- Review any partner with **Individual** as the entity type. These partners need to have Social Security Number (SSN) and not an Employe Identification Number (EIN).
- Perform a full re-compute, re-create the e-file, then re-submit.

```
/CA-Return/CA-ReturnData/CAForm565ScheduleK-1/PartnerInformation/Individual/

LastName
```

- Go to **Organizer**, **Partner Information**, **Partner by Partner Data**, then **Columnar Partner Entry**.
- Go to the **Reformat Partner Name for State Purpose** tab and remove any special characters from the partners' names, including the middle initial.

  note

  - The last name can't be more than 17 characters.
  - When using a K-1 Aggregation file, the partner's name needs to be reformatted into first and last name used to create the K-1 file. Re-attach the file to the locator.
- Perform a full re-compute, re-create the e-file, then re-submit.

```
/CA-Return/CA-ReturnData/CAForm565ScheduleK-1/PartnerInformation/Individual/

MiddleInitial
```

- Go to **Organizer**, **Partner Information**, **Partner by Partner Data**, then **Columnar Partner Entry**.
- Go to the **Reformat Partner Name for State Purpose** tab and remove any special characters from the partners' names, including the middle initial.
- Perform a full re-compute, re-create the e-file, then re-submit.