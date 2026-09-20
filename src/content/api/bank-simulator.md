Configure synthetic bank accounts and scenarios, run tests, and inspect the resulting events and file references. The Bank Simulator control API uses the same base URL and Processing session as the [Processing API](https://www.isecure.fi/apis/processing/). Actual file [uploads](https://www.isecure.fi/wsapi_v2/#operation/UploadFile) and [downloads](https://www.isecure.fi/wsapi_v2/#operation/DownloadFile) use the separate [File Exchange API](https://www.isecure.fi/wsapi_v2/).

**Experimental control API · Test environment · Paid subscription and access approval required.** This reference covers 21 simulator operations plus session exchange and notifications. It is for synthetic testing only; it does not create real bank accounts or authorize real payments.

The existing Beta File Exchange simulator also offers a fixed default account and scenario. This control API is the separate, configurable interface. Select `Bank: "simulator"` for File Exchange transfers; use `isecure-ts-client/iso20022` to manage workspaces and runs.

## The main concepts

| Concept    | Plain meaning                                                                                |
| ---------- | -------------------------------------------------------------------------------------------- |
| Capability | Supported profiles, behaviors and limits for this deployment.                                |
| Workspace  | Your synthetic banks, companies, accounts, currencies and service setup.                     |
| Scenario   | The response you want to test, such as acceptance, rejection or delay.                       |
| Run        | One execution using exact workspace and scenario revisions.                                  |
| Clock      | The simulated business time used for schedules and cutoffs. It does not change login expiry. |
| Checkpoint | A saved point from which another experiment can start.                                       |
| Branch     | A separate continuation that preserves the original experiment.                              |
| Event      | A recorded observation about a run.                                                          |
| Artifact   | A reference to exact file bytes retrieved through File Exchange.                             |

## Configure and run a test

1. **Discover capabilities.** Read `simulationCapabilities.list()` with `data_admission_mode: "synthetic"`. Use the returned quotas, profiles and clock modes; do not hardcode greater limits.
2. **Create a workspace.** Supply its synthetic banks, legal entities, accounts, opening balances, currencies and service setup. The resulting workspace starts as a draft. Account configuration is part of a workspace revision, not a separate account CRUD endpoint.
3. **Activate the workspace.** Review the configuration and pass its current resource version. Use `revise()` for supported configuration changes; do not assume that an active run will pick up later edits.
4. **Create a scenario.** Choose supported outcomes and timing rules. Save the exact scenario reference returned by the API.
5. **Start a run.** Bind the exact workspace, scenario and admitted [Processing payment revision](https://www.isecure.fi/apis/processing/#operation/payment_orders.get) or [File Exchange artifact](https://www.isecure.fi/wsapi_v2/#operation/ListFiles). A successful start means work was accepted, not necessarily completed. Follow `simulationRuns.get()` or `list()` until the returned state indicates completion or failure.
6. **Inspect the results.** Read `simulationEvents.list()` and `simulationArtifacts.list()`. Use the authorized artifact references with [File Exchange download](https://www.isecure.fi/wsapi_v2/#operation/DownloadFile) to retrieve exact output files.
7. **Compare another case.** Create a checkpoint and branch when supported. Advance the simulated clock deliberately for timed behavior. Reset, suspend or close a workspace only after reviewing that operation's state and revision requirements.

All simulator operations require the server-assigned `manage_simulation` permission and an active Bank Simulation subscription. Neither a File Exchange login nor a per-user application preview switch grants this authority.

### Discover and list your workspaces

After creating the authenticated `client` shown below:

```ts
const capabilities = await client.simulationCapabilities.list({
  data_admission_mode: "synthetic",
  page: { page_size: 25 },
});
const firstPage = await client.simulationWorkspaces.list({
  state: "active",
  page: { page_size: 25 },
});
if (firstPage.page.next_cursor) {
  const nextPage = await client.simulationWorkspaces.list({
    state: "active",
    page: { page_size: 25, cursor: firstPage.page.next_cursor },
  });
}
```

### Read the exact returned workspace

```ts
const listed = await client.simulationWorkspaces.list({
  page: { page_size: 25 },
});
const workspace = listed.workspaces[0];
if (workspace) {
  const exact = await client.simulationWorkspaces.get({
    resource_reference: {
      resource_type: "simulation_workspace",
      resource_id: workspace.workspace_id,
      resource_version: workspace.resource_version,
      revision_id: workspace.revision_id,
    },
  });
}
```

Each operation below includes its complete input and output schemas, required permissions, version headers and a matching SDK call. Workspace creation includes the complete topology and service-setup schemas so you can define banks, accounts and starting balances without guessing field names.

## Synthetic data and file access

Use invented companies, accounts and payments. Never submit real bank credentials, private keys, passwords, certificate bytes or customer bank files in simulator configuration. A synthetic certificate record models test behavior; it is not a real banking certificate.

The control API returns file references, not bank-file content. [File Exchange](https://www.isecure.fi/wsapi_v2/) independently checks access when uploading or downloading bytes. Its signed-input rules still apply. A scenario result is evidence of this synthetic test, not proof that a real bank will accept a payment.

Reset and branch operations preserve the distinction between experiments. Do not use clock changes to bypass access expiry or treat notifications as complete historical evidence. Keep the references and revisions needed to reproduce a run.
