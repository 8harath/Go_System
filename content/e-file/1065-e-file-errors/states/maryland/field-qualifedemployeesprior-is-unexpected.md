# Error: Field 'QualifedEmployeesPrior' is unexpected

This error occurs on a Maryland Partnership Return when Schedule K-1 contains "NONE" entries in the One Maryland Economic Development Credit prior year fields. Clearing these entries resolves the validation error. Applies to: OneSource Income Tax, GoSystem Tax RS, and Income Tax Express RS.

## Error message

```
Validation failed on [FILE_ID]:

Requirement: Expecting RefundableCreditPrior, NonrefundableCreditPrior, QualifiedEmployeesPrior, Employees5YearsPrior, ProjectIncomePrior, NonProjectIncomePrior, EmployeeCostsPrior, RequiredWithholdingTaxPrior, TotalProjectCostsPrior, TotalStartUpCostsPrior
Error: Field 'QualifedEmployeesPrior' is unexpected
There is an issue with the Maryland Partnership Return e-file. Please contact Thomson Reuters Support for this issue.

Element Name: QualifedEmployeesPrior
XPath: //ScheduleK1[@documentId='ScheduleK1']/Credits[1]/OneMDEconomicDevelopCrPr[1]/QualifedEmployeesPrior[1]
XML Fragment: 0
Field Key: 155,443,137,0,1,0,0,0,0
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}QualifedEmployeesPrior' is unexpected according to content model of parent element '{http://www.irs.gov/efile}OneMDEconomicDevelopCrPr'.
Expecting: {http://www.irs.gov/efile}RefundableCreditPrior, {http://www.irs.gov/efile}NonrefundableCreditPrior, {http://www.irs.gov/efile}QualifiedEmployeesPrior, {http://www.irs.gov/efile}Employees5YearsPrior, {http://www.irs.gov/efile}ProjectIncomePrior, {http://www.irs.gov/efile}NonProjectIncomePrior, {http://www.irs.gov/efile}EmployeeCostsPrior, {http://www.irs.gov/efile}RequiredWithholdingTaxPrior, {http://www.irs.gov/efile}TotalProjectCostsPrior, {http://www.irs.gov/efile}TotalStartUpCostsPrior.
```

## Solution

- Go to 

  **Tax Forms****States****Maryland****Sch K-1****Sch K-1, Page 2**

   for all partners.
- Remove the NONE from **Line 33a** and **Line 36** for each partner so that the fields are blank.
- Run a full recompute and recreate the e-file.