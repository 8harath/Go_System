# 0401: Xpath: ReturnState/ReturnDataState/FormM4/TaxDue ReturnState/ReturnDataState/SchM4T/TotalNetTax

```
* 0401: Xpath: ReturnState/ReturnDataState/FormM4/TaxDue ReturnState/ReturnDataState/SchM4T/TotalNetTax
```

The Minnesota tax ID must be entered in each locator within the consolidated group for printing the M4T.

## Solution

Enter the Minnesota tax ID for each locator within the consolidate group.

- Go to **Organizer**, **States**, **Common State**, **General Information**, and then **State /City ID Numbers**.
- Enter the **Minnesota identification number** for each locator in the consolidated group to print the M4T.
- Next, complete these steps for any members missing from the XML.


  - Go to **Tax Forms**, **States**, **Minnesota**, and then **Selected Options**.
  - On the **Combined Options** tab, select the option that the company needs to be included on Form M4A and M4T.
  - Perform a full recompute for each member.
- Re-consolidate the TopCon, recreate and resubmit the e-file.