# Form PTE-K1-E2 e-file error

## Error

```
Form PTE-K1-E2: Montana Sch K-1, Part 5, line 3a Pass-Through withholding is blank.
```

## Cause

Withholding is required for all second-tier pass-through entities. Withholding is also required for all owners that are a foreign C corporation, non-resident individual, non-resident trust or estate, or other non-resident entity that:

- has a distributive share of Montana income of $1,000 or more,
- didn't elect to be included in a composite tax return, and
- didn't have a valid Form PT-AGR on file.

## Solution

Review the following conditions regarding MT K-1, Part 5, line 3a - MT income tax withheld on behalf of the owner.

* Condition 1: Part 5, line 1 is less than $1,000.
* Condition 2: Part 2, Composite checkbox is marked, or Part 2, PT-AGR checkbox is marked.
* Condition 3: Part 2, Resident checkbox is marked.
* Condition 4: Part 2, Entity type is C, or PTP.

Use:

* Result 1: 6.9% of Part 5, line 1.
* Result 2: 6.75% of Part 5, line 1.

If conditions 1, 2, 3 and 4 aren't true and Part 2, Entity type is: I, E, T, D, DOM, P or S, then Part 5, line 3a must equal result 1 FC or TE, then Part 5, line 3a needs to equal result 2.

If condition 3 is true, then Part 5, line 3a may equal result 1 or zero.

If condition 4 is true, then Part 5, line 3a may equal result 2 or zero. Otherwise, enter zero (0).

Once these necessary adjustments are made, perform a full recompute, recreate the e-file, then resubmit.