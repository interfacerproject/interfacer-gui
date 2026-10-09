// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { useForm, UseFormReturn } from "react-hook-form";
import Module from "node:module";
import { GraphQLRequestError } from "@dyne/interfacer-client";

let reloads = 0;
let pushes = 0;
const router = {
  asPath: "/project/fixture/edit",
  reload: () => {
    reloads++;
  },
  push: () => {
    pushes++;
  },
  events: { on() {}, off() {}, emit() {} },
};
const t = (key: string) => key;
const loader = Module as unknown as { _load: (name: string, ...args: unknown[]) => unknown };
const originalLoad = loader._load;
loader._load = function (name, ...args) {
  if (name === "@bbtgnn/polaris-interfacer")
    return { Banner: ({ children }: any) => React.createElement("section", null, children) };
  if (name === "next/router") return { useRouter: () => router };
  if (name === "next-i18next") return { useTranslation: () => ({ t }) };
  if (name === "components/LoadingOverlay")
    return { __esModule: true, default: () => React.createElement("div", { "data-loading": true }) };
  if (name === "components/partials/create/FormShell")
    return { FormColumns: ({ children }: any) => React.createElement("div", null, children) };
  if (name === "components/partials/create/project/CreateProjectForm")
    return { ProjectTypeContext: React.createContext(null) };
  if (name === "./EditProjectNav") return { __esModule: true, default: () => null };
  if (name === "./SubmitChangesBar") return require("../../components/partials/project/edit/SubmitChangesBar");
  if (name === "lib/errorFormatter") return require("../../lib/errorFormatter");
  return originalLoad.call(this, name, ...args);
};
const EditFormLayout = require("../../components/partials/project/edit/EditFormLayout")
  .default as typeof import("../../components/partials/project/edit/EditFormLayout").default;
loader._load = originalLoad;
// createElement supplies children as its third argument; React 18 typings
// otherwise require the same children redundantly in the props object.
const Layout = EditFormLayout as React.ComponentType<{
  formMethods: UseFormReturn<{ title: string }>;
  onSubmit: () => Promise<void>;
  children?: React.ReactNode;
}>;

test("denied save retains the draft, shows an error and does not mark RHF submission successful or navigate", async () => {
  (globalThis as any).window = { addEventListener() {}, removeEventListener() {}, confirm: () => false };
  reloads = pushes = 0;
  let renderer!: ReactTestRenderer;

  let form!: UseFormReturn<{ title: string }>;
  let failure: Error | undefined = new GraphQLRequestError([
    { message: "forbidden", extensions: { code: "FORBIDDEN" } },
  ]);
  function Harness() {
    form = useForm({ defaultValues: { title: "Original" } });
    return React.createElement(
      Layout,
      {
        formMethods: form,
        onSubmit: async () => {
          if (failure) throw failure;
        },
      },
      React.createElement("input", { ...form.register("title") })
    );
  }
  try {
    await act(async () => {
      renderer = create(React.createElement(Harness));
    });
    await act(async () => {
      form.setValue("title", "Unsent draft", { shouldDirty: true });
      await form.trigger();
    });
    const submit = () => renderer.root.findByType("form").props.onSubmit({ preventDefault() {}, persist() {} });
    await act(async () => {
      await submit();
    });
    assert.equal(form.getValues("title"), "Unsent draft");
    assert.equal(form.formState.isSubmitSuccessful, false);
    assert.equal(form.formState.isDirty, true);
    assert.equal(reloads + pushes, 0);
    assert.equal(renderer.root.findAllByProps({ "data-loading": true }).length, 0);
    assert.equal(renderer.root.findAllByProps({ role: "alert" }).length, 1);
    assert.equal(
      renderer.root.findByProps({ type: "submit" }).props.disabled,
      false,
      "a failed request must not disable retry for an unchanged valid draft"
    );
    failure = undefined;
    await act(async () => {
      await submit();
    });
    assert.equal(form.formState.isSubmitSuccessful, true);
    assert.equal(renderer.root.findAllByProps({ role: "alert" }).length, 0);
    assert.equal(reloads, 1);
  } finally {
    await act(async () => {
      renderer?.unmount();
    });
    delete (globalThis as any).window;
  }
});
