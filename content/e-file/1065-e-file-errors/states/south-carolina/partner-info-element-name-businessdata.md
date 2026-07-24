# E-file error: Partner info element name BusinessData

```
Form: SchSC1065K1PartnerInfo/BusinessData
Requirement: Expecting FEIN
Error: Content for field 'BusinessData' is incomplete

Element Name: BusinessData
XPath: /ReturnState[1]/ReturnDataState/SchSC1065K1/PartnerInfo/BusinessData
XML Fragment: The Wilson Family SuperannuationFund
56 Powlett StreetEast MelbourneField Key: 0,0,0,0,0,0,0,0,0
Error Code: c00ce012
Error Reason: Content for element '{http://www.irs.gov/efile}BusinessData' is incomplete according to the DTD/Schema.
Expecting: {http://www.irs.gov/efile}FEIN.
```

You get this error when the FEIN/SSN field is blank.

## Solution

The State of South Carolina does not allow the FEIN/SSN to be blank or ForeignUS.

- In Organizer, go to 

  **Partner Information****Partner by Partner Data****Partner Name****Partner****Partner Information****Partner Information**
- In section add the Name, Address, Phone Number and SSN/EIN.
- In the subsection: SSN/EIN, enter SSN or EIN for this partner.
- Create the e-file again.
- You can use 99999999.
- Do a full re-compute and re-create the e-file.