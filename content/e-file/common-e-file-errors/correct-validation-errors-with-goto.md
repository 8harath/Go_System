# Correct validation errors with GoTo

Generate a validation file that uses GoTo functionality to go to the source of e-file errors and correct them efficiently.

When you create an e-file, the system identifies and reports validation errors. However, these error messages can be difficult to interpret, and locating where to make corrections may not be clear.

GoTo functionality solves this problem by letting you select a validation error and automatically go to its source—whether that's an Organizer field or a tax form. This saves time and eliminates guesswork when resolving e-file errors.

Follow these steps to create a validation file and resolve errors:

- Go to 

  **Organizer****Federal E-file****Error Checking**

  .
- Select **Generate Validation File**.
- For state returns, create the XML file with GoTo functionality separately in the 

  **State E-file****Validation**

   spreadsheet.
- After the system creates the validation file, go to 

  **View****Diagnostics****E-file Validation Errors**

  .
- Select a validation error to go directly to its source (Organizer or Tax Form field).
- If the error appears in a Tax Form field, select the link to the Organizer field and update it.
- Repeat these steps until you eliminate all validation errors.
- Select **Create E-file** to generate the final XML file for transmission.

  note

  * GoTo functionality is not available for XML files you create using **Create E-file**. To restore GoTo functionality, regenerate the validation file using the previous steps.
  * GoTo functionality doesn’t cover all XML validation errors. Product teams review and update this feature each filing season to include newly released errors.