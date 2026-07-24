# E-file diagnostic: Federal Filer (Mandatory)

```
Federal Filer (Mandatory): Federal Identification Number (FEIN), TTA Locator/Binder Number, and TTA Account Number of the Federal Return are required fields for [State] efile transmission. All the three fields are mandatory and must have valid data entry. Navigation:\Organizer\States\Common State Fed-State Electronic Filing Options\Federal Copy
```

This happens when the federal copy is missing in the state return.

## Solution

This diagnostic, worded slightly differently for various states, is applicable to all states that require a federal attachment to the state return.

- Go to **Organizer**, **States**, then the **State E-File** folder.
- Select **Enable/Create Returns** and go to the **Federal Copy** tab.
- In the state row you're getting the error for:


  - Select an option for **Federal Copy** in column **B**.
  - Enter the **Federal EIN**, the **Locator Number**, and the **Account Number** in the respective columns.
- Do a full recompute and recreate the e-file.

You need to complete this information even if you're attaching the Federal XML created in the Federal Organizer, or using the State Copy option. You can find the locator number in the Organizer under 

**Help****About 1120 Tax**

 or 

**Help****About 1065 Tax**

. The Return Number listed here is the locator number.