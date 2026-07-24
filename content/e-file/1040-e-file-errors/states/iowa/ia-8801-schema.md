# E-file diagnostic: IA 8801 schema no longer nested inside the IA 148

```
Iowa IA 8801: As IA 8801 schema no longer nested inside the IA 148, when IA 8801 exist, tax credit code '09 Iowa Alternative Min Tax Credit' needs to be selected. and amount needs to be entered on IA 148 organizer. Go to Iowa Organizer / Credits / IA-148 Tax Credits.
```

This happens when credits are populated but no tax credit has been selected.

## Solution 1

If you don’t have tax credits to select,

- In **Tax Forms**, select **States**, then **Iowa**.
- Select **IA 8801 - PY AMT Credit**.
- The diagnostic is triggered when line 7 is populated with NONE. Override NONE by selecting the space bar so that line is blank. This clears the diagnostic without selecting a tax credit.
- Do a full recompute and recreate the e-file.

## Solution 2

Check your IA 148 tax credits:

- In Organizer, select**States**, then **Iowa**.
- Select **Credits**, then **IA-148 Tax Credits**.
- In the **Schedule 148 Nonrefundable Credits** section, under **Credit name**, select tax credit code **09 Iowa Alternative Min Tax Credit (IA 8801)**.
- Do a full recompute and recreate the e-file.