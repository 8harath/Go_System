# E-file error: The field 'PrtnrShipNm' with value 'X', data format is not correct.

```
The field 'PrtnrShipNm' with value 'X', data format is not correct.
```

This error happens if the partner name or entity information contain special characters.

## Solution

- Select **Organizer**, **Partner Information**, then **Partner by Partner Data**.
- Select the partner name.
- Select **Partner Information**, then **Partner Information Name**.
- Remove any special characters.
- Select **Organizer**, **General Information**, **Basic Return Information**, then **Entity Information**.
- Remove any special characters.
- Do a full re-compute, recreate the e-file, and resubmit.