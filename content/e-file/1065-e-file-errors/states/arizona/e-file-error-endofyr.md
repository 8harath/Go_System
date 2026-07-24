# E-file error: The field EndOfYr with value NONE, data format is not correct

```
The field 'EndOfYr' with value 'NONE', data format is not correct.
```

The Arizona Form 165, Schedule K-1 NR can't have **NONE** as Ownership Capital.

## Solution

- You can select the diagnostic to take you to the correct data entry location. Otherwise, go to 

  **Organizer****Partner Information****Partner by Partner Data****Columnar Partner Entry****Ratios\Units**

   tab.
- In the section for **Ownership Capital** the **Beginning of year** and **End of Year** amounts can't be **NONE**. Replace the **NONE** with **0.000000**.
- If you are using a K-1 aggregation file, replace any instance of **NONE** with **0.000000** for partner ratios.
- Do a full recompute and recreate the e-file.