import useCyto from "hooks/useCyto";
import devLog from "lib/devLog";
import { useEffect, useState } from "react";

// Test cytoGraphData on a project in *debug instance*
const Test = () => {
  const [pp, setPp] = useState<any>(null);
  const { generateGraph } = useCyto();
  const l = async () => {
    const p = await generateGraph("063EMWS0NCTH3N6TCVNG8EEPG8", true, false, false);
    setPp(p);
  };
  useEffect(() => {
    l();
  }, []);
  return <textarea value={JSON.stringify(pp, null, 2)} />;
};

export default Test;
