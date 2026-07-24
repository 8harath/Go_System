# Error: The attribute 'claimed' with value 'XXXXXX', data format is not correct

This New York e-file reject occurs when the paid preparer address contains special characters or exceeds the 29-character limit.

## **Error message**

```
Validation failed on AXXXXXX5.XNY:Form: rtnHeader: Requirement: Address Line format Error: The attribute 'claimed' with value 'XXXXXX', data format is not correct. Element Name: PREP\_LN\_1\_ADR XPath: /ReturnState\[1]/ReturnDataState\[1]/processBO\[1]/composition\[1]/forms\[1]/rtnHeader\[1]/PREP\_LN\_1\_ADR\[1] XML Fragment: Field Key: 0,0,0,0,0,0,0,0,0 Error Code: 80004005 Error Reason: 'XXXXXX' violates pattern constraint of '\[A-Za-z0-9]\(\[A-Za-z0-9 \\-/]{0,29})'.The attribute 'claimed' with value 'XXXXXXX' failed to parse.[/STYLE]
```

## Solution

- Go to 

  **Organizer****General Information****Basic Return Information**

  .
- Select 

  **Paid Preparer Information****Firm Information****Address**

  .
- Remove special characters from the address field, including commas and periods.
- Shorten the paid preparer address to 29 characters or fewer.
- Do a full recompute to update the return calculations.
- Recreate the e-file.

note

Addresses with commas, periods, or more than 29 characters will cause the e-file to reject.