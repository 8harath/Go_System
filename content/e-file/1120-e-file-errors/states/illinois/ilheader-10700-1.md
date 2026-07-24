# ILHeader-10700-1 e-file error

```
IL Return Header (Rule ILHeader-10700-1): IL-Header BusinesRepresentative/DateSigned cannot be blank.
```

This happens if the business representative column or data signed column is blank.

## Solution

- Go to 

  **Organizer****States**

  .
- Select **Common State**, then **General Information**
- Select the **Basic Return Information** tab.
- Enter the **signature date** for **IL** in **Column L**.
- Go to the **Estimates and Extensions** section.
- Enter the date on both lines for **Illinois** in **Extension Detail**.
- Go to **Paid Preparer Information** in **General Information**.
- Select **Illinois** and enter the **Signature Date** in **Column H**.
- Do a full recompute and recreate the e-file.