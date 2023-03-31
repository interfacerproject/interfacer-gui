import DPPVisualization from "components/DPPVisualization";

// Test cytoGraphData on a project in *debug instance*
const Test = () => {
  return (
    <>
      {/* <DPPVisualization projectId="063K63B4NE1Z39NXPEWP5VK74C" /> */}
      <DPPVisualization projectId="063EMWS0NCTH3N6TCVNG8EEPG8" />
      {/* <pre className="mx-auto">{JSON.stringify(pp, null, 2)}</pre> */}
    </>
  );
};

export default Test;
