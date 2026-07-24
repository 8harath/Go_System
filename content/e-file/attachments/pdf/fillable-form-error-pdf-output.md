# Error: Document has fillable forms

Fix the “Unable to create PDF output” error that occurs when you attach PDFs with fillable forms or password protection to e-file returns.

## Scenario

You may get the following error message when printing a return or selecting **Send to PDF**.

```
Error: Document has fillable forms, Unable to create PDF output.
```

## Cause

The Organizer doesn't currently support PDFs with fillable forms or password-protected PDFs as e-file attachments.

## Solution

- Find the PDF with fillable forms attached to the e-file.
- Select **Delete** to remove the PDF from the e-file.
- Open the PDF you're trying to attach.
- Select **Print**.
- From the **Printer** dropdown, select **Microsoft Print to PDF** (or **Save as PDF** if you opened the PDF from a browser).
- Select **Print** and save the flattened PDF to your computer.
- Attach the newly saved PDF to the e-file.
- Select **Print** or **Send to PDF**.

This process converts the fillable PDF into a standard PDF format that the Organizer can process.