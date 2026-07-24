# Error: The field ‘RoutingTransitNum’ with value '999999999', data format is not correct

This e-file validation error occurs when the routing transit number doesn't meet IRS format requirements. The routing number must be 9 digits and begin with specific two-digit prefixes (01 through 12 or 21 through 32). A trapped routing number is a placeholder value (like 999999999) that must be replaced with valid bank information.

## Error message

```
Validation failed on: Form: ReturnHeader Requirement: Routing Transit Number - 9 digits beginning with 01 through 12, or 21 through 32 Error: The field 'RoutingTransitNum' with value '999999999', data format is not correct. Element Name: RoutingTransitNum XPath: /Return[1]/ReturnHeader[1]/AdditionalFilerInformation[1]/AtSubmissionCreationGrp[1]/RoutingTransitNum[1] XML Fragment: 999999999 Field Key: 0,2643,1,0,0,0,0,0,0 Error Code: 80004005 Error Reason: '999999999' violates pattern constraint of '(01 02 03 04 05 06 07 08 09 10 11 12 21 22 23 24 25 26 27 28 29 30 31 32)[0-9]{7}'. The element '{http://www.irs.gov/efile}RoutingTransitNum' with value '999999999' failed to parse
```

## Solution

- Go to 

  **Organizer****General Information****Bank Information****Return**

  .
- Select **Remove Trapped Routing Number**, press the button, and compute.
- Enter the Routing Number and Bank Account numbers completely.
- Run a full recompute and recreate the e-file.