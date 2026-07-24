# Submit linked or unlinked state returns

Submit state returns as linked or unlinked to federal returns, with different validation and transmission processes for each type.

State e-file accepts 2 types of state submissions:

* Linked
* Unlinked

Regardless of which type you select, the system transmits all state returns to the federal e-file system before it forwards them to the state taxing authority.

You decide to link or unlink the federal and state returns when you create the e-file batch and send it to Thomson Reuters.

## Linked submission

A linked state return connects to a federal return and includes the federal return's submission ID. This is also called a federal/state submission. When you transmit linked returns, the system transmits the federal return first and holds the state return until the IRS accepts or rejects the federal return.

* If the IRS rejects the federal return, the system also rejects the state return. The transmitter receives acknowledgments about the rejection, but the system doesn't notify the state.
* If the IRS accepts the federal return, the system transmits the state return. The e-file program performs validation checks before sending to the state taxing authority.
* The state can still reject the state return if it fails the IRS validation checks or if the state taxing authority rejects it.

## Unlinked submission

When you don't link federal and state returns, the system submits the state return independently. It doesn't include the federal return's submission ID. The system doesn't hold it until the IRS accepts the federal return. The IRS e-file system performs minimal validation checks on the state submission before forwarding it to the state taxing authority.

The state can still reject the state return if it fails the minimal validation checks or if the state taxing authority rejects the return.

The state may accept the state return before the IRS accepts the federal return.

important

Be careful if you materially change the federal return to get IRS acceptance. The federal return you filed with the IRS would no longer match the federal return you filed with the state. If this happens, you may need to file an amended state return.

This type of submission is also referred to as a state standalone submission.