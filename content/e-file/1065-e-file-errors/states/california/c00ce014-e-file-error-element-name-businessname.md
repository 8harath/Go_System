# c00ce014 e-file error Element name: BusinessName

## Error

```
Element 'BusinessName' is unexpected according to content model of parent element 'Other.' Expecting: 'IdNumber,' RevocableTrustIdNumber.
```

## Cause

A return receives this error when the ID Type (EIN or SSN) doesn't match the partner type selected.

## Solution

For the partner listed:

- Go to **Organizer**, **States**, **California**, **Partner Information**, and **Other Partner Information**.
- The entity type needs to match the ID Type. Only individuals can have an SSN entered. All other entity types must have an EIN.