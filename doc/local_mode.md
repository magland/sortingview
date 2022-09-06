# Local mode

**Note**: you may want to use electron mode instead. See below.

In local mode, data will not be uploaded/downloaded from the cloud, and the URLs will not be shareable.

To use local mode you either set the `SORTINGVIEW_LOCAL` env variable to `1` as shown above,
or you can pass `local=True` as an argument to `.url()` in any of the views.

To use local mode, the browser must be on the same computer as the local kachery-cloud
directory. Upon opening the URL, the user will be prompted to select the kachery-cloud
directory and give the browser permission to read from it. Note that if the directory
starts with [dot], then you will need to show hidden files in the directory selection
dialog box.

This has only been tested in Chrome and probably does not work in Firefox.