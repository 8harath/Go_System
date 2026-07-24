# Create an FBAR e-file

Complete, validate, and create FBAR e-files for individual filers and review them before transmission to FinCEN.

Follow these steps to create an FBAR e-file:

- **Complete and review your FBARs:**
- Complete and review your FBARs within a return. You can prepare only 1 FBAR in a return, except for 1040 returns.

  * For Form 1040, you can prepare separate FBARs for the taxpayer and spouse.
  * You can include multiple financial accounts on a single FBAR.
  * You need to prepare FBARs for **Individual Filers** within Form 1040 returns.
- **Generate a validation file:**
- Run a full recompute of the return, then generate a validation file.
- In the e-file folder of the **FBAR Organizer**, generate the validation file.

  note

  The validation process detects errors and omissions so you don't have to program an extensive list of reject diagnostics.
- **Review and correct validation errors:**
- With the XML file generated for validation, go to 

  **View****Diagnostics****Efile XML Validations Errors****FBAR**

   for a list of errors.
- Review each error, which explains the specific item you need to complete. Select the error and the system takes you to the field in the FBAR for correction.
- Repeat this process until you've eliminated all errors.
- **For Form 1040 returns only:** If you prepared separate FBARs for the taxpayer and spouse, you also need to generate separate validation files.

  note

  The validation errors at 

  **View****Diagnostics**

   only show errors from the last generated validation file. We recommend generating a validation file and correcting errors for 1 FBAR before validating the 2nd FBAR.
- **Create and review the FBAR e-file:**
- Create the FBAR e-file in the **e-file** folder of the **FBAR Organizer**.
- Review it using the **e-file Viewer**.

  The **e-file Viewer** shows the contents of the FBAR. While the system transmits a text-based file to FinCEN, the e-file Viewer shows information as an XML file. You can also view the FBAR information as a PDF file.
- **For Form 1040 Returns only:** If you prepared separate FBARs for the taxpayer and spouse, create separate FBAR e-files. The e-file Viewer displays both the taxpayer and spouse FBARs as separate files.