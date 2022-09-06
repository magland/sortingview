# Electron mode

Electron mode is similar to [local mode](./local_mode.md), except instead of returning
a URL, an electron window will open and data will be accessed directly
from the file system.

This requires installation of figurl-electron. On Linux you can use snap.

```bash
# Install figurl-electron on Linux
snap install --edge --devmode figurl-electron
```

To use electron mode you either set the `SORTINGVIEW_ELECTRON` env variable to `1` as shown above,
or you can call `.electron(label='...')` instead of `.url(...)` on any of the views.