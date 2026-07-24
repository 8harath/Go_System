# Error: The field ‘StateofCorp’ with value '0', data is missing

This error appears when the State of Incorporation field contains an invalid value ('0') instead of a valid two-letter state code. Required entity information is missing for the New Jersey return.

## Error message

```
Validation failed on CXXXXXXX5.inx: Form: Header Requirement: State abbreviations, a.k.a. state codes Error: The field 'StateofCorp' with value '0', data is missing. Element Name: StateofCorp XPath: /ReturnState[1]/ReturnHeaderState[1]/Header[1]/StateofCorp[1] XML Fragment: 0 Field Key: 24,906,13,0,0,0,0,0,0 Error Code: 80004005 Error Reason: '0' violates enumeration constraint of 'AL AK AS AZ AR CA CO MP CT DE DC FC FI FM FL GA GU HI ID IL IN IA KS KY LA ME MH MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PW PA PR RI SC SD TN TX VI UT VT VA WA WV WI WY AA AE AP'. The element '{http://www.irs.gov/efile}StateofCorp' with value '0' failed to parse
```

## Solution

- Go to 

  **Organizer****States****Common State****General Information****Basic Return Information****Entity Information tab**

  .
- Locate the **New Jersey** row.
- Fill out columns **E**, **F**, and **I**.
- Enter the date qualified in state in column **E** using the following format: MM/DD/YYYY.
- Run a full recompute and recreate the e-file.

note

Verify that all required columns (E, F, and I) have valid selections before recreating the e-file.