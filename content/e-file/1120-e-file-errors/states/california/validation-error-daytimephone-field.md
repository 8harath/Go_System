# Error: The field 'DaytimePhone' with value '0', data is missing

This validation error appears when the California extension payment's daytime phone field contains an invalid value instead of the required 10 digits.

## **Error message**

```
Validation failed on CXXXXXX5.ica: Form: CA-Payment\[1]\[@documentId\='ExtensionPayment] PaymentInformation\[1]/DaytimePhone\[1] Description: Daytime phone number Requirement: Used for a phone no. - 10 digits Error: The field 'DaytimePhone' with value '0', data is missing. Element Name: DaytimePhone XPath: //CA-Payment\[@documentId\='ExtensionPayment']/PaymentInformation\[1]/DaytimePhone\[1] XML Fragment: 0 Field Key: 105,1484,24,0,0,0,0,0,0 Error Code: 80004005 Error Reason: '0' violates pattern constraint of '\[0-9]{10}'. The element '{http://www.ftb.ca.gov/efile}DaytimePhone' with value '0' failed to parse
```

## Solution

- Go to 

  **Organizer****States****Common State****General Information****Basic Return Information****Signature Information**

   tab.
- Enter the phone number in the **Phone Number** field (Column **H**).

  note

  The phone number must be exactly 10 digits—don't include dashes, spaces, or other characters.
- Run a full recompute and recreate the e-file.