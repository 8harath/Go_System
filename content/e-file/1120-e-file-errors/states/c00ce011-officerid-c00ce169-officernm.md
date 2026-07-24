# c00ce011 Element name: OfficerID and c00ce169 Element name: OfficerNm e-file errors

## Errors

```
c00ce011 Element name: OfficerID - Element 'OfficerID' cannot be empty according to the DTD/Schema.
```

```
c00ce169 Element name: OfficerNm - " violates pattern constraint of '([A-Za-z0-9'\-] ?)*[A-Za-z0-9'\-]'. The element 'OfficerNm' with value " failed to parse.
```

## Cause

The officer ID and name is missing from the e-file.

## Solution

- Go to **Organizer**, **General Information**, **Basic Return Information**, and select the **Entity Information** tab.
- Enter the EIN or a reason for it missing.
- Go to the **Signing Officer** section and enter the officer signing information, including their SSN.
- Go to **Organizer**, **States**, **Common State**, **General Information**, **Basic Return Information**, and select the **Signature Information** tab.
- Enter signing information and the signature date in the state row that applies.
- Perform a full re-compute, re-create the e-file, then re-submit.