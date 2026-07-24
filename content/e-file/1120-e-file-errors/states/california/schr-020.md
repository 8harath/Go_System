# SCHR-020 e-file error

## Error

```
Schedule R, Line 1c [CombinedOffsetAndNetIncomeLoss] must equal Line 1a [NetIncomeLossAfterAdjustments] + Line 1b [WatersEdgeOffset] (SCHR-020)
```

## Cause

Schedule R only applies to LLCs that have schedule K-1. There is no apportionment (or K-1) for SMLLCs. Whatever is entered in the organizer for California sourced income is what transfers to the form, so apportionment may be calculating incorrectly.

## Solution

- In the Organizer, go to **States** and select **California**.
- Complete one of the following options:


  * Uncheck the **Corporation apportioning income using Schedule R** checkbox.

    This is located in the 

    General Information

     screen in the Additional Information section.
  * Check the **Schedule R Three-factor apportionment is used as this corporation falls under RTC Section 25128(b)** checkbox.

    This is located in the 

    Allocation and Apportionment

     screen in the Compute and Print Options section.
  * Uncheck the **LLC is apportioning income to California using Schedule R** checkbox.

    This is located in the Disregarded Entity folder on the 

    General Information

     screen.
- Once you've completed one of these options, do a full recompute, recreate the electronic file, and resubmit the return.