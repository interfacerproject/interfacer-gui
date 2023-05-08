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

export const test = baseTest.extend<{ interceptGQL: typeof interceptGQL }>({
  interceptGQL: async ({ browser }, use) => {
    await use(interceptGQL);
  },
});
