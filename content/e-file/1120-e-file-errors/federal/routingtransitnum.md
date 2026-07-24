# Error: The field ‘RoutingTransitNum’ with value '0', data is missing

This error occurs when the routing transit number field contains an invalid or missing value.

## Error message

```
Validation failed on CXXXXXX5.xml: Form: ReturnHeader Requirement: Routing Transit Number - 9 digits beginning with 01 through 12, or 21 through 32 Error: The field 'RoutingTransitNum' with value '0', data is missing. Element Name: RoutingTransitNum XPath: /Return\[1]/ReturnHeader\[1]/AdditionalFilerInformation\[1]/AtSubmissionFilingGrp\[1]/RefundDisbursementGrp\[1]/RoutingTransitNum\[1] XML Fragment: 0 Field Key: 0,621,1,0,0,0,0,0,0 Error Code: 80004005 Error Reason: '0' violates pattern constraint of '(01 02 03 04 05 06 07 08 09 10 11 12 21 22 23 24 25 26 27 28 29 30 31 32)\[0-9]{7}'. The element '{http://www.irs.gov/efile}RoutingTransitNum' with value '0' failed to parse
```

## Solution

- Go to 

  **Organizer****General Information****Bank Information****Return**

  .
- Enter a valid routing number.

  note

  The routing number must be 9 digits and begin with 01 through 12, or 21 through 32.
- Run a full recompute and re-create the e-file.