# ReturnDataState e-file error

```
The element ReturnDataState in namespace http://www.irs.gov/efile has invalid child element Form20S65 in namespace http://www.irs.gov/efile. List of possible elements expected: Form65Corp in namespace http://www.irs.gov/efile.
```

This happens when there's 1 partner that's a corporate partner, so Pennsylvania's expecting only Form PA-65 Corp.

## Solution

- Go to **Organizer**, **Partner Information**, **Partner by Partner Data**, and then **Columnar Partner Entry**.
- Select **Designations** and make sure the entity type selected is accurate. If changes are made, perform a full recompute, recreate the e-file, then resubmit.
- If the information's accurate in step 2, go to **Organizer**, **States**, **Pennsylvania**, **E-file PA 65 Corp**, **Attachments**, **K-1 Sch CP Aggregation**, and then **Summary**.
- Select **Attach K-1 Schedule CP Aggregation XML File** and attach a PDF copy of this schedule.
- Perform a full recompute, recreate the e-file, then resubmit.

note

When there are corporate partners, Pennsylvania is only expecting you to submit PA-65 Corp, not the full Pennsylvania e-file. You can also contact the state to determine your best course of action.