# E-file diagnostic: An invalid EIN was entered for Form IT-204

```
NY E-File: An invalid EIN was entered for Form IT-204 page 7, section 9. The length must be 9 characters. First two characters can be TF or NY for some forms , must be numeric, can not be '999999999', '989999999', '988888888', '000000000' or '888888888' or '980000000'. NY does NOT allow FOREIGNUS or APPLD FOR to be entered as an EIN.
```

This happens when an invalid EIN is entered for Schedule B.

## Solution

- Go to **Organizer**, then **States** folder.
- Select **New York**, then the **State Information** folder.
- Go to the **Business Address** tab.
- Go to the **Federal Schedule B, Ownership of Other Partnerships** section. All EINs in this section must be valid.
- Do a full recompute and recreate the e-file.