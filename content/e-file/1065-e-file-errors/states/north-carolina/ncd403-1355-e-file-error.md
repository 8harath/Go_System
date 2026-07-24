# NCD403-1355 e-file error

```
* NCD403-1355: [D-403] If Part 4 Section A Line 5 is populated with "Individual" or "Grantor Trust" then Part 4 Section C "NC-NPA Form attached" must be "No" or blank.
```

This happens when a partner is an individual or grantor trust and has the NC-NPA attached.

## Solution

- In **Tax Forms**, **States** folder.
- Then go to the **North Carolina**,**D-403** folder.
- Go to the **D-403, Page 3** tab.
- Go to Part 4, Section A and select the Partner Information link.
- If line 5 Type of partner is **Individual** or **Grantor Trust**, then at the bottom, **NC-NPA Form attached** must be marked **No** or blank.
- To change this option, in Organizer, select **Partner Information**.
- Select **Partner by Partner Data**, then [**Name of Partner**], then **Partner Information**.
- Select **State Partner Information**.
- In the **North Carolina** section.
- In this section select **Suppress Print of Form NC-NPA**.
- Run a full recompute, then recreate the e-file.