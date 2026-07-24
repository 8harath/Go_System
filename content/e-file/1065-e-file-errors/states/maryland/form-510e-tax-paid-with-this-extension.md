# E-file diagnostic: Form 510E tax paid with this extension

```
Form 510E: Tax paid with this extension must be equal to payment amount of financial transaction.
```

You get this error when tax paid doesn't equal the payment amount.

## Solution

- Go to **Tax Forms**, **States**, **Maryland**, and then **MD 510E**.
- Remove NONE from **Tax Paid With this Extension**.


  - Go to **Organizer**, and select **States**.
  - Select 

    **Common State****Estimates and Extensions****Extension Detail**

     .
  - Go to the **Maryland** section and remove 

    NONE

    .
- Then disable the Maryland extension:


  - In 

    **Organizer****States**

     select **State E-file**.
  - Select **Enable/Create Extensions** and clear the **Enable** checkbox for Maryland.
- Do a full recompute, recreate the e-file, then resubmit.