# CorpPartPayment-062 e-file error

This reject occurs when the California Corporation Number contains repeating digits (for example, 9999999). Enter a valid Corporation Number or select a reason why one isn't necessary.

## Error message

```
State CASeverity Reject and ContinueData Value CACorporationNumber value: 9999999.State Record CorpPartPaymentRecord NameForm Occurrence No 0Field Seq No 0Page No 1Reject Code CorpPartPayment-062Rule Number CorpPartPayment-062XML Path /CA-PaymentRequest/CA-PaymentRequestHeader/Filer/CorporationInformation/CABusinessIdNumber/CACorporationNumberError Message There is an error with the [FEIN], [CACorporationNumber], or [SOSNumber] provided in the [CA-PaymentRequestHeader]. The [FEIN], [CACorporationNumber], or [SOSNumber] must not be all zeroes, ones, twos, threes, fours, fives, sixes, sevens, eights or nines.
```

## Solution

- Go to

  **Organizer****States****California****General Information****General Information**

  .
- Review the **Corporation Number** field. Make sure it's populated with a valid number; it can't be all repeating digits.
- Alternatively, leave the **Corporation Number** field blank, and make a selection under **Reason corporation number is not applicable**.
- Do a full recompute and recreate the e-file to submit.