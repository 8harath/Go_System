# FPYMT-096 e-file error

```
If the timestamp (in the GTX key or Response to Send Submissions Request) is after the due date of the return (three and one half months after the Tax Period End Dt in the Return Header if the month in the Tax Period End Dt does not equal June), then the Requested Payment Dt in the "IRS Payment" [IRS Payment] must not be later than the date the return was received and must not be prior to five days before the date the return was received by the IRS
```

This happens when the Date to be debited entered is more than 5 days prior the submission or in the future date when the return was submitted.

## Solution

- In Organizer, select **General Information**, then **Bank Information** and return tab.
- In the **Direct Debit (Electronic Funds Withdrawal)** section, enter the date to be debited.
- Make sure the date need to be the day you submit the return or up to 5 days prior, but can't be in the future.
- Once done, full recompute and recreate the e-file