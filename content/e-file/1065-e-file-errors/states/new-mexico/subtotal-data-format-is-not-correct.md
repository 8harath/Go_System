# E-file error: 'Subtotal' data format is not correct

```
Form: FormPTE1[1] SubTotalEntityTax[1]
FormNumber: FormPTE1
LineNumber: 24
Description: Subtotal. Add lines 22 and 23.
Requirement: Type for a U.S. non-negative amount field with dollars and cents
Error: The field 'SubTotalEntityTax' with value '-XXXX' data format is not correct.
```

This happens when there is a negative amount in the subtotal field.

## Solution

- In **Tax Forms**, select 

  **States****New Mexico****PTE line 4**

  .
- This amount cannot be negative since it is a total line.
- Subtract line 3 from the sum of line 1and 2.
- Do a full re-compute and re-create the e-file.