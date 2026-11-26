import { WSChannel } from "isecure-ts-client";

export const FILE_TYPE = "camt.053.001.02";
export const TEST_URL = "https://ws-api.test.isecure.fi/v2";
const silentLogger = Object.fromEntries(
  ["debug", "info", "warn", "error"].map((name) => [name, () => {}]),
);

// Credentials come only from the dedicated demo secret, never an HTTP request.
export async function readStatement(config, Client = WSChannel) {
  if (
    !config.Email?.endsWith("@example.invalid") ||
    config.Company !== "ISECure Website Demo" ||
    !config.ApiKey ||
    !config.Password
  )
    throw new Error("Invalid demo identity");
  const client = new Client(
    {
      ...config,
      BaseUrl: TEST_URL,
      Bank: "simulator",
      Mode: "data",
      EncryptionProfile: "password-rsa-oaep-sha256-v1",
      LogLevel: "error",
    },
    { logger: silentLogger },
  );
  const auth = await client.login();
  if (auth.status !== "authenticated")
    throw new Error("Demo login unavailable");
  try {
    const listed = await client.listFiles({
      FileType: FILE_TYPE,
      Status: "ALL",
    });
    if (listed.ResponseCode !== "00")
      throw new Error("Demo listing unavailable");
    const files = listed.FileDescriptors.filter(
      (file) => file.FileType === FILE_TYPE,
    );
    // One operator-enrolled opening statement. Refuse unexpected fixture changes.
    if (files.length !== 1) throw new Error("Unexpected demo file inventory");
    const result = await client.downloadFile(FILE_TYPE, files[0].FileReference);
    if (
      result.ResponseCode !== "00" ||
      typeof result.Content !== "string" ||
      result.Content.length > 180_000
    ) {
      throw new Error("Demo retrieval unavailable");
    }
    const xml = Buffer.from(result.Content, "base64").toString("utf8");
    if (
      !xml.includes(`urn:iso:std:iso:20022:tech:xsd:${FILE_TYPE}`) ||
      !xml.includes("FI2112345600000785") ||
      /<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/iu.test(xml) ||
      Buffer.byteLength(xml) > 128_000
    )
      throw new Error("Unexpected demo document");
    return {
      schemaVersion: 1,
      environment: "test",
      bank: "simulator",
      synthetic: true,
      sdkVersion: "6.1.0",
      fileType: FILE_TYPE,
      retrievedAt: new Date().toISOString(),
      xml,
    };
  } finally {
    await client.logout().catch(() => {});
  }
}
