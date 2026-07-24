# The field 'StateApportionmentFactor' with value '0.0', data format is not correct e-file error

```
The field 'StateApportionmentFactor' with value '0.0', data format is not correct.
```

This error happens when the Maryland apportionment factor on Form 510 is "None" or 0.

## Solution

- Go to **Organizer** and select **States**.
- Select **Maryland**, then **Allocation and apportionment**.
- Change **Apportionment percentage** to 0.000001. When the apportionment factor is 0, the form instructions state to enter 0.000001.
- Do a full recompute and re-create the e-file.