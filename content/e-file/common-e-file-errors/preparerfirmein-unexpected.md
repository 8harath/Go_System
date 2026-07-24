# Error: Field ‘PreparerFirmEIN’ is unexpected

This error occurs when the 1065 state e-file validation expects preparer identification fields like PTIN or SSN. You'll need to enter complete preparer details in the Paid Preparer Information section to fix this validation failure.

## Error message

```
Validation failed on PXXXXXX5.ITN: Form: ReturnHeaderState Requirement: Expecting SelfEmployedInd, PTIN, STIN, PreparerSSN Error: Field 'PreparerFirmEIN' is unexpected Element Name: PreparerFirmEIN XPath: /ReturnState\[1]/ReturnHeaderState\[1]/PaidPreparerInformationGrp\[1]/PreparerFirmEIN\[1] XML Fragment: ######### Field Key: 118,108,2,0,0,0,0,0,0 Error Code: c00ce014 Error Reason: Element '{http://www.irs.gov/efile}PreparerFirmEIN' is unexpected according to content model of parent element '{http://www.irs.gov/efile}PaidPreparerInformationGrp'. Expecting: {http://www.irs.gov/efile}SelfEmployedInd, {http://www.irs.gov/efile}PTIN, {http://www.irs.gov/efile}STIN, {http://www.irs.gov/efile}PreparerSSN
```

## Solution

- Go to 

  **Organizer****General Information****Paid Preparer/ERO Information****Paid Preparer Information****Paid Preparer Information**

   section.
- Enter a name and the following required information:


  * SSN
  * PTIN
  * Email
  * Phone
  * Signature Date
- Recompute the return and recreate the e-file.