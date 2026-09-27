// Public screenshots use the actual application components and invented .example identities.
// This fixture has no sign-in, client, native bridge or customer data source.
import type { TenantAccount, CertificateInfo } from "@admin/domain/models";
import type { AccountUsage } from "@admin/services/account-usage";
import { createRoot } from "react-dom/client";
import { AccountUsageWorkspace } from "@admin/features/account-access/AccountUsageWorkspace";
import { CustomerAccountsPanel } from "@admin/features/account-access/CustomerAccountsPanel";
import { CertificateTable } from "@admin/components/CertificateTable";
import { savedAdministration } from "@admin/tests/fixtures/administration";
import { applyTheme } from "@admin/services/theme";
import "@admin/styles/fonts.css";
import "@admin/components/ui/tokens.css";
import "@admin/styles/main.css";

const tenant = "example-integrator";
const companies = ["Aurora", "Birch", "Cedar", "Delta", "Elm", "Fjord"];
const accounts: TenantAccount[] = companies.map((company) => ({
  email: `finance@${company.toLowerCase()}.example`,
  company: `${company} Example`,
  mode: "admin",
  apiKey: tenant,
  tenantId: tenant,
  lifecycle: "active",
  billable: true,
  source: "wsapi",
  adminRegistration: "registered",
  dataRegistration: "registered",
}));
const certificates: CertificateInfo[] = accounts.map((account, index) => ({
  tenantId: tenant,
  email: account.email,
  bank: index % 2 ? "Example Baltic Bank" : "Example Nordic Bank",
  certName: `example-certificate-${index + 1}`,
  lifecycle: index === 0 ? "expiring" : "active",
  expiresAt: index === 0 ? "2026-10-12T12:00:00Z" : "2027-06-15T12:00:00Z",
}));
const usage: AccountUsage = {
  Tenant: tenant,
  Month: "2026-09",
  Timezone: "Europe/Helsinki",
  Basis: "observed-camt-accounts@1",
  UniqueAccounts: 9,
  Accounts: accounts.map(({ email }, index) => ({
    Email: email,
    UniqueAccounts: index < 3 ? 2 : 1,
  })),
  Licenses: {
    Basis: "non-retired-user-own-accounts@1",
    Scope: "tenant",
    State: "provisional",
    Count: 9,
    BillableUsers: 6,
    RetiredUsers: 0,
    AsOf: "2026-09-27T07:00:00Z",
  },
  Collection: {
    Date: "2026-09-26",
    State: "completed",
    FinishedAt: "2026-09-27T04:00:00Z",
  },
  Daily: [],
  MissingDays: [],
  Issues: [],
};
applyTheme("light", document.documentElement, undefined);
const certificateView =
  new URLSearchParams(location.search).get("view") === "certificates";
createRoot(document.getElementById("root")!).render(
  <main
    style={{
      width: 1440,
      height: certificateView ? "auto" : 730,
      padding: certificateView ? 24 : 0,
    }}
  >
    {certificateView ? (
      <CertificateTable title="Bank certificates" certificates={certificates} />
    ) : (
      <AccountUsageWorkspace
        tenant={tenant}
        local={savedAdministration([usage])}
        accounts={accounts}
        certificates={certificates}
      >
        {({ usage, status }) => (
          <CustomerAccountsPanel
            accounts={accounts}
            certificates={certificates}
            usage={usage}
            usageStatus={status}
            accountType="integrator"
            selfEmail="admin@integrator.example"
            onDeleteAccount={async () => {}}
            onRetireCertificate={async () => {}}
            onReauthenticate={() => {}}
          />
        )}
      </AccountUsageWorkspace>
    )}
  </main>,
);
