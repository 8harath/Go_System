# ILAuth-100-3 e-file error

```
IL Authorization (Rule ILAuth-100-3): If Form IL-Authorization Line 1 contains "Jurat statement accepted and debit authorized", then the submission must contain IL-Financial and either Form IL-1120 or Form IL-1120-ST.
```

You'll receive this message when the IDOR payment checkbox is marked but no payment is due for an 1120 Illinois return.

## Solution

- In Organizer select **States**, then **Illinois**.
- Select **E-file**, then **Additional Information**.
- Clear the checkbox regarding the IDOR payment.
- Do a full recompute.
- Recreate the e-file.