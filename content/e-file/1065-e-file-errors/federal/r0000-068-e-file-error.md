# R0000-068 e-file error

```
Federal 1065 MeF: If you use the PIN signature option (Form 8879-PE), you must enter the ERO's PIN, General Partner's PIN, Partner Name, Partner Title, Date Signed, and who entered the PIN number. R0000-068 Organizer General Information Basic Return Information Tab 'Signing General Partner or LLC Member Manager.'
```

This happens because signature information is missing or not carrying through to the return due to overrides.

## Solution

- Go to **Organizer**, **General Information**, and then **Basic Return Information**.
- Select the **Return Information** tab.
- In the **Signing Partner or LLC Member** section, enter:


  - First name
  - Last name
  - Title
  - Date
- Next, go to **Federal E-file**, and **Signature Authorization**.
- In the **If Form 8879 - Practitioner PIN is selected** section, select either**General partner of LLC Member** or **ERO**.
- In the **PIN Information** section:


  - select **Randomly generate general partner or LLC PIN** and **Use first 5 numbers of firm EIN as ERO PIN**, or
  - manually enter both PINs.
- Perform a full re-compute and check if the diagnostic's been removed. If so, create the e-file and transmit. If the diagnostic still exists, continue to step 8.
- In **Tax Forms**, go to **Form 1065**.
- On the**Form 1065, Page 1** tab, check if there's any overrides in the signature area of the form. If overrides exist, remove them.
- Also review **Form 8879-PE** for any overrides and remove any that exist.
- Lastly, perform a full re-compute, create the e-file, and transmit the return.