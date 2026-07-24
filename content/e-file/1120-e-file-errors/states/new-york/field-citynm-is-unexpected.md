# Error: Field 'CityNm' is unexpected

This e-file validation error occurs when you populate both address fields in the entity information. The system expects only 1 address, which causes the CityNm element to appear in an unexpected position in the XML structure.

## Error message

```
Validation failed on: Form: ReturnHeaderState Requirement: City Requirement: Expecting AddressLine1Txt Error: Field 'CityNm' is unexpected Element Name: CityNm XPath: /ReturnState[1]/ReturnHeaderState[1]/Filer[1]/USAddress[1]/CityNm[1] XML Fragment: Atlanta Field Key: 167,1144,2,0,0,0,0,0,0 Error Code: c00ce014 Error Reason: Element '{http://www.irs.gov/efile}CityNm' is unexpected according to content model of parent element '{http://www.irs.gov/efile}USAddress'. Expecting: {http://www.irs.gov/efile}AddressLine1Txt
```

This error means the system found a city name where it expected a street address, because 2 addresses exist in the entity information.

## Solution

Complete these steps to resolve the validation error:

- Go to 

  **Organizer****General Information****Basic Return Information****Entity Information****Address**

  .
- Delete the contents of 1 address field, keeping only the primary business address.

  important

  Use only 1 address field. Remove the duplicate address before proceeding.
- For consolidated returns, complete the following additional steps:
- At the TopCon, open 

  **Organizer****States****State and City Activation/Consolidation****State and City Activation/Consolidation**

  .
- Find **NY**, right-click **Column C**, and select **subview**.
- Open and lower members not yet set up and add them.
- Go to 

  **Organizer****States****State Combined Returns****State Consolidation Steps****Option 6: Delete previously transferred state data**

  .
- Select **New York** from the state list.
- Go to 

  **Organizer****Consolidated Returns****Step 1 - What to Consolidate****Consolidated Return List**

  .
- Select **Subsidiary Listing Complete**.
- Go to 

  **Step 4 - Review Preconsol Checklist****Out of balance and compute pending**

  .
- Select **Compute all subsidiaries now**.
- Go to 

  **Step 5 - Consolidate!****Consolidate**

  .
- Recompute the return and recreate the e-file.
- Verify the e-file status shows as qualified before submitting.