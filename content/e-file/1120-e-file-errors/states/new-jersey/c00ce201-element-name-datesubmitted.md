# E-file error: Element name 'DateSubmitted'

## Error

```
Error parsing '0' as date datatype. The element 'DateSubmitted' with value '0' failed to parse.
```

## Cause

For combined New Jersey returns, the payment and date made must be included in the e-file. This error indicates the date submitted is missing.

## Solution

- Go to **Organizer**, **States**, **Common State**, **Estimates and Extensions**, then **Estimates and Extensions**.
- Select the **Payments of Tax** tab.
- Select the New Jersey row, and enter the date for any quarters that have an amount.
- Perform a full re-compute, re-create the e-file, then re-submit.