// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import Module, { createRequire } from "node:module";
import { GraphQLRequestError } from "@dyne/interfacer-client";

for (const locale of ["en", "it", "de", "fr"]) {
  test(locale + " has import recovery translations", () => {
    const copy = JSON.parse(readFileSync("public/locales/" + locale + "/common.json", "utf8")).claimFlow;
    for (const key of ["unavailable", "detailsIncomplete", "openImportedProject"]) {
      assert.ok(typeof copy?.[key] === "string" && copy[key].trim());
    }
  });
}

const project = {
  id: "import-source",
  name: "Synthetic design",
  metadata: { license: "MIT", repo: "https://example.invalid/design" },
  onhandQuantity: { hasUnit: { id: "unit-one" } },
};
let loshId = "synthetic-losh-agent";
let translate: (key: string, options?: any) => string = key => key;
let user: { ulid: string } | undefined = { ulid: "alice" };
let writeError: Error | undefined;
let detailsError: Error | undefined;
let gate: Promise<void> | undefined;
let missingResult = false;
let variables: any[] = [];
let steps: string[] = [];
const transfer = async (options: any) => {
  variables.push(options.variables);
  if (gate) await gate;
  if (writeError) throw writeError;
  return {
    data: missingResult
      ? {}
      : { createEconomicEvent: { economicEvent: { toResourceInventoriedAs: { id: "imported-project" } } } },
  };
};
const router = {
  replace: async (url: string) => {
    steps.push("navigate:" + url);
  },
};
const client = {
  config: {
    get loshId() {
      return loshId;
    },
  },
};
const native = ({ children }: any) => React.createElement("div", null, children);
const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => unknown };
const originalLoad = loader._load;
loader._load = function (name, ...args) {
  if (name === "lib/apollo-compat") return { useMutation: () => [transfer, {}] };
  if (name === "@bbtgnn/polaris-interfacer")
    return {
      Banner: native,
      Stack: native,
      Text: native,
      Button: ({ children, submit, primary, loading, ...props }: any) =>
        React.createElement(
          "button",
          { ...props, type: submit ? "submit" : "button", "data-loading": loading },
          children
        ),
    };
  if (name === "components/layout/FetchProjectLayout")
    return { __esModule: true, default: native, useProject: () => ({ project }) };
  if (name === "hooks/useAuth") return { useAuth: () => ({ user, client }) };
  if (name === "hooks/useProjectCRUD")
    return {
      useProjectCRUD: () => ({
        updateContributors: async () => {
          steps.push("contributors");
          if (detailsError) throw detailsError;
        },
        updateRelations: async () => {
          steps.push("relations");
        },
      }),
    };
  if (name === "next/router") return { useRouter: () => router };
  if (name === "next/link")
    return { __esModule: true, default: ({ children }: any) => React.createElement("div", null, children) };
  if (name === "next-i18next") return { useTranslation: () => ({ t: translate }) };
  if (name === "next-i18next/serverSideTranslations") return { serverSideTranslations: async () => ({}) };
  if (name === "lib/QueryAndMutation") return { TRANSFER_PROJECT: "TRANSFER_PROJECT" };
  if (name === "lib/devLog") return { __esModule: true, default: () => {} };
  if (name === "lib/errorFormatter") return require("../../lib/errorFormatter");
  if (name === "lib/formSetValueOptions") return { formSetValueOptions: {} };
  if (name === "lib/isFieldRequired") return { isRequired: () => false };
  if (name === "lib/tagging") return { normalizeUserTagsForSave: (tags: string[]) => tags };
  if (name.startsWith("components/")) return { __esModule: true, default: native };
  return originalLoad.call(this, name, ...args);
};
const Claim = require("../../pages/resource/[id]/claim").default as React.ComponentType;
loader._load = originalLoad;

async function render(run: (renderer: ReactTestRenderer, submit: () => Promise<void>) => Promise<void>) {
  variables = [];
  steps = [];
  translate = key => key;
  loshId = "synthetic-losh-agent";
  user = { ulid: "alice" };
  writeError = detailsError = undefined;
  gate = undefined;
  missingResult = false;
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(React.createElement(Claim));
  });
  const submit = () => renderer.root.findByType("form").props.onSubmit({ preventDefault() {}, persist() {} });
  try {
    await run(renderer, submit);
  } finally {
    await act(async () => {
      renderer.unmount();
    });
  }
}

const i18next = createRequire(require.resolve("next-i18next"))("i18next");
const localeConfig = require("../../next-i18next.config");
for (const locale of ["en", "it", "de", "fr"]) {
  test(locale + " claim page displays real localized recovery copy under flat-key configuration", async () => {
    const common = JSON.parse(readFileSync("public/locales/" + locale + "/common.json", "utf8"));
    const i18n = i18next.createInstance();
    await i18n.init({
      ...localeConfig,
      lng: locale,
      defaultNS: "ResourceProps",
      resources: { [locale]: { common, ResourceProps: {} } },
      initImmediate: false,
    });
    await render(async (renderer, submit) => {
      translate = i18n.t.bind(i18n);
      loshId = "";
      await act(async () => {
        renderer.update(React.createElement(Claim));
      });
      await act(async () => {
        await submit();
      });
      assert.equal(renderer.root.findByProps({ role: "alert" }).props.children, common.claimFlow.unavailable);
    });
  });
}

test("claim sends configured LOSH agent and signed-in receiver, then updates details and navigates", async () => {
  await render(async (_renderer, submit) => {
    await act(async () => {
      await submit();
    });
    assert.equal(variables.length, 1);
    assert.equal(variables[0].loshId, "synthetic-losh-agent");
    assert.equal(variables[0].agent, "alice");
    assert.equal(variables[0].resource, "import-source");
    assert.deepEqual(steps, ["contributors", "relations", "navigate:/project/imported-project"]);
  });
});
for (const reason of ["missing LOSH", "missing session"]) {
  test(reason + " blocks the claim before any mutation or follow-up", async () => {
    await render(async (renderer, submit) => {
      if (reason === "missing LOSH") loshId = "";
      else user = undefined;
      await act(async () => {
        renderer.update(React.createElement(Claim));
      });
      await act(async () => {
        await submit();
      });
      assert.equal(variables.length, 0);
      assert.deepEqual(steps, []);
      assert.equal(renderer.root.findAllByProps({ role: "alert" }).length, 1);
    });
  });
}
test("denied claim shows structured localized error, halts all details writes and keeps the form", async () => {
  await render(async (renderer, submit) => {
    writeError = new GraphQLRequestError([{ message: "raw denial", extensions: { code: "FORBIDDEN" } }]);
    await act(async () => {
      await submit();
    });
    assert.deepEqual(steps, []);
    assert.equal(renderer.root.findAllByType("form").length, 1);
    const alert = renderer.root.findByProps({ role: "alert" });
    assert.equal(alert.props.children, "common:requestErrors.permissionDenied");
    assert.equal(renderer.root.findByProps({ type: "submit" }).props.disabled, false);
  });
});
test("known successful import is never repeated when a subsequent details write fails", async () => {
  await render(async (renderer, submit) => {
    detailsError = new GraphQLRequestError([{ message: "denied details", extensions: { code: "FORBIDDEN" } }]);
    await act(async () => {
      await submit();
    });
    assert.deepEqual(steps, ["contributors"]);
    await act(async () => {
      await submit();
    });
    assert.equal(variables.length, 1);
    assert.equal(renderer.root.findByProps({ type: "submit" }).props.disabled, true);
    assert.ok(renderer.root.findAllByProps({ href: "/project/imported-project" }).length > 0);
    assert.equal(renderer.root.findByProps({ role: "alert" }).props.children, "common:claimFlow.detailsIncomplete");
  });
});
test("double submission only sends a single transfer", async () => {
  await render(async (_renderer, submit) => {
    let resolve!: () => void;
    gate = new Promise<void>(done => {
      resolve = done;
    });
    await act(async () => {
      const first = submit();
      const second = submit();
      await Promise.resolve();
      await Promise.resolve();
      resolve();
      await Promise.all([first, second]);
    });
    assert.equal(variables.length, 1);
  });
});
test("malformed success response does not run details writes or navigate", async () => {
  await render(async (renderer, submit) => {
    missingResult = true;
    await act(async () => {
      await submit();
    });
    assert.deepEqual(steps, []);
    assert.equal(renderer.root.findByProps({ role: "alert" }).props.children, "common:requestErrors.invalidResponse");
  });
});
