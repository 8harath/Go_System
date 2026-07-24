# Error: The field ‘Date’ with value '0', data is missing Form 05-102

This error happens when the Signature Date field on Texas Form 05-102 contains '0' instead of a valid date. You haven't entered or transferred the signatory date to the subsidiary returns.

## Error message

```
Validation failed on: Form: Form05-102[3] Signatory[1]/Date[1] Requirement: Base type for a date Error: The field 'Date' with value '0', data is missing. Element Name: Date XPath: /ReturnState[1]/ReturnDataState[1]/Form05-102[3]/Signatory[1]/Date[1] XML Fragment: 0 Field Key: 152,688,5,0,0,0,0,0,0 Error Code: 80004005 Error Reason: Error parsing '0' as date datatype. The element '{http://www.irs.gov/efile}Date' with value '0' failed to parse
```

This error may appear multiple times. It references different Form05-102 instances (Form05-102[3], Form05-102[4], Form05-102[5]) when multiple subsidiary returns don't have the signature date.

## Solution

- Go to 

  **Organizer****State Franchise Tax****Texas Franchise****Information Report****Common Information****Signatory Information**

  Section.
- Enter the **Signature Date**.
- Select **Transfer to Parent and Subs**.

  tip

  The Transfer to Parent and Subs option copies the signature date to all related entity returns in the consolidated group. This prevents the error from appearing on multiple Form 05-102 instances.
- Run a full recompute by selecting the **recompute** option from the toolbar or menu.
- Reconsolidate the return by selecting the consolidation option from the return menu.
- Recreate the e-file.