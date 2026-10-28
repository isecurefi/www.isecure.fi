import type { Lang } from "../types";

export const translations = {
  contactForm: {
    title: {
      fi: "Ota yhteyttä",
      en: "Contact Us",
      se: "Kontakta oss",
    },
    name: {
      fi: "Nimi",
      en: "Name",
      se: "Namn",
    },
    email: {
      fi: "Sähköposti",
      en: "Email",
      se: "E-post",
    },
    message: {
      fi: "Viesti",
      en: "Message",
      se: "Meddelande",
    },
    send: {
      fi: "Lähetä",
      en: "Send",
      se: "Skicka",
    },
    readMore: {
      fi: "LUE LISÄÄ",
      en: "READ MORE",
      se: "LÄS MER",
    },
    validation: {
      required: {
        fi: "Anna nimi, sähköposti ja viesti.",
        en: "Please provide name, email and message.",
        se: "Ange namn, e-post och meddelande.",
      },
      nameRequired: {
        fi: "Nimi on pakollinen ja voi sisältää vain kirjaimia",
        en: "Name is required and can only contain letters",
        se: "Namn krävs och kan bara innehålla bokstäver",
      },
      emailInvalid: {
        fi: "Anna kelvollinen sähköpostiosoite",
        en: "Please enter a valid email address",
        se: "Ange en giltig e-postadress",
      },
      messageLength: {
        fi: "Viestin tulee olla vähintään 10 merkkiä pitkä",
        en: "Message must be at least 10 characters long",
        se: "Meddelandet måste vara minst 10 tecken långt",
      },
    },
    sending: {
      fi: "Lähetetään viestiä...",
      en: "Sending message...",
      se: "Skickar meddelande...",
    },
    success: {
      fi: "Viesti lähetetty onnistuneesti!",
      en: "Message sent successfully!",
      se: "Meddelandet har skickats!",
    },
    error: {
      fi: "Viestiä ei voitu lähettää. Yritä myöhemmin uudelleen.",
      en: "Message could not be sent. Please try again later.",
      se: "Meddelandet kunde inte skickas. Försök igen senare.",
    },
  },
  contact: {
    en: "",
    fi: `ISECure Oy on ohjelmistokehittäjä Dan Forsbergin perustama
      yritys, joka tarjoaa Web Service –pankkiyhteyden verifioitua
      koodia ja räätälöintipalveluita yrityksille, järjestöille ja
      yhdistyksille. Forsberg on toiminut asiantuntijatehtävissä
      mobiiliverkostojen, tietoturvan, telecomin, ja
      ohjelmistokehittämisen parissa. Hän johti tutkimushankkeita
      Nokia Research Centerissä 10 vuoden ajan, josta siirtyi
      Poplatek:lle kehitysjohtajaksi. Nykyisin hän työskentelee
      Lontoossa Cloud Architect -nimikkeellä
      Cloudreach:llä. Forsbergin erikoisosaamista ovat
      AWS-pilvipalvelut ja PCI DSS –turvallisuussuunnittelu.`,
    se: `ISECure Oy grundades av programutvecklaren Dan Forsberg. ISECure
      Oy erbjuder företag, organisationer och föreningar Web Service
      –bankförbindelsens verifierade kod och skräddarsydda
      tjänster. Forsberg har arbetat som expert med mobilnätverk,
      dataskydd, telecom, ekonomi och mjukvaruutveckling. Under tio år
      ledde han forskningsprojekt vid Nokia Research Center och
      övergick sedan till Poplatek Oy som utvecklingsdirektör.
      Nu arbetar han i London som Cloud Architect på Cloudreach.
      Forsbergs specialkompetens ligger inom områdena AWS-molntjänster
      och PCI DSS -säkerhetsplanering.`,
  },
  "ws-info": {
    en: `<p>A company's bank connection, or Web Service channel
      (or <b>WS-channel</b>), is essential for organizations that
      want to manage and monitor their payment traffic through their
      own software.</p>
      
      <p>A company needs a connection channel for transmitting
      payment transaction data between the company's financial
      management and the bank. In 2014, many banking groups
      abandoned the PATU channel and switched to using only the
      new Web Services channel, which complies with the
      European-wide SEPA standard, for transmitting payment
      transaction data. With the company's bank connection or Web
      Service channel, it is possible to handle payment traffic
      directly from the company's own financial management
      software.</p>
      
      <p>Building a WS channel can be a year-long project even
      for an expert programmer, requiring in-depth programming
      work. Development work often needs to be done in parallel
      with multiple banks. Testing and applying for credentials
      takes considerable calendar time. Using ISECure's ready-made
      Web Service code saves time and costs.</p>`,
    fi: `<p>Yrityksen pankkiyhteys eli Web Service -kanava
      (tai <b>WS-kanava</b>) on välttämätön organisaatioille, jotka
      haluavat hoitaa ja seurata maksuliikennettään omien
      ohjelmistojensa kautta.</p>
      
      <p>Yritys tarvitsee yhteyskanavan
      maksuliikeaineiston välittämiseen yrityksen
      taloushallinnon ja pankin välillä. Vuonna 2014 monet
      pankkiryhmät ovat luopuneet PATU-kanavasta ja
      siirtyvät käyttämään pelkästään uutta,
      euroopanlaajuisen SEPA-standardin mukaista Web
      Services –kanavaa maksuliike-aineiston
      välittämiseen. Yrityksen pankkiyhteys- eli Web
      Service –kanavan avulla maksuliikenne on mahdollista
      hoitaa suoraan yrityksen omista taloushallinnon
      ohjelmistoista.</p>
      
      <p>WS-kanavan rakentaminen voi olla asiantuntevalle
      ohjelmoijalle jopa vuoden projekti, joka vaatii
      syventynyttä ohjelmointityötä. Kehitystyötä tulee
      tehdä usein rinnakkain useamman pankin
      kanssa. Testauksiin ja tunnusten hakemiseen menee
      huomattavasti kalenteriaikaa. ISECuren valmiin Web
      Service -koodin käyttäminen säästää aikaa ja
      kustannuksia.</p>`,
    se: `<p>Företagets bankförbindelse eller Web Service -kanal (kort
      WS-kanal) är grundläggande för organisationer som vill sköta och
      följa med sin betalningstrafik med hjälp av sin egen mjukvara.</p>n
      
      <p>Företaget behöver en förbindelsekanal för överföringen av
      betalningsrörelsematerial mellan företagets ekonomiförvaltning
      och banken. År 2014 har många bankgrupper avstått från
      PATU-kanalen och övergår till att för förmedlingen av
      betalningsrörelsematerial endast använda den nya Web
      Services-kanalen som motsvarar den europeiska
      SEPA-standarden. Med företagets bankförbindelse- dvs. Web
      Service-kanal är det möjligt att hantera betalningsrörelsen
      direkt i företagets eget ekonomiförvaltningsprogram.</p>
      
      <p>Uppbyggnaden av en WS-kanal kan för en sakkunnig programmerare
      utgöra ett projekt på upp till ett år och kräver fördjupat
      programmeringsarbete. Utvecklingsarbetet utförs ofta parallellt
      med flera banker. Det går åt mycket kalendertid för testningar
      och ansökningar om identifieringsnummer. Med ISECures färdiga
      Web Service-kod sparar du tid och kostnader.</p>`,
  },
  nav: {
    home: {
      en: "Home",
      fi: "Etusivu",
      se: "Hem",
    },
    wsChannel: {
      en: "WS-Channel",
      fi: "WS-Kanava",
      se: "WS-Kanal",
    },
    api: {
      en: "API",
      fi: "API",
      se: "API",
    },
    banks: {
      en: "Banks",
      fi: "Pankit",
      se: "Banker",
    },
    pricing: {
      en: "Pricing",
      fi: "Hinnat",
      se: "Priser",
    },
    contact: {
      en: "Contact",
      fi: "Yhteystiedot",
      se: "Kontakt",
    },
  },
  references: {
    title: {
      fi: "Yli 10 vuotta luotettavia pankkiyhteyksiä",
      en: "Over 10 years of reliable bank connectivity",
      se: "Över 10 år av tillförlitliga bankförbindelser",
    },
  },
  quote: {
    text: {
      fi: "Luotettava pankkiyhteys jo yli 10 vuotta!",
      en: "Reliable bank connection for over 10 years!",
      se: "Pålitlig bankförbindelse i över 10 år!",
    },
  },
};

export const defaultLang: Lang = "fi";

export function getStoredLang(): Lang {
  if (typeof globalThis.window === "undefined") {
    return defaultLang;
  }

  try {
    const urlParams = new URLSearchParams(globalThis.window.location.search);
    const urlLang = urlParams.get("lang") as Lang;
    if (urlLang && ["fi", "en", "se"].includes(urlLang)) {
      try {
        globalThis.window.localStorage.setItem("preferred-lang", urlLang);
      } catch (e) {
        globalThis.console.warn("Failed to set localStorage:", e);
      }
      return urlLang;
    }

    try {
      const stored = globalThis.window.localStorage.getItem(
        "preferred-lang",
      ) as Lang;
      if (stored && ["fi", "en", "se"].includes(stored)) {
        return stored;
      }
    } catch (e) {
      globalThis.console.warn("Failed to get localStorage:", e);
    }
  } catch (e) {
    globalThis.console.warn("Error accessing window:", e);
  }

  return defaultLang;
}

export function setStoredLang(lang: Lang): void {
  if (!lang) {
    return;
  }
  if (typeof globalThis.window !== "undefined") {
    try {
      globalThis.window.localStorage.setItem("preferred-lang", lang);
    } catch (e) {
      globalThis.console.warn("Failed to set localStorage:", e);
    }
  }
}

export function getText(key: string, lang: Lang = getStoredLang()): string {
  const keys = key.split(".");
  let result: unknown = translations;
  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  if (!result || typeof result !== "object") {
    return typeof result === "string" ? result : key;
  }
  const localized = result as Partial<Record<Lang, unknown>>;
  const value = localized[lang] ?? localized[defaultLang];
  return typeof value === "string" ? value : key;
}
