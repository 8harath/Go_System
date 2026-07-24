# Error: Field ‘Id’ is unexpected

This e-file validation error happens when the Hawaii Tax ID number is missing or uses an incorrect format. The system expects a properly formatted Hawaii Tax ID (GE or W prefix).

## Error message

```
Validation failed on PXXXXXX5.XHI: Form: SchNP\[1] NPTable\[1]/Id\[1] Description: Id, Must be an SSN FormNumber: SchNP Table Requirement: Expecting IdType Error: Field 'Id' is unexpected Element Name: Id XPath: /ReturnState\[1]/ReturnDataState\[1]/SchNP\[1]/NPTable\[1]/Id\[1] XML Fragment: 123456789 Field Key: 110,676,129,0,0,0,0,0,0 Error Code: c00ce014 Error Reason: Element '{http://www.irs.gov/efile}Id' is unexpected according to content model of parent element '{http://www.irs.gov/efile}NPTable'. Expecting: {http://www.irs.gov/efile}IdType
```

## Solution

- Enter a valid Hawaii Tax ID number in

  **Organizer****States****Hawaii****General Information****Tax ID Number**

  .


  * If the ID starts with GE, use twelve digits.
  * If the ID starts with W, use eight digits.

  note

  If you don't have a valid Hawaii Tax ID number, contact the State of Hawaii for assistance. You'll need a valid ID before you can proceed with e-filing.
- Run a full recompute and re-create the e-file to clear related errors.
- Verify the Hawaii Tax ID on Form N-20 is formatted correctly:

  * GE + 12 digits
  * W + 8 digits