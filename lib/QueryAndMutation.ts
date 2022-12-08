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
  mutation CreateProposal {
    createProposal(proposal: { name: "contribution" }) {
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

export const CREATE_ASSET = gql`
  mutation CreateAsset(
    $name: String!
    $note: String!
    $metadata: JSON
    $agent: ID!
    $creationTime: DateTime!
    $location: ID!
    $tags: [URI!]
    $resourceSpec: ID!
    $oneUnit: ID!
    $images: [IFile!]
    $repo: String
    $process: ID!
  ) {
    createEconomicEvent(
      event: {
        action: "raise"
        provider: $agent
        receiver: $agent
        outputOf: $process
        hasPointInTime: $creationTime
        resourceClassifiedAs: $tags
        resourceConformsTo: $resourceSpec
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $oneUnit }
        toLocation: $location
      }
      newInventoriedResource: { name: $name, note: $note, images: $images, metadata: $metadata, repo: $repo }
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

export const TRANSFER_ASSET = gql`
  mutation TransferAsset (
    $resource: ID!
    $name: String!
    $note: String!
    $metadata: JSON
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
        provider: "${process.env.NEXT_PUBLIC_LOASH_ID}"
        receiver: $agent
        hasPointInTime: $creationTime
        resourceClassifiedAs: $tags
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $oneUnit }
        toLocation: $location
      }
      newInventoriedResource: { name: $name, note: $note, metadata: $metadata}
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
      trace {
        __typename
        ... on EconomicEvent {
          hasPointInTime
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

export const UPDATE_METADATA = gql`
  mutation UpdateMetadata($metadata: JSON!, $id: ID!) {
    updateEconomicResource(resource: { id: $id, metadata: $metadata }) {
      economicResource {
        id
        metadata
      }
    }
  }
`;

export const QUERY_ASSET_TYPES = gql`
  query GetAssetTypes {
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

export const GET_TAGS = gql`
  query GetTags {
    economicResourceClassifications
  }
`;

export const QUERY_ASSETS = gql`
  query GetAssets($first: Int, $after: ID, $last: Int, $before: ID, $filter: ProposalFilterParams) {
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
          version
          licensor
          license
          trace {
            __typename
            ... on EconomicEvent {
              hasPointInTime
            }
          }
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
  mutation ($name: String!) {
    createProcess(process: { name: $name }) {
      process {
        id
      }
    }
  }
`;

export const FORK_ASSET = gql`
  mutation proposeContribution(
    $agent: ID! # Agent.id
    $creationTime: DateTime!
    $resource: ID! # EconomicResource.id
    $process: ID! # Process.id
    $unitOne: ID! # Unit.id
    $tags: [URI!]
    $location: ID! # SpatialThing.id
    $spec: ID! # ResourceSpecification.id
    $name: String!
    $note: String
    $repo: URI
    $metadata: JSON
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
      }
      newInventoriedResource: { name: $name, note: $note, repo: $repo, metadata: $metadata }
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
    $agent: ID!
    $creationTime: DateTime!
    $resource: ID!
    $unitOne: ID!
    $tags: [URI!]
    $spec: ID!
  ) {
    citeForkedAsset: createIntent(
      intent: {
        action: "cite"
        inputOf: $process
        provider: $agent
        hasPointInTime: $creationTime
        resourceInventoriedAs: $resource
        resourceQuantity: { hasNumericalValue: 1, hasUnit: $unitOne }
      }
    ) {
      intent {
        id
      }
    }
    produceNewResource: createIntent(
      intent: {
        action: "produce"
        outputOf: $process
        receiver: $agent
        hasPointInTime: $creationTime
        resourceClassifiedAs: $tags
        resourceConformsTo: $spec
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
  mutation LinkProposalAndIntent($proposal: ID!, $citeForkedAsset: ID!, $produceNewResource: ID!) {
    linkItem: proposeIntent(publishedIn: $proposal, publishes: $citeForkedAsset, reciprocal: false) {
      proposedIntent {
        id
      }
    }
    linkPayment: proposeIntent(publishedIn: $proposal, publishes: $produceNewResource, reciprocal: false) {
      proposedIntent {
        id
      }
    }
  }
`;

export const QUERY_PROPOSAL = gql`
  query ($id: ID!) {
    proposal(id: $id) {
      id
      name
      primaryIntents {
        id
        inputOf {
          name
          id
        }
        outputOf {
          id
          name
        }
        hasPointInTime
        resourceConformsTo {
          id
          name
        }
      }
    }
  }
`;

export const CITE_ASSET = gql`
  mutation citeAsset(
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
