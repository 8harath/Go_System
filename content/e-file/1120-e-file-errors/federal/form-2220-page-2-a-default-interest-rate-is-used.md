# E-file diagnostic: Form 2220, Page 2: A default interest rate is used

```
Form 2220, Page 2: A default interest rate is used on line 28. Interest rates must be updated to calculate the correct 2220 underpayment penalty. These rates are issued quarterly by the IRS.
```

This happens when you don't have interest rate information required by the state for e-filing.

## Solution 1

This is a severe diagnostic and won’t keep the return from qualifying for e-filing.

While the IRS updates interest rates quarterly, the interest rates are not necessarily updated quarterly in the software. Therefore, you need to make sure the rates are current with what is in section 6621.

## Solution 2

Enter rates:

- In **Organizer**, go to the **Estimates and Penalties** folder.
- Select **Underpayment of Estimates**, then the **Penalties/Interest** tab
- In the **Underpayment Interest Rates (Overrides)** section, enter **Rates**. Rates are not updated quarterly in software.
- Do a full recompute and recreate the E-.

## Solution 3

Suppress the compute option diagnostics.

- In **Organizer**, go to the **Estimates and Penalties** folder.
- Select **Underpayment of Estimates**, then the **2220 Penalty** tab.
- In the **Compute Options** section, select **Suppress the compute option diagnostics**.
- Do a full recompute and recreate the e-file.

## Solution 4

- Go to **Organizer**, **Estimates and Penalties** folder.
- Select **Underpayment of Estimates**, then the **2220 Penalty** tab.
- In the **Underpayment Penalty Compute and Print Option** section, use the dropdown to select **Option 2** or **Option 4** to prevent the 2220 from being included in the e-file.
- Do a full recompute and recreate the e-file.

note

You don't need to include Form 2220 in the electronic file if there is no underpayment penalty. There is not a way to force it to be included.