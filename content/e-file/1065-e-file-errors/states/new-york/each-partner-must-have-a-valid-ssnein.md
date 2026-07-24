# E-file diagnostic: Each partner must have a valid SSN\EIN

```
NYC E-File: According to NYC E-Filing specifications, each partner must have a valid SSN\EIN. NYC does accept FOREIGNUS or APPLD FOR. NYC will NOT accept any SSN/EIN that are all 9s (or all 0s,1s,2s,3s,4s,5s,6s,7s,8s).
```

This happens when you haven’t updated the SSN/EIN in partner Information.

## Solution

- Go to

  **Organizer****Partner Information****Partner by Partner Data**

  .
- Select **Columnar Partner Entry**, then go to the **Name and Address** tab.
- Find the **Partner Information** section.
- In column **SSN/EIN**, enter the valid **SSN** or **EIN** number.
- Do a full recompute and re-create the e-file.

note

* As of 2023, IRS no longer allows FOREIGNUS to be e-filed.
* If the partner is a foreign partner and doesn't have a SSN or TIN, enter 000-00-0000 if the foreign partner is an individual or 00-0000000 if the partner is an entity.
* According to NYC E-Filing specifications, each partner must have a valid SSN\EIN.