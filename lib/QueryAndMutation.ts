// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { gql } from "@apollo/client";

export const QUERY_VARIABLES = gql`
  query GetVariables {
    instanceVariables {
      specs {
        specCurrency {
          id
          name
        }
        specProjectDesign {
          id
          name
        }
        specProjectProduct {
          id
          name
        }
        specProjectService {
          id
          name
        }
      }
      units {
        unitOne {
          id
        }
      }
    }
  }
`;

export const CREATE_PROPOSAL = gql`
  mutation CreateProposal($name: String!, $note: String!) {
    createProposal(proposal: { name: $name, note: $note }) {
      proposal {
        id
      }
    }
  }
`;

export const CREATE_INTENT = gql`
  mutation CreateIntent($agent: ID!, $resource: ID!, $oneUnit: ID!, $currency: ID!, $howMuch: Decimal!) {
    item: createIntent(
      intent: {
        name: "project"
        action: "transfer"
        provider: $agent
        resourceInventoriedAs: $resource
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $oneUnit }
      }
    ) {
      intent {
        id
      }
    }
    payment: createIntent(
      intent: {
        name: "payment"
        action: "transfer"
        receiver: $agent
        resourceConformsTo: $currency
        resourceQuantity: { hasNumericalValue: $howMuch, hasUnit: $oneUnit }
      }
    ) {
      intent {
        id
      }
    }
  }
`;

export const LINK_PROPOSAL_AND_INTENT = gql`
  mutation LinkProposalAndIntent($proposal: ID!, $item: ID!, $payment: ID!) {
    linkItem: proposeIntent(publishedIn: $proposal, publishes: $item, reciprocal: false) {
      proposedIntent {
        id
      }
    }
    linkPayment: proposeIntent(publishedIn: $proposal, publishes: $payment, reciprocal: true) {
      proposedIntent {
        id
      }
    }
  }
`;

export const CREATE_LOCATION = gql`
  mutation CreateLocation($name: String!, $addr: String!, $lat: Decimal!, $lng: Decimal!) {
    createSpatialThing(spatialThing: { name: $name, mappableAddress: $addr, lat: $lat, long: $lng }) {
      spatialThing {
        id
        lat
        long
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $name: String!
    $note: String!
    $metadata: JSONObject
    $agent: ID!
    $creationTime: DateTime!
    $location: ID
    $tags: [URI!]
    $resourceSpec: ID!
    $oneUnit: ID!
    $images: [IFile!]
    $repo: String
    $process: ID!
    $license: String!
  ) {
    createEconomicEvent(
      event: {
        action: "produce"
        provider: $agent
        receiver: $agent
        outputOf: $process
        hasPointInTime: $creationTime
        resourceClassifiedAs: $tags
        resourceConformsTo: $resourceSpec
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $oneUnit }
        toLocation: $location
        resourceMetadata: $metadata
      }
      newInventoriedResource: { name: $name, note: $note, images: $images, repo: $repo, license: $license }
    ) {
      economicEvent {
        id
        resourceInventoriedAs {
          id
          name
        }
      }
    }
  }
`;

export const TRANSFER_PROJECT = gql`
  mutation TransferProject (
    $resource: ID!
    $name: String!
    $note: String!
    $metadata: JSONObject
    $agent: ID!
    $creationTime: DateTime!
    $location: ID!
    $tags: [URI!]
    $oneUnit: ID!
  ) {
    createEconomicEvent(
      event: {
        resourceInventoriedAs: $resource
        action: "transfer"
        provider: "${process.env.NEXT_PUBLIC_LOSH_ID}"
        receiver: $agent
        hasPointInTime: $creationTime
        resourceClassifiedAs: $tags
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $oneUnit }
        toLocation: $location
        resourceMetadata: $metadata
      }
      newInventoriedResource: { name: $name, note: $note}
    ) {
      economicEvent {
        id
        toResourceInventoriedAs {
          id
          name
        }
      }
    }
  }
`;

export const QUERY_RESOURCE = gql`
  query getResourceTable($id: ID!) {
    economicResource(id: $id) {
      id
      name
      note
      metadata
      license
      repo
      traceDpp
      trace {
        __typename
        ... on Process {
          id
          name
        }
        ... on EconomicEvent {
          inputOf {
            id
            name
          }
          outputOf {
            id
            name
          }
          hasPointInTime
          action {
            id
            label
            inputOutput
          }
        }
        ... on EconomicResource {
          id
          name
          note
        }
      }
      conformsTo {
        id
        name
      }
      onhandQuantity {
        hasUnit {
          id
          symbol
          label
        }
        hasNumericalValue
      }
      accountingQuantity {
        hasUnit {
          label
          symbol
        }
        hasNumericalValue
      }
      primaryAccountable {
        id
        name
      }
      currentLocation {
        id
        name
        mappableAddress
      }
      primaryAccountable {
        id
        name
      }
      images {
        hash
        name
        mimeType
        bin
      }
    }
  }
`;

export const QUERY_PROJECT_TYPES = gql`
  query GetProjectTypes {
    instanceVariables {
      specs {
        specProjectDesign {
          id
          name
        }
        specProjectProduct {
          id
          name
        }
        specProjectService {
          id
          name
        }
      }
    }
  }
`;

export const QUERY_AGENTS = gql`
  query getAgent($first: Int, $id: ID) {
    agents(first: $first, after: $id) {
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
        totalCount
        pageLimit
      }
      edges {
        cursor
        node {
          id
          name
        }
      }
    }
  }
`;

export const FETCH_AGENTS = gql`
  query getAgents($userOrName: String!, $last: Int) {
    agents(last: $last, filter: { name: $userOrName }) {
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
        totalCount
        pageLimit
      }
      edges {
        cursor
        node {
          id
          name
          note
          primaryLocation {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_TAGS = gql`
  query GetTags {
    economicResourceClassifications
  }
`;

export const QUERY_PROJECTS = gql`
  query GetProjects($first: Int, $after: ID, $last: Int, $before: ID, $filter: ProposalFilterParams) {
    proposals(first: $first, after: $after, before: $before, last: $last, filter: $filter) {
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
        totalCount
        pageLimit
      }
      edges {
        cursor
        node {
          id
          name
          created
          primaryIntents {
            resourceClassifiedAs
            action {
              id
            }
            hasPointInTime
            hasBeginning
            hasEnd
            resourceInventoriedAs {
              conformsTo {
                name
              }
              classifiedAs
              primaryAccountable {
                name
                id
              }
              name
              id
              note
              metadata
              onhandQuantity {
                hasUnit {
                  label
                }
              }
              images {
                hash
                name
                mimeType
                bin
              }
            }
          }
          reciprocalIntents {
            resourceQuantity {
              hasNumericalValue
              hasUnit {
                label
                symbol
              }
            }
          }
        }
      }
    }
  }
`;

export const QUERY_UNIT_AND_CURRENCY = gql`
  query GetUnitAndCurrency {
    instanceVariables {
      units {
        unitOne {
          id
        }
      }
      specs {
        specCurrency {
          id
        }
      }
    }
  }
`;

export const FETCH_USER = gql`
  query GetUser($id: ID!) {
    person(id: $id) {
      id
      name
      email
      user
      ethereumAddress
      primaryLocation {
        name
        mappableAddress
      }
    }
  }
`;

export const FETCH_RESOURCES = gql`
  query FetchInventory($first: Int, $after: ID, $last: Int, $before: ID, $filter: EconomicResourceFilterParams) {
    economicResources(first: $first, after: $after, before: $before, last: $last, filter: $filter) {
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
        totalCount
        pageLimit
      }
      edges {
        cursor
        node {
          conformsTo {
            id
            name
          }
          currentLocation {
            id
            name
            mappableAddress
          }
          id
          name
          classifiedAs
          note
          metadata
          okhv
          repo
          images {
            hash
            name
            mimeType
            bin
          }
          version
          licensor
          license
          primaryAccountable {
            id
            name
            note
          }
          custodian {
            id
            name
            note
          }
          accountingQuantity {
            hasUnit {
              id
              label
              symbol
            }
            hasNumericalValue
          }
          onhandQuantity {
            hasUnit {
              id
              label
              symbol
            }
            hasNumericalValue
          }
        }
      }
    }
  }
`;

export const GET_RESOURCE_DETAILS = gql`
  query GetResourceDetails($id: ID!) {
    proposal(id: $id) {
      created
      primaryIntents {
        hasPointInTime
        resourceInventoriedAs {
          conformsTo {
            name
            id
          }
          currentLocation {
            name
          }
          name
          id
          note
          classifiedAs
          metadata
          primaryAccountable {
            name
            id
          }
          onhandQuantity {
            hasUnit {
              label
            }
          }
          images {
            hash
            name
            mimeType
            bin
          }
        }
      }
    }
  }
`;

export const CREATE_PROCESS = gql`
  mutation CreateProcess($name: String!) {
    createProcess(process: { name: $name }) {
      process {
        id
      }
    }
  }
`;

export const FORK_PROJECT = gql`
  mutation ForkProject(
    $agent: ID! # Agent.id
    $creationTime: DateTime!
    $resource: ID! # EconomicResource.id
    $process: ID! # Process.id
    $unitOne: ID! # Unit.id
    $tags: [URI!]
    $location: ID # SpatialThing.id
    $spec: ID! # ResourceSpecification.id
    $name: String!
    $note: String
    $repo: String
    $metadata: JSONObject
  ) {
    cite: createEconomicEvent(
      event: {
        action: "cite"
        inputOf: $process
        provider: $agent
        receiver: $agent
        hasPointInTime: $creationTime
        resourceInventoriedAs: $resource
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
      }
    ) {
      economicEvent {
        id
      }
    }
    produce: createEconomicEvent(
      event: {
        action: "produce"
        outputOf: $process
        provider: $agent
        receiver: $agent
        hasPointInTime: $creationTime
        resourceClassifiedAs: $tags
        resourceConformsTo: $spec
        toLocation: $location
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
        resourceMetadata: $metadata
      }
      newInventoriedResource: { name: $name, note: $note, repo: $repo }
    ) {
      economicEvent {
        id
        resourceInventoriedAs {
          id
          name
        }
      }
    }
  }
`;

export const PROPOSE_CONTRIBUTION = gql`
  mutation proposeContribution(
    $process: ID!
    $owner: ID!
    $proposer: ID!
    $creationTime: DateTime!
    $resourceForked: ID!
    $unitOne: ID!
    $resourceOrigin: ID!
  ) {
    citeResourceForked: createIntent(
      intent: {
        action: "cite"
        inputOf: $process
        provider: $proposer
        hasPointInTime: $creationTime
        resourceInventoriedAs: $resourceForked
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
      }
    ) {
      intent {
        id
      }
    }
    acceptResourceOrigin: createIntent(
      intent: {
        action: "accept"
        inputOf: $process
        receiver: $owner
        hasPointInTime: $creationTime
        resourceInventoriedAs: $resourceOrigin
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
      }
    ) {
      intent {
        id
      }
    }
    modifyResourceOrigin: createIntent(
      intent: {
        action: "modify"
        outputOf: $process
        receiver: $owner
        hasPointInTime: $creationTime
        resourceInventoriedAs: $resourceOrigin
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
      }
    ) {
      intent {
        id
      }
    }
  }
`;

export const LINK_CONTRIBUTION_PROPOSAL_INTENT = gql`
  mutation LinkContributionAndProposalAndIntent(
    $proposal: ID!
    $citeIntent: ID!
    $acceptIntent: ID!
    $modifyIntent: ID!
  ) {
    proposeCite: proposeIntent(publishedIn: $proposal, publishes: $citeIntent) {
      proposedIntent {
        id
      }
    }
    proposeAccept: proposeIntent(publishedIn: $proposal, publishes: $acceptIntent) {
      proposedIntent {
        id
      }
    }
    proposeModify: proposeIntent(publishedIn: $proposal, publishes: $modifyIntent) {
      proposedIntent {
        id
      }
    }
  }
`;

export const QUERY_PROPOSAL = gql`
  query QueryProposal($id: ID!) {
    proposal(id: $id) {
      id
      name
      note
      status
      primaryIntents {
        id
        provider {
          id
          name
        }
        receiver {
          id
          name
        }
        inputOf {
          name
          id
        }
        outputOf {
          id
          name
        }
        hasPointInTime
        resourceInventoriedAs {
          id
          name
          repo
          primaryAccountable {
            id
            name
          }
          onhandQuantity {
            hasNumericalValue
            hasUnit {
              id
            }
          }
        }
        resourceConformsTo {
          id
          name
        }
      }
    }
  }
`;

export const CITE_PROJECT = gql`
  mutation citeProject(
    $agent: ID! # Agent.id
    $creationTime: DateTime!
    $resource: ID! # EconomicResource.id
    $process: ID! # Process.id
    $unitOne: ID! # Unit.id
  ) {
    createEconomicEvent(
      event: {
        action: "cite"
        inputOf: $process
        provider: $agent
        receiver: $agent
        hasPointInTime: $creationTime
        resourceInventoriedAs: $resource
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
      }
    ) {
      economicEvent {
        id
      }
    }
  }
`;

export const CONTRIBUTE_TO_PROJECT = gql`
  mutation contributeToProject(
    $agent: ID! # Agent.id
    $creationTime: DateTime!
    $process: ID! # Process.id
    $unitOne: ID! # Unit.id
    $conformTo: ID!
  ) {
    createEconomicEvent(
      event: {
        action: "work"
        inputOf: $process
        provider: $agent
        receiver: $agent
        resourceConformsTo: $conformTo
        hasPointInTime: $creationTime
        effortQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
      }
    ) {
      economicEvent {
        id
      }
    }
  }
`;

export const ACCEPT_PROPOSAL = gql`
  mutation acceptProposal(
    $process: ID!
    $owner: ID!
    $proposer: ID!
    $unitOne: ID!
    $resourceForked: ID!
    $resourceOrigin: ID!
    $creationTime: DateTime!
  ) {
    cite: createEconomicEvent(
      event: {
        action: "cite"
        inputOf: $process
        provider: $proposer
        receiver: $owner
        resourceInventoriedAs: $resourceForked
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
        hasPointInTime: $creationTime
      }
    ) {
      economicEvent {
        id
      }
    }

    accept: createEconomicEvent(
      event: {
        action: "accept"
        inputOf: $process
        provider: $owner
        receiver: $owner
        resourceInventoriedAs: $resourceOrigin
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
        hasPointInTime: $creationTime
      }
    ) {
      economicEvent {
        id
      }
    }

    modify: createEconomicEvent(
      event: {
        action: "modify"
        outputOf: $process
        provider: $owner
        receiver: $owner
        resourceInventoriedAs: $resourceOrigin
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
        hasPointInTime: $creationTime
      }
    ) {
      economicEvent {
        id
      }
    }
  }
`;

export const SATISFY_INTENTS = gql`
  mutation satisfyIntents(
    $unitOne: ID!
    $intentCited: ID!
    $intentAccepted: ID!
    $intentModify: ID!
    $eventCite: ID!
    $eventAccept: ID!
    $eventModify: ID!
  ) {
    cite: createSatisfaction(
      satisfaction: {
        satisfies: $intentCited
        satisfiedByEvent: $eventCite
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
      }
    ) {
      satisfaction {
        id
      }
    }

    accept: createSatisfaction(
      satisfaction: {
        satisfies: $intentAccepted
        satisfiedByEvent: $eventAccept
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
      }
    ) {
      satisfaction {
        id
      }
    }

    modify: createSatisfaction(
      satisfaction: {
        satisfies: $intentModify
        satisfiedByEvent: $eventModify
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
      }
    ) {
      satisfaction {
        id
      }
    }
  }
`;

export const REJECT_PROPOSAL = gql`
  mutation rejectProposal($intentCite: ID!, $intentAccept: ID!, $intentModify: ID!) {
    cite: updateIntent(intent: { id: $intentCite, finished: true }) {
      intent {
        id
      }
    }
    accept: updateIntent(intent: { id: $intentAccept, finished: true }) {
      intent {
        id
      }
    }
    modify: updateIntent(intent: { id: $intentModify, finished: true }) {
      intent {
        id
      }
    }
  }
`;
export const ASK_RESOURCE_PRIMARY_ACCOUNTABLE = gql`
  query askResourcePrimaryAccountable($id: ID!) {
    economicResource(id: $id) {
      primaryAccountable {
        id
        name
      }
    }
  }
`;

export const QUERY_RESOURCE_PROPOSAlS = gql`
  query resourceProposals($id: ID!) {
    proposals(filter: { primaryIntentsResourceInventoriedAsId: [$id] }) {
      edges {
        node {
          id
          status
          note
          created
          primaryIntents {
            provider {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export const CLAIM_DID = gql`
  mutation claimDID($id: ID!) {
    claimPerson(id: $id)
  }
`;

export const UPDATE_METADATA = gql`
  mutation updateMetadata(
    $process: ID!
    $agent: ID!
    $resource: ID!
    $quantity: IMeasure!
    $now: DateTime!
    $metadata: JSONObject!
  ) {
    accept: createEconomicEvent(
      event: {
        action: "accept"
        inputOf: $process
        provider: $agent
        receiver: $agent
        resourceInventoriedAs: $resource
        resourceQuantity: $quantity
        hasPointInTime: $now
      }
    ) {
      economicEvent {
        id
      }
    }

    modify: createEconomicEvent(
      event: {
        action: "modify"
        outputOf: $process
        provider: $agent
        receiver: $agent
        resourceInventoriedAs: $resource
        resourceQuantity: $quantity
        resourceMetadata: $metadata
        hasPointInTime: $now
      }
    ) {
      economicEvent {
        id
      }
    }
  }
`;

export const QUERY_PROJECT_FOR_METADATA_UPDATE = gql`
  query queryProjectForMetadataUpdate($id: ID!) {
    economicResource(id: $id) {
      id
      name
      metadata
      onhandQuantity {
        hasUnit {
          id
          symbol
          label
        }
        hasNumericalValue
      }
      accountingQuantity {
        hasUnit {
          id
          label
          symbol
        }
        hasNumericalValue
      }
      primaryAccountable {
        id
      }
    }
  }
`;
