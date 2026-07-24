# X0000-010 e-file error xpath /CA-Return/CA-ReturnData/CAForm 565ScheduleK-1/PartnerInformation/USAddress

## Error

```
Your State submission does not match the latest published FTB Schema or is not well formed. You must contact your software provider to resolve this error.
```

## Cause

This return has missing or incorrect address information entered for a partner(s).

## Solutions

```
/CA-Return/CA-ReturnData/CAForm565ScheduleK-1/PartnerInformaion/

USAddress
```

- Go to **Organizer**, **Partner Information**, **Partner by Partner Data**, then **Columnar Partner Entry**.
- Go to the **Designations** tab and review each partner's entity type.


  - If there's incorrect entity types entered, correct those, then perform a full re-compute, re-create the e-file, then re-submit.
  - For those partners who are individuals, an accurate address needs to be entered on the **Name and Address** tab. If any changes are made, perform a full re-compute, re-create the e-file, then re-submit.