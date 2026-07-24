# Element name: PREP\_LN\_1\_ADR e-file error

```
Validation failed on CXXXXXX4.xny:

Form: processBO[1] composition[1]/forms[1]/CT3ABC[1]/PREP_LN_1_ADR[1]
Requirement: Expecting AUTH_OFCR_SGN_DT
Error: Field 'PREP_LN_1_ADR' is unexpected

Element Name: PREP_LN_1_ADR
XPath: /ReturnState[1]/ReturnDataState[1]/processBO[1]/composition[1]/forms[1]/CT3ABC[1]/PREP_LN_1_ADR[1]
XML Fragment:
Field Key: 167,304,25,0,0,0,0,0,0
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}PREP_LN_1_ADR' is unexpected according to content model of parent element '{http://www.irs.gov/efile}CT3ABC'.
Expecting: {http://www.irs.gov/efile}AUTH_OFCR_SGN_DT.
```

This generally occurs when the tax office has already transmitted this return and the reject is simply a duplicate filing. It also occurs when the preparer is attempting to amend the Form **1120** and has failed to mark the return as an amended return.

## Solution

- In Organizer, select 

  **States****Common State****Basic Return Information**

  .
- Open the **Signature Information** tab.
- Go to the row for **New York**, Column L and enter the **Signature Date** for all members.
- If this is a consolidation then select **Subview** in the field and verify all members and enter their information.
- Do a full recompute of all members, reconsolidate, then create the e-file.