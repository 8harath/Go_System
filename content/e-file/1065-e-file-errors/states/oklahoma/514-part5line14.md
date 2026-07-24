# 514-Part 5, Line 14 e-file error

```
514-Part5,Line14: If the Form 514, Part 5, line 1, Partner's State (USAddress, StateAbbreviationCd) is not "OK" or is null, line 14 [(YesCheckBox) or (NoCheckBox)] should be complete. If the Partner's State is "OK", line 14 should be null.
```

This happens when Form 514, Part 5, line 1 is blank or has another state abbreviation besides OK but line 14 is blank. If the Partner’s state is Oklahoma, line 14 should be null.

## Solution

- In **Organizer**, select **States**, then **Oklahoma**.
- Select **e-File**, go to 

  **Attachments****K-1 Aggregation****Summary**

  .
- Check if the option to **Suppress partner information for 514-PT Part 5** is marked. The client will either clear it or remove the K-1 aggregation file and reattach it as the Part 5 K-1 aggregation file.
- Perform a full recompute and recreate the e-file.