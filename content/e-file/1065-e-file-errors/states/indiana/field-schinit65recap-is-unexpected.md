# Error: Field 'SchINIT65Recap' is unexpected

This validation error occurs when e-filing an Indiana 1065 return without the required Schedule K-1 partner information.

## Error message

```
Validation failed on [FILE_ID]:

Form: SchINIT65Recap[1]
FormNumber: Schedule IN Federal 1120S Recap
Description: Schedule IN Federal 1120S Recap Detail colunms
Requirement: Expecting SchINK1
Error: Field 'SchINIT65Recap' is unexpected

Element Name: SchINIT65Recap
XPath: /ReturnState[1]/ReturnDataState[1]/SchINIT65Recap[1]
XML Fragment: ******
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}SchINIT65Recap' is unexpected according to content model of parent element '{http://www.irs.gov/efile}ReturnDataState'.
Expecting: {http://www.irs.gov/efile}SchINK1.
```

## Solution 1: Schedule K-1 entered in the return or Direct K-1

The Indiana return must have at least two partners included to e-file.

- Go to 

  **Organizer****General Information****Return and Print Options**

  .
- Select the **Sch K, K-1 and Activity Schedules** tab.
- Under **Print or Suppress**, set **Schedule K-1 and partner activity schedules** to **Print**.
- Verify the IN K-1s aren't suppressed in 

  **Organizer****States****Indiana****Return Options**

  .
- Also verify they aren't suppressed in 

  **Organizer****States****Indiana****E-file****Attachments****K-1 Aggregation****Summary**

  .
- To include partners in the composite return, go to 

  **Organizer****Partner Information****Partner by Partner Data****Columnar Partner Entry****Partners State Composites**

  . Mark **X** in the IN column.
- Do a full recompute and recreate the e-file.

## Solution 2: Schedule K-1 Aggregation

- Go to 

  **Organizer****States****Indiana****E-file****Attachments****K-1 Aggregation****Summary**

  .
- Suppress the system generated IN K-1 and attach the K-1 aggregation file.
- The aggregation file must have at least two partners.
- Do a full recompute and recreate the e-file.