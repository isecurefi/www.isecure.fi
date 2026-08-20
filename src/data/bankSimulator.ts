import type { Lang } from "../types";

interface SimulatorSection {
  title: string;
  paragraphs: string[];
  items?: string[];
}

interface SimulatorContent {
  meta: {
    title: string;
    description: string;
  };
  eyebrow: string;
  title: string;
  intro: string;
  sections: SimulatorSection[];
  exampleTitle: string;
  exampleText: string;
  apiLink: string;
  sdkLink: string;
}

export const bankSimulatorContent: Record<Lang, SimulatorContent> = {
  fi: {
    meta: {
      title: "Pankkisimulaattori testiaineistoille",
      description:
        "Testaa ISECure REST API:n varmenteita, tiedostolistausta, latausta ja allekirjoitettua pain.001-lähetystä gpgtest-pankkisimulaattorilla.",
    },
    eyebrow: "ISECure REST API · gpgtest",
    title: "Pankkisimulaattori",
    intro:
      "Pankkisimulaattorilla voit testata nykyistä File Exchange API:a ja TypeScript SDK:ta ilman oikeaa pankkiyhteyttä. Käytä testiympäristössä pankkitunnistetta simulator.",
    sections: [
      {
        title: "Ympäristö ja rajapinta",
        paragraphs: [
          "Testiympäristön osoite on https://ws-api.test.isecure.fi/v2. Simulaattori on käytettävissä vain tässä gpgtest-ympäristössä.",
          'Käytä samoja rekisteröinti-, kirjautumis-, varmenne- ja tiedosto-operaatioita kuin muille pankeille. TypeScript SDK:ssa ei ole simulaattorikohtaisia metodeja; valitse asiakasasetuksissa Bank: "simulator".',
        ],
      },
      {
        title: "Varmenteen rekisteröinti",
        paragraphs: [
          "Simulaattorin WS-käyttäjätunnusta tai PIN-koodia ei noudeta erillisestä palvelusta. Luo arvot omassa testisovelluksessa ja lähetä ne nykyisellä enrollCert-operaatiolla. Company-arvon tulee vastata rekisteröityä testitiliä.",
        ],
        items: [
          "WsUserId: 1–16 tavua tulostettavaa ASCII-tekstiä ilman ohjausmerkkejä",
          "Code: 16–32 tavua tulostettavaa ASCII-tekstiä ilman välilyöntejä tai ohjausmerkkejä",
          "Arvot ovat lyhytikäistä testitietoa eikä niitä pidä tallentaa lähdekoodiin tai lokiin",
        ],
      },
      {
        title: "Ensimmäinen tiliote",
        paragraphs: [
          "Tuore suora rekisteröinti luo yhden NEW-tilassa olevan camt.053.001.02-tiliotteen. Se sisältää synteettisen tilin FI2112345600000785, 10 000 000,00 euron OPBD- ja CLBD-saldot eikä tapahtumia.",
          "Listaa tiedosto FileType-arvolla camt.053.001.02 ja Status-arvolla NEW, ja lataa palautettu läpinäkymätön FileReference downloadFile-operaatiolla. Uusi lataus palauttaa samat tavut; tila vaihtuu NEW-arvosta DLD-arvoon ja tiedosto näkyy edelleen ALL-listauksessa.",
        ],
      },
      {
        title: "Allekirjoitettu maksuaineisto ja palaute",
        paragraphs: [
          "Luo OpenPGP-avainpari paikallisesti, rekisteröi vain julkinen avain authorize-käyttöön ja allekirjoita synteettinen pain.001.001.09-aineisto omassa sovelluksessa ennen uploadFile-kutsua.",
          "Hyväksytty lähetys tuottaa listattavaksi ja ladattavaksi seuraavat synteettiset aineistot:",
        ],
        items: [
          "pain.002.001.10 maksun tilapalautteena",
          "camt.054.001.02 veloitusilmoituksena",
          "uusi camt.053.001.02 päivitettynä tiliotetietona",
        ],
      },
      {
        title: "Tenanttikohtainen tila",
        paragraphs: [
          "Simulaattorin yhteys, tiedostoviitteet ja aineistot kuuluvat vain ne luoneelle ISECure-tenantille. Toinen asiakas ei voi listata, ladata tai muuttaa niitä.",
        ],
      },
    ],
    exampleTitle: "Aja valmis TypeScript-esimerkki",
    exampleText:
      "Valmis esimerkki hoitaa testikäyttäjien rekisteröinnin ja kirjautumisen, varmenteen rekisteröinnin, PGP-avaimet, allekirjoitetun lähetyksen sekä kaikkien palautetiedostojen listauksen ja latauksen.",
    apiLink: "REST API -dokumentaatio",
    sdkLink: "TypeScript-esimerkki GitHubissa",
  },
  en: {
    meta: {
      title: "Bank Simulator for test bank files",
      description:
        "Test ISECure REST API certificates, file listing, downloads, and signed pain.001 uploads with the gpgtest Bank Simulator.",
    },
    eyebrow: "ISECure REST API · gpgtest",
    title: "Bank Simulator",
    intro:
      "Use Bank Simulator to test the existing File Exchange API and TypeScript SDK without a real bank connection. Select the bank identifier simulator in the test environment.",
    sections: [
      {
        title: "Environment and interface",
        paragraphs: [
          "The test base URL is https://ws-api.test.isecure.fi/v2. Bank Simulator is available only in this gpgtest environment.",
          'Use the same registration, login, certificate, and file operations as for other banks. The TypeScript SDK has no simulator-specific methods; select Bank: "simulator" in the client configuration.',
        ],
      },
      {
        title: "Enroll the certificate",
        paragraphs: [
          "There is no separate service for retrieving a simulator WS user ID or PIN. Generate both values in your test application and submit them with the existing enrollCert operation. Company must match the registered test account.",
        ],
        items: [
          "WsUserId: 1–16 bytes of printable ASCII without control characters",
          "Code: 16–32 bytes of printable ASCII without whitespace or control characters",
          "Treat both as short-lived test values and keep them out of source code and logs",
        ],
      },
      {
        title: "Download the first statement",
        paragraphs: [
          "A fresh direct enrollment creates one NEW camt.053.001.02 statement. It contains synthetic account FI2112345600000785, equal OPBD and CLBD balances of EUR 10,000,000.00, and no entries.",
          "List it with FileType camt.053.001.02 and Status NEW, then pass the returned opaque FileReference to downloadFile. Repeated download returns identical bytes; its status moves from NEW to DLD and it remains visible under ALL.",
        ],
      },
      {
        title: "Upload a signed payment and download feedback",
        paragraphs: [
          "Generate an OpenPGP key pair locally, register only the public key for authorize use, and sign a synthetic pain.001.001.09 file inside your application before calling uploadFile.",
          "An accepted upload produces these synthetic files for listing and download:",
        ],
        items: [
          "pain.002.001.10 payment status feedback",
          "camt.054.001.02 debit notification",
          "a new camt.053.001.02 with the updated statement data",
        ],
      },
      {
        title: "Tenant-specific state",
        paragraphs: [
          "The simulator connection, file references, and artifacts belong only to the ISECure tenant that created them. Another customer cannot list, download, or change them.",
        ],
      },
    ],
    exampleTitle: "Run the complete TypeScript example",
    exampleText:
      "The existing example handles test-user registration and login, certificate enrollment, PGP keys, signed upload, and listing and downloading every response file.",
    apiLink: "REST API documentation",
    sdkLink: "TypeScript example on GitHub",
  },
  se: {
    meta: {
      title: "Banksimulator för testfiler",
      description:
        "Testa certifikat, fillistning, hämtning och signerad pain.001-uppladdning i ISECure REST API med gpgtest-banksimulatorn.",
    },
    eyebrow: "ISECure REST API · gpgtest",
    title: "Banksimulator",
    intro:
      "Använd banksimulatorn för att testa det befintliga File Exchange API:t och TypeScript SDK:t utan en riktig bankförbindelse. Välj bankidentifieraren simulator i testmiljön.",
    sections: [
      {
        title: "Miljö och gränssnitt",
        paragraphs: [
          "Testmiljöns basadress är https://ws-api.test.isecure.fi/v2. Banksimulatorn är tillgänglig endast i denna gpgtest-miljö.",
          'Använd samma registrerings-, inloggnings-, certifikat- och filoperationer som för andra banker. TypeScript SDK:t har inga simulatorspecifika metoder; välj Bank: "simulator" i klientkonfigurationen.',
        ],
      },
      {
        title: "Registrera certifikatet",
        paragraphs: [
          "Det finns ingen separat tjänst för att hämta simulatorns WS-användar-ID eller PIN-kod. Skapa båda värdena i testapplikationen och skicka dem med den befintliga enrollCert-operationen. Company måste motsvara det registrerade testkontot.",
        ],
        items: [
          "WsUserId: 1–16 byte utskrivbar ASCII utan kontrolltecken",
          "Code: 16–32 byte utskrivbar ASCII utan blanksteg eller kontrolltecken",
          "Behandla båda som kortlivade testvärden och håll dem borta från källkod och loggar",
        ],
      },
      {
        title: "Hämta det första kontoutdraget",
        paragraphs: [
          "En ny direktregistrering skapar ett camt.053.001.02-kontoutdrag med status NEW. Det innehåller det syntetiska kontot FI2112345600000785, lika OPBD- och CLBD-saldon på 10 000 000,00 EUR och inga poster.",
          "Lista det med FileType camt.053.001.02 och Status NEW och skicka sedan den ogenomskinliga FileReference som returneras till downloadFile. Upprepad hämtning returnerar identiska byte; statusen ändras från NEW till DLD och filen är fortfarande synlig under ALL.",
        ],
      },
      {
        title: "Ladda upp en signerad betalning och hämta respons",
        paragraphs: [
          "Skapa ett OpenPGP-nyckelpar lokalt, registrera endast den publika nyckeln för authorize-användning och signera en syntetisk pain.001.001.09-fil i applikationen innan uploadFile anropas.",
          "En godkänd uppladdning skapar följande syntetiska filer för listning och hämtning:",
        ],
        items: [
          "pain.002.001.10 som betalningsstatus",
          "camt.054.001.02 som debetavisering",
          "en ny camt.053.001.02 med uppdaterade kontoutdragsdata",
        ],
      },
      {
        title: "Tenant-specifikt tillstånd",
        paragraphs: [
          "Simulatoranslutningen, filreferenserna och filerna tillhör endast den ISECure-tenant som skapade dem. En annan kund kan inte lista, hämta eller ändra dem.",
        ],
      },
    ],
    exampleTitle: "Kör det fullständiga TypeScript-exemplet",
    exampleText:
      "Det befintliga exemplet hanterar registrering och inloggning av testanvändare, certifikatregistrering, PGP-nycklar, signerad uppladdning samt listning och hämtning av alla responsfiler.",
    apiLink: "REST API-dokumentation",
    sdkLink: "TypeScript-exempel på GitHub",
  },
};
