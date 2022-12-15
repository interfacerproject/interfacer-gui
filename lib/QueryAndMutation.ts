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
      }
      newInventoriedResource: {
        name: $name
        note: $note
        images: $images
        metadata: $metadata
        repo: $repo
        license: $license
      }
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
        provider: "${process.env.NEXT_PUBLIC_LOSH_ID}"
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
      license
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
  mutation CreateProcess($name: String!) {
    createProcess(process: { name: $name }) {
      process {
        id
      }
    }
  }
`;

export const FORK_ASSET = gql`
  mutation ForkAsset(
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
    $repo: String
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
