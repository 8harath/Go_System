# E-file returns and extensions in the Organizer

Follow these steps to turn on e-file, select a signature method, attach documents, validate the return, and transmit it to the IRS using Organizer.

Complete the following steps to e-file a return and extension in the Organizer.

- In the Organizer, select **Federal e-file**, then **Enable** to turn on e-file.
- Select a signature authorization method: **Form 8879 Practitioner PIN** or **Form 8453 scanned signature document**.
- Attach supporting documents in PDF format, such as Form 8453, then enter general dependencies for the return.
- Attach separate XML files for international forms:

  * Form 5471
  * Binary attachments for Forms 5471 and 8865
- Review additional information specific to the e-file return, such as business name control and foreign entity identification.
- Generate a validation file to check for errors and validate the XML file against the IRS schemas.
- Select **Create E-File** to create the e-file.
- Review the status of the XML file, including the date and time stamp, validation errors, and file name.
- Review e-file diagnostics.
- Perform a full recompute.
- Review the return.
- Use the browser to transmit the e-file to the IRS.
- Check the e-file status to verify that the IRS has accepted or rejected the return.

note

**Additional requirements**



* If the return includes international forms, aggregate them into the primary return XML file.
* If the return is a mixed return (for example, it includes a life insurance company or property and casualty Insurance company), create a mixed return XML file.
* If you're filing a short period return, attach a Form 1128 to the return.
* If you selected the **Practitioner PIN method**, include a Form 8879 with the e-file.

**IRS e-filing requirements**

The IRS requires that your return meets the following criteria:

* **Business rules**: The return must include all required forms and schedules.
* **Schemas**: The return needs to comply with IRS schemas, which define the format and structure of the XML file.
* **Validation**: The return needs to pass validation checks to ensure it meets IRS requirements.