import { Checkbox, ChoiceList, Spinner, Stack } from "@bbtgnn/polaris-interfacer";
import { default as cytoscape, default as Cytoscape } from "cytoscape";
import dagre from "cytoscape-dagre";
import euler from "cytoscape-euler";
import fcose from "cytoscape-fcose";
import klay from "cytoscape-klay";
import useCyto from "hooks/useCyto";
import { compound, stylesheet } from "lib/cytoscape/helper";
import { useCallback, useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import "tippy.js/dist/tippy.css";

Cytoscape.use(fcose);
Cytoscape.use(klay);
Cytoscape.use(dagre);
Cytoscape.use(euler);
// Cytoscape.use(popper);

const addLabels = (n: any) => {
  n.data["label"] = n.data.name;
  return n;
};

const DPPVisualization = ({ projectId }: { projectId: string }) => {
  const { generateGraph } = useCyto();
  const cyRef = useRef<cytoscape.Core | null>();
  const [pp, setPp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<string[]>(["klay"]);
  const [showUsers, setShowUsers] = useState(false);
  const [compact, setCompact] = useState(true);
  const [grouped, setGrouped] = useState(false);

  const fetchData = async (compact: boolean, showUsers: boolean, grouped: boolean) => {
    setLoading(true);
    const p = await generateGraph(projectId, grouped, showUsers, compact);
    if (grouped) compound(p);
    p.elements["nodes"] = p.elements.nodes.map(addLabels);
    setPp(p);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(compact, showUsers, grouped);

    // cleanup cytoscape listeners on unmount
    return () => {
      if (cyRef.current) {
        cyRef.current.removeAllListeners();
        cyRef.current = null;
      }
    };
  }, [compact, showUsers, grouped]);

  const cyCallback = useCallback((cy: cytoscape.Core) => {
    // this is called each render of the component, don't add more listeners
    if (cyRef.current) return;

    cyRef.current = cy;

    cy.ready(() => {
      // groupNodes(cy, pp.groups);
      // createToolTip(cy);
      // console.debug("Tooltips added");
    });
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="container mx-auto justify-evenly flex items-center p-8">
        <ChoiceList
          title="Layout"
          choices={
            grouped
              ? [
                  { label: "klay", value: "klay" },
                  { label: "dagre", value: "dagre" },
                  { label: "fcose", value: "fcose" },
                ]
              : [
                  { label: "klay", value: "klay" },
                  { label: "euler", value: "euler" },
                  { label: "dagre", value: "dagre" },
                  { label: "fcose", value: "fcose" },
                ]
          }
          selected={layout}
          onChange={useCallback((value: string[]) => setLayout(value), [])}
        />
        <Stack vertical>
          <Checkbox
            label="Agents"
            checked={showUsers}
            onChange={useCallback((newChecked: boolean) => setShowUsers(newChecked), [])}
          />
          <Checkbox
            label="Grouped"
            checked={grouped}
            onChange={useCallback((newChecked: boolean) => setGrouped(newChecked), [])}
          />
          <Checkbox
            label="Events"
            checked={!compact}
            onChange={useCallback((newChecked: boolean) => setCompact(!newChecked), [])}
          />
        </Stack>
        <div>{loading && <Spinner />}</div>
      </div>
      {pp && (
        <>
          <CytoscapeComponent
            zoom={1}
            cy={cyCallback}
            elements={CytoscapeComponent.normalizeElements(pp.elements)}
            layout={{ name: layout[0] }}
            pan={{ x: 0, y: 0 }}
            stylesheet={stylesheet}
            className={"h-screen w-full"}
            minZoom={0.2}
            maxZoom={8}
            style={{}}
          />
        </>
      )}
    </div>
  );
};

export default DPPVisualization;
