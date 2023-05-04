// import { InterceptedRequest } from 'playwright/types/protocol';
import { Route, type Page } from "@playwright/test";

const storageObject = {
  ethereumPrivateKey: "35394f33359a391dc177df909cfaa68ae9c206ef5bbb8d2a501edd07bc36a52c",
  authName: "pippo",
  authUsername: "pippo",
  bitcoinPrivateKey: "KwQTBaMFje9BairZM7r1irxDQ4dPvbcwuQNw4H3Mcdsk82cHuXev",
  ecdhPublicKey: "NtHMQN8seboQtfPPpGzQyFCxX1cXJwaR9bTKrxEaAfdFfJ32TNa3sniy6fje6UjmNoKMvHQymeWLVA6Rsdmqy5Ba",
  seed: "skin buyer sunset person run push elevator under debris soft surge man",
  authEmail: "pippo@dyne.org",
  reflowPrivateKey: "m0TjAQtJs7/+mJiyk/S3PvN8lyOwZEcYFjUm0oSl0is=",
  ecdhPrivateKey: "Yi69UJBXfwVWq7qXXOj3YI+ix5WhJC+DDPYAi7FqyEs=",
  eddsaPublicKey: "2S8qn196efFgyrC1dYms6UkkhCnweYM6DJhLgd3kuPEm",
  reflowPublicKey:
    "2LexKLUQez348DGPQi3cWHZ1HQbepnnxoV5dTArz1RzyimgUm1Z6zY7n4V9ttdzDbP6vDEuznbDFB489gjcMdTzNiKziCDY42Md4ezTAqiaRzoChGmC4oRtox8apUpCgmSQd4o1z6JyJ74kgAQHsPq6hxBF3ooScsehtwQTdd231gSTTmXkcBToQx1u2GTj3VTKfdMdAtYFKUv4KunhM6goiJifoJUNsjjKS74HFLEv4YhkuenBptu8pmawccJz9PoYmYK",
  bitcoinPublicKey: "cAb9KBaR42zf4z6F6fZwUBUesJvZMEnhNxMek52nQJJW",
  ethereumAddress: "6b252998de193cfc303066ac518488c11869723d",
  eddsaPrivateKey: "5iNX7QCGKXXF2Lrvxk2p6C3miUd5d8jm8rDg77nGLUv",
  HMAC: "HsF2xuY/lM3xftrR3dKaJ1lC6YDnDjbwzknX0qRV6D0=",
};

type StorageObjectKeys = keyof typeof storageObject;

export async function login(page: Page) {
  await page.goto("");
  await page.evaluate(storageObject => {
    Object.keys(storageObject).forEach(key => {
      localStorage.setItem(key, storageObject[key as StorageObjectKeys]);
    });
  }, storageObject);
}

export async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}
export function randomString(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; ++i) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const randomCity = () => {
  const cities = [
    "Rome",
    "Milan",
    "Naples",
    "Turin",
    "Palermo",
    "Genoa",
    "Bologna",
    "Florence",
    "Catania",
    "Bari",
    "Paris",
    "Toulouse",
    "Lyon",
    "Marseille",
    "Nice",
    "Nantes",
    "Montpellier",
    "Strasbourg",
    "Bordeaux",
    "Lille",
    "Berlin",
    "Hamburg",
    "Munich",
    "Cologne",
    "Frankfurt",
    "Stuttgart",
    "Düsseldorf",
    "Dortmund",
    "Essen",
    "Leipzig",
    "Bremen",
    "Madrid",
    "Barcelona",
    "Valencia",
    "Seville",
    "Zaragoza",
    "Málaga",
    "Murcia",
    "Palma",
    "Las Palmas",
    "Bilbao",
    "Alicante",
    "Córdoba",
    "Valladolid",
    "London",
    "Birmingham",
    "Glasgow",
    "Leeds",
    "Sheffield",
    "Edinburgh",
    "Liverpool",
    "Manchester",
    "Bristol",
    "Wakefield",
    "Cardiff",
    "Coventry",
    "Nottingham",
    "Leicester",
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Philadelphia",
    "Phoenix",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
    "Austin",
    "Jacksonville",
    "San Francisco",
    "Indianapolis",
    "Columbus",
    "Fort Worth",
    "Charlotte",
    "Detroit",
    "El Paso",
    "Seattle",
    "Denver",
    "Washington",
    "Boston",
    "Memphis",
    "Nashville",
    "Portland",
    "Oklahoma City",
    "Las Vegas",
    "Baltimore",
    "Louisville",
    "Milwaukee",
    "Albuquerque",
    "Tucson",
    "Fresno",
    "Sacramento",
    "Long Beach",
    "Kansas City",
    "Mesa",
    "Atlanta",
    "Virginia Beach",
    "Omaha",
    "Colorado Springs",
    "Raleigh",
    "Miami",
    "Oakland",
    "Minneapolis",
    "Tulsa",
    "Cleveland",
    "Wichita",
    "Arlington",
    "New Orleans",
    "Bakersfield",
    "Tampa",
    "Honolulu",
    "Aurora",
    "Anaheim",
    "Santa Ana",
    "St. Louis",
    "Riverside",
    "Corpus Christi",
    "Pittsburgh",
    "Anchorage",
    "Stockton",
    "Cincinnati",
    "St. Paul",
    "Toledo",
    "Greensboro",
    "Newark",
    "Plano",
    "Henderson",
    "Lincoln",
    "Orlando",
    "Chula Vista",
    "Irvine",
    "Fort Wayne",
  ];
  return cities[Math.floor(Math.random() * cities.length)];
};

type CalledWith = Record<string, unknown>;

export async function interceptGQL(
  page: Page,
  operationName: string
  // resp: Record<string, unknown>
): Promise<void> {
  await page.route("**/api", function (route: Route) {
    const req = route.request().postDataJSON();
    if (req.operationName !== operationName) {
      return route.fallback();
    }
    req.waitForResponse();
  });
}
