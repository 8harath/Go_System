# E-file error: State requires federal e-file to be clean of validation errors

```
Federal Efile Validation Errors: State requires Federal Efile to be clean of validation errors Recreate the State Electronic File for this diagnostic to get cleared.
```

This happens when you create the state e-file but the federal return isn't qualified.

## Solution

Create and qualify the e-file for federal and then create the state e-file to clear the diagnostic.

- In **Organizer** go to **States**, then **State E-file**,
- Select **Enable Create Returns**, and then the **Federal Copy** tab.
- The **Federal E-file Status (State Copy Only)** column needs to say qualified for the Federal e-file. If it isn’t qualified, then you will need to clear the diagnostics for the Federal Return.
- If this is a topcon or single entity return for federal, select **Attach the Federal XML created in the federal organizer** in the **Federal Copy** column.
- For any other return, select **Attach the federal XML created in another return** or **Attach a Federal XML created just for state (state copy)**.
- Enter the **Federal EIN**, **Locator Number**, and **Account Number** from the locator that has the accepted federal return.
- Perform a full re-compute, re-create the e-file, then re-submit.