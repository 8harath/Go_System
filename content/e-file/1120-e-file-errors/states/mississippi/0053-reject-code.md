# 0053 e-file error

```
Federal or state MS Return
Record No NA
Form Occurrence No 0
Field Seq No 0
Form No
Page No 1
Reject Code 53
Path to XML Error
Error Category Acceptance Validation
Rule Number 0053
Severity Error
Data Value
Alternate Reject Code 0
Message Required Combined Income Tax Schedule (Form 83-310) was not transmitted
```

This happens when the filing status did not match the entity type submitted.

## Solution

- In Organizer, select **States**, then **Common State**.
- Select **General Information**, then **Basic Return Information**.
- Select the **Filing Status** tab.
- Go to the row for **Mississippi**.
- When Column C shows as combined, the return shouldn't be filed out of this locator with this status, it should be filed at the Topcon level.
- If Mississippi is being filed out of this locator, then set Column C to **single**, and the State and City Activation **single**as well.
- Do a full recompute, recreate, and resubmit the e-file.