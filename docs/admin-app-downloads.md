# Administration app download preparation

Publication is on hold until the application and plugins have been separated. The website draft
shows “coming soon” and disabled platform buttons. `src/data/admin-app-release.json` retains the
candidate download URLs but has `available: false`; the visible copy contains no version number.
The Finnish platform label remains **Työpöytäsovellus**.

The public release serves integrator administrators with accounts, bank certificate status and
billing/license figures. It does not advertise plugins, Agents, reconciliation or mobile apps.
The screenshot fixture imports the actual application components and provides invented `.example`
identities. It never signs in or reads production/test customer accounts. See
[the capture instructions](../scripts/admin-screenshots/README.md).

The macOS signing note describes the planned ISECure Oy Developer ID signature and Apple
notarisation before distribution. Windows updater signatures verify automatic updates; they are
not Authenticode publisher signatures. Until publisher signing is implemented, retain the Windows
unknown-publisher explanation. Do not promise that signing makes software risk-free.

When a release is authorized and qualified, update the candidate URLs and release state together
with the availability and signing copy. Keep the public version string absent. Publication checks
the installer URLs before offering downloads. Follow the existing clean-commit website publisher,
which preserves the separate `/app/` origin. Preparing these files does not publish either product.

Review (2026-09-27): functionality covers all three locales, disabled downloads, image enlargement
and desktop/mobile layout. Privacy review confirms six invented accounts, no external capture
requests and no customer images. Simplicity review retains the existing landing-page component and
release metadata; screenshots render shared app components instead of recreating their interface.
