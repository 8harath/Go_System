# E-file error: "AtSubmissionCreationDeviceId" not correct

```
The field 'AtSubmissionCreationDeviceId' with value 'NONE', data format is not correct.
```

## Solution

- Go to **View**, then **Diagnostics** and select the diagnostic.
- Go to the DETAILS OF XML FILE / Common E-file Issue Fields section.
- Delete the information in the Initial Device ID, IP Address, IP Time lines.
- Do a full re-compute, recreate the e-file, and resubmit.