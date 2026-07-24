# E-file error: Field OwnerPartnerInformation missing

```
Form: Form84131[1] OwnerPartnerInformation[1]
Requirement: Expecting PassThroughEntityElection, Status
Error: Field 'OwnerPartnerInformation' is unexpected
```

This happens when line 5 is empty.

## Solution

- Go to Tax Forms.
- Select **States**, then **Mississippi**.
- Select **84-131 (Sch K)**, then line 5.
- The state does not accept a blank line 5. It triggers a diagnostic.
- Enter **NONE** or enter the information.
- Do a full recompute and recreate the e-file