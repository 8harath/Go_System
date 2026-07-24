# Error: ReturnDataState Cannot Be Empty

This e-file validation error happens when the Delaware extension doesn't have an estimated income amount. The **ReturnDataState** field needs a value before you can create the e-file.

## Error message

```
Validation failed on CXXXXXX5.ide: Error: ReturnDataState ActionNeeded: Field 'ReturnDataState' cannot be empty Element Name: ReturnDataState XPath: /ReturnState\[1]/ReturnDataState\[1] XML Fragment: Field Key: 0,0,0,0,0,0,0,0,0 Error Code: c00ce011 Error Reason: Element '{http://www.irs.gov/efile}ReturnDataState' cannot be empty according to the DTD/Schema
```

## Solution

- Go to

  **Organizer****States****Delaware****General Information**

  .
- In the **EXTENSION | ESTIMATE** section, go to **Estimated amount of distributive (S corp) or taxable (C corp) income for the taxable year**.
- Enter **NONE** if there's no income, or enter the estimated amount.
- Recreate the e-file to clear the validation error.