import type { Lang } from "../types";

export interface DailyCashContent {
  meta: { title: string; description: string };
  previewLabel: string;
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    primaryAction: string;
    secondaryAction: string;
    qualifier: string;
  };
  plain: { eyebrow: string; title: string; body: string };
  value: {
    eyebrow: string;
    title: string;
    items: ReadonlyArray<{ title: string; body: string }>;
  };
  how: {
    eyebrow: string;
    title: string;
    steps: ReadonlyArray<{ number: string; title: string; body: string }>;
  };
  essentials: {
    eyebrow: string;
    title: string;
    lead: string;
    rows: ReadonlyArray<{ capability: string; answer: string }>;
  };
  trust: {
    eyebrow: string;
    title: string;
    items: ReadonlyArray<{ title: string; body: string }>;
  };
  status: {
    label: string;
    title: string;
    body: string;
    included: string;
    includedItems: readonly string[];
    excluded: string;
    excludedItems: readonly string[];
    action: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: ReadonlyArray<{ question: string; answer: string }>;
  };
  dashboard: {
    label: string;
    title: string;
    synthetic: string;
    asOf: string;
    coverage: string;
    coverageDetail: string;
    entity: string;
    accounts: string;
    accountLabels: readonly [string, string, string];
    fresh: string;
    stale: string;
    activity: string;
    activityRows: ReadonlyArray<{
      label: string;
      detail: string;
      amount: string;
      direction: "in" | "out";
    }>;
    evidence: string;
  };
}

export const dailyCashContent = {
  fi: {
    meta: {
      title: "Daily Cash – päivän kassatilanne ja pankkidatan tila | ISECure",
      description:
        "Daily Cash kokoaa pätevöidyt camt.053-tiliotteet selkeäksi kassatilanne-, tuoreus- ja tapahtumanäkymäksi. Tuotekehityksen esikatselu, ei tuotantosaatavuuslupaus.",
    },
    previewLabel: "Yksityinen tuote-esikatselu · ei vielä julkisessa myynnissä",
    hero: {
      eyebrow: "Daily Cash · kevyt treasury-näkymä",
      title: "Tiedä päivän kassatilanne — ja mikä vaatii huomiota",
      lead: "Yksi helppolukuinen näkymä konsernin ja yhtiöiden pankin raportoimiin saldoihin, datan tuoreuteen ja kirjattuihin tapahtumiin. Jokainen luku säilyttää yhteyden lähdetiliotteeseen.",
      primaryAction: "Katso miten se toimii",
      secondaryAction: "Tarkista kehitysvaihe",
      qualifier:
        "Pankin raportoimaa tietoa, ei reaaliaikainen käytettävissä oleva saldo.",
    },
    plain: {
      eyebrow: "Selkokielellä",
      title:
        "Daily Cash korvaa aamun manuaalisen saldokierroksen yhdellä luotettavalla näkymällä",
      body: "Palvelu vastaanottaa valtuutetut camt.053-tiliotteet, tarkistaa ja normalisoi niiden sisällön sekä näyttää viimeisimmän pätevän kassatilanteen. Se kertoo samalla, jos tiliote puuttuu, on vanhentunut tai sisältää ristiriitaista tietoa. Valuuttoja ei lasketa salaa yhteen.",
    },
    value: {
      eyebrow: "Mitä käyttäjä saa",
      title:
        "Kevyen TMS:n tärkein näkyvyys ilman raskasta käyttöönottoprojektia",
      items: [
        {
          title: "Kassatilanne",
          body: "Konserninäkymä, jossa yhtiö-, tili- ja valuuttapositiot pysyvät erillään ilman laskettua konsernisummaa.",
        },
        {
          title: "Luotettava tuoreus",
          body: "Näe milloin pankin aineisto on havaittu ja mitkä tilit ovat tuoreita, vanhoja tai puuttuvia.",
        },
        {
          title: "Tapahtumahaku",
          body: "Suodata kirjauksia ja hae tapahtumia viitteellä, UETR-tunnisteella tai käyttötarkoituksella.",
        },
        {
          title: "Selitettävät luvut",
          body: "Avaa saldo, kirjaus, tapahtuma ja käsittelyevidenssi samasta polusta.",
        },
        {
          title: "Huomiota vaativat asiat",
          body: "Puuttuvat ja viivästyneet tiliotteet sekä ristiriidat näkyvät varoituksina, eivät piiloudu summaan.",
        },
        {
          title: "Rajattu vienti",
          body: "Vie turvallinen, kiinteäsarakkeinen CSV-näkymä ilman raakaa pankkiaineistoa.",
        },
      ],
    },
    how: {
      eyebrow: "Yksi tietolähde",
      title: "Sama laskenta API:ssa ja käyttöliittymässä",
      steps: [
        {
          number: "01",
          title: "Vastaanota",
          body: "Nykyinen File Exchange -polku tai hallittu testituonti toimittaa tarkan camt.053-aineiston.",
        },
        {
          number: "02",
          title: "Pätevöi",
          body: "Sanoma, pankkiprofiili, rivit ja lähdeyhteydet tarkistetaan ennen käyttöä.",
        },
        {
          number: "03",
          title: "Laske",
          body: "Yksi deterministinen Cash Position -moduuli valitsee saldot ja arvioi kattavuuden ja tuoreuden.",
        },
        {
          number: "04",
          title: "Näytä",
          body: "Generoitu luku-API, hallintasovellus ja viennit esittävät saman tuloksen lisäämättä omaa talouslogiikkaa.",
        },
      ],
    },
    essentials: {
      eyebrow: "Treasury Essentials",
      title: "Selkeä vähimmäistaso kilpailukykyiselle kassanhallinnalle",
      lead: "Daily Cash keskittyy ensin näkyvyyteen ja evidenssiin. Maksaminen, ennustaminen ja hyväksyntätyönkulut lisätään erillisinä, hallittuina moduuleina.",
      rows: [
        {
          capability: "Kassa tänään",
          answer:
            "Kirjatut, käytettävissä olevat, sulkevat ja päivänsisäiset saldot silloin kun pankkiaineisto ne raportoi.",
        },
        {
          capability: "Konserni ja yhtiöt",
          answer:
            "Tilien ryhmittely oikeushenkilön ja valuutan mukaan; valuutat erillään oletuksena.",
        },
        {
          capability: "Tapahtumat",
          answer:
            "Kirjausten ja tapahtumien haku, suodatus ja lähteeseen porautuminen.",
        },
        {
          capability: "Datan laatu",
          answer:
            "Tuoreus, kattavuus, käsittelytila, puuttuvat aineistot ja ristiriidat näkyviksi.",
        },
        {
          capability: "Integrointi",
          answer:
            "Generoitu, vain lukuun tarkoitettu Cash Visibility API -paketti ja TypeScript-asiakas.",
        },
        {
          capability: "Valuuttanäkymä",
          answer:
            "Ei implisiittistä muunnosta; raportointivaluutta vain erikseen pätevöidyllä FX-havainnolla.",
        },
      ],
    },
    trust: {
      eyebrow: "Miksi luvun voi selittää",
      title: "Pankkitiedostosta näkymään ilman näkymätöntä tulkintaa",
      items: [
        {
          title: "Tarkka raha",
          body: "Summat ja valuutat käsitellään tarkkoina desimaaleina, ei liukulukuina tai oletettuina euroina.",
        },
        {
          title: "Lähde-evidenssi",
          body: "Positio säilyttää viitteet valittuihin saldoihin, tiliotteisiin, käsittelyajoihin ja säilytettyyn aineistoon.",
        },
        {
          title: "Rehellinen saatavuus",
          body: "Vanha, osittainen, puuttuva ja ristiriitainen tieto ilmaistaan sellaisena eikä korvata hiljaisella oletuksella.",
        },
      ],
    },
    status: {
      label: "Kehitysvaihe",
      title: "Suunniteltu tuotantoon, mutta ei vielä tuotantolupaus",
      body: "Tämä sivu on arvioitava tuote-esikatselu. Daily Cashin tietomalli, laskentamoduuli ja API-sopimus on toteutettu tuote-ehdokkaaksi, jota nyt pätevöitetään. Julkinen lanseeraus edellyttää koko nouto-, toisto-, valvonta- ja asiakaspolun todistamista.",
      included: "Esikatselussa valmista",
      includedItems: [
        "Daily Cash -semantiikka",
        "Deterministinen Cash Position -moduuli",
        "Generoitu luku-API",
        "Synteettinen hallintasovellusnäkymä",
      ],
      excluded: "Ei vielä väitetä",
      excludedItems: [
        "Reaaliaikaista saldoa",
        "Kaikkien pankkien tai camt.053-versioiden tukea",
        "Tuotantokäyttöä ilman pätevöintiä",
        "Täyttä TMS:ää tai automaattista kirjanpitoa",
      ],
      action: "Keskustele design-kumppanuudesta",
    },
    faq: {
      eyebrow: "Usein kysyttyä",
      title: "Mitä Daily Cash on — ja mitä se ei ole",
      items: [
        {
          question: "Onko Daily Cash täysi TMS?",
          answer:
            "Ei. Ensimmäinen tuote on kevyt treasury-näkyvyys: kassa, tapahtumat, tuoreus, poikkeukset ja evidenssi. Maksut, ennusteet, likviditeettisuunnittelu ja hyväksynnät ovat erillisiä tulevia moduuleja.",
        },
        {
          question: "Näyttääkö se reaaliaikaisen käytettävissä olevan saldon?",
          answer:
            "Ei automaattisesti. Näkymä kertoo pankin aineistossa raportoidun saldotyypin ja ajankohdan. Tiedostopohjainen camt.053 on tyypillisesti päivän tiliote, ei jatkuva reaaliaikavirta.",
        },
        {
          question: "Voiko sitä kokeilla ennen pankkiyhteyttä?",
          answer:
            "Kyllä suunnittelu- ja testivaiheessa. Synteettisiä tai hallitusti tuotuja camt.053-tiedostoja voidaan käyttää mallin, käyttöliittymän ja integraation todentamiseen. Tuotanto vaatii valtuutetun ja pätevöidyn noutopolun.",
        },
        {
          question: "Lasketaanko eri valuutat yhteen?",
          answer:
            "Ei oletuksena. EUR, USD ja muut valuutat pysyvät erillisinä. Raportointivaluutta voidaan näyttää vain, kun käytössä on nimenomaisesti pätevöity kurssihavainto.",
        },
      ],
    },
    dashboard: {
      label: "Daily Cash",
      title: "Kassatilanne",
      synthetic: "Synteettinen esimerkki",
      asOf: "Tilanne 9.8.2026 klo 09.15",
      coverage: "Osittainen kattavuus",
      coverageDetail: "3/3 tiliä · USD-aineisto vanhentunut",
      entity: "Yhtiön kirjattu kassa",
      accounts: "Tilit ja lähteen tila",
      accountLabels: ["Operatiivinen tili", "Palkkatili", "USD-myyntitili"],
      fresh: "Tuore",
      stale: "Vanha",
      activity: "Viimeisimmät kirjaukset",
      activityRows: [
        {
          label: "Asiakassuoritus",
          detail: "INV-2026-4421 · Tänään",
          amount: "+12 500,00 EUR",
          direction: "in",
        },
        {
          label: "Toimittajamaksu",
          detail: "SUPPLIER-883 · Tänään",
          amount: "−3 200,75 EUR",
          direction: "out",
        },
        {
          label: "Palkat",
          detail: "PAYROLL-2026-08 · Tänään",
          amount: "−48 250,00 EUR",
          direction: "out",
        },
      ],
      evidence:
        "Kaikki luvut linkittyvät tiliotteeseen ja käsittelyevidenssiin",
    },
  },
  en: {
    meta: {
      title: "Daily Cash – cash visibility and bank-data status | ISECure",
      description:
        "Daily Cash turns qualified camt.053 statements into a clear view of cash, freshness, and transactions. Product-development preview, not a production-availability claim.",
    },
    previewLabel: "Private product preview · not yet on public sale",
    hero: {
      eyebrow: "Daily Cash · lightweight treasury visibility",
      title: "Know today’s cash — and what needs attention",
      lead: "One readable view of group and entity cash, data freshness, and booked bank activity. Every number remains connected to the statement that supports it.",
      primaryAction: "See how it works",
      secondaryAction: "Check development status",
      qualifier: "Bank-reported data, not a real-time available-funds balance.",
    },
    plain: {
      eyebrow: "In plain English",
      title:
        "Daily Cash replaces the morning balance chase with one trustworthy view",
      body: "It receives authorized camt.053 statements, validates and normalizes them, and shows the latest qualified cash position. It also tells you when a statement is missing, stale, or contradictory. Different currencies are never silently added together.",
    },
    value: {
      eyebrow: "What users get",
      title:
        "The most useful lightweight-TMS visibility without a heavyweight rollout",
      items: [
        {
          title: "Cash position",
          body: "A group overview of separate entity, account, and currency positions—without an invented group total.",
        },
        {
          title: "Trustworthy freshness",
          body: "See when bank data was observed and which accounts are fresh, stale, or missing.",
        },
        {
          title: "Transaction search",
          body: "Filter entries and find transactions by reference, UETR, or purpose.",
        },
        {
          title: "Explainable numbers",
          body: "Drill through balance, entry, transaction, and processing evidence.",
        },
        {
          title: "Attention signals",
          body: "Missing or delayed statements and contradictions become warnings instead of disappearing into totals.",
        },
        {
          title: "Bounded export",
          body: "Export a safe fixed-column CSV view without raw bank-file bytes.",
        },
      ],
    },
    how: {
      eyebrow: "One source of meaning",
      title: "The API and interface use the same calculation",
      steps: [
        {
          number: "01",
          title: "Receive",
          body: "The existing File Exchange path, or a governed test import, provides the exact camt.053 artifact.",
        },
        {
          number: "02",
          title: "Qualify",
          body: "Message syntax, bank profile, observations, and source lineage are checked before use.",
        },
        {
          number: "03",
          title: "Calculate",
          body: "One deterministic Cash Position module selects balances and evaluates coverage and freshness.",
        },
        {
          number: "04",
          title: "Present",
          body: "The generated read API, admin application, and exports show the same result without adding financial logic.",
        },
      ],
    },
    essentials: {
      eyebrow: "Treasury Essentials",
      title: "A clear baseline for competitive cash management",
      lead: "Daily Cash starts with visibility and evidence. Payments, forecasting, and approval workflows can be added as separate governed modules.",
      rows: [
        {
          capability: "Cash today",
          answer:
            "Booked, available, closing, and interim balances when the bank artifact reports them.",
        },
        {
          capability: "Groups and entities",
          answer:
            "Accounts grouped by legal entity and currency; currencies stay separate by default.",
        },
        {
          capability: "Transactions",
          answer:
            "Search and filter entries and transactions, then drill into their source.",
        },
        {
          capability: "Data quality",
          answer:
            "Freshness, coverage, processing status, missing data, and contradictions made visible.",
        },
        {
          capability: "Integration",
          answer:
            "A generated read-only Cash Visibility API pack and TypeScript client.",
        },
        {
          capability: "FX presentation",
          answer:
            "No implicit conversion; reporting currency only with an explicitly qualified FX observation.",
        },
      ],
    },
    trust: {
      eyebrow: "Why the number is explainable",
      title: "From bank file to screen without invisible interpretation",
      items: [
        {
          title: "Exact money",
          body: "Amounts and currencies use exact decimals—never floating point, implicit cents, or assumed euros.",
        },
        {
          title: "Source evidence",
          body: "A position retains references to selected balances, statements, processing runs, and the retained artifact.",
        },
        {
          title: "Honest availability",
          body: "Stale, partial, missing, and contradictory data remains visible instead of being replaced by a quiet assumption.",
        },
      ],
    },
    status: {
      label: "Development status",
      title: "Designed for production, not yet a production promise",
      body: "This is a reviewable product preview. The Daily Cash model, calculation module, and API contract are implemented as a product candidate now undergoing qualification. Public launch requires evidence across retrieval, replay, monitoring, recovery, and an authorized customer journey.",
      included: "Ready in the preview",
      includedItems: [
        "Daily Cash semantics",
        "Deterministic Cash Position module",
        "Generated read API",
        "Synthetic admin-app experience",
      ],
      excluded: "Not claimed yet",
      excludedItems: [
        "Real-time available funds",
        "Every bank or camt.053 version",
        "Production use without qualification",
        "A full TMS or automatic bookkeeping",
      ],
      action: "Discuss a design-partner pilot",
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "What Daily Cash is — and is not",
      items: [
        {
          question: "Is Daily Cash a full TMS?",
          answer:
            "No. The first product is lightweight treasury visibility: cash, transactions, freshness, exceptions, and evidence. Payments, forecasts, liquidity planning, and approvals are separate future modules.",
        },
        {
          question: "Does it show real-time available funds?",
          answer:
            "Not automatically. The view states the balance type and time reported by the bank artifact. File-based camt.053 is normally an end-of-day statement, not a continuous real-time feed.",
        },
        {
          question: "Can we try it before a live bank connection?",
          answer:
            "Yes, for design and testing. Synthetic or governed imported camt.053 files can validate the model, UI, and integration. Production requires an authorized, qualified retrieval path.",
        },
        {
          question: "Are currencies added together?",
          answer:
            "Not by default. EUR, USD, and other currencies stay separate. A reporting-currency view is allowed only when an explicitly qualified FX observation is available.",
        },
      ],
    },
    dashboard: {
      label: "Daily Cash",
      title: "Cash overview",
      synthetic: "Synthetic example",
      asOf: "As of 9 Aug 2026, 09:15",
      coverage: "Partial coverage",
      coverageDetail: "3/3 accounts · USD source is stale",
      entity: "Entity booked cash",
      accounts: "Accounts and source status",
      accountLabels: [
        "Operating account",
        "Payroll account",
        "USD receivables",
      ],
      fresh: "Fresh",
      stale: "Stale",
      activity: "Recent booked entries",
      activityRows: [
        {
          label: "Customer payment",
          detail: "INV-2026-4421 · Today",
          amount: "+12,500.00 EUR",
          direction: "in",
        },
        {
          label: "Supplier payment",
          detail: "SUPPLIER-883 · Today",
          amount: "−3,200.75 EUR",
          direction: "out",
        },
        {
          label: "Payroll",
          detail: "PAYROLL-2026-08 · Today",
          amount: "−48,250.00 EUR",
          direction: "out",
        },
      ],
      evidence: "Every number links to statement and processing evidence",
    },
  },
  se: {
    meta: {
      title: "Daily Cash – kassavy och status för bankdata | ISECure",
      description:
        "Daily Cash omvandlar kvalificerade camt.053-kontoutdrag till en tydlig vy över kassa, aktualitet och transaktioner. Produktförhandsvisning, inte ett löfte om produktionstillgänglighet.",
    },
    previewLabel:
      "Privat produktförhandsvisning · ännu inte i offentlig försäljning",
    hero: {
      eyebrow: "Daily Cash · lätt treasury-överblick",
      title: "Se dagens kassa — och vad som kräver uppmärksamhet",
      lead: "En lättläst vy över koncernens och bolagens bankrapporterade saldon, datans aktualitet och bokförda bankhändelser. Varje belopp behåller länken till kontoutdraget som stöder det.",
      primaryAction: "Se hur det fungerar",
      secondaryAction: "Kontrollera utvecklingsstatus",
      qualifier:
        "Bankrapporterad information, inte ett realtidssaldo för tillgängliga medel.",
    },
    plain: {
      eyebrow: "Enkelt förklarat",
      title: "Daily Cash ersätter morgonens saldojakt med en tillförlitlig vy",
      body: "Tjänsten tar emot behöriga camt.053-kontoutdrag, validerar och normaliserar dem och visar den senaste kvalificerade kassapositionen. Den berättar också om ett utdrag saknas, är gammalt eller motsägelsefullt. Olika valutor summeras aldrig i tysthet.",
    },
    value: {
      eyebrow: "Vad användaren får",
      title: "Den viktigaste lätta TMS-överblicken utan ett tungt införande",
      items: [
        {
          title: "Kassaposition",
          body: "En koncernvy med separata bolags-, konto- och valutapositioner, utan en påhittad koncernsumma.",
        },
        {
          title: "Tillförlitlig aktualitet",
          body: "Se när bankdata observerades och vilka konton som är aktuella, gamla eller saknas.",
        },
        {
          title: "Transaktionssökning",
          body: "Filtrera poster och hitta transaktioner med referens, UETR eller ändamål.",
        },
        {
          title: "Förklarbara belopp",
          body: "Följ saldo, post, transaktion och behandlingsevidens i samma kedja.",
        },
        {
          title: "Uppmärksamhetssignaler",
          body: "Saknade eller försenade utdrag och motsägelser blir varningar i stället för att döljas i summor.",
        },
        {
          title: "Begränsad export",
          body: "Exportera en säker CSV-vy med fasta kolumner utan råa bankfiler.",
        },
      ],
    },
    how: {
      eyebrow: "En betydelsekälla",
      title: "API och gränssnitt använder samma beräkning",
      steps: [
        {
          number: "01",
          title: "Ta emot",
          body: "Den befintliga File Exchange-kanalen eller en styrd testimport levererar den exakta camt.053-filen.",
        },
        {
          number: "02",
          title: "Kvalificera",
          body: "Meddelande, bankprofil, observationer och källhärledning kontrolleras före användning.",
        },
        {
          number: "03",
          title: "Beräkna",
          body: "En deterministisk Cash Position-modul väljer saldon och bedömer täckning och aktualitet.",
        },
        {
          number: "04",
          title: "Presentera",
          body: "Det genererade läs-API:t, adminappen och exporterna visar samma resultat utan egen finanslogik.",
        },
      ],
    },
    essentials: {
      eyebrow: "Treasury Essentials",
      title: "En tydlig basnivå för konkurrenskraftig kassahantering",
      lead: "Daily Cash börjar med överblick och evidens. Betalningar, prognoser och godkännandeflöden kan läggas till som separata styrda moduler.",
      rows: [
        {
          capability: "Kassa i dag",
          answer:
            "Bokförda, tillgängliga, utgående och intradags-saldon när bankmaterialet rapporterar dem.",
        },
        {
          capability: "Koncern och bolag",
          answer:
            "Konton grupperas efter juridisk person och valuta; valutor hålls separata som standard.",
        },
        {
          capability: "Transaktioner",
          answer:
            "Sök och filtrera poster och transaktioner och följ dem till källan.",
        },
        {
          capability: "Datakvalitet",
          answer:
            "Aktualitet, täckning, behandlingsstatus, saknade data och motsägelser görs synliga.",
        },
        {
          capability: "Integration",
          answer:
            "Ett genererat läsbart Cash Visibility API-paket och en TypeScript-klient.",
        },
        {
          capability: "Valutavy",
          answer:
            "Ingen implicit omräkning; rapporteringsvaluta endast med en uttryckligen kvalificerad FX-observation.",
        },
      ],
    },
    trust: {
      eyebrow: "Varför beloppet kan förklaras",
      title: "Från bankfil till skärm utan osynlig tolkning",
      items: [
        {
          title: "Exakta pengar",
          body: "Belopp och valutor använder exakta decimaler—aldrig flyttal, implicita cent eller antagna euro.",
        },
        {
          title: "Källevidens",
          body: "En position behåller referenser till valda saldon, utdrag, behandlingskörningar och den bevarade filen.",
        },
        {
          title: "Ärlig tillgänglighet",
          body: "Gammal, partiell, saknad och motsägelsefull information förblir synlig i stället för att ersättas av ett tyst antagande.",
        },
      ],
    },
    status: {
      label: "Utvecklingsstatus",
      title: "Utformad för produktion, ännu inget produktionslöfte",
      body: "Detta är en granskningsbar produktförhandsvisning. Daily Cash-modellen, beräkningsmodulen och API-avtalet har implementerats som en produktkandidat som nu kvalificeras. Offentlig lansering kräver evidens för hämtning, återspelning, övervakning, återställning och en behörig kundresa.",
      included: "Klart i förhandsvisningen",
      includedItems: [
        "Daily Cash-semantik",
        "Deterministisk Cash Position-modul",
        "Genererat läs-API",
        "Syntetisk vy i adminappen",
      ],
      excluded: "Påstås inte ännu",
      excludedItems: [
        "Realtidssaldo för tillgängliga medel",
        "Varje bank eller camt.053-version",
        "Produktionsbruk utan kvalificering",
        "Ett fullständigt TMS eller automatisk bokföring",
      ],
      action: "Diskutera ett designpartnerprojekt",
    },
    faq: {
      eyebrow: "Vanliga frågor",
      title: "Vad Daily Cash är — och inte är",
      items: [
        {
          question: "Är Daily Cash ett fullständigt TMS?",
          answer:
            "Nej. Den första produkten är lätt treasury-överblick: kassa, transaktioner, aktualitet, undantag och evidens. Betalningar, prognoser, likviditetsplanering och godkännanden är separata framtida moduler.",
        },
        {
          question: "Visar den tillgängliga medel i realtid?",
          answer:
            "Inte automatiskt. Vyn anger saldotypen och tidpunkten som bankmaterialet rapporterar. Filbaserad camt.053 är normalt ett dagsutdrag, inte ett kontinuerligt realtidsflöde.",
        },
        {
          question: "Kan vi prova före en aktiv bankförbindelse?",
          answer:
            "Ja, för design och testning. Syntetiska eller styrt importerade camt.053-filer kan validera modellen, gränssnittet och integrationen. Produktion kräver en behörig, kvalificerad hämtningsväg.",
        },
        {
          question: "Summeras olika valutor?",
          answer:
            "Inte som standard. EUR, USD och andra valutor hålls separata. En rapporteringsvaluta får visas endast när en uttryckligen kvalificerad FX-observation finns.",
        },
      ],
    },
    dashboard: {
      label: "Daily Cash",
      title: "Kassaöversikt",
      synthetic: "Syntetiskt exempel",
      asOf: "Läge 9 aug 2026 kl. 09.15",
      coverage: "Partiell täckning",
      coverageDetail: "3/3 konton · USD-källan är gammal",
      entity: "Bolagets bokförda kassa",
      accounts: "Konton och källstatus",
      accountLabels: ["Driftskonto", "Lönekonto", "USD-fordringar"],
      fresh: "Aktuell",
      stale: "Gammal",
      activity: "Senaste bokförda poster",
      activityRows: [
        {
          label: "Kundbetalning",
          detail: "INV-2026-4421 · I dag",
          amount: "+12 500,00 EUR",
          direction: "in",
        },
        {
          label: "Leverantörsbetalning",
          detail: "SUPPLIER-883 · I dag",
          amount: "−3 200,75 EUR",
          direction: "out",
        },
        {
          label: "Löner",
          detail: "PAYROLL-2026-08 · I dag",
          amount: "−48 250,00 EUR",
          direction: "out",
        },
      ],
      evidence: "Varje belopp länkar till kontoutdrag och behandlingsevidens",
    },
  },
} satisfies Record<Lang, DailyCashContent>;
