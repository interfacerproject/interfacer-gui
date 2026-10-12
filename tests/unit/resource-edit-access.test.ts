// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import Module, { createRequire } from "node:module";
import fs from "node:fs";
import { translateCommon } from "../../lib/errorFormatter";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
let access: any, primary: string, pushes: string[], draft: (v: string) => void;
const router = {
  asPath: "/project/resource/edit",
  push: (url: string) => {
    pushes.push(url);
  },
  replace: (url: string) => {
    pushes.push(url);
  },
};
const native = ({ children }: any) => React.createElement("div", null, children);
const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => any },
  original = loader._load;
loader._load = function (name, ...args) {
  if (name === "./FetchProjectLayout" || name === "components/layout/FetchProjectLayout")
    return {
      useProject: () => ({
        project: {
          id: "resource",
          conformsTo: { name: "Design" },
          primaryAccountable: { id: primary },
          metadata: { contributors: ["alice"] },
        },
        isOwner: primary === "alice",
        editAccess: access,
      }),
    };
  if (name === "hooks/useAuth") return { useAuth: () => ({ user: { ulid: "alice" } }) };
  if (name === "@bbtgnn/polaris-interfacer")
    return {
      Link: native,
      Spinner: () => null,
      Banner: native,
      Text: native,
      Button: ({ children }: any) => React.createElement("button", null, children),
    };
  if (name === "components/FullWidthBanner" || name === "next/link") return { __esModule: true, default: native };
  if (name === "components/types") return require("../../components/types");
  if (name === "components/partials/project/projectSections") return { isEditRouteAllowed: () => true };
  if (name === "next-i18next") return { useTranslation: () => ({ t: (k: string) => k }) };
  if (name === "next/router") return { useRouter: () => router };
  if (name === "lib/errorFormatter") return require("../../lib/errorFormatter");
  return original.call(this, name, ...args);
};
const Layout = require("../../components/layout/EditProjectLayout").default;
const EditBanner = require("../../components/partials/project/[id]/EditBanner").default;
loader._load = original;
function Form() {
  const [value, setValue] = React.useState("original");
  draft = setValue;
  return React.createElement("input", { value, readOnly: true });
}
async function render(run: (renderer: ReactTestRenderer, update: () => Promise<void>) => Promise<void>) {
  access = { status: "controller", refetch: async () => {} };
  primary = "alice";
  pushes = [];
  let renderer!: ReactTestRenderer;
  const app = () => React.createElement(Layout, null, React.createElement(Form));
  const update = async () => {
    await act(async () => {
      renderer.update(app());
    });
  };
  try {
    await act(async () => {
      renderer = create(app());
    });
    await run(renderer, update);
  } finally {
    await act(async () => {
      renderer?.unmount();
    });
  }
}
test("controller can enter edit even when someone else is accountable", async () =>
  render(async (r, update) => {
    primary = "bob";
    await update();
    assert.equal(r.root.findAllByType("input").length, 1);
    assert.deepEqual(pushes, []);
  }));
test("accountable/contributor is not an editing grant", async () =>
  render(async (r, update) => {
    access = { ...access, status: "read-only" };
    await update();
    const fields = r.root.findAllByType("fieldset");
    assert.equal(fields.length, 1);
    assert.equal(fields[0].props.disabled, true);
    assert.deepEqual(pushes, []);
  }));
for (const status of ["loading", "read-only", "unassigned", "organization", "error"]) {
  test("draft survives access change to " + status + " without redirects or unmount", async () =>
    render(async (r, update) => {
      await act(async () => {
        draft("unsent draft");
      });
      access = { ...access, status };
      await update();
      assert.equal(r.root.findByType("input").props.value, "unsent draft");
      const fields = r.root.findAllByType("fieldset");
      assert.equal(fields.length, 1);
      assert.equal(fields[0].props.disabled, true);
      assert.deepEqual(pushes, []);
    })
  );
}
const i18next = createRequire(require.resolve("next-i18next"))("i18next");
for (const locale of ["en", "it", "de", "fr"]) {
  test(locale + " access states resolve under the real flat-key i18n config", async () => {
    const translations = JSON.parse(
      fs.readFileSync(__dirname + "/../../public/locales/" + locale + "/common.json", "utf8")
    );
    const instance = i18next.createInstance();
    await instance.init({
      lng: locale,
      ns: ["common"],
      defaultNS: "common",
      nsSeparator: false,
      keySeparator: false,
      resources: { [locale]: { common: translations } },
    });
    for (const key of ["controller", "loading", "read-only", "unassigned", "organization", "error", "checkAgain"]) {
      assert.equal(
        translateCommon(instance.t.bind(instance), "resourceAccess." + key),
        translations.resourceAccess[key]
      );
      assert.ok(translations.resourceAccess[key].length > 8);
    }
  });
}

test("edit banner uses control, not the owner flag", async () => {
  primary = "alice";
  access = { status: "read-only" };
  let r!: ReactTestRenderer;
  try {
    await act(async () => {
      r = create(React.createElement(EditBanner));
    });
    assert.equal(r.root.findAllByType("button").length, 0);
    primary = "bob";
    access = { status: "controller" };
    await act(async () => {
      r.update(React.createElement(EditBanner));
    });
    assert.equal(r.root.findAllByType("button").length, 1);
  } finally {
    await act(async () => {
      r?.unmount();
    });
  }
});
