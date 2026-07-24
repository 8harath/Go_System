# SPTecK1-ALPTEC-016 e-file error

```
SPtecK1-ALPTEC-016: If NonResCompositeDistribution/EntityType (Col C) is populated, then NonResCompositeDistribution/PercentOfOwnership must be completed.
```

This happens when the percentage of ownership is missing.

## Solution 1

- Go to **Tax Forms**, **States**, then **Alabama**.
- Select **Composite Return**, **PTE-C, Page 3**, then **Partner Detail**.
- Select **Schedule PTE-CK1 Workpaper**, then select **Nonresidential Composite Payment Return** from the **Composite Filing-Partner info** dropdown.
- Select the partner that doesn't have a percentage on **Line D**.
- You can go to the **Organizer** folder, then select **Partner Information**, **Partner by Partner Data**.
- Select the **Partner Name** then select **Partner Information** on the 

  Partner Information

   screen. Go to the **Partner Ratios** section.
- Select **Organizer**, **Partner Information**, **Allocations Options**, then **Time** and **Type**. Change time and type to **Ending Capital**.
- Perform a full recompute and recreate the e-file.

## Solution 2

- If you're using an aggregation file, in **Organizer**, select **States**, then **Alabama.**
- Select **E-File**, **Attachments**, **K-1 Aggregation**, then **Summary**.
- Select **Attach K-1 Aggregation XML File**.
- Review the Direct K-1 Aggregation XML File.
- Perform a full-recompute and re-create the e-file

note

If you're using a K-1 Import File, also update the K-1 Import File.