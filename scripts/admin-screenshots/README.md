# Administration screenshots

These images render the application's real account and certificate components with six invented
`.example` accounts. They do not use a signed-in session, AWS, production data or a live test tenant.
The caption identifies the data as synthetic. The fixed capture date keeps examples reproducible.

With the sibling `isecure-admin-app` dependencies and Playwright Chromium installed, run:

```sh
node scripts/admin-screenshots/capture.mjs
```

Set `ISECURE_ADMIN_SOURCE` to select a different app checkout. The capture server listens only on
loopback and closes afterwards. The browser refuses external requests; capture fails on such a
request, a rendering error or a displayed email outside `.example`. Review the PNGs before committing.
The initial images use app commit `fb005e6a6140271032220cf8a0f03a38b021bd83`.
These are component screenshots, not evidence of installed application or provider acceptance.
