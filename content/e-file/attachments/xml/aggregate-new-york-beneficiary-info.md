# Set up and create an aggregated New York e-file

Configure and generate an aggregated New York e-file by attaching K-1 XML files from subsidiary returns to the primary return.

Follow these steps to set up and create an aggregated New York e-file:

- **Create and prepare the subsidiary return e-file.**
- In the subsidiary return, create the e-file. The New York e-file will have an extension of **XXXXXXXX.XNY**.
- Rename the New York e-file to 

  XXXXXXXXNY.XML

  .
- **Attach K-1 XML files to the primary return.**
- In the primary return, go to 

  **Organizer****States****New York****E-file****Attachments****K-1 Aggregation**

  .
- Select **NY K1 Aggregation**.
- Select **Attach K-1 Aggregation XML File**.
- Select **New York K-1 Aggregation** for **Attachment Jurisdiction**.
- Select **Browse** to find and select the XML file created earlier, then select **Upload** to attach it to the return.
- Select **Done**. Repeat steps 5-8 for each XML file you want to include.
- After you attach the XML files, verify their details are correct in the **K-1 Attachments Summary**.

  important

  The system validates attached XML files to detect XML errors. If validation errors exist, delete the attachment, correct the errors in the subsidiary return, recreate the XML file, and re-attach it.
- **Configure optional settings.**
- (Optional) If you don't want to include the beneficiary information from the primary return in the XML file, select **Suppress system generated Form IT-205, Schedule C**.
- On the **New York K1 Aggregation** page in the primary return, override the total number of beneficiaries if needed. The system includes this number in the total number of beneficiaries in the aggregated XML file.
- **Create the aggregated e-file.**
- Go to **Organizer** **E-file** **Enable/Create** for the primary return.
- In the **Enable** column, select **New York**.
- Select **Create Return E-file**.