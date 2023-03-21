import useCyto from "hooks/useCyto";
import devLog from "lib/devLog";
import { useEffect, useState } from "react";

// Test cytoGraphData on a project in *debug instance*
const Test = () => {
  const [pp, setPp] = useState<any>(null);
  const { generateGraph } = useCyto();
  const l = async () => {
    const p = await generateGraph("063EC255EADPZKTSEY75H3V7SR", {} as Record<string, any>, false, false);
    devLog("ppppppppp", p);
    setPp(p);
  };
  useEffect(() => {
    l();
  }, []);
  return <textarea value={JSON.stringify(pp, null, 2)} />;
};

export default Test;
