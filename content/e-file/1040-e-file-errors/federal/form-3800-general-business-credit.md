# E-file diagnostic: Form 3800 - General Business Credit:

Learn how to resolve various Form 3800 e-file diagnostic errors that occur when required line items are missing values based on entries in other parts of the form.

One or more e-file diagnostics appear for Form 3800. Examples include:

```
Form 3800 - General Business Credit: If Part III, line 6, column (f) has a value and Part III Line 3, column (j) has a non-zero value, then Form 3800, Part II, line 24 must have a value.
```

```
Form 3800 – General Business Credit: If Part III Line 2, column (f) has a non-zero value, then Form 3800 Part I, line 3 must have a value.
```

This happens when there is an amount Form 3800 and the program is consequently expecting another line on Form 3800 to have a value.

## Cause

This diagnostic occurs when an amount is entered on Form 3800 and the program expects a corresponding value on another line of the form. Many amounts in Parts I and II auto-populate based on entries in Part III.

## Solution

Review the e-file diagnostic to identify which lines on Form 3800 are in question. Review the form instructions or consider overriding amounts if needed.

- Go to 

  **Tax Forms****Federal**

  .
- Select **Form 3800 - General Business Credit**, then go to the line items in question.
- If there are amounts present, go to the line referenced at the end of the diagnostic and make sure there is an amount or 

  NONE

   entered.
- Do a full recompute and recreate the e-file.