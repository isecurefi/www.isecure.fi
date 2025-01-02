import type { Lang } from '../types';

export const translations = {
  frontContent: {
    title: {
      fi: 'Tarvitsetko ratkaisuja pankkiyhteyksien rakentamiseen?',
      en: 'Do you need solutions for building bank connections?',
      se: 'Behöver du lösningar för att bygga bankförbindelser?'
    },
    subtitle: {
      fi: 'Tarjoamme ISECure WS-Kanava:aan perustuvia paketteja:',
      en: 'We offer packages based on ISECure WS-Channel:',
      se: 'Vi erbjuder paket baserade på ISECure WS-Kanal:'
    },
    apiSection: {
      title: {
        fi: 'WS-KANAVA API (REST), OPENAPI KUVAUS JA WSCLI KOMENTORIVITYÖKALU',
        en: 'WS-CHANNEL API (REST), OPENAPI DESCRIPTION AND WSCLI COMMAND LINE TOOL',
        se: 'WS-KANAL API (REST), OPENAPI BESKRIVNING OCH WSCLI KOMMANDORADSVERKTYG'
      },
      bankFiles: {
        title: {
          fi: 'Pankkitiedostot palveluna',
          en: 'Bank Files as a Service',
          se: 'Bankfiler som tjänst'
        },
        subtitle: {
          fi: 'PANKKITIEDOSTOT SUORAAN PALVEIMELLESI',
          en: 'BANK FILES DIRECTLY TO YOUR SERVER',
          se: 'BANKFILER DIREKT TILL DIN SERVER'
        },
        description: {
          fi: 'Palvelu synkronoi tiedostot pankista esim. SFTP palvelimellesi tai vaikkapa AWS S3 Bucket:iin säännöllisesti ja luotettavasti haluamansi ajankohtana. Pankkitiedostojen lähetys onnistuu myös lähettämällä tiedostot suoraan S3 Bucketiin. Selkeät raportit sekä lähetyksistä että vastaanotoista.',
          en: 'The service synchronizes files from the bank to your SFTP server or AWS S3 Bucket regularly and reliably at your desired time. Bank files can also be sent by uploading directly to an S3 Bucket. Clear reports for both sent and received files.',
          se: 'Tjänsten synkroniserar filer från banken till din SFTP-server eller AWS S3 Bucket regelbundet och pålitligt vid önskad tidpunkt. Bankfiler kan också skickas genom att ladda upp direkt till en S3 Bucket. Tydliga rapporter för både skickade och mottagna filer.'
        }
      },
      description: {
        fi: 'Oletko kehittämässä omaa palvelua tai tuotetta, jossa hyödynnät WS-kanavaa? Tarjoamme kilpailukykyiseen hintaan WS-Kanavan SaaS palveluna.',
        en: 'Are you developing your own service or product that utilizes the WS-Channel? We offer WS-Channel as a SaaS service at a competitive price.',
        se: 'Utvecklar du en egen tjänst eller produkt som använder WS-Kanal? Vi erbjuder WS-Kanal som SaaS-tjänst till ett konkurrenskraftigt pris.'
      },
      services: {
        fi: 'Palvelumme käyttää mm. AWS:n API Gateway, Dynamo DB, Cognito Your User Pool, KMS, IAM, CloudWatch ja Lambda palveluita ja skaalautuu tarpeidesi mukaan.',
        en: 'Our service uses AWS services including API Gateway, Dynamo DB, Cognito Your User Pool, KMS, IAM, CloudWatch and Lambda, and scales according to your needs.',
        se: 'Vår tjänst använder AWS-tjänster som API Gateway, Dynamo DB, Cognito Your User Pool, KMS, IAM, CloudWatch och Lambda, och skalar enligt dina behov.'
      }
    }
  },
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
  contactForm: {
    title: {
      fi: 'Ota yhteyttä',
      en: 'Contact Us',
      se: 'Kontakta oss'
    },
    name: {
      fi: 'Nimi',
      en: 'Name',
      se: 'Namn'
    },
    email: {
      fi: 'Sähköposti',
      en: 'Email',
      se: 'E-post'
    },
    message: {
      fi: 'Viesti',
      en: 'Message',
      se: 'Meddelande'
    },
    send: {
      fi: 'LÄHETÄ',
      en: 'SEND',
      se: 'SKICKA'
    },
    validation: {
      required: {
        fi: 'Anna nimi, sähköposti ja viesti.',
        en: 'Please provide name, email and message.',
        se: 'Ange namn, e-post och meddelande.'
      },
      nameRequired: {
        fi: 'Nimi on pakollinen ja voi sisältää vain kirjaimia',
        en: 'Name is required and can only contain letters',
        se: 'Namn krävs och kan bara innehålla bokstäver'
      },
      emailInvalid: {
        fi: 'Anna kelvollinen sähköpostiosoite',
        en: 'Please enter a valid email address',
        se: 'Ange en giltig e-postadress'
      },
      messageLength: {
        fi: 'Viestin tulee olla vähintään 10 merkkiä pitkä',
        en: 'Message must be at least 10 characters long',
        se: 'Meddelandet måste vara minst 10 tecken långt'
      }
    },
    sending: {
      fi: 'Lähetetään viestiä...',
      en: 'Sending message...',
      se: 'Skickar meddelande...'
    },
    success: {
      fi: 'Viesti lähetetty onnistuneesti!',
      en: 'Message sent successfully!',
      se: 'Meddelandet har skickats!'
    },
    error: {
      fi: 'Viestiä ei voitu lähettää. Yritä myöhemmin uudelleen.',
      en: 'Message could not be sent. Please try again later.',
      se: 'Meddelandet kunde inte skickas. Försök igen senare.'
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
      Nu arbetar han i London som Cloud Architect på Cloudreach.
      Forsbergs specialkompetens ligger inom områdena AWS-molntjänster
      och PCI DSS -säkerhetsplanering.`
  },
  'ws-info': {
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
  },
  references: {
    title: {
      fi: 'Referenssit',
      en: 'References',
      se: 'Referenser'
    }
  },
  webService: {
    title: {
      fi: 'Yrityksen pankkiyhteys eli Web Service',
      en: 'Company Bank Connection - Web Service',
      se: 'Företagets bankförbindelse - Web Service'
    },
    wsChannel: {
      title: {
        fi: 'ISECure WS-Kanava',
        en: 'ISECure WS-Channel',
        se: 'ISECure WS-Kanal'
      },
      subtitle: {
        fi: 'WS-KANAVA SUORAAN PILVIPALVELUNA YRITYKSILLE',
        en: 'WS-CHANNEL DIRECTLY AS A CLOUD SERVICE FOR COMPANIES',
        se: 'WS-KANAL DIREKT SOM MOLNTJÄNST FÖR FÖRETAG'
      },
      description: {
        fi: 'Tarjoamme testatun ja verifioidun koodin täydellä lisenssillä kehitys- ja asiakastarpeisiinne.',
        en: 'We offer tested and verified code with full license for your development and customer needs.',
        se: 'Vi erbjuder testad och verifierad kod med full licens för dina utvecklings- och kundbehov.'
      },
      quote: {
        fi: 'ISECuren WS-kanavalla voi esimerkiksi ladata automaattisesti konekieliset tiliotteet ja viitesiirrot ja yhdistää ne korkealaatuisen JavaScript-kirjaston kanssa interaktiivisten statistiikkojen luomiseksi.',
        en: 'With ISECure\'s WS-channel, you can automatically download machine-readable account statements and reference transfers and combine them with a high-quality JavaScript library to create interactive statistics.',
        se: 'Med ISECures WS-kanal kan du automatiskt ladda ner maskinläsbara kontoutdrag och referensöverföringar och kombinera dem med ett högkvalitativt JavaScript-bibliotek för att skapa interaktiv statistik.'
      },
      details: {
        fi: 'ISECuren WS-Kanava sisältää WebService-pankkiyhteysohjelmisto SDK:n usealle pankille: Nordea, DanskeBank, Osuuspankki, S-Pankki/LähiTapiola, Ålandsbanken, Samlink -pankit: Handelsbanken, Aktia, POP, Säästöpankki. Tuemme sekä APP- että PKI-puolta (mm. sertifikaatin haku PIN -koodilla ja uusinta). WS-kanava on ollut tuotannossa yli 10 vuotta ja on käytössä useilla asiakkailla.',
        en: 'ISECure\'s WS-Channel includes WebService banking software SDK for multiple banks: Nordea, DanskeBank, OP Bank, S-Bank/LähiTapiola, Ålandsbanken, Samlink banks: Handelsbanken, Aktia, POP, Savings Bank. We support both APP and PKI sides (including certificate retrieval with PIN code and renewal). The WS-channel has been in production for over 10 years and is used by multiple customers.',
        se: 'ISECures WS-Kanal inkluderar WebService bankprogramvaru-SDK för flera banker: Nordea, DanskeBank, OP Bank, S-Bank/LähiTapiola, Ålandsbanken, Samlink banker: Handelsbanken, Aktia, POP, Sparbanken. Vi stöder både APP- och PKI-sidor (inklusive certifikathämtning med PIN-kod och förnyelse). WS-kanalen har varit i produktion i över 10 år och används av flera kunder.'
      },
      saas: {
        fi: 'Voit ostaa WS-kanavan suoraan palveluna Hosting -paketilla (SaaS) valitsemillesi tai kaikille pankeille.',
        en: 'You can purchase the WS-channel directly as a service with a Hosting package (SaaS) for your selected banks or all banks.',
        se: 'Du kan köpa WS-kanalen direkt som en tjänst med ett Hosting-paket (SaaS) för dina valda banker eller alla banker.'
      },
      api: {
        title: {
          fi: 'WS-Kanava API - Turvalliset Pankkiintegraatioratkaisut | Pohjoismaiset Pankit',
          en: 'WS-Channel API - Secure Bank Integration Solutions | Nordic Banks',
          se: 'WS-Kanal API - Säkra Banktintegrationslösningar | Nordiska Banker'
        }
      }
    },
    description: {
      fi: 'Web Service -kanava on pankkien tarjoama yritysasiakkaille suunnattu pankkiyhteys, joka mahdollistaa pankkiaineistojen automaattisen lähetyksen ja noudon. Web Service -kanava on korvannut vanhan eräsiirtopalvelun (PATU). Web Service -kanava on standardoitu ja se perustuu kansainvälisiin XML-standardeihin.',
      en: 'The Web Service channel is a bank connection offered by banks for corporate customers, enabling automatic transmission and retrieval of banking materials. The Web Service channel has replaced the old batch transfer service (PATU). The Web Service channel is standardized and based on international XML standards.',
      se: 'Web Service-kanalen är en bankförbindelse som erbjuds av banker för företagskunder, vilket möjliggör automatisk överföring och hämtning av bankmaterial. Web Service-kanalen har ersatt den gamla batch-överföringstjänsten (PATU). Web Service-kanalen är standardiserad och baserad på internationella XML-standarder.'
    },
    security: {
      fi: 'Web Service -kanava on tietoturvallinen ja luotettava tapa hoitaa yrityksen maksuliikenne. Yhteys pankkiin muodostetaan aina SSL-suojattuna ja aineistot allekirjoitetaan digitaalisesti PKI-varmenteella.',
      en: 'The Web Service channel is a secure and reliable way to handle company payment traffic. The connection to the bank is always SSL-protected and materials are digitally signed with a PKI certificate.',
      se: 'Web Service-kanalen är ett säkert och pålitligt sätt att hantera företagets betalningstrafik. Anslutningen till banken är alltid SSL-skyddad och material signeras digitalt med ett PKI-certifikat.'
    },
    banks: {
      fi: 'Tuetut pankit',
      en: 'Supported Banks',
      se: 'Stödda banker'
    }
  }
};

export const defaultLang: Lang = 'fi';

export function getStoredLang(): Lang {
  if (typeof window === 'undefined') {
    return defaultLang;
  }
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as Lang;
    if (urlLang && ['fi', 'en', 'se'].includes(urlLang)) {
      try {
        window.localStorage.setItem('preferred-lang', urlLang);
      } catch (e) {
        console.warn('Failed to set localStorage:', e);
      }
      return urlLang;
    }
    
    try {
      const stored = window.localStorage.getItem('preferred-lang') as Lang;
      if (stored && ['fi', 'en', 'se'].includes(stored)) {
        return stored;
      }
    } catch (e) {
      console.warn('Failed to get localStorage:', e);
    }
  } catch (e) {
    console.warn('Error accessing window:', e);
  }
  
  return defaultLang;
}

export function setStoredLang(lang: Lang): void {
  if (!lang) {
    return;
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('preferred-lang', lang);
    } catch (e) {
      console.warn('Failed to set localStorage:', e);
    }
  }
}

export function getText(key: string, lang: Lang = getStoredLang()): string | Record<string, string> {
  const keys = key.split('.');
  let result: unknown = translations;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  return result[lang] || result[defaultLang] || key;
}
