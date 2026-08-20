import type { Lang } from "../types";
import { dailyCashContent } from "./dailyCash";
import { invoicingContent } from "./invoicing";

export type CatalogStage =
  "experimental" | "beta" | "ga" | "planned" | "retired";
export type CatalogEnvironment = "test" | "production";
export type CatalogRequirement = "required" | "not-required";
export type CatalogAdmission =
  | "self-service"
  | "normal-onboarding"
  | "request-access"
  | "invite-only"
  | "unavailable";
export type CatalogVisibility = "draft" | "soft-launch" | "promoted" | "none";
export type CatalogDirection = "input" | "output" | "bidirectional";
export type CatalogKind = "product" | "integration";

export type LocalizedText = Readonly<Record<Lang, string>>;

export interface CatalogCapability {
  readonly direction: CatalogDirection;
  readonly label: LocalizedText;
  readonly detail: LocalizedText;
}

export interface CatalogFaq {
  readonly question: LocalizedText;
  readonly answer: LocalizedText;
}

export interface CatalogGlossaryTerm {
  readonly term: LocalizedText;
  readonly definition: LocalizedText;
}

export interface CatalogAccessOffer {
  readonly environment: CatalogEnvironment;
  readonly registration: CatalogRequirement;
  readonly subscription: CatalogRequirement;
  readonly admission: CatalogAdmission;
}

interface CatalogRecordBase {
  readonly kind: CatalogKind;
  readonly id: string;
  readonly category: LocalizedText;
  readonly name: LocalizedText;
  readonly buyerJob: LocalizedText;
  readonly summary: LocalizedText;
  readonly stage: CatalogStage;
  readonly access: readonly CatalogAccessOffer[];
  readonly capabilities: readonly CatalogCapability[];
  readonly qualification: {
    readonly label: LocalizedText;
    readonly scope: LocalizedText;
    readonly evidenceDate: string;
    readonly evidenceSource: string;
  };
  readonly limitations: Readonly<Record<Lang, readonly string[]>>;
  readonly cta: {
    readonly label: LocalizedText;
    readonly href: LocalizedText;
  };
  readonly faq: readonly CatalogFaq[];
  readonly glossary: readonly CatalogGlossaryTerm[];
  readonly aliases: readonly string[];
  readonly dependencies: readonly string[];
  readonly seo: {
    readonly title: LocalizedText;
    readonly description: LocalizedText;
  };
}

export interface RoutedCatalogRecord extends CatalogRecordBase {
  readonly visibility: Exclude<CatalogVisibility, "none">;
  readonly routes: Readonly<Record<Lang, string>>;
}

export interface HiddenCatalogRecord extends CatalogRecordBase {
  readonly visibility: "none";
  readonly routes?: never;
}

export type CatalogRecord = RoutedCatalogRecord | HiddenCatalogRecord;

export interface DeveloperSurface {
  readonly id: string;
  readonly kind: "api";
  readonly productId: string;
  readonly name: LocalizedText;
  readonly summary: LocalizedText;
  readonly stage: CatalogStage;
  readonly access: readonly CatalogAccessOffer[];
  readonly visibility: "soft-launch" | "promoted";
  readonly routes: Readonly<Record<Lang, string>>;
  readonly seo: {
    readonly title: LocalizedText;
    readonly description: LocalizedText;
  };
}

const text = (fi: string, en: string, se: string): LocalizedText => ({
  fi,
  en,
  se,
});

const localizedLists = (
  fi: readonly string[],
  en: readonly string[],
  se: readonly string[],
): Readonly<Record<Lang, readonly string[]>> => ({ fi, en, se });

const routeSet = (slug: string): Readonly<Record<Lang, string>> => ({
  fi: `/${slug}/`,
  en: `/en/${slug}/`,
  se: `/se/${slug}/`,
});

const contactHref = text("/#contact", "/en/#contact", "/se/#contact");
const designPartnerCta = text(
  "Keskustele design-kumppanuudesta",
  "Discuss a design partnership",
  "Diskutera ett designpartnerskap",
);

const fileExchangeAccess = [
  {
    environment: "test",
    registration: "required",
    subscription: "not-required",
    admission: "self-service",
  },
  {
    environment: "production",
    registration: "required",
    subscription: "required",
    admission: "normal-onboarding",
  },
] as const satisfies readonly CatalogAccessOffer[];

const subscribedTestAccess = [
  {
    environment: "test",
    registration: "required",
    subscription: "required",
    admission: "request-access",
  },
] as const satisfies readonly CatalogAccessOffer[];

const subscribedProductionAccess = [
  {
    environment: "production",
    registration: "required",
    subscription: "required",
    admission: "normal-onboarding",
  },
] as const satisfies readonly CatalogAccessOffer[];

const statusGlossary: readonly CatalogGlossaryTerm[] = [
  {
    term: text("Tuotevaihe", "Product stage", "Produktfas"),
    definition: text(
      "Kertoo tuotteen kypsyydestä: experimental, beta, GA, suunniteltu tai poistettu. Se ei yksin kerro ympäristöä tai kaupallista pääsyä.",
      "States product maturity: Experimental, Beta, GA, Planned, or Retired. It does not by itself define environment or commercial access.",
      "Anger produktens mognad: Experimental, Beta, GA, Planerad eller Avvecklad. Den anger inte ensam miljö eller kommersiell åtkomst.",
    ),
  },
  {
    term: text("Pääsy", "Access", "Åtkomst"),
    definition: text(
      "Kertoo ympäristön sekä vaaditaanko rekisteröinti, maksullinen tilaus ja erillinen hyväksyntä.",
      "States the environment and whether registration, a paid subscription, and separate admission are required.",
      "Anger miljön och om registrering, en betald prenumeration och separat godkännande krävs.",
    ),
  },
  {
    term: text("Pätevöitys", "Qualification", "Kvalificering"),
    definition: text(
      "Rajaa täsmällisesti, mikä ympäristö, pankki, aineisto ja käyttötapa on todennettu.",
      "Defines the exact environment, bank, file type, and use that has been verified.",
      "Avgränsar exakt vilken miljö, bank, filtyp och användning som har verifierats.",
    ),
  },
];

const plannedQualification = {
  label: text("Suunniteltu", "Planned", "Planerad"),
  scope: text(
    "Ei tuotantosaatavuus- tai tukilupausta.",
    "No production availability or support claim.",
    "Inget löfte om produktionstillgänglighet eller stöd.",
  ),
  evidenceDate: "2026-08-20",
  evidenceSource:
    "bankfiles-platform TASKS.md and public website product-launch design",
} as const;

const plannedProduct = (
  id: string,
  name: LocalizedText,
  buyerJob: LocalizedText,
  summary: LocalizedText,
  capability: CatalogCapability,
): HiddenCatalogRecord => ({
  kind: "product",
  id,
  category: text(
    "Yrityksen talouden käyttöjärjestelmä",
    "Company financial operating system",
    "Företagets ekonomiska operativsystem",
  ),
  name,
  buyerJob,
  summary,
  stage: "planned",
  access: [],
  visibility: "none",
  capabilities: [capability],
  qualification: plannedQualification,
  limitations: localizedLists(
    ["Ei julkista tuotesivua tai tuotantosaatavuuslupausta."],
    ["No public product page or production-availability claim."],
    [
      "Ingen offentlig produktsida eller utfästelse om produktionstillgänglighet.",
    ],
  ),
  cta: { label: designPartnerCta, href: contactHref },
  faq: [],
  glossary: statusGlossary,
  aliases: [],
  dependencies: [],
  seo: {
    title: name,
    description: summary,
  },
});

export const catalogRecords: readonly CatalogRecord[] = [
  {
    kind: "product",
    id: "bank-connectivity",
    category: text("Pankkiyhteydet", "Bank Connectivity", "Bankförbindelser"),
    name: text("Pankkiyhteydet", "Bank Connectivity", "Bankförbindelser"),
    buyerJob: text(
      "Siirrä yrityksen pankkiaineistot yhden hallitun rajapinnan kautta.",
      "Move corporate bank files through one managed interface.",
      "Överför företagets bankfiler via ett hanterat gränssnitt.",
    ),
    summary: text(
      "Nykyinen WebServices-palvelu yhdistää ohjelmiston tuettuihin pankkien yritysaineistokanaviin.",
      "The current WebServices service connects software to supported corporate bank-file channels.",
      "Den nuvarande WebServices-tjänsten ansluter programvara till stödda företagsbankkanaler.",
    ),
    stage: "ga",
    access: fileExchangeAccess,
    visibility: "promoted",
    routes: routeSet("web-services"),
    capabilities: [
      {
        direction: "bidirectional",
        label: text("Pankkiaineistot", "Bank files", "Bankfiler"),
        detail: text(
          "Listaa ja lataa pankin tarjoamia aineistoja sekä lähetä valtuutettuja aineistoja asiakkaan pankkisopimuksen rajoissa.",
          "List and download bank-provided files and upload authorized files within the customer's bank agreement.",
          "Lista och hämta filer från banken samt skicka behöriga filer inom kundens bankavtal.",
        ),
      },
      {
        direction: "input",
        label: text("Varmenteet", "Certificates", "Certifikat"),
        detail: text(
          "Rekisteröi ja uusi pankkiyhteyden varmenteita nykyisen rajapinnan kautta.",
          "Enroll and renew bank-connection certificates through the existing API.",
          "Registrera och förnya bankanslutningscertifikat via det befintliga API:t.",
        ),
      },
    ],
    qualification: {
      label: text("Nykyinen palvelu", "Current service", "Nuvarande tjänst"),
      scope: text(
        "Käyttö edellyttää asiakkaan pankkisopimuksia. Tarkka pankki- ja aineistotuki määräytyy sopimuksen ja pätevöidyn profiilin mukaan.",
        "Use requires the customer's bank agreements. Exact bank and file support depends on the agreement and qualified profile.",
        "Användning kräver kundens bankavtal. Exakt bank- och filstöd beror på avtalet och den kvalificerade profilen.",
      ),
      evidenceDate: "2026-08-20",
      evidenceSource:
        "Current WebServices offer and published File Exchange API reference",
    },
    limitations: localizedLists(
      [
        "Palvelu ei korvaa asiakkaan pankkisopimusta tai pankin myöntämää valtuutta.",
        "File Exchange API siirtää aineistot eikä muuta niiden taloudellista sisältöä.",
      ],
      [
        "The service does not replace the customer's bank agreement or bank-granted authority.",
        "The File Exchange API transports files; it does not change their financial content.",
      ],
      [
        "Tjänsten ersätter inte kundens bankavtal eller bankens behörighet.",
        "File Exchange API transporterar filer och ändrar inte deras ekonomiska innehåll.",
      ],
    ),
    cta: {
      label: text("Ota yhteyttä", "Contact us", "Kontakta oss"),
      href: contactHref,
    },
    faq: [
      {
        question: text(
          "Onko REST API oma pankkituote?",
          "Is the REST API a separate banking product?",
          "Är REST API:t en separat bankprodukt?",
        ),
        answer: text(
          "Ei. Se on nykyisen Pankkiyhteydet-tuotteen kehittäjäpinta pankkiaineistojen siirtoon.",
          "No. It is the developer surface of the current Bank Connectivity product for bank-file exchange.",
          "Nej. Det är utvecklarytan för den nuvarande Bankförbindelser-produkten för filutbyte.",
        ),
      },
    ],
    glossary: statusGlossary,
    aliases: ["web-services", "ws-channel", "file-exchange-api"],
    dependencies: [],
    seo: {
      title: text(
        "WS-kanava API suomalaisiin pankkeihin | ISECure",
        "Finnish Bank Web Services API | ISECure",
        "WS-kanal API för finländska banker | ISECure",
      ),
      description: text(
        "WS-kanava yhdistää ohjelmiston tuettuihin suomalaisiin yrityspankkiaineistoihin.",
        "Connect software to supported Finnish corporate bank-file channels.",
        "Anslut programvara till stödda finländska företagsbankkanaler.",
      ),
    },
  },
  {
    kind: "product",
    id: "bank-simulation",
    category: text("Pankkisimulaatio", "Bank Simulation", "Banksimulering"),
    name: text("Pankkisimulaattori", "Bank Simulator", "Banksimulator"),
    buyerJob: text(
      "Testaa koko tiedostopolku ilman oikeaa pankkiyhteyttä.",
      "Test the complete file flow without a real bank connection.",
      "Testa hela filflödet utan en riktig bankanslutning.",
    ),
    summary: text(
      "Tenanttikohtainen testipankki tuottaa synteettiset tiliotteet ja maksupalautteet nykyisen ISECure REST API:n File Exchange -toiminnoilla.",
      "A tenant-specific test bank produces synthetic statements and payment feedback through the existing ISECure REST API File Exchange operations.",
      "En tenantspecifik testbank skapar syntetiska kontoutdrag och betalningsrespons via File Exchange-funktionerna i det befintliga ISECure REST API:t.",
    ),
    stage: "beta",
    access: subscribedTestAccess,
    visibility: "soft-launch",
    routes: routeSet("bank-simulator"),
    capabilities: [
      {
        direction: "output",
        label: text("Alkutiliote", "Initial statement", "Första kontoutdrag"),
        detail: text(
          "Uusi rekisteröinti luo listattavan ja ladattavan camt.053.001.02-aineiston.",
          "Fresh enrollment creates a listable and downloadable camt.053.001.02 file.",
          "En ny registrering skapar en camt.053.001.02-fil som kan listas och hämtas.",
        ),
      },
      {
        direction: "input",
        label: text(
          "Allekirjoitettu maksu",
          "Signed payment",
          "Signerad betalning",
        ),
        detail: text(
          "Hyväksyy paikallisesti allekirjoitetun synteettisen pain.001.001.09-aineiston.",
          "Accepts a locally signed synthetic pain.001.001.09 file.",
          "Tar emot en lokalt signerad syntetisk pain.001.001.09-fil.",
        ),
      },
      {
        direction: "output",
        label: text("Palauteaineistot", "Feedback files", "Responsfiler"),
        detail: text(
          "Tuottaa pain.002.001.10-, camt.054.001.02- ja päivitetyn camt.053.001.02-aineiston.",
          "Produces pain.002.001.10, camt.054.001.02, and an updated camt.053.001.02.",
          "Skapar pain.002.001.10, camt.054.001.02 och en uppdaterad camt.053.001.02.",
        ),
      },
    ],
    qualification: {
      label: text("Testiympäristö", "Test environment", "Testmiljö"),
      scope: text(
        "Vain pankille simulator osoitteessa https://ws-api.test.isecure.fi/v2. Simulaattorievidenssi ei todista oikean pankin toimintaa.",
        "Only for bank simulator at https://ws-api.test.isecure.fi/v2. Simulator evidence does not prove real-bank behavior.",
        "Endast för banken simulator på https://ws-api.test.isecure.fi/v2. Simulatorevidens bevisar inte en riktig banks beteende.",
      ),
      evidenceDate: "2026-08-20",
      evidenceSource:
        "SIMBANK-007 and deployed Bank Simulator end-to-end example",
    },
    limitations: localizedLists(
      [
        "Vain synteettinen testidata.",
        "Ei pankkisopimusta, tuotantokanavaa tai oikeaa maksua.",
      ],
      [
        "Synthetic test data only.",
        "No bank agreement, production channel, or real payment.",
      ],
      [
        "Endast syntetiska testdata.",
        "Inget bankavtal, ingen produktionskanal och ingen riktig betalning.",
      ],
    ),
    cta: {
      label: text(
        "Pyydä pankkisimulaattorin käyttöoikeus",
        "Request Bank Simulator access",
        "Begär åtkomst till Banksimulatorn",
      ),
      href: contactHref,
    },
    faq: [
      {
        question: text(
          "Tarvitaanko erillinen simulaattori-SDK?",
          "Does the simulator need a separate SDK?",
          "Behöver simulatorn ett separat SDK?",
        ),
        answer: text(
          "Ei. Käytä samoja REST-operaatioita ja TypeScript SDK:ta pankkiasetuksella simulator.",
          "No. Use the same REST operations and TypeScript SDK with the bank setting simulator.",
          "Nej. Använd samma REST-operationer och TypeScript SDK med bankinställningen simulator.",
        ),
      },
      {
        question: text(
          "Voivatko asiakkaat nähdä toistensa tiedostot?",
          "Can customers see each other's files?",
          "Kan kunder se varandras filer?",
        ),
        answer: text(
          "Eivät. Simulaattorin yhteys, tiedostoviitteet ja aineistot ovat tenanttikohtaisia.",
          "No. Simulator connections, file references, and files are tenant-specific.",
          "Nej. Simulatoranslutningar, filreferenser och filer är tenantspecifika.",
        ),
      },
    ],
    glossary: statusGlossary,
    aliases: ["simulator"],
    dependencies: ["bank-connectivity"],
    seo: {
      title: text(
        "Pankkisimulaattori testiaineistoille | ISECure",
        "Bank Simulator for test bank files | ISECure",
        "Banksimulator för testfiler | ISECure",
      ),
      description: text(
        "Testaa File Exchange API:n listaus-, lataus- ja allekirjoitettu lähetyspolku synteettisesti.",
        "Test File Exchange API listing, download, and signed upload with synthetic data.",
        "Testa listning, hämtning och signerad uppladdning i File Exchange API med syntetiska data.",
      ),
    },
  },
  {
    kind: "product",
    id: "daily-cash",
    category: text("Päivän kassa", "Daily Cash", "Daglig kassa"),
    name: text("Daily Cash", "Daily Cash", "Daily Cash"),
    buyerJob: text(
      "Näe pankin raportoima kassatilanne, tuoreus ja poikkeukset.",
      "See bank-reported cash, freshness, and exceptions.",
      "Se bankrapporterad kassa, aktualitet och avvikelser.",
    ),
    summary: text(
      dailyCashContent.fi.plain.body,
      dailyCashContent.en.plain.body,
      dailyCashContent.se.plain.body,
    ),
    stage: "planned",
    access: [],
    visibility: "draft",
    routes: routeSet("daily-cash"),
    capabilities: [
      {
        direction: "input",
        label: text("Tiliotteet", "Statements", "Kontoutdrag"),
        detail: text(
          "Valtuutetut ja pätevöidyt camt.053-aineistot.",
          "Authorized and qualified camt.053 files.",
          "Behöriga och kvalificerade camt.053-filer.",
        ),
      },
      {
        direction: "output",
        label: text("Kassanäkymä", "Cash view", "Kassavy"),
        detail: text(
          "Tilikohtaiset saldot, tapahtumat, tuoreus, kattavuus ja evidenssi.",
          "Account-level balances, transactions, freshness, coverage, and evidence.",
          "Saldon, transaktioner, aktualitet, täckning och evidens per konto.",
        ),
      },
    ],
    qualification: {
      label: text(
        dailyCashContent.fi.status.label,
        dailyCashContent.en.status.label,
        dailyCashContent.se.status.label,
      ),
      scope: text(
        dailyCashContent.fi.status.body,
        dailyCashContent.en.status.body,
        dailyCashContent.se.status.body,
      ),
      evidenceDate: "2026-08-20",
      evidenceSource:
        "Bankfiles platform Daily Cash candidate and synthetic preview",
    },
    limitations: localizedLists(
      dailyCashContent.fi.status.excludedItems,
      dailyCashContent.en.status.excludedItems,
      dailyCashContent.se.status.excludedItems,
    ),
    cta: {
      label: text(
        dailyCashContent.fi.status.action,
        dailyCashContent.en.status.action,
        dailyCashContent.se.status.action,
      ),
      href: contactHref,
    },
    faq: dailyCashContent.fi.faq.items.map((_, index) => ({
      question: text(
        dailyCashContent.fi.faq.items[index]?.question ?? "",
        dailyCashContent.en.faq.items[index]?.question ?? "",
        dailyCashContent.se.faq.items[index]?.question ?? "",
      ),
      answer: text(
        dailyCashContent.fi.faq.items[index]?.answer ?? "",
        dailyCashContent.en.faq.items[index]?.answer ?? "",
        dailyCashContent.se.faq.items[index]?.answer ?? "",
      ),
    })),
    glossary: statusGlossary,
    aliases: ["cash-visibility"],
    dependencies: ["bank-connectivity"],
    seo: {
      title: text(
        dailyCashContent.fi.meta.title,
        dailyCashContent.en.meta.title,
        dailyCashContent.se.meta.title,
      ),
      description: text(
        dailyCashContent.fi.meta.description,
        dailyCashContent.en.meta.description,
        dailyCashContent.se.meta.description,
      ),
    },
  },
  {
    kind: "product",
    id: "invoicing",
    category: text("Laskutus", "Invoicing", "Fakturering"),
    name: text("Laskutus", "Invoicing", "Fakturering"),
    buyerJob: text(
      "Näe laskun jokainen vaihe erillisenä ja selitettävänä.",
      "See every invoice stage separately and explainably.",
      "Se varje fakturafas separat och förklarbart.",
    ),
    summary: text(
      invoicingContent.fi.plain.body,
      invoicingContent.en.plain.body,
      invoicingContent.se.plain.body,
    ),
    stage: "planned",
    access: [],
    visibility: "draft",
    routes: routeSet("invoicing"),
    capabilities: [
      {
        direction: "input",
        label: text("Laskuaineisto", "Invoice evidence", "Fakturaevidens"),
        detail: text(
          "Saapuvat ja lähtevät asiakirjat sekä niiden erilliset havainnot.",
          "Incoming and outgoing documents and their separate observations.",
          "Inkommande och utgående dokument och deras separata observationer.",
        ),
      },
      {
        direction: "output",
        label: text("Työnäkymä", "Work view", "Arbetsvy"),
        detail: text(
          "Erilliset validointi-, hyväksyntä-, toimitus-, maksu-, selvitys- ja kirjanpitotilat.",
          "Separate validation, approval, delivery, payment, settlement, and bookkeeping states.",
          "Separata statusar för validering, godkännande, leverans, betalning, avveckling och bokföring.",
        ),
      },
    ],
    qualification: {
      label: text(
        invoicingContent.fi.status.label,
        invoicingContent.en.status.label,
        invoicingContent.se.status.label,
      ),
      scope: text(
        invoicingContent.fi.status.body,
        invoicingContent.en.status.body,
        invoicingContent.se.status.body,
      ),
      evidenceDate: "2026-08-20",
      evidenceSource:
        "Bankfiles platform Invoicing target design and synthetic preview",
    },
    limitations: localizedLists(
      invoicingContent.fi.status.excludedItems,
      invoicingContent.en.status.excludedItems,
      invoicingContent.se.status.excludedItems,
    ),
    cta: {
      label: text(
        invoicingContent.fi.status.action,
        invoicingContent.en.status.action,
        invoicingContent.se.status.action,
      ),
      href: contactHref,
    },
    faq: [
      {
        question: text(
          "Tarkoittaako pätevä laskutiedosto, että lasku on hyväksytty tai maksettu?",
          "Does a valid invoice file mean the invoice is approved or paid?",
          "Betyder en giltig fakturafil att fakturan är godkänd eller betald?",
        ),
        answer: text(
          "Ei. Asiakirjan pätevyys, hyväksyntä, maksu, selvitys ja kirjanpito ovat erillisiä tiloja.",
          "No. Document validity, approval, payment, settlement, and bookkeeping are separate states.",
          "Nej. Dokumentets giltighet, godkännande, betalning, avveckling och bokföring är separata statusar.",
        ),
      },
    ],
    glossary: statusGlossary,
    aliases: [],
    dependencies: [],
    seo: {
      title: text(
        invoicingContent.fi.meta.title,
        invoicingContent.en.meta.title,
        invoicingContent.se.meta.title,
      ),
      description: text(
        invoicingContent.fi.meta.description,
        invoicingContent.en.meta.description,
        invoicingContent.se.meta.description,
      ),
    },
  },
  plannedProduct(
    "analytics-insights",
    text(
      "Analytiikka ja oivallukset",
      "Analytics and Insights",
      "Analys och insikter",
    ),
    text(
      "Ymmärrä muutokset ja mahdollisuudet.",
      "Understand changes and opportunities.",
      "Förstå förändringar och möjligheter.",
    ),
    text(
      "Tavoitemoduuli selitettäville taloushavainnoille ja analyyseille.",
      "Target module for explainable financial observations and analysis.",
      "Målmodul för förklarbara finansiella observationer och analyser.",
    ),
    {
      direction: "output",
      label: text("Oivallukset", "Insights", "Insikter"),
      detail: text(
        "Evidenssiin sidotut havainnot.",
        "Evidence-linked observations.",
        "Evidenslänkade observationer.",
      ),
    },
  ),
  plannedProduct(
    "reconciliation-close",
    text(
      "Täsmäytys ja kauden sulku",
      "Reconciliation and Close",
      "Avstämning och bokslut",
    ),
    text(
      "Selvitä poikkeukset ja todista sulun tila.",
      "Resolve exceptions and prove close status.",
      "Lös avvikelser och visa bokslutsstatus.",
    ),
    text(
      "Tavoitemoduuli evidenssiin sidotulle täsmäytykselle ja kauden sululle.",
      "Target module for evidence-linked reconciliation and close.",
      "Målmodul för evidenslänkad avstämning och bokslut.",
    ),
    {
      direction: "bidirectional",
      label: text("Täsmäytys", "Reconciliation", "Avstämning"),
      detail: text(
        "Ehdokkaat, päätökset ja tulosevidenssi.",
        "Candidates, decisions, and outcome evidence.",
        "Kandidater, beslut och resultatevidens.",
      ),
    },
  ),
  plannedProduct(
    "treasury-essentials",
    text("Treasury Essentials", "Treasury Essentials", "Treasury Essentials"),
    text(
      "Valmistele ja seuraa kassaa ja maksuja.",
      "Prepare and track cash and payments.",
      "Förbered och följ kassa och betalningar.",
    ),
    text(
      "Tavoitemoduuli kassalle, maksuille ja lyhyen aikavälin suunnittelulle.",
      "Target module for cash, payments, and short-horizon planning.",
      "Målmodul för kassa, betalningar och kortsiktig planering.",
    ),
    {
      direction: "bidirectional",
      label: text("Treasury-työ", "Treasury work", "Treasury-arbete"),
      detail: text(
        "Kassa, maksut ja ennusteet erillisinä kyvykkyyksinä.",
        "Cash, payments, and forecasts as separate capabilities.",
        "Kassa, betalningar och prognoser som separata funktioner.",
      ),
    },
  ),
  plannedProduct(
    "financial-attention",
    text("Talouden huomio", "Financial Attention", "Finansiell uppmärksamhet"),
    text(
      "Tuo tärkeät poikkeukset oikealle henkilölle.",
      "Bring important exceptions to the right person.",
      "För viktiga avvikelser till rätt person.",
    ),
    text(
      "Tavoitemoduuli huomion ja työn koordinointiin ilman taloudellista päätösvaltaa.",
      "Target module for coordinating attention and work without financial authority.",
      "Målmodul för att samordna uppmärksamhet och arbete utan finansiell beslutanderätt.",
    ),
    {
      direction: "output",
      label: text("Huomio", "Attention", "Uppmärksamhet"),
      detail: text(
        "Poikkeukset, mahdollisuudet ja vaadittu työ.",
        "Exceptions, opportunities, and required work.",
        "Avvikelser, möjligheter och nödvändigt arbete.",
      ),
    },
  ),
  plannedProduct(
    "obligations-compliance",
    text(
      "Velvoitteet ja compliance",
      "Obligations and Compliance",
      "Skyldigheter och compliance",
    ),
    text(
      "Seuraa vaadittua työtä ja sen evidenssiä.",
      "Track required work and its evidence.",
      "Följ obligatoriskt arbete och dess evidens.",
    ),
    text(
      "Tavoitemoduuli taloudellisten ja yritysvelvoitteiden kontekstiin, ei laki- tai veroneuvontaan.",
      "Target module for financial and corporate obligation context, not legal or tax advice.",
      "Målmodul för finansiella och bolagsrelaterade skyldigheter, inte juridisk eller skatterådgivning.",
    ),
    {
      direction: "output",
      label: text(
        "Velvoitekonteksti",
        "Obligation context",
        "Skyldighetskontext",
      ),
      detail: text(
        "Lähteistetty soveltuvuus ja vaadittu työ.",
        "Sourced applicability and required work.",
        "Källbelagd tillämplighet och nödvändigt arbete.",
      ),
    },
  ),
  plannedProduct(
    "governed-ai",
    text("Hallittu AI", "Governed AI", "Styrd AI"),
    text(
      "Anna agentin ehdottaa työtä ilman avointa päätösvaltaa.",
      "Let an agent propose work without open-ended authority.",
      "Låt en agent föreslå arbete utan obegränsad behörighet.",
    ),
    text(
      "Tavoitemoduuli rajatuille agenteille, evaluoinnille ja todennettaville tuloksille.",
      "Target module for bounded agents, evaluation, and verifiable outcomes.",
      "Målmodul för avgränsade agenter, utvärdering och verifierbara resultat.",
    ),
    {
      direction: "bidirectional",
      label: text("Hallittu ehdotus", "Governed proposal", "Styrt förslag"),
      detail: text(
        "Agentti ehdottaa; säännöt, valtuus ja ihminen hallitsevat vaikutusta.",
        "The agent proposes; rules, authority, and people govern effects.",
        "Agenten föreslår; regler, behörighet och människor styr effekter.",
      ),
    },
  ),
  {
    kind: "integration",
    id: "nordea",
    category: text("Pankki-integraatio", "Bank integration", "Bankintegration"),
    name: text("Nordea", "Nordea", "Nordea"),
    buyerJob: text(
      "Yhdistä ohjelmisto Nordean yritysaineistokanavaan.",
      "Connect software to Nordea's corporate bank-file channel.",
      "Anslut programvara till Nordeas företagsbankkanal.",
    ),
    summary: text(
      "Nykyinen WebServices-yhteys Nordean kanssa sovittuihin yritysaineistoihin.",
      "Current WebServices connection for corporate files agreed with Nordea.",
      "Nuvarande WebServices-anslutning för företagsfiler som avtalats med Nordea.",
    ),
    stage: "ga",
    access: subscribedProductionAccess,
    visibility: "promoted",
    routes: routeSet("nordea"),
    capabilities: [
      {
        direction: "bidirectional",
        label: text("Yritysaineistot", "Corporate files", "Företagsfiler"),
        detail: text(
          "Nouto ja lähetys asiakkaan Nordea-sopimuksen ja palvelujen rajoissa.",
          "Download and upload within the customer's Nordea agreement and enabled services.",
          "Hämtning och uppladdning inom kundens Nordea-avtal och aktiverade tjänster.",
        ),
      },
    ],
    qualification: {
      label: text(
        "Nykyinen yhteys",
        "Current connection",
        "Nuvarande anslutning",
      ),
      scope: text(
        "Asiakas tarvitsee Nordean Web Services -sopimuksen ja siihen kuuluvat aineistopalvelut.",
        "The customer needs a Nordea Web Services agreement and the relevant file services.",
        "Kunden behöver ett Nordea Web Services-avtal och relevanta filtjänster.",
      ),
      evidenceDate: "2026-08-20",
      evidenceSource: "Current public Nordea WebServices offer",
    },
    limitations: localizedLists(
      [
        "Sivun yleiskuvaus ei ole kaikkien Nordea-profiilien tai aineistojen pätevöitys.",
      ],
      [
        "The page overview is not qualification of every Nordea profile or file type.",
      ],
      [
        "Sidans översikt är inte en kvalificering av alla Nordea-profiler eller filtyper.",
      ],
    ),
    cta: {
      label: text("Ota yhteyttä", "Contact us", "Kontakta oss"),
      href: contactHref,
    },
    faq: [],
    glossary: statusGlossary,
    aliases: [],
    dependencies: ["bank-connectivity"],
    seo: {
      title: text(
        "Nordea-pankkiyhteys",
        "Nordea bank connectivity",
        "Nordea-bankförbindelse",
      ),
      description: text(
        "Nordean yritysaineistot ISECuren kautta.",
        "Nordea corporate files through ISECure.",
        "Nordeas företagsfiler via ISECure.",
      ),
    },
  },
  {
    kind: "integration",
    id: "op",
    category: text("Pankki-integraatio", "Bank integration", "Bankintegration"),
    name: text("OP", "OP", "OP"),
    buyerJob: text(
      "Yhdistä ohjelmisto OP:n yritysaineistokanavaan.",
      "Connect software to OP's corporate bank-file channel.",
      "Anslut programvara till OP:s företagsbankkanal.",
    ),
    summary: text(
      "Nykyinen WebServices-yhteys OP:n kanssa sovittuihin yritysaineistoihin.",
      "Current WebServices connection for corporate files agreed with OP.",
      "Nuvarande WebServices-anslutning för företagsfiler som avtalats med OP.",
    ),
    stage: "ga",
    access: subscribedProductionAccess,
    visibility: "promoted",
    routes: routeSet("op"),
    capabilities: [
      {
        direction: "bidirectional",
        label: text("Yritysaineistot", "Corporate files", "Företagsfiler"),
        detail: text(
          "Nouto ja lähetys asiakkaan OP-sopimuksen ja palvelujen rajoissa.",
          "Download and upload within the customer's OP agreement and enabled services.",
          "Hämtning och uppladdning inom kundens OP-avtal och aktiverade tjänster.",
        ),
      },
    ],
    qualification: {
      label: text(
        "Nykyinen yhteys",
        "Current connection",
        "Nuvarande anslutning",
      ),
      scope: text(
        "Asiakas tarvitsee OP:n Web Services -sopimuksen ja siihen kuuluvat aineistopalvelut.",
        "The customer needs an OP Web Services agreement and the relevant file services.",
        "Kunden behöver ett OP Web Services-avtal och relevanta filtjänster.",
      ),
      evidenceDate: "2026-08-20",
      evidenceSource: "Current public OP WebServices offer",
    },
    limitations: localizedLists(
      [
        "Sivun yleiskuvaus ei ole kaikkien OP-profiilien tai aineistojen pätevöitys.",
      ],
      [
        "The page overview is not qualification of every OP profile or file type.",
      ],
      [
        "Sidans översikt är inte en kvalificering av alla OP-profiler eller filtyper.",
      ],
    ),
    cta: {
      label: text("Ota yhteyttä", "Contact us", "Kontakta oss"),
      href: contactHref,
    },
    faq: [],
    glossary: statusGlossary,
    aliases: [],
    dependencies: ["bank-connectivity"],
    seo: {
      title: text(
        "OP-pankkiyhteys",
        "OP bank connectivity",
        "OP-bankförbindelse",
      ),
      description: text(
        "OP:n yritysaineistot ISECuren kautta.",
        "OP corporate files through ISECure.",
        "OP:s företagsfiler via ISECure.",
      ),
    },
  },
];

export const developerSurfaces = [
  {
    id: "file-exchange-api",
    kind: "api",
    productId: "bank-connectivity",
    name: text(
      "ISECure REST API — File Exchange",
      "ISECure REST API — File Exchange",
      "ISECure REST API — File Exchange",
    ),
    summary: text(
      "Tuotannossa oleva ISECure REST API. File Exchange on sen pysyvä listaus-, lataus- ja lähetysraja.",
      "The production ISECure REST API. File Exchange is its permanent list, download, and upload boundary.",
      "ISECure REST API i produktion. File Exchange är dess permanenta gräns för listning, hämtning och uppladdning.",
    ),
    stage: "ga",
    access: fileExchangeAccess,
    visibility: "promoted",
    routes: text("/wsapi_v2/", "/wsapi_v2/", "/wsapi_v2/"),
    seo: {
      title: text(
        "ISECure REST API — File Exchange",
        "ISECure REST API — File Exchange",
        "ISECure REST API — File Exchange",
      ),
      description: text(
        "Tuotannon rajapinta pankkivarmenteille sekä tiedostojen listaukseen, lataukseen ja lähetykseen.",
        "Production API for bank certificates and file listing, download, and upload.",
        "Produktions-API för bankcertifikat samt listning, hämtning och uppladdning av filer.",
      ),
    },
  },
  {
    id: "processing-api",
    kind: "api",
    productId: "treasury-essentials",
    name: text("Processing API", "Processing API", "Processing API"),
    summary: text(
      "Erillinen experimental-vaiheen rajapinta maksuerän luontiin, validointiin, hyväksyntään sekä tarkan pain.001-aineiston muodostamiseen ja lataamiseen.",
      "A separate Experimental API for creating, validating, and approving payment batches and generating and downloading exact pain.001 files.",
      "Ett separat API i Experimental-fasen för att skapa, validera och godkänna betalningsbatcher samt generera och hämta exakta pain.001-filer.",
    ),
    stage: "experimental",
    access: subscribedTestAccess,
    visibility: "soft-launch",
    routes: routeSet("processing-api"),
    seo: {
      title: text(
        "Processing API pain.001-maksuaineistojen luontiin | ISECure",
        "Processing API for pain.001 payment generation | ISECure",
        "Processing API för generering av pain.001-betalningar | ISECure",
      ),
      description: text(
        "Experimental-vaiheessa oleva erillinen rajapinta maksuerän validointiin, hyväksyntään sekä tarkan pain.001.001.09-aineiston lataamiseen.",
        "Separate Experimental API for validating and approving a payment batch and downloading exact pain.001.001.09.",
        "Separat API i Experimental-fasen för att validera och godkänna en betalningsbatch och hämta exakt pain.001.001.09.",
      ),
    },
  },
] as const satisfies readonly DeveloperSurface[];

export function getDeveloperSurface(id: string): DeveloperSurface {
  const surface = developerSurfaces.find((candidate) => candidate.id === id);
  if (!surface) throw new Error(`Unknown developer surface: ${id}`);
  return surface;
}

export const catalogUi = {
  fi: {
    products: "Tuotteet",
    experimental: "Experimental",
    beta: "Beta",
    ga: "GA",
    planned: "Suunniteltu",
    retired: "Poistettu",
    access: "Pääsy",
    testEnvironment: "Testiympäristö",
    productionEnvironment: "Tuotanto",
    registrationRequired: "Rekisteröinti vaaditaan",
    registrationNotRequired: "Ei rekisteröintiä",
    subscriptionRequired: "Maksullinen tilaus vaaditaan",
    subscriptionNotRequired: "Tilausta ei vaadita",
    selfService: "Avoin rekisteröinti",
    normalOnboarding: "Normaali käyttöönotto",
    requestAccess: "Pyydä käyttöoikeus",
    inviteOnly: "Vain kutsusta",
    unavailable: "Ei saatavilla",
    noAccess: "Ei asiakaskäyttöä",
    qualification: "Tarkka tila ja rajaus",
    capabilities: "Kyvykkyydet ja suunta",
    direction: "Suunta",
    capability: "Kyvykkyys",
    limitation: "Rajaukset",
    faq: "Usein kysyttyä",
    glossary: "Sanasto",
    inputs: "Sisään",
    outputs: "Ulos",
    bidirectional: "Molempiin suuntiin",
    catalogEntries: "Tuotteet",
  },
  en: {
    products: "Products",
    experimental: "Experimental",
    beta: "Beta",
    ga: "GA",
    planned: "Planned",
    retired: "Retired",
    access: "Access",
    testEnvironment: "Test environment",
    productionEnvironment: "Production",
    registrationRequired: "Registration required",
    registrationNotRequired: "No registration required",
    subscriptionRequired: "Paid subscription required",
    subscriptionNotRequired: "No subscription required",
    selfService: "Open registration",
    normalOnboarding: "Standard onboarding",
    requestAccess: "Request access",
    inviteOnly: "Invitation only",
    unavailable: "Unavailable",
    noAccess: "No customer access",
    qualification: "Exact status and scope",
    capabilities: "Capabilities and direction",
    direction: "Direction",
    capability: "Capability",
    limitation: "Limitations",
    faq: "Frequently asked questions",
    glossary: "Glossary",
    inputs: "Input",
    outputs: "Output",
    bidirectional: "Both directions",
    catalogEntries: "Products",
  },
  se: {
    products: "Produkter",
    experimental: "Experimental",
    beta: "Beta",
    ga: "GA",
    planned: "Planerad",
    retired: "Avvecklad",
    access: "Åtkomst",
    testEnvironment: "Testmiljö",
    productionEnvironment: "Produktion",
    registrationRequired: "Registrering krävs",
    registrationNotRequired: "Ingen registrering krävs",
    subscriptionRequired: "Betald prenumeration krävs",
    subscriptionNotRequired: "Ingen prenumeration krävs",
    selfService: "Öppen registrering",
    normalOnboarding: "Normal onboarding",
    requestAccess: "Begär åtkomst",
    inviteOnly: "Endast på inbjudan",
    unavailable: "Inte tillgänglig",
    noAccess: "Ingen kundåtkomst",
    qualification: "Exakt status och omfattning",
    capabilities: "Funktioner och riktning",
    direction: "Riktning",
    capability: "Funktion",
    limitation: "Avgränsningar",
    faq: "Vanliga frågor",
    glossary: "Ordlista",
    inputs: "In",
    outputs: "Ut",
    bidirectional: "Båda riktningarna",
    catalogEntries: "Produkter",
  },
} as const;

function validateAccess(
  id: string,
  stage: CatalogStage,
  offers: readonly CatalogAccessOffer[],
): void {
  if ((stage === "planned" || stage === "retired") && offers.length > 0) {
    throw new Error(`${stage} catalog entry cannot grant access: ${id}`);
  }
  if (stage !== "planned" && stage !== "retired" && offers.length === 0) {
    throw new Error(`Active catalog entry requires an access offer: ${id}`);
  }
  const environments = new Set<CatalogEnvironment>();
  for (const offer of offers) {
    if (environments.has(offer.environment)) {
      throw new Error(`Duplicate ${offer.environment} access offer: ${id}`);
    }
    environments.add(offer.environment);
    if (
      offer.subscription === "required" &&
      offer.registration !== "required"
    ) {
      throw new Error(`Subscription access requires registration: ${id}`);
    }
    if (stage === "experimental" && offer.environment === "production") {
      throw new Error(
        `Experimental entry cannot claim production access: ${id}`,
      );
    }
  }
}

const recordById = new Map<string, CatalogRecord>();
const routedPaths = new Set<string>();
for (const record of catalogRecords) {
  if (recordById.has(record.id)) {
    throw new Error(`Duplicate catalog record: ${record.id}`);
  }
  recordById.set(record.id, record);
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(record.qualification.evidenceDate)) {
    throw new Error(`Invalid catalog evidence date: ${record.id}`);
  }
  validateAccess(record.id, record.stage, record.access);
  if (record.visibility === "none") continue;
  if (record.visibility !== "draft" && record.stage === "planned") {
    throw new Error(`Planned catalog record cannot be public: ${record.id}`);
  }
  for (const lang of ["fi", "en", "se"] as const) {
    const route = record.routes[lang];
    if (!route.startsWith("/") || !route.endsWith("/")) {
      throw new Error(
        `Catalog route must use leading and trailing slashes: ${record.id}`,
      );
    }
    if (routedPaths.has(route)) {
      throw new Error(`Duplicate catalog route: ${route}`);
    }
    routedPaths.add(route);
  }
}

for (const record of catalogRecords) {
  for (const dependency of record.dependencies) {
    if (!recordById.has(dependency)) {
      throw new Error(
        `Unknown catalog dependency ${dependency} for ${record.id}`,
      );
    }
  }
}

const developerSurfaceIds = new Set<string>();
const developerRouteOwners = new Map<string, string>();
for (const surface of developerSurfaces) {
  if (recordById.has(surface.id) || developerSurfaceIds.has(surface.id)) {
    throw new Error(`Duplicate developer surface: ${surface.id}`);
  }
  developerSurfaceIds.add(surface.id);
  validateAccess(surface.id, surface.stage, surface.access);
  const product = recordById.get(surface.productId);
  if (!product || product.kind !== "product") {
    throw new Error(
      `Unknown product ${surface.productId} for developer surface ${surface.id}`,
    );
  }
  for (const lang of ["fi", "en", "se"] as const) {
    const route = surface.routes[lang];
    if (!route.startsWith("/") || !route.endsWith("/")) {
      throw new Error(
        `Developer route must use leading and trailing slashes: ${surface.id}`,
      );
    }
    const owner = developerRouteOwners.get(route);
    if (owner && owner !== surface.id) {
      throw new Error(`Duplicate developer route: ${route}`);
    }
    developerRouteOwners.set(route, surface.id);
  }
}

export function getCatalogRecord(id: string): CatalogRecord {
  const record = recordById.get(id);
  if (!record) throw new Error(`Unknown catalog record: ${id}`);
  return record;
}

export function getPublicProductRecords(): readonly RoutedCatalogRecord[] {
  return catalogRecords.filter(
    (record): record is RoutedCatalogRecord =>
      record.kind === "product" &&
      (record.visibility === "soft-launch" || record.visibility === "promoted"),
  );
}

export function getDraftCatalogPaths(): readonly string[] {
  return catalogRecords.flatMap((record) =>
    record.visibility === "draft" ? Object.values(record.routes) : [],
  );
}

export function stageLabel(stage: CatalogStage, lang: Lang): string {
  const ui = catalogUi[lang];
  return {
    experimental: ui.experimental,
    beta: ui.beta,
    ga: ui.ga,
    planned: ui.planned,
    retired: ui.retired,
  }[stage];
}

export function accessOfferLabels(
  offer: CatalogAccessOffer,
  lang: Lang,
): readonly string[] {
  const ui = catalogUi[lang];
  return [
    offer.environment === "test"
      ? ui.testEnvironment
      : ui.productionEnvironment,
    offer.registration === "required"
      ? ui.registrationRequired
      : ui.registrationNotRequired,
    offer.subscription === "required"
      ? ui.subscriptionRequired
      : ui.subscriptionNotRequired,
    {
      "self-service": ui.selfService,
      "normal-onboarding": ui.normalOnboarding,
      "request-access": ui.requestAccess,
      "invite-only": ui.inviteOnly,
      unavailable: ui.unavailable,
    }[offer.admission],
  ];
}

export function directionLabel(
  direction: CatalogDirection,
  lang: Lang,
): string {
  const ui = catalogUi[lang];
  return {
    input: ui.inputs,
    output: ui.outputs,
    bidirectional: ui.bidirectional,
  }[direction];
}
