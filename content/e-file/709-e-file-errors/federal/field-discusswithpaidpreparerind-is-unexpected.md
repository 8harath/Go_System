# Error: Field "DiscussWithPaidPreparerInd" is unexpected

This error occurs on a Federal 709 e-file when signature authorization settings aren't configured. Configure the signature options to resolve the validation error.

## Error message

```
Validation failed on [FILE_ID]:

Form: ReturnHeader
Description: Discuss With Paid Preparer Indicator
Requirement: Expecting PrimaryPINEnteredByCd, SignatureOptionCd
Error: Field 'DiscussWithPaidPreparerInd' is unexpected

Element Name: DiscussWithPaidPreparerInd
XPath: /Return[1]/ReturnHeader[1]/DiscussWithPaidPreparerInd[1]
XML Fragment: true
Field Key: 7,27,5,0,0,0,0,0,0
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}DiscussWithPaidPreparerInd' is unexpected according to content model of parent element '{http://www.irs.gov/efile}ReturnHeader'.
Expecting: {http://www.irs.gov/efile}PrimaryPINEnteredByCd, {http://www.irs.gov/efile}SignatureOptionCd.
```

## Solution

- Go to 

  **Organizer****E-file****Signature Authorization**

  .
- Make a selection other than **Not applicable** in both the **Signature for 709** and **PIN Entered by** sections.
- Recompute and recreate the e-file.