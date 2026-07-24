# E-file Diagnostic: Schedule K-1 Partner # must have name

```
Schedule K-1:Partner # with entity type Individual must have name separated into First and Last name fields (Middle Initial is optional).
```

This happens when partners that are individuals don't have their names formatted properly or they have an EIN instead of an SSN.

## Solution

- In **Organizer**, select **Partner Information**.
- Select **Partner by Partner**, then **Data**, then the **Columnar Partner Entry** folder.
- Go to the **Reformat Partner Name for State Purpose** tab.
- In the section for any partners who are Individual partners, reformat their names into the **First** and **Last Name** fields.
- Do a full recompute.
- In **Organizer**, select **State**, then the **Partner Information** folder.
- For each partner that is selected as an **Individual** partner, make sure you have a **First Name** and **Last Name** entered.
- Also verify that the SSN if formatted as XXX-XX-XXXX.
- Do a full recompute and recreate the e-file.