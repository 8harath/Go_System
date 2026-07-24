# E-file error: Federal return copy requirements

There are a few different messages you might get regarding attaching a federal return to the state. Some examples are:

```
Complete information must be made for Federal Copy Requirements.
```

```
Copy of Federal Return: You have selected the option to "Attach the federal XML created in the federal organizer", but the federal XML is not qualified. Create a qualified federal XML or select the option to "Attach a federal XML created just for state"
```

```
Federal Copy Requirements: Enter FEIN, Locator or Binder Number or Account Number.
```

This happens when a qualified XML copy of the federal return isn't attached to the state return.

## Solution

If you've prepared the federal return in the program, open that return and create an XML e-file:

- In 

  Organizer

  , go to the **Federal E-file** folder.
- Select **Create E-file**, then the **Create Federal E-file** button.
- Make sure the return qualifies and is clear of any validation errors and reject diagnostics.

Once the federal XML is created and cleared of any errors, open the state return to attach it:

- Go to **Organizer**, **States**, then the **State E-File** folder.
- Select **Enable/Create Returns** and go to the **Federal Copy** tab.
- In the state row you're getting the error for:


  - Select an option for **Federal Copy** in column **B**.
  - Enter the **Federal EIN**, the **Locator Number**, and the **Account Number** in the respective columns.
- Do a full recompute and recreate the e-file.

This information must be filled out even if you are attaching the Federal XML created in the Federal Organizer or using the State Copy option. You can find the locator number in the Organizer under 

**Help****About 1120 Tax**

 or 

**Help****About 1065 Tax**

. The Return Number listed here is the locator number.