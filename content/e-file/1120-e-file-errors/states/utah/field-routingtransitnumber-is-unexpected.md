# Error: Field 'RoutingTransitNumber' is unexpected

This validation error occurs when you e-file a Utah 1120 extension without complete bank information or with a zero payment amount. Utah requires a payment with extension e-files.

## Error message

```
Validation failed on CXXXXXX.iut1: Requirement: Expecting Checking, Savings Error: Field 'RoutingTransitNumber' is unexpected Element Name: RoutingTransitNumber XPath: /ReturnState[1]/FinancialTransaction[1]/StatePayment[1]/RoutingTransitNumber[1] XML Fragment: 019999999 Field Key: 154,543,6,0,0,0,0,0,0 Error Code: c00ce014 Error Reason: Element '{http://www.irs.gov/efile}RoutingTransitNumber' is unexpected according to content model of parent element '{http://www.irs.gov/efile}StatePayment'. Expecting: {http://www.irs.gov/efile}Checking, {http://www.irs.gov/efile}Savings
```

## Solution

If there's a payment due, complete all bank information:

- Go to 

  **Organizer****States****Common State****General Information****Bank Information****Extension debit tab**

  .
- For the state row, enter the account type (**Checking** or **Savings**), routing number, and account number.
- Do a full recompute and recreate the e-file.