import { gql, useQuery } from "@apollo/client";
import { useState } from "react";

const useDpp = () => {
  let visited: Array<any> = [];
  const MAX_DEPTH = 1000;
  const [resourceId, setResourceId] = useState<string | undefined>(undefined);
  const [eventId, setEventId] = useState<string | undefined>(undefined);
  const [processId, setProcessId] = useState<string | undefined>(undefined);

  const resourceVariables = {
    id: resourceId,
  };
  const eventVariables = {
    id: eventId,
  };
  const processVariables = {
    id: processId,
  };

  const ER_QUERY = gql`
    query ($id: ID!) {
      economicResource(id: $id) {
        previous {
          __typename
          ... on EconomicEvent {
            id
            action {
              id
              label
            }
            atLocation {
              ...location
            }
          }
        }
      }
    }
    fragment location on SpatialThing {
      id
      alt
      lat
      long
      mappableAddress
      name
      note
    }
  `;

  const EE_QUERY = gql`
    query ($id: ID!) {
      economicEvent(id: $id) {
        previous {
          __typename
          ... on EconomicResource {
            id
            name
            note
            trackingIdentifier
            metadata
            currentLocation {
              ...location
            }
          }
          ... on EconomicEvent {
            id
            action {
              id
              label
            }
            atLocation {
              ...location
            }
          }
          ... on Process {
            id
            name
            note
          }
        }
      }
    }
    fragment location on SpatialThing {
      id
      alt
      lat
      long
      mappableAddress
      name
      note
    }
  `;

  const PR_QUERY = gql`
    query ($id: ID!) {
      process(id: $id) {
        previous {
          __typename
          ... on EconomicEvent {
            id
            action {
              id
              label
            }
            atLocation {
              ...location
            }
          }
        }
      }
    }
    fragment location on SpatialThing {
      id
      alt
      lat
      long
      mappableAddress
      name
      note
    }
  `;

  const resource = useQuery(ER_QUERY, { variables: resourceVariables });
  const event = useQuery(EE_QUERY, { variables: eventVariables });
  const process = useQuery(PR_QUERY, { variables: processVariables });

  const er_before = async ({ id, dpp = [], depth }: { id: string; dpp?: any[]; depth: number }) => {
    setResourceId(id);

    if (depth > MAX_DEPTH) {
      depth += 1;
    }

    const events: any[] = await resource.data?.economicResource.previous;
    if (events?.length > 0) {
      let event = events.pop();

      // This must be of type EconomicEvent since the call only returns that
      while (visited.includes(event["id"])) {
        if (events.length == 0) {
          return dpp;
        }
        event = events.pop();
      }
      visited = visited.concat(event["id"]);
      let a_dpp: any = {};
      dpp.push(a_dpp);
      a_dpp.type = event["__typename"];
      a_dpp.id = event["id"];
      a_dpp.children = [];

      fill_event(a_dpp, event);
      ee_before({ id: event["id"], dpp: a_dpp["children"], depth: depth });
    }
    return dpp;
  };

  const fill_event = (a_dpp: any, item: any) => {
    a_dpp["name"] = item["action"]["id"];
  };
  const fill_res = (a_dpp: any, item: any) => {
    a_dpp["note"] = item["note"];
    a_dpp["trackingIdentifier"] = item["trackingIdentifier"];
  };

  const fill_process = (a_dpp: any, item: any) => {
    a_dpp["note"] = item["note"];
  };

  const ee_before = ({ id, dpp, depth }: { id: string; dpp: any; depth: number }) => {
    setEventId(id);
    if (depth > MAX_DEPTH) {
      return;
    }
    depth += 1;

    let pf_items = event["data"]["economicEvent"]["previous"];

    if (typeof pf_items == "object") {
      pf_items = [pf_items];
    }
    if (typeof pf_items == null) {
      return;
    }
    if (!pf_items.isArray()) {
      let pf_item = pf_items[-1];
      if (pf_item["id"] in visited) {
        return;
      }
      let a_dpp: any = {};
      dpp.push(a_dpp);
      a_dpp["type"] = pf_item["__typename"];
      a_dpp["id"] = pf_item["id"];
      a_dpp["children"] = [];

      if (pf_item["__typename"] == "EconomicEvent") {
        visited = visited.concat(pf_item["id"]);
        fill_event(a_dpp, pf_item);
        ee_before({ id: pf_item["id"], dpp: a_dpp["children"], depth });
      }
      if (pf_item["__typename"] == "EconomicResource") {
        fill_res(a_dpp, pf_item);
        er_before({ id: pf_item["id"], dpp: a_dpp["children"], depth });
      }
      if (pf_item["__typename"] == "Process") {
        visited = visited.concat(pf_item["id"]);
        fill_process(a_dpp, pf_item);
        pr_before({ id: pf_item["id"], dpp: a_dpp["children"], depth });
      }
    }
  };

  const pr_before = ({ id, dpp, depth }: { id: string; dpp: any; depth: number }) => {
    setProcessId(id);

    if (depth > MAX_DEPTH) {
      return;
    }
    depth += 1;

    const events: any[] = process["data"]["process"]["previous"];
    if (events.length != 0) {
      events.forEach(event => {
        if (event["id"] in visited) {
          return;
        }
        visited = visited.concat(event["id"]);
        let a_dpp: any = {};
        dpp.push(a_dpp);
        a_dpp["type"] = event["__typename"];
        a_dpp["id"] = event["id"];
        a_dpp["children"] = [];
        fill_event(a_dpp, event);
        ee_before({ id: event["id"], dpp: a_dpp["children"], depth: depth });
      });
    }
  };

  return { er_before };
};

export default useDpp;
