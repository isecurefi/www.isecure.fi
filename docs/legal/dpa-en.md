---
title: "Data Processing Agreement (DPA)"
---

**Version 1.0.1 — 18 October 2026**

This Data Processing Agreement ("DPA") is an annex to the service agreement ("Agreement") between
the customer named in the Agreement ("Customer", the controller) and ISECure Oy, Business ID
FI22963369, Helsinki, Finland ("ISECure", the processor). It implements Article 28 of the EU General
Data Protection Regulation 2016/679 ("GDPR"). If this DPA and the Agreement conflict on the
processing of personal data, this DPA prevails.

## 1. Subject matter and nature of the processing

ISECure provides the WS Channel API: a hosted gateway that exchanges bank files between the
Customer's systems and Finnish banks over the banks' SEPA Web Services channel, including bank
certificate enrolment and renewal. ISECure processes personal data only to the extent it is contained
in the bank files and account data the Customer sends through the service. The processing is
described in Annex 1.

ISECure does not read, analyse or use the content of bank files for its own purposes, other than
computing aggregated usage figures (such as counts of observed bank accounts and files) for billing
and licensing. ISECure
software that the Customer runs on its own devices (such as the ISECure Admin App) processes data
locally under the Customer's control and is not covered by this DPA.

## 2. Duration

This DPA applies as long as ISECure processes personal data on behalf of the Customer under the
Agreement, and until the data has been deleted under Section 10.

## 3. Customer's instructions

ISECure processes personal data only on the Customer's documented instructions. The Agreement, this
DPA, and the API requests the Customer's authorised users make through the service are the complete
instructions. ISECure will inform the Customer if, in its opinion, an instruction infringes the GDPR
or other EU or Member State data protection law.

ISECure may process personal data without instructions where EU or Member State law requires it. In
that case ISECure informs the Customer of the legal requirement before processing, unless the law
prohibits this.

## 4. Confidentiality

ISECure ensures that persons authorised to process the personal data are bound by a contractual or
statutory obligation of confidentiality. Access is limited to persons who need it to operate,
support or secure the service.

## 5. Security

ISECure implements the technical and organisational measures described in Annex 2 and keeps them at
a level appropriate to the risk, taking into account the state of the art, the nature of the data
and the costs of implementation (GDPR Article 32). ISECure may update Annex 2 provided the overall
level of security does not decrease.

## 6. Sub-processors

The Customer gives general written authorisation to the sub-processors listed in Annex 3. ISECure
will notify the Customer by email at least 30 days before adding or replacing a sub-processor. The
Customer may object on reasonable data protection grounds within that period. If the parties cannot
resolve the objection, the Customer may terminate the affected service.

ISECure imposes on each sub-processor, by written contract, the same data protection obligations as
in this DPA, and remains fully liable to the Customer for the sub-processor's performance.

## 7. International transfers

Personal data is stored and processed in the European Union (AWS region eu-west-1, Ireland). ISECure
does not transfer personal data outside the EU or EEA unless the Customer instructs it, or a listed
sub-processor does so under a valid transfer mechanism in GDPR Chapter V, such as an adequacy
decision or the European Commission's Standard Contractual Clauses.

## 8. Assistance to the Customer

Taking into account the nature of the processing, ISECure assists the Customer with appropriate
technical and organisational measures to respond to data subject requests under GDPR Chapter III. If
a data subject contacts ISECure directly, ISECure refers the request to the Customer without undue
delay and does not respond on the Customer's behalf unless instructed.

ISECure also assists the Customer in meeting its obligations under GDPR Articles 32 to 36 (security,
breach notification, data protection impact assessments and prior consultation), taking into account
the information available to ISECure. ISECure may charge reasonable costs for assistance that goes
beyond what the service and this DPA normally require.

## 9. Personal data breach

ISECure notifies the Customer without undue delay, and at the latest within 48 hours, after becoming
aware of a personal data breach affecting the Customer's personal data. The notification includes
the information available at that time, in particular the nature of the breach, the categories and
approximate number of data subjects and records concerned, the likely consequences, and the measures
taken or proposed. ISECure supplements the information as it becomes available. The notification is
sent to the email address registered for the Customer's owner account and, as a short alert, to
the verified phone number of that account by SMS. The Customer keeps these contact details current.

## 10. Deletion and return

When the Agreement ends, or earlier on the Customer's request, ISECure deletes the Customer's
accounts, bank certificates and keys within 30 days, unless EU or Member State law requires further
storage. Bank message logs expire at the end of the retention period stated in Annex 1 and are not
copied elsewhere. Database backups (point-in-time recovery) cover a rolling 35-day window, so
deleted account and certificate data leaves the backups no later than 35 days after deletion.
Backups are used only to recover from a service failure; after any restore, already deleted
accounts are deleted again. Bank files are not stored for retrieval, so no return is provided; the Customer
retrieves its own copies from the bank or from its own systems.

Account and certificate management audit events (Annex 1) are retained after deletion so that the
Customer, and ISECure, can later prove what was done to the account and by whom. During the
Agreement ISECure processes these events as the Customer's processor. Only for the residual
retention after account deletion or the end of the Agreement does ISECure act as an independent
controller, on the basis of its legitimate interest in evidencing service delivery and investigating
security incidents. The 10-year period matches the general limitation period for contractual
claims. The events contain the acting and target user's email address, the action, its outcome, a
timestamp and a technical request identifier, never file content or key material.

## 11. Audit

ISECure makes available to the Customer the information necessary to demonstrate compliance with
this DPA. ISECure answers reasonable written questions and provides available descriptions of its
security measures and sub-processors. If this is not sufficient, the Customer, or an independent
auditor bound by confidentiality and approved by ISECure, may audit ISECure's processing once per
calendar year, with at least 30 days' written notice, during normal business hours and without
disrupting the service. Audits are limited to ISECure's own operations; AWS is audited through the
compliance reports AWS publishes. The Customer bears its own audit costs.

## 12. Liability and general

Each party's liability under this DPA follows the limitation of liability in the Agreement, except
where the GDPR does not permit a limitation. This DPA is governed by the law of Finland. Disputes are
resolved as set out in the Agreement.

---

## Annex 1 — Description of the processing

| Item                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subject matter           | Exchange of bank files between the Customer and Finnish banks through the WS Channel API, with bank certificate enrolment and renewal.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Nature                   | Transmission, temporary storage during transfer, signing and encryption for the bank channel, logging.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Purpose                  | To perform the Agreement: deliver payment, statement, reporting and related files to and from the banks the Customer has connected.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Data subjects            | The Customer's employees, customers, suppliers and other payees or payers whose data appears in bank files; the Customer's users of the service.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Personal data categories | **In bank files:** names, bank account numbers (IBAN, BIC), payment amounts, references and messages, invoice and salary details, addresses and other identifiers the Customer includes. The Customer decides what the files contain. **Service user data:** name, email address, phone number, company, role, login and audit events.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Special categories       | None intended. Salary files may reveal trade union membership or health-related deductions if the Customer includes them; the Customer is responsible for such content.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Where data is stored     | AWS region eu-west-1 (Ireland). Production and test environments run in separate AWS accounts. The test environment is intended for integration testing with synthetic data and carries baseline controls only; the Customer must not send real personal data to it. ISECure does not inspect file content, so compliance rests on the Customer. The test environment connects only to the banks' test systems, and its logs expire within 30 days as in production.                                                                                                                                                                                                                                                                                                                                                  |
| Retention                | Bank files pass through the API and are not stored for later download. The application-level bank message content (request and response) is written to the Customer's own log stream and retained for 30 days for support and reconciliation. That log stream is held in ISECure's AWS account, is the only copy, is not backed up, and is readable only by ISECure operations staff. API Gateway and Lambda diagnostic logs contain no request or response content and expire within 30 days. Account and certificate management audit events, which contain user email addresses but no file content, are retained for 10 years and survive account deletion so that the Customer can prove its own account history. Bank certificates and keys are kept until the Customer retires them or the account is deleted. |

## Annex 2 — Technical and organisational security measures

**Hosting.** The service runs on AWS API Gateway and AWS Lambda in region eu-west-1. Production and
test are separate AWS accounts. AWS physical and infrastructure security is covered by AWS's own
certifications (ISO 27001, SOC 1/2/3).

**Encryption in transit.** All API traffic uses TLS. Passwords and login challenges are additionally
RSA-OAEP encrypted inside TLS using fresh per-login parameters. Traffic to banks uses the banks'
signed and TLS-protected Web Services channel.

**Encryption at rest.** Databases use AWS-managed encryption at rest. Bank certificates and private
keys are encrypted with AWS Key Management Service before storage. Logs are stored in AWS CloudWatch Logs with server-side encryption.

**Authentication and access control.** User identities are managed in Amazon Cognito. Each
Customer (tenant) is identified by its own API key; every request is checked against the verified
owner of that key before data is read or written. Users have separate administrative and data roles
with separate passwords. Administrative actions require multi-factor authentication (SMS or
authenticator app). Rate limits apply per tenant.

**Tenant isolation.** Account data, certificates and logs are bound to the verified tenant. Request
parameters cannot redirect logging or data access to another tenant.

**Logging and monitoring.** Account and certificate management actions are recorded in an audit log
that the Customer can read through the API. Apart from the Customer's own bank message log described
in Annex 1, runtime diagnostics (API Gateway, Lambda) contain structural fields only and never include
request or response bodies, file content, passwords, tokens, MFA codes or key material. Deletion of the audit log,
and changes to its retention, are denied to the service's runtime permissions. API Gateway and Lambda logs
expire after 30 days.

**ISECure staff access.** Only named ISECure personnel have AWS access, protected by MFA. Access to
customer data is limited to what support or operation requires. Support staff ask for the API request
ID, never for credentials or file contents.

**Secure development.** Changes are tested with synthetic data before deployment. Real customer data
is never used in tests, source control or issue tracking.

**Backups and availability.** Tables holding account and certificate data have DynamoDB point-in-time
recovery enabled. The service depends on bank
availability; incidents are handled through the support contact in the Agreement.

## Annex 3 — Sub-processors

| Sub-processor                       | Purpose                                                                                                                         | Location                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Amazon Web Services EMEA SARL (AWS) | Hosting, compute, storage, identity (Cognito), key management (KMS), logs, email and SMS delivery of verification and MFA codes | EU, region eu-west-1 (Ireland). AWS's data processing addendum incorporates the EU standard contractual clauses for any support access from outside the EU. SMS are sent with Amazon SNS from Ireland; AWS routes them through international carrier partners and does not publish the route per country. An SMS contains only the phone number and a code or short alert. Users who prefer no SMS can use an authenticator app (Annex 2). |

The banks to which the Customer connects are the Customer's own counterparties and independent
controllers. They are not sub-processors of ISECure.

Changes to this list are notified under Section 6.

## Annex 4 — Change log

| Version | Date            | Change                                                                                                                                                                                                                  |
| ------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 17 October 2026 | First published version.                                                                                                                                                                                                |
| 1.0.1   | 18 October 2026 | Clarifications: 35-day backup window, location and access of the bank message log, audit event fields and controller role, test environment, AWS transfer basis and SMS routing. No change to the parties' obligations. |

Earlier versions are available on request.
