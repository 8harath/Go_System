# c00ce020 Element name: ConsolReturnChkbx and c00ce169 Element name: CombinedReturnChkbx e-file errors

## Errors

```
c00cd020: Required attribute 'referenceDocumentId' is missing.
```

```
c00cd169: 'BinaryAttach0000XXX1 BinaryAttach0000XXX1N1 BinaryAttach0000XXX1N2' violates pattern constraint of '[A-Za-z0-9:\.\-]{1,30}.' The attribute 'referenceDocumentId' with value 'BinaryAttach0000XXX1 BinaryAttach0000XXX1N1 BinaryAttach0000XXX1N2' failed to parse.
```

## Cause

For consolidated/combined returns, the state of Virginia requires the attachment of a copy of the consolidated/combined return 500 as a PDF document named Form 500.pdf.

## Solution

- Go to **Organizer**, **States**, **Virginia**, **E-file**, **Attachments**, and then **Summary**.
- Select **Attach PDF**, then **Add**.
- Select Virginia for the **Attachment Jurisdiction**.
- Select **Next**, go to the PDF file, then select **Open**.
- Select Form500 Consolidated/Combined Return Attachment, whichever is applicable, for the **Predefined description**.

  note

  Predefined descriptions are for required attachments only. For all others, use user-defined descriptions.
- Select **Upload**, then **Done**.
- Perform a full re-compute, re-create the e-file, then re-submit.