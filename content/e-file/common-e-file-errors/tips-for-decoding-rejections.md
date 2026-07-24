# Tips for decoding e-file rejections

These tips explain the rejection text, what it means, and generally how to fix it.

## Database validation error

This indicates what's known as a master file rejection, meaning that there's not necessarily a calculation error within the return (unless you also receive additional errors), but instead a mismatch between a piece of demographic information reported on the form and what the IRS has on file in their records.

First, you can verify you've entered the SSN/EIN of the taxpayer correctly if it states that the SSN/EIN and name control don't match.

Next step is to contact the IRS (800-829-1040 for individuals or 800-829-4933 for businesses) or Social Security Administration (800-772-1213).

## Unexpected [child element...] / expected: {}

This indicates that while the IRS or state's e-file processor was analyzing the e-file, it found an entry that it didn't expect to see until later on in the e-file, until after it had already seen other items - specifically, whatever it lists as "expected."

This means the 'expected' item's missing.

Both the expected and unexpected items will have field descriptions which should hint as to what place on the form the rejection's referring.

Use the unexpected item(s) to establish context as to where the expected item(s) should have been, and attempt to identify the line described as 'expected' and identify what might be missing about that item.

Many times, this refers to the system seeing an amount for a subschedule line item, without a corresponding description, or vice versa. This may include entering a zero.

## Element data is incomplete / expected: {}

In most cases, this rejection's synonymous with the unexpected child element rejection previously explained. This indicates that the item listed as 'expected' is missing and must be entered.

## Violates mininclusive restraint: 0

Whenever you see the word 'constraints,' this means the tax authority has established certain rules as to what can be in that field on the return. In this case, a rejection like this indicates that the lowest value the tax authority will accept is 0; therefore, positive values.

This error generally results when the tax authority expects a gross number in a field (e.g. apportionment factors) yet a negative number's been entered. If this is the case, the only resolution is to replace the negative number with a positive one or a zero.

## Violates enumeration constraint of...

This indicates that the tax authority has specified a specific (enumerated) group of values which this field could potentially contain.

For instance, in a field requesting an entry for the state in which the corporate books are located, the accepted list of entries would only include the list of standard state postal codes. Typically, the list of acceptable values is generally included within the rejection itself.

## Value failed to parse / error parsing element with value {}

This is very similar to the rejection previously explained. This indicates that the entry in the field referenced goes against the data type which the tax authority expects to see in that field.

For instance, it may be expecting a decimal number in a field for the apportionment percentage, and will return this error is instead it sees a word in this field.

## Element {} cannot be empty according to the schema

The schema refers to the blueprint to which all submitted e-files must conform, which is established by the tax authority.

This rejection indicates that the specified field's required to have data in order for the return to be acceptable for e-file.

Using the description of the field, attempt to locate the field which is missing data, and place an entry in the corresponding input screen field. This may include entering a zero.