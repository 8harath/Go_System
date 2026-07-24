# Error: The field “TaxpayerDaytimePhoneNum” with value '0', data is missing

This error occurs when the taxpayer's daytime phone number is invalid. The IRS requires a 10-digit phone number. The system sends "0" when no valid home phone number exists or the preferred contact option is set incorrectly.

## Error message

```
Validation failed on: Form: IRSPayment\[1]\[@documentId\='IRSPayment] TaxpayerDaytimePhoneNum\[1] Requirement: Taxpayer's Daytime Phone Number Requirement: Used for a phone no. - 10 digits Error: The field 'TaxpayerDaytimePhoneNum' with value '0', data is missing. Element Name: TaxpayerDaytimePhoneNum XPath: //IRSPayment\[@documentId\='IRSPayment']/TaxpayerDaytimePhoneNum\[1] XML Fragment: 0 Field Key: 1,166,9,0,0,0,0,0,0 Error Code: 80004005 Error Reason: '0' violates pattern constraint of '\[0-9]{10}'. The element '{http://www.irs.gov/efile}TaxpayerDaytimePhoneNum' with value '0' failed to parse
```

## Solution

- Go to 

  **Organizer****General Information****Basic Return Information****Taxpayer Information**

  .
- Enter a 10-digit home phone number in the **Home Phone** field.
- Set the **Preferred Taxpayer Contact Number** option to **HOME**. It can't be a cell phone.