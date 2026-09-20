// Only operations implemented by the Experimental C# facade belong here.
export const CSHARP_SDK_URL = "https://github.com/isecurefi/isecure-cs-client";

const register = `// One call performs InitRegister and Register; do not call it twice.
// password is supplied securely by your application. Registration does not log in.
var registration = await client.RegisterAsync(password);
// Keep registration.ApiKey for future client instances.
// Start LoginAsync to discover any required phone verification step.`;

const login = `// One call performs InitLogin and Login; password is an application input.
var state = await client.LoginAsync(password);
if (state.Status == AuthStatus.Authenticated)
{
    var certificates = await client.ListCertificatesAsync();
}
// Otherwise follow NeedsMfaSelection, NeedsMfa, NeedsPhoneVerification,
// or NeedsEmailVerification. Failed requires a fresh login before retrying.`;

export const CSHARP_SDK_SAMPLES: Record<string, string> = {
  InitRegister: register,
  Register: register,
  InitLogin: login,
  Login: login,
  LoginMFA: `// state is the previous login/selection result; code is the requested SMS/TOTP code.
if (state.Status == AuthStatus.NeedsMfa)
{
    state = await client.SubmitMfaCodeAsync(code);
}
// Check state.Status: MFA success can still require email verification.
// Only Authenticated permits protected operations. Failed needs a fresh login.
// To enroll TOTP, pass setupTotp: true for an eligible SMS challenge,
// retain the returned TotpEnrollment in memory, then call VerifyTotpAsync.`,
  SelectMFA: `// Select only a factor offered by the current login result.
// This example prefers TOTP when offered; your UI can let the user choose.
if (state.Status == AuthStatus.NeedsMfaSelection)
{
    var method = state.Methods.Contains(MfaMethod.Totp)
        ? MfaMethod.Totp : state.Methods.First();
    state = await client.SelectMfaTypeAsync(method);
}
// Check the new state; for NeedsMfa, ask for a code matching state.Method.`,
  VerifyPhone: `// First call LoginAsync after registration to obtain NeedsPhoneVerification.
// code is the registration SMS, not a login MFA code.
if (state.Status == AuthStatus.NeedsPhoneVerification)
{
    var verification = await client.VerifyPhoneAsync(code);
    if (verification.Status == AuthStatus.VerificationAccepted)
        state = await client.LoginAsync(password);
}
// Complete the new login's required steps, including a separate login SMS.`,
  VerifyEmail: `// code is from the verification email. The client retains the access token.
if (state.Status == AuthStatus.NeedsEmailVerification)
{
    var verification = await client.VerifyEmailAsync(code);
    if (verification.Status == AuthStatus.VerificationAccepted)
        state = await client.LoginAsync(password);
}
// Verification does not log in. Complete the fresh login's MFA again.`,
  VerifyTOTP: `// state is the result of SubmitMfaCodeAsync(code, setupTotp: true).
// Show its enrollment URI only to the user; never log/store enrollment secrets.
var enrollment = state.TotpEnrollment
    ?? throw new InvalidOperationException("No TOTP enrollment returned.");
// code is a NEW code from the authenticator after adding the enrollment URI.
var verification = await client.VerifyTotpAsync(enrollment.AccessToken, code);
if (verification.Status != AuthStatus.VerificationAccepted)
    throw new InvalidOperationException("TOTP enrollment was not confirmed.");
// Confirmation preserves an existing login; it does not create a new one.`,
  Logout: `// Call on the same instance that logged in, including in application cleanup.
await client.LogoutAsync();
// Local authentication clears even if server logout throws.
// Handle the exception: local clearing does not prove server revocation.`,
  ListCerts: `// Requires an authenticated client. Discovery does not enroll certificates.
var certificates = await client.ListCertificatesAsync();
foreach (var connection in certificates.Connections ?? [])
    Console.WriteLine(connection.Bank);`,
  UploadKey: `// Requires an authenticated admin client; publicKeyFile is a caller-chosen path.
// Register only the PUBLIC half of the key used for detached file signatures.
var publicKey = await File.ReadAllTextAsync(publicKeyFile);
await client.UploadPgpKeyAsync(publicKey, PgpKeyPurpose.Authorize);`,
  ListFiles: `// Requires authentication and an enrolled bank connection with access.
var files = await client.ListFilesAsync(fileType: "camt.053.001.02", status: "NEW");
// Pass a returned descriptor's FileType and FileReference to DownloadFileAsync.
Console.WriteLine(files.FileDescriptors.Count);`,
  UploadFile: `// Requires an authenticated data client and an enrolled bank connection.
// Caller-chosen paths: paymentFile and signatureFile. Sign the exact bytes first
// with your own signer; register its public key on the admin account.
var bytes = await File.ReadAllBytesAsync(paymentFile);
var signature = await File.ReadAllTextAsync(signatureFile);
await client.UploadFileAsync(bytes, "payment.xml", "pain.001.001.09", signature);
// Use a file type accepted by your bank. Poll separately for feedback.
// After a timeout, check status before retrying: the upload may have succeeded.`,
  DownloadFile: `// Requires an authenticated data client. descriptor came from ListFilesAsync.
var file = await client.DownloadFileAsync(descriptor.FileType, descriptor.FileReference);
// Choose outputFile locally; never use a remote reference as a filesystem path.
await using var output = new FileStream(outputFile, FileMode.CreateNew, FileAccess.Write);
await output.WriteAsync(file.Bytes); // Preserve the exact downloaded bytes.`,
};
