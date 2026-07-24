# E-file viewer features and improvements

The e-file viewer displays XML files as searchable PDFs with schema-based data, navigation features, and improved performance.

The e-file viewer displays your XML file contents as a PDF in Acrobat, organized according to IRS and state schemas. The viewer pulls identifying information directly from the schemas instead of using style sheets overlaid on tax form images.

**No dependence on IRS style sheets**

The e-file viewer doesn't rely on IRS-provided style sheets to display tax forms. Previously, the IRS didn't always provide style sheets on time, and they sometimes conflicted with the latest schemas. The system now pulls line numbers, descriptions, and element names directly from the current federal or state schemas, avoiding outdated style sheets.

**PDF format for all states**

In the past, reviewing a state e-file meant viewing raw XML because states didn't provide style sheets. The e-file viewer now uses a PDF format available for all states.

**Navigation features**

Each PDF includes the taxpayer name, FEIN, page number, and XML file creation date. Hyperlinks let you go to supporting documents like other forms or schedules. PDF bookmarks let you jump quickly to specific forms or details. When multiple forms or schedules are included, the number appears in parentheses, and you can expand the bookmark to see each one.

Use shortcut keys for navigation. For example, use **Alt + Left Arrow** to return to the previous view.

**Search capability**

Unlike style sheets, the PDF is searchable using the **Find** feature. You can search for element names from validation errors to understand the data context and help resolve validation issues.

**Performance improvements**

The e-file viewer performs faster, especially with large XML files. You no longer need to close the return to view the XML file or PDF. You can also save the PDF to your local machine.