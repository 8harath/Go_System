# Compare FBAR and MeF e-file systems

Review the key differences between FBAR and MeF e-file systems for transmission, format, attachments, EFIN requirements, signatures, and error handling.

The following table shows the key differences between FBAR and MeF e-file systems regarding transmission, format, attachments, EFIN, signature, and errors.

|

Process | MeF | FBAR |


| --- | --- | --- |

|  |  |  |
| --- | --- | --- |
|

Transmission | The system transmits federal and state returns to the IRS | The system transmits through the FinCEN batch filing system |


|

Format | XML | XML |


|

Attachments | You can include PDF attachments | You can't include attachments |


|

EFIN | You must have an EFIN to e-file | N/A |


|

Signature | You use a PIN signature or attach Form 8453 PDF | When filing through the FinCEN batch filing system using a 3rd party, the filer and the 3rd party sign and retain Form 114a |


|

Errors | The IRS and states can reject returns for validation errors and business rule validations | The system generates 2 types of errors:   * **Fatal Error** : FinCEN rejects the FBAR * **File Error** : FinCEN accepts the FBAR but you must file it as a corrected report |