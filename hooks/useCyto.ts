import { useQuery } from "@apollo/client";
import { GET_DPP, GET_PROCESS_GROUP } from "lib/QueryAndMutation";
import {
  EconomicEvent,
  EconomicResource,
  GetDppQuery,
  GetDppQueryVariables,
  GetProcessGroupQuery,
  GetProcessGroupQueryVariables,
  Process,
} from "./../lib/types/index";

type ProcessGroup = Record<
  string,
  {
    id: string;
    name: string;
    note?: string | null;
    type: string;
    groups: string[];
    groupedIn: string | null;
  }
>;

type DppChild = {
  type: "EconomicResource" | "EconomicEvent" | "Process";
  children: DppChild[];
  node: EconomicResource | EconomicEvent | Process;
};

type CitoGraph = {
  elements: { nodes: any[]; edges: any[] };
  groups: any[];
  flags: string[];
};

const useCytoGraph = () => {
  const { refetch: fetchDPP } = useQuery<GetDppQuery, GetDppQueryVariables>(GET_DPP);
  const { refetch: fetchProcessGroup } = useQuery<GetProcessGroupQuery, GetProcessGroupQueryVariables>(
    GET_PROCESS_GROUP
  );

  const populateProcessGroups = async (id: string, processGroups: ProcessGroup) => {
    const { data } = await fetchProcessGroup({ id });
    const pg = data.processGroup;
    if (!pg) throw new Error("Process group not found.");
    //@ts-ignore
    processGroups[pg.name] = {
      id: pg.id,
      name: pg.name,
      note: pg.note,
      type: pg.type,
      groups: pg.groups!.edges.map(e => e.node.id),
      groupedIn: null,
    };

    if (pg.groupedIn !== null) {
      processGroups[pg.name].groupedIn = pg.groupedIn!.id;
      let found = false;
      for (const k of Object.keys(processGroups)) {
        if (processGroups[k].id === processGroups[pg.name].groupedIn) {
          found = true;
          break;
        }
      }
      if (!found) await populateProcessGroups(processGroups[pg.name].groupedIn!, processGroups);
    }
  };

  const findProcessGroups = async (dppChild: DppChild, processGroups: ProcessGroup) => {
    if (dppChild.type === "Process") {
      // @ts-ignore
      const id = dppChild.node.groupedIn.id;
      if (id !== null) {
        let found = false;
        for (const k of Object.keys(processGroups)) {
          if (processGroups[k].id === id) {
            found = true;
            break;
          }
        }
        if (!found) await populateProcessGroups(id, processGroups);
      }
    }

    for (let c of dppChild.children) await findProcessGroups(c, processGroups);
  };

  const differentiateResources = (dppChild: DppChild) => {
    let new_: DppChild | null = null;
    if (dppChild.type === "EconomicEvent")
      // @ts-ignore
      new_ = { children: [], type: dppChild.type, node: { ...dppChild.node, name: dppChild.node.action.id } };
    if (dppChild.type === "EconomicResource") {
      for (let c of dppChild.children) {
        // @ts-ignore
        if (c.node.action.id === "modify") {
          new_ = { children: [], type: dppChild.type, node: { ...dppChild.node, id: dppChild.node.id + c.node.id } };
          break;
        }
      }
    }
    if (!new_) new_ = { children: [], type: dppChild.type, node: dppChild.node };
    for (let c of dppChild.children) new_.children.push(differentiateResources(c));
    return new_;
  };

  const flattenObject: (obj: Record<string, any>, parentKey?: string) => Record<string, any> = (
    obj,
    parentKey = ""
  ) => {
    // console.log("flattenObject obj", obj);
    // if (!obj) debugger;
    return Object.keys(obj).reduce((acc: Record<string, any>, k: string) => {
      // console.log("flattenObject accumulator", acc);
      const key: string = parentKey ? `${parentKey}.${k}` : k;
      if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k]))
        return { ...acc, ...flattenObject(obj[k], key) };
      acc[key] = obj[k];
      return acc;
    }, {});
  };

  const isCompact = (compact: boolean, dppChild: DppChild) => {
    if (!compact) return false;

    if (dppChild.type === "EconomicResource" || dppChild.type === "Process") return true;
    // else, we can assume: dppChild.type === "EconomicEvent"
    // @ts-ignore
    const id = dppChild.node.action.id;
    if (id === "transfer" || id === "transferAllRights" || id === "transferCustody") return true;
    return false;
  };

  const makeCyto = (
    dppChild: DppChild,
    citoGraph: Record<string, any>,
    assignedNodes: Set<string>,
    assignedUsers: Set<string>,
    doUsers: boolean,
    compact: boolean,
    pendingEdge: Record<string, any>
  ) => {
    // @ts-ignore
    if (doUsers && (dppChild.node.provider !== null || dppChild.node.receiver !== null)) {
      // @ts-ignore
      const agent = dppChild.node.provider ? dppChild.node.provider : dppChild.node.receiver;
      if (!assignedUsers.has(agent.id)) {
        citoGraph.nodes.push({ data: { id: agent.id, ...flattenObject(agent) } });
        assignedUsers.add(agent.id);
        citoGraph.edges.push({ data: { source: agent.id, target: agent.id } });
      }
    }

    if (!assignedNodes.has(dppChild.node.id)) {
      const origin = assignedNodes.size === 0;
      assignedNodes.add(dppChild.node.id);
      if (!compact || isCompact(compact, dppChild)) {
        citoGraph.nodes.push({
          data: flattenObject({
            origin: origin,
            type: dppChild.type,
            ...dppChild.node,
          }),
        });
      }

      if (isCompact(compact, dppChild)) {
        if (pendingEdge.target === null) {
          pendingEdge.target = dppChild.node.id;
        } else {
          pendingEdge.source = dppChild.node.id;
          citoGraph.edges.push({
            data: {
              source: pendingEdge.source,
              target: pendingEdge.target,
            },
          });
          pendingEdge = { target: dppChild.node.id };
        }
      }
    }

    for (let c of dppChild.children) {
      if (!compact) {
        citoGraph.edges.push({
          data: {
            source: c.node.id,
            target: dppChild.node.id,
          },
        });
      }

      makeCyto(c, citoGraph, assignedNodes, assignedUsers, doUsers, compact, pendingEdge);
    }
  };

  const generateGraph = async (id: string, processGroups: any, doUsers: boolean, compact: boolean) => {
    // const addGroups = Object.keys(processGroups).length !== 0;
    console.log(Object.keys(processGroups).length !== 0);
    const addGroups = true;
    // let processGroups = {} as any
    const { data } = await fetchDPP({ id });
    const [oldDppChild] = data.economicResource?.traceDpp;

    const dppChild = differentiateResources(oldDppChild);

    if (addGroups) await findProcessGroups(dppChild, processGroups);

    if (compact) doUsers = false;

    const citoGraph: CitoGraph = {
      elements: { nodes: [], edges: [] },
      groups: [],
      flags: [],
    };

    const assignedNodes: Set<string> = new Set(),
      assignedUsers: Set<string> = new Set();

    let pendingEdge = {};
    if (compact) {
      pendingEdge = { source: null, target: null };
      citoGraph.flags.push("compact");
    }

    makeCyto(dppChild, citoGraph.elements, assignedNodes, assignedUsers, doUsers, compact, pendingEdge);
    if (addGroups) {
      for (const k of Object.keys(processGroups)) citoGraph.groups.push(flattenObject(processGroups[k]));
    }
    return citoGraph;
  };

  return {
    generateGraph,
  };
};

export default useCytoGraph;
