// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// LOCAL DEV ONLY. Seeds the marketplace with a presentable showcase, through
// the same signed paths people use: each invented person is registered in
// Zenflows, creates their own projects (with description, licence, place and a
// drawing), then Medusa receives their signed catalog registrations, build
// listings and units on sale. Writes the people's keys to a local file so you
// can sign in as them; never commit that file.
//
//   pnpm market:showcase           (GUI on :3002, live Medusa on :9000, Zenflows on :8000)
//
// Env: MARKET_SHOWCASE_ZENFLOWS_ADMIN (required; the Zenflows ADMIN_KEY),
// MARKET_SHOWCASE_ZENFLOWS (default http://127.0.0.1:8000/api),
// MARKET_SHOWCASE_GUI (default http://localhost:3002),
// MARKET_SHOWCASE_OUT (default ../interfacer-medusa/.tmp/showcase-actors.json),
// MARKET_SHOWCASE_FORCE=1 to seed again although the output file exists.

import { createHash, generateKeyPairSync, randomBytes, sign, type KeyObject } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { signGraphQLRequest } from "@dyne/interfacer-client";
import { canonicalOperation } from "../../lib/market/wallet";
import { DESIGNS, PEOPLE, PRODUCTS, SERVICES, type ShowcasePerson } from "./catalog";
import { plate } from "./drawings";

const ZENFLOWS = process.env.MARKET_SHOWCASE_ZENFLOWS || "http://127.0.0.1:8000/api";
const GUI = process.env.MARKET_SHOWCASE_GUI || "http://localhost:3002";
const ADMIN = process.env.MARKET_SHOWCASE_ZENFLOWS_ADMIN || "";
const OUT = resolve(process.env.MARKET_SHOWCASE_OUT || "../interfacer-medusa/.tmp/showcase-actors.json");

function base58(bytes: Uint8Array): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const digits: number[] = [];
  for (const byte of Array.from(bytes)) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] * 256;
      digits[i] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let leading = "";
  for (const byte of Array.from(bytes)) {
    if (byte !== 0) break;
    leading += "1";
  }
  return (
    leading +
    digits
      .reverse()
      .map(d => alphabet[d])
      .join("")
  );
}

interface Actor {
  key: string;
  name: string;
  id: string;
  user: string;
  email: string;
  seed: string;
  publicKey: string;
  privateKey: KeyObject;
}

async function gql<T = any>(query: string, variables: Record<string, unknown>, as?: Actor): Promise<T> {
  const body = JSON.stringify({ query: query.replace(/\s+/g, " ").trim(), variables });
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (as) {
    const store = {
      getItem: (k: string) => (k === "eddsaPrivateKey" ? as.seed : k === "authUsername" ? as.user : null),
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    const signed = await signGraphQLRequest(body, store as any);
    headers["zenflows-user"] = signed["zenflows-user"];
    headers["zenflows-sign"] = signed["zenflows-sign"];
  } else headers["zenflows-admin"] = ADMIN;
  const res = await fetch(ZENFLOWS, { method: "POST", headers, body });
  const json: any = await res.json();
  if (!res.ok || json.errors?.length) throw new Error(`zenflows: ${JSON.stringify(json.errors ?? res.status)}`);
  return json.data as T;
}

async function newActor(person: ShowcasePerson, stamp: string): Promise<Actor> {
  const { privateKey } = generateKeyPairSync("ed25519");
  const jwk = privateKey.export({ format: "jwk" }) as { d: string; x: string };
  const publicKey = base58(Uint8Array.from(Buffer.from(jwk.x, "base64url")));
  const user = `${person.key}${stamp}`;
  const email = `${user}@showcase.invalid`;
  const data = await gql<{ createPerson: { agent: { id: string } } }>(
    `mutation($p: PersonCreateParams!) { createPerson(person: $p) { agent { id } } }`,
    { p: { name: person.name, user, email, eddsaPublicKey: publicKey } }
  );
  return {
    key: person.key,
    name: person.name,
    id: data.createPerson.agent.id,
    user,
    email,
    seed: base58(Uint8Array.from(Buffer.from(jwk.d, "base64url"))),
    publicKey,
    privateKey,
  };
}

type Spec = "design" | "service" | "product";
let instance: { specs: Record<Spec, string>; unitOne: string } | null = null;

async function instanceVars(as: Actor) {
  if (instance) return instance;
  const v = (
    await gql(
      `{ instanceVariables { specs { specProjectDesign { id } specProjectService { id } specProjectProduct { id } }
         units { unitOne { id } } } }`,
      {},
      as
    )
  ).instanceVariables;
  instance = {
    specs: {
      design: v.specs.specProjectDesign.id,
      service: v.specs.specProjectService.id,
      product: v.specs.specProjectProduct.id,
    },
    unitOne: v.units.unitOne.id,
  };
  return instance;
}

// The GUI's own CreateProject: a produce event out of a creation Process, with
// the project's images declared by hash and then uploaded to Zenflows.
async function createProject(
  owner: Actor,
  spec: Spec,
  p: { name: string; note: string; license: string; tags: string[]; svg: string; city?: ShowcasePerson["city"] }
): Promise<string> {
  const vars = await instanceVars(owner);
  const process = (
    await gql(`mutation($name: String!) { createProcess(process: { name: $name }) { process { id } } }`, {
      name: `creation of ${p.name} by owner`,
    }, owner)
  ).createProcess.process.id;
  let location: string | undefined;
  if (p.city)
    location = (
      await gql(
        `mutation($name: String!, $addr: String!, $lat: Decimal!, $lng: Decimal!) {
          createSpatialThing(spatialThing: { name: $name mappableAddress: $addr lat: $lat long: $lng }) { spatialThing { id } } }`,
        { name: p.city.name, addr: p.city.address, lat: p.city.lat, lng: p.city.lng },
        owner
      )
    ).createSpatialThing.spatialThing.id;
  const bytes = new Uint8Array(Buffer.from(p.svg, "utf8"));
  const hash = createHash("sha512").update(bytes).digest("base64url");
  const file = `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`;
  const metadata = {
    contributors: [],
    licenses: [{ scope: "Hardware", licenseId: p.license }],
    relations: [],
    remote: spec === "design",
    design: false,
    image: [],
  };
  const created = await gql(
    `mutation CreateProject(
      $name: String! $note: String! $metadata: JSONObject $agent: ID!
      $creationTime: DateTime! $location: ID $tags: [URI!] $resourceSpec: ID!
      $oneUnit: ID! $images: [IFile!] $repo: String $process: ID! $license: String!
    ) {
      createEconomicEvent(
        event: {
          action: "produce" provider: $agent receiver: $agent outputOf: $process
          hasPointInTime: $creationTime resourceClassifiedAs: $tags
          resourceConformsTo: $resourceSpec resourceQuantity: { hasNumericalValue: 1 hasUnit: $oneUnit }
          toLocation: $location resourceMetadata: $metadata
        }
        newInventoriedResource: { name: $name note: $note images: $images repo: $repo license: $license }
      ) { economicEvent { resourceInventoriedAs { id } } }
    }`,
    {
      name: p.name,
      note: p.note,
      metadata: JSON.stringify(metadata),
      agent: owner.id,
      creationTime: new Date().toISOString(),
      location,
      tags: [...p.tags, `license-${p.license.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`],
      resourceSpec: vars.specs[spec],
      oneUnit: vars.unitOne,
      images: [{ hash, size: bytes.length, name: file, description: p.name, mimeType: "image/svg+xml", extension: "svg" }],
      repo: "",
      process,
      license: p.license,
    },
    owner
  );
  const form = new FormData();
  form.append(hash, new Blob([bytes], { type: "image/svg+xml" }), file);
  const upload = await fetch(`${ZENFLOWS}/file`, { method: "POST", body: form });
  if (upload.status !== 201) throw new Error(`zenflows file upload: ${upload.status}`);
  return created.createEconomicEvent.economicEvent.resourceInventoriedAs.id;
}

// The marketplace wallet envelope (lib/market/wallet.ts), signed in Node.
function interfacerAuth(as: Actor, op: string, params: unknown): string {
  const envelope = {
    op,
    params,
    person_id: as.id,
    nonce: randomBytes(16).toString("hex"),
    issued_at: new Date().toISOString(),
  };
  const signature = sign(null, new Uint8Array(Buffer.from(canonicalOperation(envelope), "utf8")), as.privateKey).toString("base64");
  return Buffer.from(JSON.stringify({ envelope, signature }), "utf8").toString("base64url");
}

async function market<T = any>(path: string, as: Actor, op: string, params: unknown, body: unknown = params) {
  const res = await fetch(`${GUI}/api/market/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-interfacer-auth": interfacerAuth(as, op, params) },
    body: JSON.stringify(body),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`market ${path}: ${json.reason || json.message || res.status}`);
  return json as T;
}

async function main() {
  if (!ADMIN) throw new Error("set MARKET_SHOWCASE_ZENFLOWS_ADMIN to the Zenflows ADMIN_KEY");
  if (existsSync(OUT) && process.env.MARKET_SHOWCASE_FORCE !== "1")
    throw new Error(`${OUT} exists: the showcase is already seeded (MARKET_SHOWCASE_FORCE=1 to add another)`);
  const config: any = await (await fetch(`${GUI}/api/market/dev/store/config`)).json();
  if (!config.live) throw new Error("Medusa must run in live mode (with a Zenflows URL)");

  const stamp = Date.now().toString(36);
  const people: Record<string, Actor> = {};
  for (const p of PEOPLE) people[p.key] = await newActor(p, stamp);
  const city = (key: string) => PEOPLE.find(p => p.key === key)?.city;
  const town = (address: string) =>
    address
      .split(",")
      .slice(-2)[0]
      .trim()
      .replace(/^\d+\s*/, "");
  const resources: Record<string, string> = {};

  for (const d of DESIGNS) {
    const owner = people[d.owner];
    const id = await createProject(owner, "design", {
      name: d.name,
      note: d.note,
      license: d.license,
      tags: d.tags,
      svg: plate({ kind: "design", drawing: d.drawing, title: d.name, subtitle: `by ${owner.name}`, sheet: d.license, dims: undefined }),
    });
    resources[d.key] = id;
    const params = { resource_id: id, document: { schema_version: "interfacer-build-requirements-v1", requirements: d.requirements } };
    await market("dev/interfacer/catalog/designs", owner, "catalog.design.register", params);
    console.log(`design   ${d.name} (${owner.name})`);
  }

  for (const s of SERVICES) {
    const owner = people[s.owner];
    const place = city(s.owner)!;
    const id = await createProject(owner, "service", {
      name: s.name,
      note: s.note,
      license: "CC-BY-SA-4.0",
      tags: ["tag-fabrication"],
      city: place,
      svg: plate({ kind: "service", drawing: s.drawing, title: owner.name, subtitle: town(place.address), sheet: s.capabilities.processes.map(x => x.split("_")[0].toUpperCase()).join(" + ") }),
    });
    resources[s.key] = id;
    const document = {
      schema_version: "interfacer-fabrication-capabilities-v1",
      capabilities: s.capabilities,
      base_price_eur: s.base_price_eur,
      per_unit_price_eur: s.per_unit_price_eur,
      location: { country_code: place.country, city: town(place.address) },
    };
    await market("dev/interfacer/catalog/services", owner, "catalog.service.register", { resource_id: id, document });
    for (const [design, [base, unit, days]] of Object.entries(s.builds)) {
      const params = {
        service_id: id,
        design_id: resources[design],
        base_price_eur: base,
        per_unit_price_eur: unit,
        lead_days: days,
        active: true,
      };
      await market("dev/interfacer/catalog/build-listings", owner, "catalog.build.list", params);
    }
    console.log(`service  ${s.name}: builds ${Object.keys(s.builds).join(", ")}`);
  }

  for (const p of PRODUCTS) {
    const owner = people[p.owner];
    const id = await createProject(owner, "product", {
      name: p.name,
      note: p.note,
      license: "CERN-OHL-S-2.0",
      tags: ["tag-showcase"],
      city: city(p.owner),
      svg: plate({ kind: "product", drawing: p.drawing, title: p.name, subtitle: owner.name, sheet: `EUR ${p.price_eur}`, dims: p.dims }),
    });
    resources[p.key] = id;
    const created = await market<{ binding: { id: string } }>("dev/interfacer/listings/live", owner, "commerce.listing.live.create", {
      resource_id: id,
    });
    const listing = created.binding.id;
    await market(`dev/interfacer/listings/${listing}/publish`, owner, "commerce.listing.publish", { listing_id: listing, priceEUR: p.price_eur }, { priceEUR: p.price_eur });
    await market(`dev/interfacer/listings/${listing}/checkout`, owner, "commerce.listing.checkout.setup", { listing_id: listing }, {});
    console.log(`product  ${p.name}: EUR ${p.price_eur} (${owner.name})`);
  }

  // Keys stay local: sign in as a showcase person by putting these values in the
  // browser's localStorage (eddsaPrivateKey, eddsaPublicKey, authEmail, authUsername).
  const out: Record<string, unknown> = { created_at: new Date().toISOString(), resources, people: {} };
  for (const a of Object.values(people))
    (out.people as Record<string, unknown>)[a.key] = { name: a.name, id: a.id, user: a.user, email: a.email, seed: a.seed, publicKey: a.publicKey };
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", { mode: 0o600 });
  console.log(`\nShowcase seeded: ${DESIGNS.length} designs, ${SERVICES.length} workshops, ${PRODUCTS.length} units on sale.`);
  console.log(`People and their keys: ${OUT} (local only, never commit).`);
}

main().catch(e => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
