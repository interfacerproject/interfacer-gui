const addParents = n => {
  if (Object.hasOwn(n.data, "groupedIn")) {
    n.data.parent = n.data["groupedIn"];
  }
  if (Object.hasOwn(n.data, "groupedIn.id")) {
    n.data.parent = n.data["groupedIn.id"];
  }
  return n;
};

export const compound = d => {
  const processGroups = d.groups.map(g => {
    return { data: g };
  });
  d.elements.nodes = d.elements.nodes.concat(processGroups);
  d.elements["nodes"] = d.elements.nodes.map(addParents);
  return d;
};

export const stylesheet = [
  {
    selector: "node",
    style: {
      textWrap: "wrap",
      label: "data(label)",
    },
  },
  {
    selector: "node[type = 'EconomicResource'][?origin]",
    style: {
      backgroundColor: "#e34a33",
      shape: "ellipse",
    },
  },
  {
    selector: "node[type = 'EconomicResource'][!origin]",
    style: {
      backgroundColor: "#8980F5",
      shape: "ellipse",
    },
  },
  {
    selector: "node[type = 'EconomicEvent']",
    style: {
      backgroundColor: "#FFEEDD",
      shape: "rectangle",
    },
  },
  {
    selector: "node[type = 'EconomicEvent'][name = 'transfer']",
    style: {
      backgroundColor: "#D6D6D6",
    },
  },
  {
    selector: "node[type = 'EconomicEvent'][name = 'transferCustody']",
    style: {
      backgroundColor: "#D6D6D6",
    },
  },
  {
    selector: "node[type = 'EconomicEvent'][name = 'transferAllRights']",
    style: {
      backgroundColor: "#D6D6D6",
    },
  },
  {
    selector: "node[type = 'Process']",
    style: {
      backgroundColor: "#21897E",
      shape: "diamond",
    },
  },
  {
    selector: "node[type = 'ProcessGroup']",
    style: {
      backgroundColor: "#21897E",
      shape: "diamond",
    },
  },
  {
    selector: "node[type = 'ProcessGroup'][groups]",
    style: {
      backgroundColor: "#c0ede8",
      opacity: 0.8,
      borderColor: "gray",
      shape: "roundrectangle",
    },
  },
  {
    selector: "node[type = 'Person']",
    style: {
      backgroundColor: "#000000",
      shape: "triangle",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1,
      fontSize: "10px",
      fontStyle: "oblique",
      lineColor: "#969696",
      targetArrowColor: "#969696",
      targetArrowShape: "triangle",
      curveStyle: "bezier",
    },
  },
  {
    selector: "[?grouped]",
    style: {
      opacity: 0.2,
      backgroundColor: "transparent",
    },
  },
];
