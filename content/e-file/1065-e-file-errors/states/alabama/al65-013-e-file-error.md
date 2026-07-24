# AL65-013 e-file error

```
AL E-File: AL Reject Code SL-AL65-013: If AL 65,Page 5,Schedule L line 13b is populated, then a pdf document must be attached (File name and Predefined Name: OtherFixedAssets.pdf) itemizing the separate categories and amounts of other current assets included in the total of current assets.
```

You get this error when AL 65, Page 5, Schedule L line 13b is populated, then a PDF document must be attached with the same file name as mentioned in the diagnostics.

## Solution

- Go to **Organizer**, **States**, **Alabama**, **E-file-Form 65**,**Attachments**, **PDF Attachments**, **Summary** and select **Attach PDF**.
- You need to attach a PDF with the same file name as mentioned in the diagnostics.

  note

  In the user-defined description, make sure it is the same as the file name. Don't forget to add the **.pdf** as well.
- Do a full recompute and recreate the e-file.