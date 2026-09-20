import { readFileSync } from "node:fs";

import pinnedSpec from "../data/wsapi_v2.json";
import pinnedMetadata from "../data/wsapi_v2.source.json";

// Local review only: production builds always use the recorded upstream mirror.
// Example: WSAPI_PREVIEW_SPEC=/absolute/path/wsapi_v2.json yarn dev
const previewPath = import.meta.env.DEV
  ? process.env.WSAPI_PREVIEW_SPEC
  : undefined;

export const sourceSpec: typeof pinnedSpec = previewPath
  ? (JSON.parse(readFileSync(previewPath, "utf8")) as typeof pinnedSpec)
  : pinnedSpec;
export const sourceRevision = previewPath
  ? "local-preview"
  : pinnedMetadata.commit;
