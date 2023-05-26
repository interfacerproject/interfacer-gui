import { Page, Route, test as baseTest } from "@playwright/test";

type CalledWith = Record<string, unknown>;

export async function interceptGQL(
  page: Page,
  operationName: string,
  onResp?: (route: Route, request: Request) => void,
  resp?: CalledWith
): Promise<CalledWith[]> {
  const reqs: CalledWith[] = [];
  await page.route("**/api", function (route: Route) {
    const req = route.request().postDataJSON();
    if (req.operationName !== operationName) return route.continue();
    reqs.push(req.variables);
    onResp && onResp(route, req);
    if (resp) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: resp }),
      });
    }
    route.continue();
  });
  return reqs;
}

const storageObject = {
  ethereumPrivateKey: process.env.ETHEREUMPRIVATEKEY,
  authName: process.env.AUTHNAME,
  authId: process.env.AUTHID,
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
  answer1: process.env.ANSWER1,
  answer2: process.env.ANSWER2,
  answer3: process.env.ANSWER3,
  invitationKey: process.env.NEXT_PUBLIC_INVITATION_KEY,
};
type StorageObjectKeys = keyof typeof storageObject;

async function login(page: Page) {
  await page.goto("");
  await page.evaluate(storageObject => {
    Object.keys(storageObject).forEach(key => {
      localStorage.setItem(key, storageObject[key as StorageObjectKeys]!);
    });
  }, storageObject);
}

async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

const randomCity = () => {
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

const envVariables = {
  ...process.env,
};

const random = {
  randomString(length: number) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; ++i) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  randomEmail() {
    return `${this.randomString(10)}@${this.randomString(10)}.com`;
  },
  randomCity,
};

export type EnvVariables = typeof envVariables;

export const test = baseTest.extend<{
  interceptGQL: typeof interceptGQL;
  authVariables: typeof storageObject;
  login: typeof login;
  logout: typeof logout;
  random: typeof random;
  envVariables: EnvVariables;
}>({
  interceptGQL: async ({ browser }, use) => {
    await use(interceptGQL);
  },
  authVariables: async ({ browser }, use) => {
    await use(storageObject);
  },
  login: async ({ page }, use) => {
    await use(login);
  },
  logout: async ({ page }, use) => {
    await use(logout);
  },
  random: async ({ page }, use) => {
    await use(random);
  },
  envVariables: async ({ page }, use) => {
    await use(envVariables);
  },
});
