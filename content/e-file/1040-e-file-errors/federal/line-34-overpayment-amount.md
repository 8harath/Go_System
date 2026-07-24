# E-file diagnostic: Form 1040, line 34 (overpayment amount) is greater than line 38

```
Form 1040: If Form 1040, line 34 (overpayment amount) is greater than line 38 (estimate penalty amount) then the line 34 (overpayment amount) must equal the sum of lines 35a (refund amount), line 36 (amount applied to next year estimates), and line 38 (estimate penalty amount). If you have additional penalties and interest, please add them back into the amount on line 35a (refund amount) or line 36 (amount applied to next year estimates) in order to efile. (Rule Number: IND-073).
```

This happens when additional penalties and interest are being calculated.

## Solution

- In Organizer, select**Estimates and Penalties**, then**Penalties and Interest**.
- Go to the Additional Penalties and Interest section, remove the selection **Compute Interest on balance due** and **Compute interest on late filing penalty, if any**.
- In the Late Payment Penalty section, select **Do not compute the penalty**.
- In the Late Filing Penalty section, select**Do not compute the penalty**.
- In the Additional Penalties and Interest from Form 8978section, **Do Not Include Penalties and Interest from Form 8978**.
- Do a full recompute and recreate the e-file.

  note

  This is an IRS limitation. They don't allow additional penalties and interest included in either the refund amount or the amount owed. The return will be rejected with additional penalties and interest included. This doesn't apply to the estimated tax penalty.