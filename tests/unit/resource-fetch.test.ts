import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import Module from "node:module";
import { GraphQLRequestError } from "@dyne/interfacer-client";
let pushes: string[] = [],
  result: any;
const router = {
  query: { id: "resource" },
  replace: (url: string) => {
    pushes.push(url);
  },
};
const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => any },
  original = loader._load;
loader._load = function (name, ...args) {
  if (name === "lib/apollo-compat")
    return { useQuery: () => ({ ...result, startPolling() {}, refetch: async () => {} }) };
  if (name === "hooks/useResourceControl") return { useResourceControl: () => ({ status: "controller" }) };
  if (name === "next/router") return { useRouter: () => router };
  if (name === "next-i18next") return { useTranslation: () => ({ t: (key: string) => key }) };
  if (name === "@bbtgnn/polaris-interfacer")
    return {
      Spinner: () => null,
      Banner: ({ children }: any) => React.createElement("section", { role: "alert" }, children),
    };
  if (name === "lib/errorFormatter") return require("../../lib/errorFormatter");
  return original.call(this, name, ...args);
};
const Layout = require("../../components/layout/FetchProjectLayout").default;
loader._load = original;
async function render(run: (r: ReactTestRenderer) => Promise<void>) {
  let r!: ReactTestRenderer;
  pushes = [];
  try {
    await act(async () => {
      r = create(React.createElement(Layout, null, React.createElement("input", { id: "child" })));
    });
    await run(r);
  } finally {
    await act(async () => {
      r?.unmount();
    });
  }
}
test("denied resource read is not reported as not-found or rendered as an undefined project", async () => {
  result = {
    loading: false,
    error: new GraphQLRequestError([{ message: "private detail", extensions: { code: "FORBIDDEN" } }]),
  };
  await render(async r => {
    assert.deepEqual(pushes, []);
    assert.equal(r.root.findAllByProps({ role: "alert" }).length, 1);
    assert.equal(r.root.findAllByProps({ id: "child" }).length, 0);
    assert.ok(!JSON.stringify(r.toJSON()).includes("private detail"));
  });
});
test("genuine missing resource redirects only after loading, without rendering children", async () => {
  result = { loading: false, data: { economicResource: null } };
  await render(async r => {
    assert.deepEqual(pushes, ["/404"]);
    assert.equal(r.root.findAllByProps({ id: "child" }).length, 0);
  });
});
test("a project snapshot for another route cannot render the editor", async () => {
  result = { loading: false, data: { economicResource: { id: "other" } } };
  await render(async r => {
    assert.equal(r.root.findAllByProps({ id: "child" }).length, 0);
  });
});
