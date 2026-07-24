# E-file error: The field 'MiddleInitial' with value '', data is missing

```
Form: MiddleInitial[1]
Requirement: Typically used for a person's name. Legal Characters: A-Z, a-z, 0-9, hyphen, apostrophe and single space. Illegal Character: leading space, trailing space, adjacent spaces, and other symbols.
Error: The field 'MiddleInitial' with value '', data is missing.
```

This happens when there is an illegal character in the middle initial field or its missing a value.

## Solution

- In Organizer, select 

  **Partner Information****Partner by Partner Data****Columnar Partner Entry****Reformat Partner Name for State Purposes**

   .
- Remove special characters.
- Check **View**, then **Overrides** to make sure there isn't an incorrect name missed somewhere.
- Recompute and recreate the e-file.