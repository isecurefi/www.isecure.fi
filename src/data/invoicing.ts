import type { Lang } from "../types";

export interface InvoicingContent {
  readonly meta: { readonly title: string; readonly description: string };
  readonly previewLabel: string;
  readonly hero: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly action: string;
    readonly qualifier: string;
  };
  readonly plain: {
    readonly eyebrow: string;
    readonly title: string;
    readonly body: string;
  };
  readonly profiles: {
    readonly eyebrow: string;
    readonly title: string;
    readonly items: ReadonlyArray<{
      readonly title: string;
      readonly body: string;
    }>;
  };
  readonly lifecycle: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly stages: readonly string[];
  };
  readonly status: {
    readonly label: string;
    readonly title: string;
    readonly body: string;
    readonly included: string;
    readonly includedItems: readonly string[];
    readonly excluded: string;
    readonly excludedItems: readonly string[];
    readonly action: string;
  };
  readonly mock: {
    readonly label: string;
    readonly synthetic: string;
    readonly previewState: string;
    readonly incoming: string;
    readonly outgoing: string;
    readonly due: string;
    readonly draft: string;
    readonly settled: string;
    readonly invoice: string;
    readonly counterparty: string;
    readonly amount: string;
    readonly state: string;
    readonly boundary: string;
  };
}

export const invoicingContent: Readonly<Record<Lang, InvoicingContent>> = {
  fi: {
    meta: {
      title:
        "Laskutus – laskut ja niiden todellinen tila yhdessä näkymässä | ISECure",
      description:
        "ISECuren Laskutus kokoaa saapuvat ja lähtevät laskut, luonnokset, eräpäivät, toimituksen, maksun valmistelun ja täsmäytyksen ymmärrettäväksi työnäkymäksi. Piilotettu tuotekehityksen esikatselu.",
    },
    previewLabel:
      "Piilotettu tuotekehityksen esikatselu · ei tuotantosaatavuuslupaus",
    hero: {
      eyebrow: "Laskutus · talouden käyttöjärjestelmän moduuli",
      title:
        "Tiedä missä jokainen lasku oikeasti on — ja mitä tapahtuu seuraavaksi",
      lead: "Yksi selkeä työnäkymä saapuviin ja lähteviin laskuihin, luonnoksiin, eräpäiviin, toimitukseen, maksun valmisteluun ja täsmäytykseen. Jokainen vaihe pysyy erillisenä ja selitettävänä.",
      action: "Katso suunniteltu työnkulku",
      qualifier:
        "Synteettinen esikatselu. Vastaanottoa, lähetystä, maksamista tai kirjanpitoa ei vielä väitetä tuotanto-ominaisuuksiksi.",
    },
    plain: {
      eyebrow: "Selkokielellä",
      title:
        "Lasku ei ole valmis vain siksi, että tiedosto on teknisesti pätevä",
      body: "ISECure näyttää asiakirjan tarkistuksen, liiketoiminnan katselmoinnin, laskun hyväksynnän, toimituksen, maksun valmistelun, maksuhyväksynnän, maksun toimeenpanon, pankin tuloksen, selvityksen, täsmäytyksen ja kirjanpidon omina tosiasioinaan. Näin käyttäjä näkee puuttuvan vaiheen ilman harhaanjohtavaa vihreää kokonaistilaa.",
    },
    profiles: {
      eyebrow: "Yksi työjono, monta näkymää",
      title: "Työskentele tilanteen mukaan menettämättä lähdeyhteyttä",
      items: [
        {
          title: "Saapuvat",
          body: "Toimittajalaskut, niiden tarkistus, katselmointi ja maksun valmistelu.",
        },
        {
          title: "Lähtevät",
          body: "Asiakaslaskut, luonnokset, toimitushavainnot ja hylkäykset.",
        },
        {
          title: "Erääntyvät",
          body: "Nimenomaisesti luokitellut erääntyvät ja myöhästyneet tilanteet — ei pelkkä päivämääräarvaus.",
        },
        {
          title: "Hyvityslaskut",
          body: "Hyvitykset säilyvät omina asiakirjoinaan ja suhteinaan.",
        },
        {
          title: "Maksun valmistelu",
          body: "Valmistelu sidotaan tarkkaan laskuversioon, maksunsaajaan ja saajan tiliin.",
        },
        {
          title: "Selvitys ja täsmäytys",
          body: "Pankki-, selvitys-, täsmäytys- ja kirjanpitohavainnot näkyvät toisistaan erillään.",
        },
      ],
    },
    lifecycle: {
      eyebrow: "Ei oikopolkuja",
      title: "Yksi näkymä, erilliset vastuut ja todisteet",
      lead: "Myöhempi vaihe ei todista aikaisempaa eikä hyväksyntä anna automaattisesti toimeenpanovaltaa.",
      stages: [
        "Asiakirja",
        "Tarkistus",
        "Liiketoiminnan katselmointi",
        "Laskun hyväksyntä",
        "Toimitus",
        "Maksun valmistelu",
        "Maksuhyväksyntä",
        "Maksun toimeenpano",
        "Pankin tulos",
        "Selvitys",
        "Täsmäytys",
        "Kirjanpito",
      ],
    },
    status: {
      label: "Kehitysvaihe",
      title: "Käyttökokemus ja sopimukset rakennetaan ennen tuotantolupausta",
      body: "Tämä piilotettu sivu kuvaa tavoitellun tuotteen. Ensimmäinen toteutus käyttää generoituja sopimuksia ja determinististä synteettistä dataa. Jokainen ulkoinen reitti pätevöitetään itsenäisesti ennen julkaisua.",
      included: "Esikatselussa",
      includedItems: [
        "Generoitu API-paketin esikatselusopimus — ei käyttöönotettua API:a",
        "Muokattavat työjononäkymät",
        "Neljän tason porautuminen",
        "Erilliset elinkaaritilat ja evidenssi",
      ],
      excluded: "Ei vielä tuotantoväitettä",
      excludedItems: [
        "Verkkolaskujen vastaanotto tai lähetys",
        "Lasku- tai maksuhyväksyntä",
        "Maksun toimeenpano tai pankin lopputulos",
        "Automaattinen kirjanpito, vero- tai ammattipäätelmä",
      ],
      action: "Keskustele design-kumppanuudesta",
    },
    mock: {
      label: "Laskut",
      synthetic: "Synteettinen esimerkki",
      previewState: "Esikatselu",
      incoming: "Saapuvat",
      outgoing: "Lähtevät",
      due: "Erääntyvät",
      draft: "Luonnos",
      settled: "Selvitetty",
      invoice: "Lasku",
      counterparty: "Vastapuoli",
      amount: "Summa",
      state: "Havaittu tila",
      boundary: "Asiakirja ≠ hyväksyntä ≠ maksu ≠ selvitys ≠ kirjanpito",
    },
  },
  en: {
    meta: {
      title:
        "Invoicing – every invoice and its real status in one view | ISECure",
      description:
        "ISECure Invoicing brings incoming and outgoing invoices, drafts, due work, delivery, payment preparation, and reconciliation into one understandable workbench. Unlisted product-development preview.",
    },
    previewLabel:
      "Unlisted product-development preview · not a production-availability claim",
    hero: {
      eyebrow: "Invoicing · financial operating-system module",
      title: "Know where every invoice really stands — and what happens next",
      lead: "One readable workbench for incoming and outgoing invoices, drafts, due work, delivery, payment preparation, and reconciliation. Every stage remains separate and explainable.",
      action: "See the planned workflow",
      qualifier:
        "Synthetic preview. Receiving, sending, paying, and bookkeeping are not yet claimed as production capabilities.",
    },
    plain: {
      eyebrow: "In plain English",
      title:
        "An invoice is not finished just because its file is technically valid",
      body: "ISECure shows document validation, business review, invoice approval, delivery, payment preparation, payment approval, payment execution, bank outcome, settlement, reconciliation, and bookkeeping as separate facts. Users can see the missing step instead of trusting one misleading green status.",
    },
    profiles: {
      eyebrow: "One worklist, many views",
      title: "Work by situation without losing the source",
      items: [
        {
          title: "Incoming",
          body: "Supplier invoices, validation, review, and payment preparation.",
        },
        {
          title: "Outgoing",
          body: "Customer invoices, drafts, delivery observations, and rejections.",
        },
        {
          title: "Due work",
          body: "Explicitly classified due and overdue situations—not a date-only guess.",
        },
        {
          title: "Credit notes",
          body: "Credits remain distinct documents with explicit relationships.",
        },
        {
          title: "Payment preparation",
          body: "Preparation binds the exact invoice revision, payee, and beneficiary account.",
        },
        {
          title: "Settlement & reconciliation",
          body: "Bank, settlement, reconciliation, and bookkeeping observations remain independent.",
        },
      ],
    },
    lifecycle: {
      eyebrow: "No shortcuts",
      title: "One view, separate responsibilities and evidence",
      lead: "A later stage does not prove an earlier one, and an approval does not silently grant execution authority.",
      stages: [
        "Document",
        "Validation",
        "Business review",
        "Invoice approval",
        "Delivery",
        "Payment preparation",
        "Payment approval",
        "Payment execution",
        "Bank outcome",
        "Settlement",
        "Reconciliation",
        "Bookkeeping",
      ],
    },
    status: {
      label: "Development status",
      title: "The experience and contracts come before the production promise",
      body: "This hidden page describes the intended product. The first implementation uses generated contracts and deterministic synthetic data. Every external route is qualified independently before release.",
      included: "In the preview",
      includedItems: [
        "Generated API-pack preview contract — not a deployed API",
        "Configurable worklist views",
        "Four-level progressive drill-down",
        "Separate lifecycle states and evidence",
      ],
      excluded: "Not yet a production claim",
      excludedItems: [
        "E-invoice receive or send",
        "Invoice or payment approval",
        "Payment execution or final bank outcome",
        "Automatic bookkeeping, tax, or professional conclusions",
      ],
      action: "Discuss a design partnership",
    },
    mock: {
      label: "Invoices",
      synthetic: "Synthetic example",
      previewState: "Preview",
      incoming: "Incoming",
      outgoing: "Outgoing",
      due: "Due",
      draft: "Draft",
      settled: "Settled",
      invoice: "Invoice",
      counterparty: "Counterparty",
      amount: "Amount",
      state: "Observed state",
      boundary: "Document ≠ approval ≠ payment ≠ settlement ≠ bookkeeping",
    },
  },
  se: {
    meta: {
      title: "Fakturering – varje faktura och dess verkliga status | ISECure",
      description:
        "ISECure Fakturering samlar inkommande och utgående fakturor, utkast, förfall, leverans, betalningsförberedelse och avstämning i en tydlig arbetsvy. Olistad produktutvecklingsförhandsvisning.",
    },
    previewLabel:
      "Olistad produktutvecklingsförhandsvisning · inget löfte om produktionstillgänglighet",
    hero: {
      eyebrow: "Fakturering · modul i det finansiella operativsystemet",
      title:
        "Se var varje faktura verkligen befinner sig — och vad som händer härnäst",
      lead: "En lättläst arbetsvy för inkommande och utgående fakturor, utkast, förfall, leverans, betalningsförberedelse och avstämning. Varje steg förblir separat och förklarbart.",
      action: "Se det planerade arbetsflödet",
      qualifier:
        "Syntetisk förhandsvisning. Mottagning, sändning, betalning och bokföring påstås ännu inte vara produktionsfunktioner.",
    },
    plain: {
      eyebrow: "På vanlig svenska",
      title: "En faktura är inte färdig bara för att filen är tekniskt giltig",
      body: "ISECure visar dokumentvalidering, affärsgranskning, fakturagodkännande, leverans, betalningsförberedelse, betalningsgodkännande, betalningsutförande, bankutfall, avveckling, avstämning och bokföring som separata fakta. Då syns det saknade steget utan en missvisande grön totalstatus.",
    },
    profiles: {
      eyebrow: "En arbetslista, många vyer",
      title: "Arbeta efter situation utan att tappa källan",
      items: [
        {
          title: "Inkommande",
          body: "Leverantörsfakturor, validering, granskning och betalningsförberedelse.",
        },
        {
          title: "Utgående",
          body: "Kundfakturor, utkast, leveransobservationer och avvisningar.",
        },
        {
          title: "Förfall",
          body: "Uttryckligen klassificerade förfallna och sena situationer—inte en gissning från datumet.",
        },
        {
          title: "Kreditnotor",
          body: "Krediter förblir separata dokument med uttryckliga relationer.",
        },
        {
          title: "Betalningsförberedelse",
          body: "Förberedelsen binds till exakt fakturaversion, betalningsmottagare och konto.",
        },
        {
          title: "Avveckling och avstämning",
          body: "Bank-, avvecklings-, avstämnings- och bokföringsobservationer förblir oberoende.",
        },
      ],
    },
    lifecycle: {
      eyebrow: "Inga genvägar",
      title: "En vy, separata ansvar och bevis",
      lead: "Ett senare steg bevisar inte ett tidigare, och ett godkännande ger inte tyst behörighet att verkställa.",
      stages: [
        "Dokument",
        "Validering",
        "Affärsgranskning",
        "Fakturagodkännande",
        "Leverans",
        "Betalningsförberedelse",
        "Betalningsgodkännande",
        "Betalningsutförande",
        "Bankutfall",
        "Avveckling",
        "Avstämning",
        "Bokföring",
      ],
    },
    status: {
      label: "Utvecklingsstatus",
      title: "Upplevelsen och avtalen kommer före produktionslöftet",
      body: "Den här dolda sidan beskriver den avsedda produkten. Den första implementationen använder genererade avtal och deterministiska syntetiska data. Varje extern rutt kvalificeras separat före lansering.",
      included: "I förhandsvisningen",
      includedItems: [
        "Genererat förhandsavtal för API-paketet — inget driftsatt API",
        "Konfigurerbara arbetslistor",
        "Fyra nivåers progressiv detaljvy",
        "Separata livscykelstatusar och bevis",
      ],
      excluded: "Ännu inget produktionspåstående",
      excludedItems: [
        "Mottagning eller sändning av e-faktura",
        "Faktura- eller betalningsgodkännande",
        "Betalningsverkställighet eller slutligt bankutfall",
        "Automatisk bokföring, skatte- eller yrkesslutsats",
      ],
      action: "Diskutera ett designsamarbete",
    },
    mock: {
      label: "Fakturor",
      synthetic: "Syntetiskt exempel",
      previewState: "Förhandsvisning",
      incoming: "Inkommande",
      outgoing: "Utgående",
      due: "Förfall",
      draft: "Utkast",
      settled: "Avvecklad",
      invoice: "Faktura",
      counterparty: "Motpart",
      amount: "Belopp",
      state: "Observerad status",
      boundary: "Dokument ≠ godkännande ≠ betalning ≠ avveckling ≠ bokföring",
    },
  },
};
