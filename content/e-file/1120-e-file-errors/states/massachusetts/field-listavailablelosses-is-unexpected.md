# Error: Field 'ListAvailableLosses' is unexpected

This error occurs when the Massachusetts Schedule NOL return contains an unexpected ListAvailableLosses element during XML validation. The error indicates that the schema expects CorpTotalIncome instead of ListAvailableLosses at the specified location.

## Error message

```
1. Validation failed on [FILE_ID]:

Form: SchNOL[1][@documentId='SchNOL] ListAvailableLosses[@documentId='NOLAvailable']
Description: List the available losses by tax year end. Losses may be carried forward up to 20 years. List any available losses from the oldest prior year first. Then list, in descending order, the available loss for each succeeding prior taxable year
LineNumber: Schedule NOL Line 4
Requirement: Expecting CorpTotalIncome
Error: Field 'ListAvailableLosses' is unexpected

Element Name: ListAvailableLosses
XPath: //ListAvailableLosses[@documentId='NOLAvailable']
XML Fragment: ******
Field Key: 124,1904,2,0,0,0,0,0,0
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}ListAvailableLosses' is unexpected according to content model of parent element '{http://www.irs.gov/efile}SchNOL'.
Expecting: {http://www.irs.gov/efile}CorpTotalIncome.
```

## Solution

- Go to 

  **Organizer****States****Massachusetts****State Adjustments**

  .
- In the **Income not subject to apportionment** field, enter **NONE** or the amount.
- Run a full recompute and recreate the e-file.