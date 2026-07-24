# FINTRAN-98150 e-file error

```
State Payment Amount in Financial Transaction, if present, must be greater than 0.
```

This happens when financial transaction information has been entered with NONE for the amount to be paid.

## Solution

- Go to **Organizer**, **States**, then **Common state**.
- Select **General information**, then **Bank information**.
- On the **Direct Debit** tab, remove the routing number, account number, and amount to be debited (if NONE was populated).

note

If no tax is due, view the note on the Maryland form 510E: "If no tax is due with this extension, do not mail this paper form unless it is the first filing of the entity, instead file the extension at: [www.marylandtaxes.gov](https://www.marylandtaxes.gov/) or call 410-260-7829 from central Maryland or 1-800-260-3664 from elsewhere to telefile this form."