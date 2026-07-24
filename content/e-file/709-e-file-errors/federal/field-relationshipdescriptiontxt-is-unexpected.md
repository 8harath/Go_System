# Error: Field "RelationshipDescriptionTxt" is unexpected

This error occurs when the donee address is missing or incomplete on a Form 709 gift tax return. Enter the complete donee address information to resolve the validation error.

## Error message

```
Validation failed on [FILE_ID]:

Form: IRS709[1][@documentId='IRS709] DonorGiftsSubjectToGiftTxGrp[2]/RelationshipDescriptionTxt[1]
Description: Donee's Relationship To Donor
LineNumber: Schedule A Part 1 Column (c)
Requirement: Expecting DoneeUSAddress, DoneeForeignAddress
Error: Field 'RelationshipDescriptionTxt' is unexpected

Element Name: RelationshipDescriptionTxt
XPath: //IRS709[@documentId='IRS709']/DonorGiftsSubjectToGiftTxGrp[2]/RelationshipDescriptionTxt[1]
XML Fragment: Son
Field Key: 1,100,128,1,1,5,0,0,0
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}RelationshipDescriptionTxt' is unexpected according to content model of parent element '{http://www.irs.gov/efile}DonorGiftsSubjectToGiftTxGrp'.
Expecting: {http://www.irs.gov/efile}DoneeUSAddress, {http://www.irs.gov/efile}DoneeForeignAddress.
```

## Solution

- Go to 

  **Organizer****List of Gift Recipients****Name****Recipient Information**

  .
- Enter the Donee Address and relationship to the donor.

  note

  Alternatively, check the checkbox **Check if address is same as donor**.
- Do a full recompute and recreate the e-file.