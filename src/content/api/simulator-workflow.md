## Worked simulator example

The following example starts after the shared authentication example. Set `simulation = client`; obtain `capability` from `simulationCapabilities.list({ data_admission_mode: "synthetic", page: { page_size: 25 } })`. `processingConnectedAccountId` and `paymentOrderRevisionReference` must identify your authorized synthetic Processing account and exact payment revision. Create and persist a separate UUID for each command in `commandKeys` (`workspaceCreate`, `workspaceActivate`, `scenarioCreate`, `runStart`, `clockControl`, `checkpointCreate`, `branchCreate`, `workspaceReset`, `workspaceClose`) before sending it. These are application inputs, not literal credentials supplied by the example.

### 2. Create a synthetic Workspace

The example below creates two banks and two EUR accounts for one invented company. It also models a
WebServices-style agreement, user, certificate, connection, file permission, schedule and cutoff.
The certificate is only a synthetic configuration record: do not put certificate bytes or a private
key in the request.

Select the ISO profile and runtime policy from capability discovery. The connected account ID comes
from the separately resolved Processing payment capability.

```ts
const profile = capability.profile_capabilities[0];
const runtimePolicy = capability.runtime_policy_profiles[0];
if (!profile || !runtimePolicy)
  throw new Error("Required simulator profiles are unavailable");

const workspaceCreated = await simulation.simulationWorkspaces.create(
  {
    capability_reference: capability.capability_reference,
    data_admission_mode: "synthetic",
    topology: {
      banks: [
        {
          bank_key: "bank-a",
          display_name: "Synthetic Bank A",
          domicile_country: "FI",
          runtime_policy_profile_id: runtimePolicy.runtime_policy_profile_id,
          runtime_policy_profile_version:
            runtimePolicy.runtime_policy_profile_version,
          supported_currencies: ["EUR"],
        },
        {
          bank_key: "bank-b",
          display_name: "Synthetic Bank B",
          domicile_country: "FI",
          runtime_policy_profile_id: runtimePolicy.runtime_policy_profile_id,
          runtime_policy_profile_version:
            runtimePolicy.runtime_policy_profile_version,
          supported_currencies: ["EUR"],
        },
      ],
      legal_entities: [
        {
          legal_entity_key: "example-company",
          display_name: "Example Company Oy",
          domicile_country: "FI",
        },
      ],
      currencies: [{ currency: "EUR", fraction_digits: 2 }],
      accounts: [
        {
          account_key: processingConnectedAccountId,
          bank_key: "bank-a",
          legal_entity_key: "example-company",
          currency: "EUR",
          starting_balance: { amount: "100000.00", currency: "EUR" },
        },
        {
          account_key: "synthetic-beneficiary-eur",
          bank_key: "bank-b",
          legal_entity_key: "example-company",
          currency: "EUR",
          starting_balance: { amount: "25000.00", currency: "EUR" },
        },
      ],
      counterparties: [],
    },
    service_setup: {
      agreements: [
        {
          agreement_key: "agreement-a",
          bank_key: "bank-a",
          legal_entity_key: "example-company",
          agreement_profile_id: "isecure.simulation.agreement",
          agreement_profile_version: "1",
        },
      ],
      users: [
        {
          user_key: "user-a",
          agreement_key: "agreement-a",
          display_name: "Synthetic WS user",
          user_profile_id: "isecure.simulation.webservices_user",
          user_profile_version: "1",
        },
      ],
      certificates: [
        {
          certificate_key: "certificate-a",
          user_key: "user-a",
          certificate_profile_id: "isecure.simulation.certificate",
          certificate_profile_version: "1",
          valid_from: "2026-01-01T00:00:00Z",
          valid_until: "2036-01-01T00:00:00Z",
        },
      ],
      connections: [
        {
          connection_key: "connection-a",
          agreement_key: "agreement-a",
          user_key: "user-a",
          certificate_key: "certificate-a",
          connection_profile_id: "isecure.simulation.connection",
          connection_profile_version: "1",
        },
      ],
      file_permissions: [
        {
          permission_key: "pain001-outbound",
          connection_key: "connection-a",
          file_type_code: "pain.001.001.09",
          direction: "customer_to_bank",
          message_namespace: profile.message_namespace,
          profile_id: profile.profile_id,
          profile_version: profile.profile_version,
        },
      ],
      schedules: [
        {
          schedule_key: "weekday-processing",
          permission_key: "pain001-outbound",
          schedule_profile_id: "isecure.simulation.schedule",
          schedule_profile_version: "1",
          business_timezone: "Europe/Helsinki",
        },
      ],
      cutoffs: [
        {
          cutoff_key: "eur-cutoff",
          permission_key: "pain001-outbound",
          cutoff_profile_id: "isecure.simulation.cutoff",
          cutoff_profile_version: "1",
          business_timezone: "Europe/Helsinki",
          currency: "EUR",
        },
      ],
    },
  },
  { idempotencyKey: commandKeys.workspaceCreate },
);
```

The result is a draft Workspace. Keep its exact resource version and revision ID. Configuration
changes append a new revision; they do not edit the old one.

```ts
function workspaceReference(workspace: typeof workspaceCreated.workspace) {
  return {
    resource_type: "simulation_workspace",
    resource_id: workspace.workspace_id,
    resource_version: workspace.resource_version,
    revision_id: workspace.revision_id,
  };
}

const draftReference = workspaceReference(workspaceCreated.workspace);
const activated = await simulation.simulationWorkspaces.activate(
  {
    workspace_reference: draftReference,
    expected_resource_version: workspaceCreated.workspace.resource_version,
  },
  {
    idempotencyKey: commandKeys.workspaceActivate,
    expectedResourceVersion: `"${workspaceCreated.workspace.resource_version}"`,
  },
);
const activeWorkspace = workspaceReference(activated.workspace);
```

If another command revised the Workspace first, activation returns `412`. Read the current revision
and decide again instead of forcing an overwrite.

### 3. Describe the bank behavior

A Scenario is an immutable list of typed directives. Start with one clear outcome.

```ts
const scenarioCreated = await simulation.simulationScenarios.create(
  {
    workspace_revision_reference: activeWorkspace,
    scenario_profile_id: profile.profile_id,
    scenario_profile_version: profile.profile_version,
    name: "Accept one synthetic payment",
    directives: [{ directive_ordinal: 1, outcome: "accept" }],
  },
  { idempotencyKey: commandKeys.scenarioCreate },
);

const scenarioReference = {
  resource_type: "simulation_scenario",
  resource_id: scenarioCreated.scenario.scenario_id,
  resource_version: scenarioCreated.scenario.resource_version,
  revision_id: scenarioCreated.scenario.revision_id,
};
```

Useful follow-up experiments include:

| Question                                              | Directive idea                                          |
| ----------------------------------------------------- | ------------------------------------------------------- |
| Does the client explain a bank rejection?             | `outcome: 'reject'` with a stable synthetic reason code |
| Does polling tolerate delayed processing?             | `outcome: 'delay'` with bounded `delay_seconds`         |
| Does reconciliation handle a returned payment?        | `outcome: 'return'`                                     |
| Does recovery avoid assuming success after a timeout? | `fault_kind: 'timeout_after_acceptance'`                |
| Does event handling reject contradictory evidence?    | `fault_kind: 'contradictory_status'`                    |

Create a new Scenario revision for a changed experiment. Do not hide behavior in payment values,
file names or remittance text.

### 4. Start and observe an asynchronous Run

This example assumes `paymentOrderRevisionReference` is an exact synthetic payment-order revision
prepared through the [Processing API](https://www.isecure.fi/apis/processing/).

```ts
const started = await simulation.simulationRuns.start(
  {
    workspace_revision_reference: activeWorkspace,
    scenario_revision_reference: scenarioReference,
    data_admission_mode: "synthetic",
    input: {
      input_type: "payment_order_revision",
      payment_order_revision_reference: paymentOrderRevisionReference,
    },
  },
  { idempotencyKey: commandKeys.runStart },
);

let current = await simulation.simulationRuns.get({
  resource_reference: {
    resource_type: "simulation_run",
    resource_id: started.run.run_id,
  },
});

for (
  let poll = 0;
  ["accepted", "running", "paused"].includes(current.run.state) && poll < 30;
  poll += 1
) {
  await new Promise((resolve) => setTimeout(resolve, 3_000));
  current = await simulation.simulationRuns.get({
    resource_reference: {
      resource_type: "simulation_run",
      resource_id: started.run.run_id,
    },
  });
}
if (["accepted", "running", "paused"].includes(current.run.state)) {
  throw new Error("Run did not finish inside the bounded observation window");
}
if (current.run.state !== "succeeded") {
  throw new Error(
    `Run ended in ${current.run.state}; inspect its events before continuing`,
  );
}
```

Starting a Run returns acceptance, not its final outcome. The API request Lambda does not keep
running in the background after it returns. Instead, acceptance records durable work that a later,
separately invoked and lease-bounded worker attempt can continue. After response loss or timeout,
list Runs and events using the same Workspace and reconcile the original idempotency key before
issuing anything new.

### 5. Move business time deliberately

Simulation time controls cutoffs, schedules and Scenario events. Security-token expiry, audit time
and retention still use real time.

```ts
const clock = await simulation.simulationClocks.control(
  {
    workspace_reference: activeWorkspace,
    expected_clock_revision: current.run.clock.clock_revision,
    control_kind: "step_duration",
    step_seconds: "60",
  },
  {
    idempotencyKey: commandKeys.clockControl,
    expectedResourceVersion: `"${current.run.clock.clock_revision}"`,
  },
);
```

Use `step_event` when you want the next scheduled event, `set_acceleration` for bounded faster
pacing, and `advance_to_instant` for an exact future business instant. Use only modes and limits
returned by capability discovery.

### 6. Inspect events and exact Artifact references

Events explain what the Run did without returning exact file bytes.

```ts
const events = await simulation.simulationEvents.list({
  workspace_reference: activeWorkspace,
  run_reference: {
    resource_type: "simulation_run",
    resource_id: current.run.run_id,
    resource_version: current.run.resource_version,
    revision_id: current.run.revision_id,
  },
  page: { page_size: 100 },
});

const artifacts = await simulation.simulationArtifacts.list({
  run_reference: {
    resource_type: "simulation_run",
    resource_id: current.run.run_id,
    resource_version: current.run.resource_version,
    revision_id: current.run.revision_id,
  },
  page: { page_size: 100 },
});
```

Each Artifact includes a `file_exchange_occurrence_reference`. Use that reference with the
separately authenticated, permanent [File Exchange API](https://www.isecure.fi/wsapi_v2/) to download exact
bytes. The Simulation API never provides another download endpoint. Verify the expected media type,
namespace and profile before parsing a file.

The event list is the recovery authority. SSE is a bounded notification convenience: tolerate
duplicates and reconcile list/get state after a gap or reconnect.

### 7. Checkpoint, branch and compare

Take a checkpoint only after reading the exact Run revision you intend to preserve.

```ts
const runReference = {
  resource_type: "simulation_run",
  resource_id: current.run.run_id,
  resource_version: current.run.resource_version,
  revision_id: current.run.revision_id,
};

const checkpoint = await simulation.simulationCheckpoints.create(
  {
    run_reference: runReference,
    expected_resource_version: current.run.resource_version,
  },
  {
    idempotencyKey: commandKeys.checkpointCreate,
    expectedResourceVersion: `"${current.run.resource_version}"`,
  },
);

const branch = await simulation.simulationBranches.create(
  {
    checkpoint_reference: {
      resource_type: "simulation_checkpoint",
      resource_id: checkpoint.checkpoint.checkpoint_id,
      resource_version: "1",
      revision_id: checkpoint.checkpoint.checkpoint_id,
    },
    scenario_revision_reference: scenarioReference,
  },
  { idempotencyKey: commandKeys.branchCreate },
);
```

Create or select another Scenario revision and start the next Run with the Branch reference. Compare
events, terminal state and artifact roles. Do not compare only HTTP status codes.

### 8. Reset or close with intent

Reset is a governed revision, not deletion. Choose the narrowest scope that matches the experiment:

- `runtime_state` keeps configured balances and active Scenarios;
- `runtime_state_and_balances` also restores balances; and
- `runtime_state_balances_and_active_scenarios` also clears the active Scenario selection.

Supply the current Workspace version, an idempotency key and a stable reason code. Prior revisions,
Runs, events and Artifacts remain evidence.

```ts
const reset = await simulation.simulationWorkspaces.reset(
  {
    workspace_reference: activeWorkspace,
    branch_reference: {
      resource_type: "simulation_branch",
      resource_id: branch.branch.branch_id,
      resource_version: "1",
      revision_id: branch.branch.branch_id,
    },
    expected_resource_version: activated.workspace.resource_version,
    reset_scope: "runtime_state_and_balances",
    reason_code: "repeat_synthetic_test",
  },
  {
    idempotencyKey: commandKeys.workspaceReset,
    expectedResourceVersion: `"${activated.workspace.resource_version}"`,
  },
);
```

Close the Workspace only when no more experiments should run; close is terminal.

```ts
await simulation.simulationWorkspaces.close(
  {
    workspace_reference: workspaceReference(reset.workspace),
    expected_resource_version: reset.workspace.resource_version,
  },
  {
    idempotencyKey: commandKeys.workspaceClose,
    expectedResourceVersion: `"${reset.workspace.resource_version}"`,
  },
);
```

### Common mistakes

| Symptom                      | Likely cause                                                   | What to do                                                                   |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `401`                        | Processing session is missing or expired                       | Re-authenticate and exchange a new Processing session                        |
| `403`                        | Permission or entitlement is absent                            | Stop and request an explicit assignment or entitlement                       |
| `409`                        | One idempotency key was reused for different input             | Reconcile the original command; use a new key only for a new logical command |
| `412`                        | The exact resource version is stale                            | Read the latest revision and re-evaluate the change                          |
| Run stays accepted/running   | Work is asynchronous or business time has not reached an event | Read the Run and events; inspect the Clock before advancing it               |
| Artifact has no inline bytes | This is intentional                                            | Follow its File Exchange occurrence reference with a separate session        |
| Timeout after acceptance     | The result may already exist                                   | Reconcile Runs and events; never assume failure and submit a duplicate       |
