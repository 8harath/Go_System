# 2155 e-file error

```
* 2155: Form 120S, Question A is No, but Schedule C, and / or Schedule D are populated with a value other than zero.; FRM - Inconsistent Data for Pass Through Entity (PTE) Election.
```

This happens when Form 120S Page 1 Question A is answered NO, but there is data in Schedule C and D.

## Solution

- In Tax Forms, select**States**, then **Arizona**.
- Select **Form 120S - Tax Return Page 1 Question A**.
- If Question A is answered **No**, Schedule C and D must be blank.
- If Schedule C and D are populated, Form 120S Page 1 Question A must be answered **Yes**.
- To mark Question A as **Yes**, go to Organizer, then select **States**, then **Arizona**, then **General Information**.
- Go to the Pass-Through Entity Information section, and select **The S Corporation is making the Pass-Through Entity (PTE) election**.
- Do a full recompute and recreate the e-file.