# Schedule K1- Partner Count e-file error

```
Rule Number: Schedule K1- Partner Count
Description: Number of Schedule K-1 value entered on Form PTE = X.
Actual Number of Schedule K-1 elements = X in the XML.
```

This diagnostic generates when the system detects that the number of Schedules K-1 included in the return does not match what is listed on that jurisdiction's main form. This can happen when K-1s are suppressed and there's no aggregation file attached.

## Solution

- In **Organizer**, select **General Information**.
- Select **Return and Print Options** and go to the **Sch K, K-1 and Activity Schedules** tab.
- In the **Print or Suppress** section, check if **Schedule K-1, partner activity schedules, and Schedule K-3** is marked as **Suppressed**.
- If they're suppressed, either change it to **Print**, or attach an aggregation file. To attach an aggregation file:


  - Select 

    **Federal E-file****Attachments****K-1 Aggregation****K-1 Aggregation**

    .
  - Select **Attach K-1 Aggregation XML File**.
- If they're not suppressed or you have an aggregation file attached, you can override the partner count. To do this:


  - Go to the **Basic Return Information** screen in the **General Information** folder.
  - Enter an amount in **Number of partners in partnership (Override)**.
- Do a full re-compute and e-file the return.