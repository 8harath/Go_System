# c00ce014 e-file error Element name: OfficerID

## Error

```
Element 'OfficerID' is unexpected according to content model of parent element 'Corporate.' Expecting: OfficerNm.
```

## Cause

The officer ID is missing from the state e-file.

## Solution

- Go to **Organizer**, **General Information**, and then **Basic Return Information**.
- Select the **Entity Information** tab.
- In the **Entity Information** section, enter the corporation's EIN.
- Next, select the **Return Information** tab.
- In the **Signing Officer** section, complete the officer signing information, including the SSN.
- Go to **Organizer**, **States**, **Common State**, **General Information**, and then **Basic Return Information**.
- Select the **Signature Information** tab, and enter the signing information including the signature date in the proper state row.
- Perform a full re-compute, re-create the e-file, then re-submit.