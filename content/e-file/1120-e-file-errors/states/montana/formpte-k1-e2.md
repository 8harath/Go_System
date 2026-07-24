# FormPTE-k1-e2 e-file error

## Error

```
Pass-Through withholding is zero. Withholding is required on all second-tier pass-through entities. Withholding is also required on all owners who are a foreign C Corporation, non-resident individual, trust or estate, or other non-resident entity that 1) has a distributive share of Montana income of $1,000 or more, 2) did not elect to be included in a composite tax return, and 3) did not have a valid Form PT-AGR on file.(FormPTE-K1-E2)
```

## Cause

A Shareholder marked as a Domestic 2nd Tier Pass-Through entity doesn't have an amount on Schedule K-1, Part 5, Line 3b.

## Solution

- In the **Organizer**, go to **States**.
- Select **Montana**, then **Shareholder Information**.
- For each Shareholder who has **Domestic 2nd Tier Pass-Through Entity** marked, complete the following.


  - In **Tax Forms**, go to **States**, then select **Montana**.
  - Select **Schedule K-1**, then the Shareholder's name.
  - On **Schedule K-1, Part 5, Line 3b** enter NONE.
- Do a Full Recompute, recreate the electronic file, and resubmit the return.