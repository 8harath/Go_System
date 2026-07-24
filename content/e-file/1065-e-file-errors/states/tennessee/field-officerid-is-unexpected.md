# Error: Field 'OfficerID' is unexpected

This e-file validation error is triggered when the contact person name is not filled out for Tennessee.

## Error message

```
1. Validation failed on:
      Form: AuthenticationHeader
      Requirement: If this is a foreign national and there is no issued SSN, use 888008888 If there is an issued SSN and software understands and requests the officer's identification but the taxpayer chooses not to enter it, use 999009999
      Requirement: Expecting OfficerNm
      Error: Field 'OfficerID' is unexpected
      Element Name: OfficerID
      XPath: /ReturnState[1]/AuthenticationHeader[1]/BusinessDetail[1]/Partnership[1]/OfficerID[1]
      XML Fragment: 363258060
      Field Key: 0,0,0,0,0,0,0,0,0
      Error Code: c00ce014
      Error Reason: Element '{http://www.irs.gov/efile}OfficerID' is unexpected according to content model of parent element '{http://www.irs.gov/efile}Partnership'.
      Expecting: {http://www.irs.gov/efile}OfficerN[/STYLE]
```

## Solution

- Go to 

  **Organizer****States****Common State****General Information****Books and Records****Contact Person**

  tab
- In the **Tennessee Franchise** row, enter the contact person's name in **Columns B** and **C**.
- Do a full recompute and recreate the e-file.