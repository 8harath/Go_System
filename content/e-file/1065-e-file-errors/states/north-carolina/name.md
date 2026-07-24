# E-file error: Field 'Name' with value 'XXX,XXX' data format is not correct

```
Form: FormNCD403[1] Part4[1]/Partners[2]/PartA[1]/PartnerInfo[1]/IDName[1]/Business[1]/Name[1]
Requirement: Used for business name. Limited to 70 characters. 
Legal Characters: A-Z, a-z, 0-9, hash, hyphen, parentheses, ampersand, apostrophe and single space. 
Illegal Character: leading space, trailing space, adjacent spaces, and other symbols.
Error: The field 'Name' with value 'XXX, XXX', data format is not correct.
```

This happens when you use an illegal special character: leading space, trailing space, adjacent space, and other symbols.

## Solution

- Go to **Organizer,** **Partner Information** and**Partner by Partner Data**.
- Select **Partner name**, **Partner Information** and **Partner Information** again.
- Remove the special character.
- Do a full re-compute, recreate the e-file, then resubmit.