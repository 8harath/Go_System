# E-file diagnostic: XML is created but not qualified

## Error

```
XML is created but NOT qualified - Diag need to be cleared.
```

## Cause

This happens when you have qualified a Top consolidation but have diagnostics in member locators or subsidiaries. The Topcon won't show any diagnostics.

## Solution

- In Organizer, select **Federal E-File**, then **Status**.
- Select**Consolidation Detail**.
- Review the **Return Number** and **Status** columns. Identify which subsidiary or member is not qualified.
- Go to the unqualified member and read the diagnostics.
- Make necessary changes.
- Do a Full Recompute at the member level.
- Consolidate the Topcon.
- Recreate the e-file.