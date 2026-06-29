# Interfacer GUI Logic Analysis: Primitives & Patterns for a TypeScript Client SDK

> **Date:** 2026-06-25  
> **Purpose:** Document the complete logic of `interfacer-gui` — how authentication works, how projects (designs, products, machines, services) are created, how all interactions with Zenflows and external services function, and identify the primitives that can be extracted into a standalone TypeScript client library.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication System](#2-authentication-system)
3. [The Zenflows GraphQL Layer (ValueFlows Vocabulary)](#3-the-zenflows-graphql-layer)
4. [Project/Resource Creation Flows](#4-projectresource-creation-flows)
5. [External Services & REST APIs](#5-external-services--rest-apis)
6. [Tagging & Classification System](#6-tagging--classification-system)
7. [Metadata Conventions](#7-metadata-conventions)
8. [Primitive Catalog for TypeScript Client SDK](#8-primitive-catalog-for-typescript-client-sdk)
9. [SDK Architecture Recommendation](#9-sdk-architecture-recommendation)

---

## 1. Architecture Overview

### Services the GUI talks to

```
┌─────────────────────────┐     ┌──────────────────────────────┐
│   interfacer-gui        │     │   Zenflows (GraphQL)          │
│   (Next.js / React)     │◄───►│   - ValueFlows vocabulary     │
│                         │     │   - Signed requests (EdDSA)   │
│   Authentication:       │     │   - File storage (base64)     │
│   - Zenroom crypto      │     │   - Person/Agent management   │
│   - localStorage keys   │     └──────────────────────────────┘
│                         │
│                         │     ┌──────────────────────────────┐
│                         │     │   interfacer-dpp (REST)       │
│                         │◄───►│   - Digital Product Passport  │
│                         │     │   - File uploads (did-sign)   │
│                         │     │   - MongoDB-backed            │
│                         │     └──────────────────────────────┘
│                         │
│                         │     ┌──────────────────────────────┐
│                         │     │   Inbox (REST)                │
│                         │◄───►│   - Notifications            │
│                         │     │   - Messaging (signed)       │
│                         │     └──────────────────────────────┘
│                         │
│                         │     ┌──────────────────────────────┐
│                         │     │   Wallet (REST)               │
│                         │◄───►│   - Idea/Strength points      │
│                         │     │   - Signed requests           │
│                         │     └──────────────────────────────┘
│                         │
│                         │     ┌──────────────────────────────┐
│                         │     │   Social (ActivityPub)        │
│                         │◄───►│   - Likes / Follows            │
│                         │     │   - Signed requests           │
│                         │     └──────────────────────────────┘
│                         │
│                         │     ┌──────────────────────────────┐
│                         │     │   OSH / GitHub / GitLab        │
│                         │◄───►│   - Auto-import               │
│                         │     │   - Open Source Hardware       │
│                         │     └──────────────────────────────┘
│                         │
│  Local Storage:         │
│  - IndexedDB (Dexie)    │
│  - localStorage         │
│  - Keypairoom keys      │
└─────────────────────────┘
```

### Key Architectural Patterns

1. **Zenflows is the single source of truth** for all domain data (projects, resources, agents, locations). Everything is stored as ValueFlows entities.
2. **The GUI has its own entity model** (`ProjectType`) that maps onto Zenflows ResourceSpecifications. This mapping is what needs a client SDK.
3. **Metadata overloading**: Zenflows `EconomicResource.metadata` (JSONObject) is heavily overloaded to store contributors, relations, declarations, licenses, models, machines, materials, product filters, service filters, remote flag, design flag, and more.
4. **Classification tags (`classifiedAs`)** are overloaded to store both user tags and system-derived filter metadata (categories, power requirements, environmental data, etc.), distinguished by prefix.
5. **Dual file storage**: Images go to Zenflows (base64, hashed with Zenroom SHA-512). Model files go to DPP service (did-signed, SHA-256).

---

## 2. Authentication System

### 2.1 Key Storage (localStorage)

All cryptographic keys are stored in `window.localStorage`:

| Key                  | Description                     |
| -------------------- | ------------------------------- |
| `eddsaPrivateKey`    | EdDSA private key (signing)     |
| `eddsaPublicKey`     | EdDSA public key                |
| `ethereumPrivateKey` | Ethereum private key            |
| `ethereumAddress`    | Ethereum address                |
| `reflowPrivateKey`   | Reflow private key              |
| `reflowPublicKey`    | Reflow public key               |
| `bitcoinPrivateKey`  | Bitcoin private key             |
| `bitcoinPublicKey`   | Bitcoin public key              |
| `ecdhPrivateKey`     | ECDH private key                |
| `ecdhPublicKey`      | ECDH public key                 |
| `seed`               | Keypairoom seed phrase          |
| `authId`             | Zenflows Agent/Person ULID      |
| `authName`           | Display name                    |
| `authUsername`       | Username                        |
| `authEmail`          | Email                           |
| `didId`              | DID identifier (after claiming) |

### 2.2 Key Derivation: Keypairoom (Zenroom)

The project uses **Keypairoom** — a deterministic key derivation protocol based on Zenroom (zero-knowledge VM). There are two flows:

#### Flow A: Registration (Sign Up)

1. User enters: name, email, username
2. `register(email, firstRegistration: true)` → GraphQL mutation `REGISTER_USER` (calls `keypairoomServer` on Zenflows)
3. Server returns `HMAC` (server-side shard)
4. User answers 5 security questions (where parents met, first pet name, first teacher name, hometown, mother's maiden name)
5. `keypair()` runs `keypairoomClient-8-9-10-11-12.zen` over Zenroom with userChallenges + HMAC → produces all keypairs
6. All keys saved to localStorage
7. `signup()` → GraphQL mutation `SIGN_UP` (`createPerson`) with all public keys + ethereum address
8. `login()` → queries `FETCH_SELF` (personCheck by email + eddsaPublicKey)
9. `sendEmailVerification()` → mutation `SEND_EMAIL_VERIFICATION`
10. `claim(id)` → mutation `CLAIM_DID`

#### Flow B: Login (Sign In)

1. User enters email
2. `register(email, firstRegistration: false)` → `REGISTER_USER` → returns HMAC
3. User chooses: passphrase mode or questions mode
4. **Questions mode:** User answers 5 questions → HMAC + answers → keypairoom → generates seed → show seed
5. **Passphrase mode:** User enters seed directly
6. `doLogin()` → Zenroom runs `keypairoomClientRecreateKeys.zen` with seed + HMAC → recreates all keys
7. Keys saved to localStorage
8. `login()` → `FETCH_SELF` query → confirms user exists

### 2.3 Apollo Client with Signed Calls

`createApolloClient(authenticated)` in `lib/createApolloClient.ts`:

- **Unauthenticated** (`withSignedCalls = false`): Standard HTTP link to `NEXT_PUBLIC_ZENFLOWS_URL`
- **Authenticated** (`withSignedCalls = true`): Custom `fetch` function that:
  1. Takes the GraphQL body
  2. Signs it with `sign_graphql.zen` (Zenroom) using EdDSA private key
  3. Adds headers: `zenflows-sign`, `zenflows-user`, `zenflows-hash`

The sign contract (`sign_graphql.zen`) does:

```
Given I have a 'string' named 'gql' (base64 of the GraphQL body)
Given I have a 'keyring' (eddsa private key)
Produce an EdDSA signature + hash
```

### 2.4 Signed REST Calls

`useSignedPost()` in `hooks/useSignedPost.ts` provides two signing modes:

- **`signRequest(json)`** → `zenflows-sign` + `zenflows-id` headers (for inbox/wallet/social)
- **`signDidRequest(json)`** → `did-sign` + `did-pk` headers (for DPP service)

Both use the same `sign_graphql.zen` EdDSA contract.

---

## 3. The Zenflows GraphQL Layer (ValueFlows Vocabulary)

### 3.1 Schema & Code Generation

- Schema URL: `https://zenflows-test.interfacer.dyne.org/play`
- Codegen tool: `@graphql-codegen/cli` with plugins `typescript` + `typescript-operations`
- Output: `lib/types/index.ts` (4700+ lines of generated types)
- Documents scanned from: `lib/**`, `components/**`, `pages/**`, `contexts/**`

### 3.2 Core ValueFlows Entities Used

| VF Entity               | GUI Concept                              | How Created                                                                                        |
| ----------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `Person` / `Agent`      | User                                     | `createPerson` mutation during sign-up                                                             |
| `EconomicResource`      | Project (Design/Product/Service/Machine) | `createEconomicEvent` with `newInventoriedResource`                                                |
| `ResourceSpecification` | Project type (e.g. "Project Design")     | Pre-configured in Zenflows instance                                                                |
| `EconomicEvent`         | Activity log entry                       | Created for every action (produce, transfer, cite, consume, work, accept, modify, pickup, dropoff) |
| `Process`               | Audit trail / grouping                   | Created before every set of economic events                                                        |
| `Proposal`              | Contribution proposal                    | `createProposal` + linked intents                                                                  |
| `Intent`                | Proposed action                          | Created for proposal items                                                                         |
| `Satisfaction`          | Intent fulfillment                       | Links Intent → EconomicEvent                                                                       |
| `SpatialThing`          | Location                                 | `createSpatialThing`                                                                               |
| `Unit`                  | Measurement unit (always "one")          | Retrieved from `instanceVariables`                                                                 |

### 3.3 ResourceSpecifications (Project Types)

The mapping between GUI project types and Zenflows `ResourceSpecification` IDs:

| GUI `ProjectType` | Zenflows `ResourceSpecification` | Config Variable          |
| ----------------- | -------------------------------- | ------------------------ |
| `DESIGN`          | `specProjectDesign`              | from `instanceVariables` |
| `PRODUCT`         | `specProjectProduct`             | from `instanceVariables` |
| `SERVICE`         | `specProjectService`             | from `instanceVariables` |
| `MACHINE`         | `specMachine`                    | from `instanceVariables` |
| `DPP`             | `specDpp`                        | from `instanceVariables` |
| `MATERIAL`        | `specMaterial`                   | from `instanceVariables` |

These are fetched by `useResourceSpecs()` via `QUERY_PROJECT_TYPES` GQL query.

### 3.4 Full GraphQL Operations Catalog

#### Queries

| Query Name                                | Purpose                          | Key Variables                   |
| ----------------------------------------- | -------------------------------- | ------------------------------- |
| `QUERY_VARIABLES` / `QUERY_PROJECT_TYPES` | Get all specs, units, currencies | none                            |
| `QUERY_UNIT_AND_CURRENCY`                 | Get unitOne and currency spec    | none                            |
| `FETCH_SELF`                              | Verify user by email + pubkey    | `$email`, `$pubkey`             |
| `FETCH_USER`                              | Get person details               | `$id`                           |
| `QUERY_AGENTS`                            | Paginated agent list             | `$first`, `$id`                 |
| `FETCH_AGENTS`                            | Search agents by name            | `$userOrName`, `$last`          |
| `GET_TAGS`                                | Get all classification tags      | none                            |
| `QUERY_PROJECTS`                          | Browse/filter projects           | `$first`, `$after`, `$filter`   |
| `QUERY_RESOURCE`                          | Get single resource details      | `$id`                           |
| `FETCH_RESOURCES`                         | List/inventory resources         | `$first`, `$filter`, `$orderBy` |
| `QUERY_MACHINES`                          | Get machines by spec             | `$resourceSpecId`               |
| `QUERY_CITED_RESOURCES`                   | Get resources cited in process   | `$processId`                    |
| `QUERY_PROPOSAL`                          | Get proposal details             | `$id`                           |
| `QUERY_RESOURCE_PROPOSALS`                | Proposals for a resource         | `$id`                           |
| `ASK_RESOURCE_PRIMARY_ACCOUNTABLE`        | Get resource owner               | `$id`                           |
| `QUERY_PROJECT_FOR_METADATA_UPDATE`       | Get resource for metadata edit   | `$id`                           |
| `GET_RESOURCE_DETAILS`                    | Resource via proposal            | `$id`                           |

#### Mutations

| Mutation Name                       | Purpose                                       | Key Pattern                       |
| ----------------------------------- | --------------------------------------------- | --------------------------------- |
| `REGISTER_USER`                     | Keypairoom server shard                       | `$firstRegistration`, `$userData` |
| `SIGN_UP`                           | Create person with all keys                   | 8 key params                      |
| `SEND_EMAIL_VERIFICATION`           | Request verification email                    | `$template`                       |
| `CLAIM_DID`                         | Claim DID for person                          | `$id`                             |
| `CREATE_PROJECT`                    | Create any project (design, product, service) | produce event + new resource      |
| `CREATE_MACHINE_RESOURCE`           | Create machine resource                       | produce event + new resource      |
| `CREATE_DPP_RESOURCE`               | Create DPP resource                           | produce event + new resource      |
| `CREATE_LOCATION`                   | Create spatial thing                          | `$name`, `$addr`, `$lat`, `$lng`  |
| `CREATE_PROCESS`                    | Create process for grouping events            | `$name`                           |
| `CITE_PROJECT`                      | Cite/link a related resource                  | cite event                        |
| `CONSUME_RESOURCE`                  | Consume material in process                   | consume event                     |
| `CONTRIBUTE_TO_PROJECT`             | Log work contribution                         | work event                        |
| `FORK_PROJECT`                      | Fork a project                                | cite + produce events             |
| `TRANSFER_PROJECT`                  | Transfer resource ownership                   | transfer event                    |
| `UPDATE_METADATA`                   | Update resource metadata                      | accept + modify events            |
| `UPDATE_RESOURCE_CLASSIFIED_AS`     | Update tags                                   | direct resource update            |
| `RELOCATE_PROJECT`                  | Move to new location                          | pickup + dropoff events           |
| `CREATE_PROPOSAL`                   | Create proposal                               | `$name`, `$note`                  |
| `CREATE_INTENT`                     | Create intents for proposal                   | item + payment intents            |
| `LINK_PROPOSAL_AND_INTENT`          | Link intents to proposal                      | `proposeIntent` x2                |
| `PROPOSE_CONTRIBUTION`              | Create contribution proposal                  | cite + accept + modify intents    |
| `LINK_CONTRIBUTION_PROPOSAL_INTENT` | Link contribution intents                     | `proposeIntent` x3                |
| `ACCEPT_PROPOSAL`                   | Accept contribution                           | cite + accept + modify events     |
| `SATISFY_INTENTS`                   | Fulfill intents                               | satisfaction x3                   |
| `REJECT_PROPOSAL`                   | Reject by finishing intents                   | `updateIntent` x3                 |

---

## 4. Project/Resource Creation Flows

### 4.1 The CreateProjectForm Interface

All project types (Product, Design, Service) use `CreateProjectForm` with `projectType` parameter.
Machines use the same form but call `handleMachineCreation` instead.

**Form steps and data:**

```typescript
CreateProjectValues {
  main: MainStepValues           // title, description, tags, link (repo)
  productFilters: ...            // categories, power, energy, CO2, recyclability, repairability
  serviceFilters: ...            // serviceType, availability
  linkedDesign: string           // for PRODUCTs: the design ID they derive from
  location: LocationStepValues   // location name, address, lat/lng, remote flag
  images: ImagesStepValues       // image files
  modelFiles: ModelFilesStepValues // 3D model files (for products)
  declarations: DeclarationsStepValues // CE, RoHS, etc.
  contributors: string[]         // agent ULIDs
  relations: string[]            // related project ULIDs
  licenses: {scope, licenseId}[] // SPDX license IDs
  machines: MachineDetails[]     // machine resources to use (for products)
  materials: MaterialDetails[]   // material resources to consume (for products)
}
```

### 4.2 `handleProjectCreation()` — Products, Designs, Services

The master function in `useProjectCRUD.ts`. Here's the complete flow:

**Phase 1: Setup**

1. Create a `Process`: `createProcess("creation of {title} by {user}")` → returns processId
2. Fetch `unitOne` and `specCurrency` via `QUERY_UNIT_AND_CURRENCY`
3. Resolve resource spec ID from `projectTypes[projectType]` (maps `ProjectType` enum → `ResourceSpecification.id`)

**Phase 2: Location** 4. If location data provided, `handleCreateLocation()` → `createSpatialThing` mutation

- Sets `remote` flag on designs (designs are always remote by policy)

**Phase 3: Assets** 5. **Images**: `prepFilesForZenflows()` → hashes each file with Zenroom SHA-512 → returns `IFile[]` ({name, hash, mimeType, size, extension}) 6. **Model Files**: `uploadModelFilesToDpp()` → uploads each file to DPP service → returns `ProjectModelMetadata[]` 7. **Tags**: Builds composite tag set:

- User tags (normalized to `tag-{slug}` prefix)
- Machine tags (`machine-{name}`)
- Material tags (`material-{name}`)
- Product filter tags (categories, power compatibility, replicability, recyclability ranges, energy ranges, CO2 ranges)
- Service filter tags (service type, availability)
- License tags (`license-{spdxId}`)

8. **Metadata**: Constructs JSON metadata object:
   ```json
   {
     "contributors": ["ulid1", "ulid2"],
     "licenses": [{"scope":"Hardware","licenseId":"CERN-OHL-S-2.0"}],
     "relations": ["ulid3"],
     "declarations": {"ce":true,"rohs":true},
     "remote": false,
     "design": "parentDesignUlid",
     "models": [{...modelMetadata}],
     "machines": [{...machineDetails}],
     "materials": [{...materialDetails}],
     "productFilters": {...numericFilters}
   }
   ```

**Phase 4: DPP (Products only)** 9. If project is a Product, optionally:

- `createDppResource()` → create a DPP EconomicResource with `dppServiceUlid` in metadata
- `citeProject()` → link the DPP resource to the main project

**Phase 5: Create the resource** 10. `CREATE_PROJECT` mutation:
`graphql
    createEconomicEvent(
      event: {
        action: "produce"
        provider: $agent, receiver: $agent
        outputOf: $process
        hasPointInTime: $creationTime
        resourceClassifiedAs: $tags
        resourceConformsTo: $resourceSpec  # project type spec
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $oneUnit }
        toLocation: $location
        resourceMetadata: $metadata
      }
      newInventoriedResource: {
        name: $name, note: $note,
        images: $images, repo: $repo, license: $license
      }
    ) {
      economicEvent { id, resourceInventoriedAs { id, name } }
    }
    `

**Phase 6: Relationships & Side Effects** 11. **Cite DPP resource** if created (step 9) 12. **Consume machines**: `CONTRIBUTE_TO_PROJECT` (action: "work") for each machine 13. **Consume materials**: `CONSUME_RESOURCE` (action: "consume") for each material 14. **Add relations**: For each related project, `CITE_PROJECT` + [update other project's metadata.relations](bidi — currently commented out for children update) 15. **Add contributors**: `CONTRIBUTE_TO_PROJECT` (action: "work") for each contributor + send inbox notification 16. **Link design** (Products): If `linkedDesign` set, `addRelation()` + mark design as manufacturable (add `manufacturable-true` tag) 17. **Upload images**: `uploadFiles()` → POSTs to `NEXT_PUBLIC_ZENFLOWS_FILE_URL` 18. **Assign points**: `addIdeaPoints()` and `addStrengthsPoints()` via Wallet API

### 4.3 `handleMachineCreation()` — Machines

Same pattern as project creation but:

- No DPP step
- No product/service filters
- Uses `CREATE_MACHINE_RESOURCE` mutation (simpler, no tags/images/license on the mutation)
- Tags and metadata stored in `resourceMetadata` as JSON string
- No linked design logic

Key mutation:

```graphql
createMachineResource(
  agent, creationTime, process, resourceSpec: specMachine.id,
  unitOne, name, note, metadata
)
```

### 4.4 `handleCreateLocation()` — Location creation

```typescript
async handleCreateLocation(location: LocationStepValues, design: boolean):
  Promise<{ remote: boolean; st: SpatialThingRes | undefined }>
```

- `remote` is always `true` for designs (by policy)
- Calls `CREATE_LOCATION` mutation: `createSpatialThing(name, mappableAddress, lat, long)`

### 4.5 Contribution / Proposal Flow

Two main scenarios:

#### A) Proposing a contribution (from `ProposeContribution` page)

1. `CREATE_PROCESS` → process
2. `PROPOSE_CONTRIBUTION` → 3 intents: cite (the fork), accept (origin resource), modify (origin resource)
3. `CREATE_PROPOSAL` → creates proposal
4. `LINK_CONTRIBUTION_PROPOSAL_INTENT` → links 3 intents to proposal
5. Sends inbox notification to owner

#### B) Accepting a contribution (from `Proposal` page)

1. `ACCEPT_PROPOSAL` → 3 economic events: cite, accept, modify
   - Modify event carries new metadata: origin resource's metadata + forked resource's ID added to relations
2. `SATISFY_INTENTS` → 3 satisfactions linking intents → events
3. Sends inbox notifications
4. Points awarded

#### C) Rejecting a contribution

1. `REJECT_PROPOSAL` → marks all 3 intents as `finished: true`
2. Sends inbox notification

### 4.6 Metadata Update Flow

When editing project metadata (contributors, relations, licenses, declarations, location):

1. Fetch current resource state via `queryProjectForMetadataUpdate`
2. Create a new `Process` for the update
3. `UPDATE_METADATA` mutation → accept + modify events
   - Accept event: acknowledges current state
   - Modify event: applies new metadata
4. For relational updates, also creates cite/contribute events

### 4.7 Relocation Flow

`relocateProject()` in `useProjectCRUD`:

1. Optionally update `remote` flag in metadata
2. Create new location if changed
3. `RELOCATE_PROJECT` mutation → pickup + dropoff events
   - Pickup: from old location
   - Dropoff: to new location

---

## 5. External Services & REST APIs

### 5.1 DPP Service (`NEXT_PUBLIC_DPP_URL`)

Endpoints (matching `interfacer-dpp` Go backend):

| Method | Path                                 | Purpose                                                                                     |
| ------ | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| POST   | `/dpp`                               | Create DPP document                                                                         |
| GET    | `/dpp/:id`                           | Get DPP by ID                                                                               |
| PUT    | `/dpp/:id`                           | Update DPP document                                                                         |
| DELETE | `/dpp/:id`                           | Delete DPP                                                                                  |
| GET    | `/dpps`                              | List DPPs (query params: productId, createdBy, status, q, sortBy, sortOrder, limit, offset) |
| PUT    | `/dpp/:id/status`                    | Update DPP status (active/draft/archived)                                                   |
| POST   | `/upload`                            | Upload file → returns `Attachment`                                                          |
| GET    | `/file/:id`                          | Get file URL                                                                                |
| POST   | `/dpp/:id/attachments?section=...`   | Add attachment to DPP                                                                       |
| DELETE | `/dpp/:id/attachments/:attachmentId` | Remove attachment                                                                           |
| GET    | `/dpp/:id/qr?size=...`               | QR code for DPP                                                                             |

**Auth for DPP**: Uses `did-sign` + `did-pk` headers (EdDSA signature over request body). Always sends `x-user-id` header (user ULID).

### 5.2 Inbox Service (`NEXT_PUBLIC_INBOX_*`)

| Endpoint             | Purpose               | Auth                                                |
| -------------------- | --------------------- | --------------------------------------------------- |
| `INBOX_SEND`         | Send message          | Signed POST (`zenflows-sign`)                       |
| `INBOX_READ`         | Read messages         | Signed POST                                         |
| `INBOX_COUNT_UNREAD` | Count unread messages | Signed POST, polled every `INBOX_COUNT_INTERVAL` ms |
| `INBOX_SET_READ`     | Mark message as read  | Signed POST                                         |

Message payload format:

```json
{
  "sender": "userULID",
  "receivers": ["ulid1", "ulid2"],
  "content": {
    "message": { "proposalID": "...", "proposerName": "...", ... },
    "subject": "Contribution proposed",
    "data": "2024-01-01T00:00:00Z"
  }
}
```

Message subjects used: `ADDED_AS_CONTRIBUTOR`, `CONTRACT`, `CONTRIBUTION_ACCEPTED`, `CONTRIBUTION_REJECTED`

### 5.3 Wallet Service (`NEXT_PUBLIC_WALLET`)

| Endpoint                                                          | Purpose                      |
| ----------------------------------------------------------------- | ---------------------------- |
| `GET /wallet/token/{idea\|strengths}/{agentId}`                   | Get current balance          |
| `GET /wallet/token/{idea\|strengths}/{agentId}?until={timestamp}` | Get balance at point in time |
| `POST /wallet/token`                                              | Add tokens (signed)          |

Points are awarded for: creating projects, forking, contributing, starring, watching, accepting contributions, citing projects.

### 5.4 Social Service (ActivityPub)

| Endpoint                                    | Purpose                                 |
| ------------------------------------------- | --------------------------------------- |
| `GET /inbox/person/{id}/liked`              | Get user's likes                        |
| `GET /inbox/economicresource/{id}/follower` | Get resource followers                  |
| `GET /inbox/person/{id}/following`          | Get user's follows                      |
| `POST /inbox/person/{id}/outbox`            | Like or Follow (ActivityStreams format) |

ActivityStreams format:

```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "Like",
  "actor": "/inbox/person/userUlid",
  "object": "/inbox/economicresource/resourceUlid",
  "published": "2024-01-01T00:00:00Z"
}
```

### 5.5 Auto-Import Service (`NEXT_PUBLIC_OSH`)

| Endpoint            | Purpose                                |
| ------------------- | -------------------------------------- |
| `POST /osh/analyze` | Analyze GitHub repo for OSH compliance |

Also directly uses GitHub API (`Octokit`) and GitLab API for auto-importing project metadata.

### 5.6 File Proxy (Next.js API routes)

The GUI includes API routes that proxy Zenflows file access:

| Route                               | Purpose                                                           |
| ----------------------------------- | ----------------------------------------------------------------- |
| `GET /api/file/[hash]`              | Proxies `ZENFLOWS_FILE_URL/{hash}`, returns base64-decoded binary |
| `GET /api/image/[hash]`             | Same but for images                                               |
| `GET /api/dpp-file/[id]/[filename]` | Proxies DPP file access                                           |

### 5.7 Location Services

| Endpoint                            | Purpose                |
| ----------------------------------- | ---------------------- |
| `NEXT_PUBLIC_LOCATION_AUTOCOMPLETE` | Address autocomplete   |
| `NEXT_PUBLIC_LOCATION_LOOKUP`       | Reverse geocode lookup |

---

## 6. Tagging & Classification System

### 6.1 Tag Prefixes (stored in `economicResource.classifiedAs`)

| Prefix            | Purpose                     | Example                             |
| ----------------- | --------------------------- | ----------------------------------- |
| `tag-`            | User-entered free-form tags | `tag-3d-printing`                   |
| `category-`       | Product category            | `category-electronics`              |
| `machine-`        | Machines used               | `machine-cnc-mill`                  |
| `material-`       | Materials consumed          | `material-pla-filament`             |
| `powercompat-`    | Power compatibility         | `powercompat-usb-c`                 |
| `powerreq-`       | Power requirement (range)   | `powerreq-ge-50`, `powerreq-le-100` |
| `replicability-`  | Replicability level         | `replicability-high`                |
| `recyclability-`  | Recyclability (range)       | `recyclability-ge-50`               |
| `repairability-`  | Repairability               | `repairability-available`           |
| `env-energy-`     | Energy consumption (range)  | `env-energy-ge-30`                  |
| `env-co2-`        | CO2 footprint (range)       | `env-co2-ge-5`                      |
| `servicetype-`    | Service type                | `servicetype-fabrication`           |
| `availability-`   | Availability                | `availability-booking-required`     |
| `license-`        | License                     | `license-cern-ohl-s-2-0`            |
| `manufacturable-` | Can be manufactured         | `manufacturable-true`               |

### 6.2 Numeric Range Tags (Monotonic)

Numeric filters use "greater-or-equal" (`ge-`) and "less-or-equal" (`le-`) range tags for efficient filtering:

- Power requirement: 0, 10, 25, 50, 75, 100, 150, 200, 250, 300, 500, 750, 1000, 1500, 2000 W
- Energy: 0, 10, 20, 30, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000 kWh
- CO2: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 5, 7.5, 10, 15, 20 kg
- Recyclability: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 %

Decimal encoding: `0.5` → `0p5` (using `p` instead of `.` to stay URL-safe after slugging).

---

## 7. Metadata Conventions

All `EconomicResource.metadata` is a free-form `JSONObject` with these established conventions:

```typescript
interface ProjectMetadata {
  contributors: string[]; // Agent ULIDs
  licenses: Array<{
    // SPDX license info
    scope: string; // "Hardware", "Software", "Documentation"
    licenseId: string; // SPDX identifier
  }>;
  relations: string[]; // Related EconomicResource ULIDs
  declarations: {
    // Compliance declarations
    ce?: boolean;
    rohs?: boolean;
    // ... extensible
  };
  remote: boolean; // Whether remote/non-physical
  design: string | boolean; // For products: linked design ULID or false
  models: ProjectModelMetadata[]; // 3D model files (DPP-uploaded)
  machines: MachineDetails[]; // Machines used
  materials: MaterialDetails[]; // Materials consumed
  productFilters: ProductFilterMetadata; // Structured filters (see section 6)
  // dpp: REMOVED — now cited as separate EconomicResource
}
```

---

## 8. Primitive Catalog for TypeScript Client SDK

Below is a catalog of every "primitive" operation the GUI performs, organized for extraction into a standalone client.

### 8.1 Authentication Primitives

```
class AuthClient {
  // Step 1: Get HMAC server-side shard
  requestHmac(email: string, firstRegistration: boolean): Promise<string>

  // Step 2: Derive keys client-side (Zenroom)
  deriveKeys(userChallenges: Challenges, email: string, hmac: string): Promise<Keyring>
  recreateKeys(seed: string, hmac: string): Promise<Keyring>

  // Step 3: Verify user exists on Zenflows
  verifyUser(email: string, eddsaPublicKey: string): Promise<PersonInfo>

  // Step 4: Register new user on Zenflows
  registerUser(personData: PersonRegistrationData): Promise<Agent>

  // Step 5: Email verification
  sendEmailVerification(template: EmailTemplate): Promise<void>

  // Step 6: DID claiming
  claimDid(personId: string): Promise<string>

  // Signing utilities
  signGraphqlMutation(body: string, eddsaPrivateKey: string): Promise<SignedHeaders>
  signRestRequest(body: string, eddsaPrivateKey: string): Promise<SignedHeaders>
  signDidRequest(body: string, eddsaPrivateKey: string, publicKey: string): Promise<DidHeaders>
}
```

### 8.2 Project/Resource Primitives

```
class ResourceClient {
  // Creation
  createProcess(name: string): Promise<string>
  createLocation(name: string, address?: string, lat?: number, lng?: number): Promise<SpatialThing>

  createProject(params: CreateProjectParams): Promise<EconomicResource>
  createMachine(params: CreateMachineParams): Promise<EconomicResource>
  createDppResource(params: CreateDppParams): Promise<EconomicResource>

  // Reading
  getResource(id: string): Promise<EconomicResource>
  listResources(filter: ResourceFilter, pagination: Pagination): Promise<PaginatedResources>
  getProjects(filter: ProposalFilter): Promise<PaginatedProjects>

  // Relations
  citeResource(resourceId: string, processId: string): Promise<void>
  consumeResource(resourceId: string, processId: string): Promise<void>
  contributeToResource(resourceId: string, processId: string, contributionType: string): Promise<void>

  // Metadata
  updateMetadata(resourceId: string, metadata: Record<string, unknown>): Promise<void>
  updateClassifiedAs(resourceId: string, tags: string[]): Promise<void>
  relocateResource(resourceId: string, location: LocationParams): Promise<void>

  // Proposals
  proposeContribution(params: ContributionParams): Promise<Proposal>
  acceptProposal(proposalId: string): Promise<void>
  rejectProposal(proposalId: string): Promise<void>

  // Resolution helpers
  getProjectSpecId(projectType: ProjectType): Promise<string>
  getUnitOne(): Promise<string>
  getCurrencySpec(): Promise<string>
}
```

### 8.3 File Primitives

```
class FileClient {
  // Zenflows file storage (images, general files)
  hashFile(file: File): Promise<string>        // Zenroom SHA-512
  prepFileForUpload(file: File): Promise<IFile>
  uploadToZenflows(file: File): Promise<void>    // POST to ZENFLOWS_FILE_URL
  getFileUrl(hash: string): string               // proxy URL
  getFileBinary(hash: string): Promise<ArrayBuffer>

  // DPP file storage (models, attachments)
  uploadToDpp(file: File): Promise<Attachment>   // did-signed, SHA-256
  getDppFileUrl(id: string): string
}
```

### 8.4 DPP Primitives

```
class DppClient {
  createDpp(data: DppDocument): Promise<string>
  getDpp(id: string): Promise<DppDocument>
  updateDpp(id: string, data: Partial<DppDocument>): Promise<void>
  deleteDpp(id: string): Promise<void>
  listDpps(filters: ListDppsFilters): Promise<ListDppsResponse>
  updateStatus(id: string, status: DppStatus): Promise<void>
  addAttachment(dppId: string, section: string, file: File): Promise<Attachment>
  deleteAttachment(dppId: string, attachmentId: string): Promise<void>
  getQrCode(dppId: string, size?: number): string
}
```

### 8.5 Messaging Primitives

```
class InboxClient {
  sendMessage(message: any, receivers: string[], subject: string): Promise<void>
  getMessages(): Promise<Message[]>
  getUnreadCount(): Promise<number>
  markRead(messageId: number): Promise<void>
}
```

### 8.6 Points/Economy Primitives

```
class WalletClient {
  getBalance(agentId: string, token: Token): Promise<number>
  getBalanceAt(agentId: string, token: Token, timestamp: number): Promise<number>
  addPoints(agentId: string, token: Token, amount: number): Promise<void>
  getTrend(agentId: string, token: Token, period: TrendPeriod): Promise<number>
}
```

### 8.7 Social Primitives

```
class SocialClient {
  like(resourceId: string): Promise<void>
  follow(resourceId: string): Promise<void>
  getLikes(): Promise<string[]>
  getFollowers(resourceId: string): Promise<string[]>
  getFollowing(): Promise<string[]>
  isLiked(resourceId: string): Promise<boolean>
}
```

### 8.8 Tagging Primitives

```
class TaggingClient {
  normalizeUserTags(rawTags: string[]): string[]
  deriveProductFilterTags(filters: ProductFilterMetadata): string[]
  extractUserTagValues(classifiedAs: string[]): string[]
  isSystemTag(tag: string): boolean

  // Numeric range helpers
  monotonicRangeTags(prefix: string, value: number, thresholds: number[]): string[]

  // Utility
  slugifyTagValue(value: string): string
  prefixedTag(prefix: string, value: string): string
  mergeTags(...tagLists: string[][]): string[]
}
```

### 8.9 Auto-Import Primitives

```
class ImportClient {
  importFromGithub(url: string): Promise<Partial<ProjectData>>
  importFromGitlab(host: string, projectId: string): Promise<Partial<ProjectData>>
  analyzeRepoForOsh(repoUrl: string): Promise<any>
}
```

---

## 9. SDK Architecture Recommendation

### 9.1 Package Structure

```
@interfacer/client/
├── package.json
├── src/
│   ├── index.ts                  # Main exports
│   ├── client.ts                 # Unified InterfacerClient
│   ├── config.ts                 # Client configuration
│   │
│   ├── auth/
│   │   ├── AuthClient.ts         # Auth operations
│   │   ├── keypair.ts            # Key derivation (wraps Zenroom)
│   │   └── types.ts              # Auth types
│   │
│   ├── resources/
│   │   ├── ResourceClient.ts     # Project/Resource CRUD
│   │   ├── types.ts              # Resource entity types
│   │   └── queries.ts            # GraphQL operations
│   │
│   ├── files/
│   │   ├── FileClient.ts         # File upload/download
│   │   └── hashing.ts            # File hashing (wraps Zenroom)
│   │
│   ├── dpp/
│   │   ├── DppClient.ts          # DPP operations
│   │   └── types.ts              # DPP document types
│   │
│   ├── messaging/
│   │   └── InboxClient.ts        # Inbox operations
│   │
│   ├── wallet/
│   │   └── WalletClient.ts       # Points operations
│   │
│   ├── social/
│   │   └── SocialClient.ts       # ActivityPub likes/follows
│   │
│   ├── tagging/
│   │   ├── TaggingClient.ts      # Classification helpers
│   │   └── constants.ts          # Tag prefixes, thresholds
│   │
│   ├── import/
│   │   └── ImportClient.ts       # GitHub/GitLab import
│   │
│   └── crypto/
│       ├── sign.ts               # EdDSA signing (wraps Zenroom)
│       └── zenroom-bridge.ts     # Zenroom WASM interface
```

### 9.2 Entity Types the SDK Should Expose

```typescript
// High-level domain entities, NOT raw ValueFlows:

interface Project {
  id: string; // EconomicResource ULID
  name: string;
  description: string;
  type: ProjectType; // DESIGN | PRODUCT | SERVICE | MACHINE
  createdAt: string;

  // Owner
  owner: { id: string; name: string; image?: string };

  // Location
  location?: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  isRemote: boolean;

  // Metadata
  tags: string[]; // User-visible tags (stripped of system prefixes)
  licenses: License[];
  contributors: Contributor[];
  relations: Relation[];
  declarations: Declaration[];

  // Product filters (PRODUCT type only)
  productFilters?: ProductFilters;
  serviceFilters?: ServiceFilters;

  // Linked resources
  linkedDesign?: { id: string; name: string }; // For PRODUCTs
  derivedProducts?: Array<{ id: string; name: string }>; // For DESIGNS

  // DPP
  dpp?: { id: string; status: DppStatus };

  // Assets
  images: Image[];
  models: ModelFile[];

  // Machines & Materials (PRODUCT type)
  machines: MachineRef[];
  materials: MaterialRef[];

  // Social
  likes: number;
  followers: number;
  isLiked: boolean;
  isFollowed: boolean;
}

interface ProductFilters {
  categories: string[];
  powerCompatibility: string[];
  replicability: string;
  recyclabilityPct: number;
  repairability: boolean;
  powerRequirementW: number;
  energyKwh: number;
  co2Kg: number;
}

interface ServiceFilters {
  serviceType: string[];
  availability: string[];
}
```

### 9.3 The Unified Client

```typescript
class InterfacerClient {
  readonly auth: AuthClient;
  readonly resources: ResourceClient;
  readonly files: FileClient;
  readonly dpp: DppClient;
  readonly inbox: InboxClient;
  readonly wallet: WalletClient;
  readonly social: SocialClient;
  readonly tagging: TaggingClient;
  readonly import: ImportClient;

  constructor(config: InterfacerConfig) {
    // Initialize Zenroom WASM
    // Set up Apollo client or fetch wrapper
    // Wire up key storage
  }

  // High-level composite operations

  // Register + login in one flow
  async createAccount(params: RegistrationParams): Promise<User>;

  // Create project with all side effects (DPP, citations, tags, points)
  async createProject(params: CreateProjectInput): Promise<Project>;

  // Get project fully resolved (resource + metadata + dpp + social)
  async getProject(id: string): Promise<Project>;

  // List projects with filters
  async listProjects(filters: ProjectListFilters): Promise<PaginatedResults<Project>>;
}
```

### 9.4 Key Design Decisions

1. **Zenroom as peer dependency**: The SDK should accept Zenroom as a dependency or use a bridge pattern to avoid bundling the WASM if the consumer already has it.

2. **GraphQL client agnosticism**: The SDK should use `fetch` internally, not depend on Apollo. The calling app can use Apollo for its own purposes.

3. **Environment-driven configuration**: All service URLs (zenflows, dpp, inbox, wallet, social) come from a config object, not process.env.

4. **Key storage abstraction**: Allow injection of a key storage interface (localStorage, secure enclave, etc.) rather than hardcoding to `window.localStorage`.

5. **Type codegen from Zenflows schema**: The SDK should generate its types from the Zenflows GraphQL schema, keeping the ValueFlows vocabulary as the source of truth but wrapping it in domain-friendly types.

### 9.5 Common Patterns Used in the GUI

| Pattern                                | Description                                                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Process-per-action**                 | Every mutation (create, update, cite, relocate) creates a new `Process` first, which groups related `EconomicEvent`s                                      |
| **Event sourcing**                     | All state changes are economic events (produce, accept, modify, cite, consume, work, pickup, dropoff). Resources are never directly mutated.              |
| **Accept+Modify pattern**              | Metadata updates use two events: `accept` (acknowledge current state) + `modify` (apply new state)                                                        |
| **Intent→Proposal→Event→Satisfaction** | The full contribution workflow: intents describe what is proposed, proposals group intents, economic events fulfill, satisfactions link intents to events |
| **Metadata overloading**               | Structured app data goes into `EconomicResource.metadata` as JSON                                                                                         |
| **Tag-based filtering**                | Product attributes become prefixed tags in `classifiedAs` for efficient GraphQL filtering                                                                 |
| **Dual signing**                       | GraphQL calls use `zenflows-sign` headers; DPP calls use `did-sign` + `did-pk` headers; both derived from the same EdDSA key                              |
| **Inbox for notifications**            | All user-to-user communication (contributor added, proposal submitted, accepted/rejected) goes through a signed REST inbox                                |

---

## Appendix: Environment Variables Reference

| Variable                               | Purpose                                                 |
| -------------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_ZENFLOWS_URL`             | Zenflows GraphQL endpoint                               |
| `NEXT_PUBLIC_ZENFLOWS_FILE_URL`        | Zenflows file storage endpoint                          |
| `NEXT_PUBLIC_ZENFLOWS_ADMIN`           | Admin token for sign-up mutation                        |
| `NEXT_PUBLIC_DPP_URL`                  | DPP service base URL                                    |
| `NEXT_PUBLIC_LOSH_ID`                  | Default "losh" (commons) agent ULID for transfer events |
| `NEXT_PUBLIC_INBOX_SEND`               | Inbox send endpoint                                     |
| `NEXT_PUBLIC_INBOX_READ`               | Inbox read endpoint                                     |
| `NEXT_PUBLIC_INBOX_COUNT_UNREAD`       | Inbox unread count endpoint                             |
| `NEXT_PUBLIC_INBOX_SET_READ`           | Inbox mark-read endpoint                                |
| `NEXT_PUBLIC_INBOX_COUNT_INTERVAL`     | Polling interval for unread count (ms)                  |
| `NEXT_PUBLIC_WALLET`                   | Wallet token endpoint                                   |
| `NEXT_PUBLIC_SOCIAL_PERSON`            | Social (ActivityPub) person base                        |
| `NEXT_PUBLIC_SOCIAL_ECONOMIC_RESOURCE` | Social (ActivityPub) resource base                      |
| `NEXT_PUBLIC_OSH`                      | Open Source Hardware analysis endpoint                  |
| `NEXT_PUBLIC_LOCATION_AUTOCOMPLETE`    | Location autocomplete                                   |
| `NEXT_PUBLIC_LOCATION_LOOKUP`          | Location reverse lookup                                 |
| `NEXT_PUBLIC_START_DATE`               | Wallet cycle start date                                 |
| `NEXT_PUBLIC_CYCLE_LENGTH`             | Wallet cycle length (days)                              |
| `NEXT_PUBLIC_DID_EXPLORER`             | DID explorer URL                                        |
| `NEXT_PUBLIC_MAPBOX_KEY`               | Mapbox API key                                          |

---

This document captures the complete logic of `interfacer-gui` as of 2026-06-25. Use it as the blueprint for building `@interfacer/client` — a standalone TypeScript SDK that any project can use to interact with the Interfacer ecosystem without duplicating this logic.
