# Element name: FormNCNPA e-file error

This e-file validation error happens when Form NC-NPA is marked as being attached but the PDF attachment is missing. To fix this, either attach the NC-NPA forms as PDFs and mark them as attached, or suppress the print of Form NC-NPA.

## Error message

```
Validation failed on: Form: FormNCD403[1] Part4[1]/Partners[42]/FormNCNPA[1] Description: Indicate whether an NC-NA has been attached to this submission; if attached, the referenceDocument ID is included in the attribute field LineNumber: FormNumber: FormD403 Element Name: FormNCNPA XPath: /ReturnState[1]/ReturnDataState[1]/FormNCD403[1]/Part4[1]/Partners[42]/FormNCNPA[1] XML Fragment: Attach Field Key: 0,0,0,0,0,0,0,0,0 Error Code: 80004005 Error Reason: Required attribute 'referenceDocumentId' is missing
```

## Solutions

Complete 1 of the following solutions to resolve this error.

**Solution 1: Attach separate Forms NC-NPA as PDFs for each partner**

- Print form NC-NPA as a separate PDF for each partner.
- Go to 

  **Organizer****States****North Carolina****E-file**

  .
- Select 

  **Attachments****PDF Attachments****Summary**

  .
- Select **Attach** to upload each file.
- Mark the **NC NPA Attached** checkbox.

**Solution 2: Suppress the print of Form NC-NPA**

- Go to 

  **Organizer****Partner Information****Partner by Partner Data**

  .
- Select the partner name.
- Go to

  **Partner Information****State Partner Information**

  tab, then the **North Carolina** section.
- Mark the **Suppress Print of Form NC-NPA**checkbox.