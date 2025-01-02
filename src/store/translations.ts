import type { Lang } from '../types';

export const translations = {
  hero: {
    title1: {
      en: 'WS-Channel',
      fi: 'WS-Kanava',
      se: 'WS-Kanal'
    },
    subtitle1: {
      en: 'When you need a bank connection channel for your business idea or customer project, or want to automate bank file processing',
      fi: 'Kun tarvitset liikeideaasi tai asiakas-projektiasi varten pankkiyhteyskanavan tai haluat automatisoida pankkiaineistojen käsittelyä',
      se: 'När du behöver en bankförbindelsekanal för din affärsidé eller kundprojekt, eller vill automatisera bankfilshantering'
    },
    title2: {
      en: 'WS-Channel API',
      fi: 'WS-Kanava API',
      se: 'WS-Kanal API'
    },
    subtitle2: {
      en: 'One and the same API interface for your integration with all banks. Scales automatically according to your needs.',
      fi: 'Yksi ja sama API rajapinta integraatiotasi varten kaikille pankeille. Skaalautuu automaattisesti tarpeidesi mukaan.',
      se: 'Ett och samma API-gränssnitt för din integration med alla banker. Skalar automatiskt enligt dina behov.'
    }
  },
  contact: {
    en: '',
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
      Forsbergs specialkompetens ligger inom områdena PCI
      DSS -säkerhetsplanering och AWS-molntjänster.`
  },
  'ws-info': {
    en: '',
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
      Web Service-kod sparar du tid och kostnader.</p>`
  },
  nav: {
    home: {
      en: 'Home',
      fi: 'Etusivu',
      se: 'Hem'
    },
    wsChannel: {
      en: 'WS-Channel',
      fi: 'WS-Kanava',
      se: 'WS-Kanal'
    },
    api: {
      en: 'API',
      fi: 'API',
      se: 'API'
    },
    contact: {
      en: 'Contact',
      fi: 'Yhteystiedot',
      se: 'Kontakt'
    }
  }
};

export const defaultLang: Lang = 'fi';

export function getStoredLang(): Lang {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as Lang;
    if (urlLang && ['fi', 'en', 'se'].includes(urlLang)) {
      localStorage.setItem('preferred-lang', urlLang);
      return urlLang;
    }
    const stored = localStorage.getItem('preferred-lang') as Lang;
    if (stored && ['fi', 'en', 'se'].includes(stored)) {
      return stored;
    }
  }
  return defaultLang;
}

export function setStoredLang(lang: Lang): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('preferred-lang', lang);
  }
}

export function getText(key: string, lang: Lang = getStoredLang()): string {
  const keys = key.split('.');
  let result = translations;
  for (const k of keys) {
    if (result[k]) {
      result = result[k];
    } else {
      return key;
    }
  }
  return result[lang] || result[defaultLang] || key;
}
