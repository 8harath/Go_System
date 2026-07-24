# X0000-010 e-file error

## Error

```
Your State submission does not match the latest published FTB Schema or is not well formed. You must contact your software provider to resolve this error.
```

## Cause

This return has missing or incorrect partner information entered for disregarded entities.

## Solutions

```
/CA-Return/CA-ReturnData/CAForm565ScheduleK-1/PartnerInformation/DisregardedEntity/NotApplicable
```

- Go to **Organizer**, **States**, **California**, and then **Partner Information**.
- Review partner information to ensure it's accurate. If a partner is designated as a disregarded entity, then you need to complete the **Disregarded Entity** section.
- Perform a full re-compute, re-create the e-file, then re-submit.

```
/CA-Return/CA-ReturnData/CAForm565ScheduleK-1/PartnerInformation/DisregardedEntity/TIN
```

- Go to **Organizer**, **Partner Information**, and then **Partner by Partner Data**.
- Review any partner designated as a disregarded entity and verify the TIN is accurate.
- Perform a full re-compute, re-create the e-file, then re-submit.