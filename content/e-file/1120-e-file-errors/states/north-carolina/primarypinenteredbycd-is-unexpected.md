# Error: Field ‘PrimaryPINEnteredByCd’ is unexpected

This e-file validation error appears when the North Carolina return expects a signature but gets an unexpected PIN field instead.

## Error message

```
Validation failed on CXXXXXX5.inc: Form: ReturnHeaderState Requirement: Expecting Signature Error: Field 'PrimaryPINEnteredByCd' is unexpected Element Name: PrimaryPINEnteredByCd XPath: /ReturnState\[1]/ReturnHeaderState\[1]/SignatureOption\[1]/SignaturePIN\[1]/PrimaryPINEnteredByCd\[1] XML Fragment: ERO Field Key: 139,986,13,0,0,0,0,0,0 Error Code: c00ce014 Error Reason: Element '{http://www.irs.gov/efile}PrimaryPINEnteredByCd' is unexpected according to content model of parent element '{http://www.irs.gov/efile}SignaturePIN'. Expecting: {http://www.irs.gov/efile}Signature
```

## Solution

- Go to

  **Organizer****States****North Carolina****E-file****Additional Information**

  .
- Go to the **Business Representative (Mandatory)** section.
- Select a **PIN Type** other than None Selected, such as **Practitioner PIN** or **Self-Select PIN**.
- If you have a state issued PIN, mark the **PIN Entered By** checkbox and enter the PIN in the field.
- Do a full recompute and recreate the e-file.