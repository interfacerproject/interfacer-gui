// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { gql } from "lib/apollo-compat";

/**
 * Like the SDK's FETCH_AGENTS, but also selects `user` (the handle) and
 * supports `before` for cursor pagination via useLoadMore.
 */
export const SEARCH_PEOPLE = gql`
  query searchPeople($userOrName: String!, $last: Int, $before: ID) {
    people(last: $last, before: $before, filter: { userOrName: $userOrName }) {
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
          user
          images {
            bin
            mimeType
          }
          primaryLocation {
            id
            name
          }
        }
      }
    }
  }
`;
