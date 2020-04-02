# Version 1.0.1

* When invoking the `spec-generator` service, respec arguments are HTTP encoded. Although the spec generator does work without encoding in some cases, it does not for other combinations... Properly encoding the HTTP is safer (and also standard compliant...).
* The usage of the `-r` flag in the CLI (resp. the `respec=true` query parameter for the server) is not required in case any of the respec flags/parameters (`specStatus`, `publishDates`, etc.) are used; that flag/parameter is implied.
