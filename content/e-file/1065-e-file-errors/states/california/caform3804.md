# E-file error: Content for field 'CAForm3804' is incomplete

```
Form: CAForm3804[@documentId='F3804']
Requirement: CA Form 3804 - Pass-Through Entity Elective Tax Calculation
Requirement: Expecting ElectorInformation
Error: Content for field 'CAForm3804' is incomplete
```

You get this error when Form 3804 is incomplete, even if it isn't needed.

## Solution

- Go to **Organizer**, **States**, and choose **California**.
- Select **Return Options**, **Print Options**, and open the **Print Options** tab.
- In the Print Suppression section, mark the checkboxes for **Form 3804** and **Form 3804-CR**.
- Do a full re-compute and recreate the e-file.