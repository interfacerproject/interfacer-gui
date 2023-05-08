// import { InterceptedRequest } from 'playwright/types/protocol';
import { Route, type Page } from "@playwright/test";

export const storageObject = {
  ethereumPrivateKey: process.env.ETHEREUMPRIVATEKEY,
  authName: process.env.AUTHNAME,
  authUsername: process.env.AUTHUSERNAME,
  bitcoinPrivateKey: process.env.BITCOINPRIVATEKEY,
  ecdhPublicKey: process.env.ECDHPUBLICKEY,
  seed: process.env.SEED,
  authEmail: process.env.AUTHEMAIL,
  reflowPrivateKey: process.env.REFLOWPRIVATEKEY,
  ecdhPrivateKey: process.env.ECDHPRIVATEKEY,
  eddsaPublicKey: process.env.EDDSAPUBLICKEY,
  reflowPublicKey: process.env.REFLOWPUBLICKEY,
  bitcoinPublicKey: process.env.BITCOINPUBLICKEY,
  ethereumAddress: process.env.ETHEREUMADDRESS,
  eddsaPrivateKey: process.env.EDDSAPRIVATEKEY,
  HMAC: process.env.HMAC,
};

type StorageObjectKeys = keyof typeof storageObject;

export async function login(page: Page) {
  await page.goto("");
  await page.evaluate(storageObject => {
    Object.keys(storageObject).forEach(key => {
      localStorage.setItem(key, storageObject[key as StorageObjectKeys]!);
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
    "Roma",
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
