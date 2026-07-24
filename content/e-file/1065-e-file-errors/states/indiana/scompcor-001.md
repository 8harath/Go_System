# SCOMPCOR-001 e-file error

```
IF exception code CORExceptionEntityCode 03 through 13 is present a corresponding INCompA is required.
```

This reject happens when the partner has exception code populating in the tax forms, but no IN CompA has been generated.

## Solution

- Go to **Organizer**, **States**, and select **Indiana**.
- Go to **Composite Return**, and the **Composite Information** section.
- **X** and **Opt Out** must both be checked to activate the IN CompA.
- Do a full recompute, recreate the e-file, and resubmit the return.