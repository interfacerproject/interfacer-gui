import type { TraceDppNode } from "@dyne/interfacer-client";
import { Copy, FitToScreen, List, Network_3, Subtract, Add } from "@carbon/icons-react";
import DetailSection from "components/DetailSection";
import { useAuth } from "hooks/useAuth";
import dayjs from "lib/dayjs";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Tree, { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";

type TraceView = "graph" | "outline";
type NodeKind = "resource" | "event" | "process" | "other";

type TraceGraphDatum = RawNodeDatum & {
  attributes: Record<string, string | number | boolean> & { nodeKey: string; kind: NodeKind };
  children?: TraceGraphDatum[];
};

const NODE_COLORS: Record<NodeKind, { fill: string; stroke: string; eyebrow: string }> = {
  resource: { fill: "#f1f8f5", stroke: "#036a53", eyebrow: "RESOURCE" },
  event: { fill: "#fff5ea", stroke: "#c76526", eyebrow: "EVENT" },
  process: { fill: "#fff8df", stroke: "#916a00", eyebrow: "PROCESS" },
  other: { fill: "#f5f5f5", stroke: "#6c707c", eyebrow: "RECORD" },
};

function asRecord(value: unknown): Record<string, any> | undefined {
  return value && typeof value === "object" ? (value as Record<string, any>) : undefined;
}

function nodeKind(node: TraceDppNode): NodeKind {
  if (node.type === "EconomicResource") return "resource";
  if (node.type === "EconomicEvent") return "event";
  if (node.type === "Process") return "process";
  return "other";
}

function nodeLabel(node: TraceDppNode): string {
  if (node.node.name) return node.node.name;
  const action = asRecord(node.node.action)?.label || asRecord(node.node.action)?.id;
  if (action) {
    const resource = asRecord(node.node.resourceInventoriedAs)?.name;
    return resource ? `${action} · ${resource}` : String(action);
  }
  return node.type.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function nodeTime(node: TraceDppNode): string | undefined {
  const value = node.node.hasPointInTime || node.node.hasEnd || node.node.hasBeginning;
  return typeof value === "string" ? value : undefined;
}

function truncate(value: string, length = 24): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

function flattenTrace(nodes: TraceDppNode[]): TraceDppNode[] {
  return nodes.flatMap(node => [node, ...flattenTrace(node.children || [])]);
}

function toGraphDatum(node: TraceDppNode, path: string, lookup: Map<string, TraceDppNode>): TraceGraphDatum {
  const id = typeof node.node.id === "string" ? node.node.id : "node";
  const nodeKey = `${path}-${id}`;
  lookup.set(nodeKey, node);
  return {
    name: nodeLabel(node),
    attributes: { nodeKey, kind: nodeKind(node) },
    children: node.children?.map((child, index) => toGraphDatum(child, `${path}.${index}`, lookup)),
  };
}

function TraceNode({ nodeDatum, selectedKey }: CustomNodeElementProps & { selectedKey?: string }) {
  const kind = (nodeDatum.attributes?.kind as NodeKind) || "other";
  const palette = NODE_COLORS[kind];
  const selected = nodeDatum.attributes?.nodeKey === selectedKey;

  return (
    <g>
      <rect
        x={-12}
        y={-27}
        width={196}
        height={54}
        rx={6}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={selected ? 3 : 1.5}
      />
      <circle cx={4} cy={-10} r={4} fill={palette.stroke} />
      <text x={14} y={-6} fill={palette.stroke} stroke="none" fontSize={9} fontWeight={700} letterSpacing="0.08em">
        {palette.eyebrow}
      </text>
      <text x={4} y={14} fill="#0b1324" stroke="none" fontSize={13} fontWeight={600}>
        {truncate(nodeDatum.name)}
      </text>
      {nodeDatum.children?.length ? (
        <circle
          cx={172}
          cy={0}
          r={4}
          fill={nodeDatum.__rd3t.collapsed ? palette.stroke : palette.fill}
          stroke={palette.stroke}
        />
      ) : null}
    </g>
  );
}

function TraceOutline({
  nodes,
  selected,
  onSelect,
  depth = 0,
}: {
  nodes: TraceDppNode[];
  selected?: TraceDppNode;
  onSelect: (node: TraceDppNode) => void;
  depth?: number;
}) {
  return (
    <ul className={depth === 0 ? "m-0 p-0 list-none space-y-2" : "mt-2 ml-5 pl-4 border-l border-ifr space-y-2"}>
      {nodes.map((node, index) => {
        const kind = nodeKind(node);
        const palette = NODE_COLORS[kind];
        const isSelected = selected === node;
        const key = `${node.node.id || node.type}-${depth}-${index}`;
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => onSelect(node)}
              className="w-full flex items-center gap-3 p-3 text-left border transition-colors"
              style={{
                borderRadius: "var(--ifr-radius-sm)",
                borderColor: isSelected ? palette.stroke : "var(--ifr-border)",
                backgroundColor: isSelected ? palette.fill : "var(--ifr-bg-surface)",
              }}
            >
              <span
                className="shrink-0"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: kind === "event" ? 2 : 999,
                  backgroundColor: palette.stroke,
                }}
              />
              <span className="flex-1 min-w-0">
                <span className="block text-ifr-text-primary font-semibold truncate">{nodeLabel(node)}</span>
                <span className="block text-ifr-text-secondary mt-0.5" style={{ fontSize: "var(--ifr-fs-xs)" }}>
                  {palette.eyebrow}
                  {nodeTime(node) ? ` · ${dayjs(nodeTime(node)).format("DD MMM YYYY, HH:mm")}` : ""}
                </span>
              </span>
              {node.children?.length ? (
                <span className="text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-xs)" }}>
                  {node.children.length}
                </span>
              ) : null}
            </button>
            {node.children?.length ? (
              <TraceOutline nodes={node.children} selected={selected} onSelect={onSelect} depth={depth + 1} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function NodeDetails({ node }: { node?: TraceDppNode }) {
  const { t } = useTranslation("common");
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center text-ifr-text-secondary">
        <p className="m-0">{t("Select a node to inspect its provenance details.")}</p>
      </div>
    );
  }

  const metadata = asRecord(node.node.metadata);
  const action = asRecord(node.node.action);
  const dppUlid = metadata?.dppServiceUlid;
  const fields = [
    [t("Type"), node.type],
    [t("Action"), action?.label || action?.id],
    [t("Date"), nodeTime(node) ? dayjs(nodeTime(node)).format("DD MMM YYYY, HH:mm") : undefined],
    [t("License"), node.node.license],
    [t("Licensor"), node.node.licensor],
    [t("DPP identifier"), dppUlid],
    [t("Record ID"), node.node.id],
  ].filter((field): field is [string, string] => Boolean(field[1]));

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block"
          style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: NODE_COLORS[nodeKind(node)].stroke }}
        />
        <span className="uppercase tracking-wide text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-xs)" }}>
          {NODE_COLORS[nodeKind(node)].eyebrow}
        </span>
      </div>
      <h4
        className="m-0 text-ifr-text-primary"
        style={{ fontFamily: "var(--ifr-font-heading)", fontSize: "var(--ifr-fs-lg)" }}
      >
        {nodeLabel(node)}
      </h4>
      {node.node.note ? <p className="mt-2 mb-0 text-ifr-text-secondary">{node.node.note}</p> : null}

      <dl className="mt-5 mb-0 divide-y divide-[#e5e7eb]">
        {fields.map(([label, value]) => (
          <div key={label} className="py-2.5 grid grid-cols-[110px_minmax(0,1fr)] gap-3">
            <dt className="text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-xs)" }}>
              {label}
            </dt>
            <dd
              className="m-0 text-ifr-text-primary break-all"
              style={{ fontSize: "var(--ifr-fs-sm)", fontWeight: 500 }}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <details className="mt-4">
        <summary className="cursor-pointer text-[#036a53] font-semibold" style={{ fontSize: "var(--ifr-fs-sm)" }}>
          {t("Raw node data")}
        </summary>
        <pre className="mt-3 p-3 overflow-auto bg-[#f6f6f7] border border-ifr rounded-ifr-sm text-xs whitespace-pre-wrap break-all">
          {JSON.stringify(node.node, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function LoadingTrace() {
  return (
    <div className="grid gap-4 animate-pulse" aria-label="Loading traceability data">
      <div className="h-[420px] rounded-ifr-md bg-[rgba(200,212,229,0.3)]" />
      <div className="h-[420px] rounded-ifr-md bg-[rgba(200,212,229,0.2)]" />
    </div>
  );
}

export default function ProjectTraceability({ projectId }: { projectId: string }) {
  const { t } = useTranslation("common");
  const { client } = useAuth();
  const requestedProjectRef = useRef<string>();
  const traceRequestedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<TraceDppNode[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [view, setView] = useState<TraceView>("graph");
  const [selected, setSelected] = useState<TraceDppNode>();
  const [zoom, setZoom] = useState(0.72);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(760);
  const [treeKey, setTreeKey] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width) setCanvasWidth(width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [nodes, view]);

  const loadTrace = useCallback(async () => {
    if (!client || loading || requestedProjectRef.current === projectId) return;
    requestedProjectRef.current = projectId;
    setLoading(true);
    setError(undefined);
    try {
      const result = await client.resources.getTraceDpp(projectId);
      setNodes(result);
      setSelected(result[0]);
    } catch (reason) {
      requestedProjectRef.current = undefined;
      setError(reason instanceof Error ? reason.message : t("Traceability data could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [client, loading, projectId, t]);

  const requestTrace = useCallback(() => {
    traceRequestedRef.current = true;
    void loadTrace();
  }, [loadTrace]);

  useEffect(() => {
    if (client && traceRequestedRef.current && !nodes && !loading && !error) void loadTrace();
  }, [client, error, loadTrace, loading, nodes]);

  const allNodes = useMemo(() => flattenTrace(nodes || []), [nodes]);
  const counts = useMemo(
    () => ({
      resources: allNodes.filter(node => node.type === "EconomicResource").length,
      processes: allNodes.filter(node => node.type === "Process").length,
      events: allNodes.filter(node => node.type === "EconomicEvent").length,
    }),
    [allNodes]
  );

  const graph = useMemo(() => {
    const lookup = new Map<string, TraceDppNode>();
    const data = (nodes || []).map((node, index) => toGraphDatum(node, String(index), lookup));
    return { data, lookup };
  }, [nodes]);

  const selectedKey = useMemo(() => {
    let match: string | undefined;
    graph.lookup.forEach((value, key) => {
      if (value === selected) match = key;
    });
    return match;
  }, [graph.lookup, selected]);

  const copyTrace = useCallback(async () => {
    if (!nodes) return;
    await navigator.clipboard.writeText(JSON.stringify(nodes, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [nodes]);

  const resetGraph = () => {
    setZoom(0.72);
    setTreeKey(key => key + 1);
  };

  return (
    <DetailSection
      icon={<Network_3 size={24} />}
      iconBg="bg-[rgba(3,106,83,0.1)] text-[#036a53]"
      title={t("Traceability")}
      subtitle={t("Follow the resources, processes and events behind this project")}
      sectionId="traceability"
      onOpen={requestTrace}
      badge={
        allNodes.length ? (
          <span className="border border-[#c9cccf] rounded px-2 py-0.5 text-xs font-medium text-[#0b1324]">
            {allNodes.length}
          </span>
        ) : undefined
      }
    >
      {loading ? (
        <LoadingTrace />
      ) : error ? (
        <div className="p-6 border border-[#f0c6c2] bg-[#fef5f5] rounded-ifr-md">
          <h4 className="m-0 text-[#8e1f17] font-semibold">{t("Traceability data is unavailable")}</h4>
          <p className="mt-2 mb-4 text-[#8e1f17]">{error}</p>
          <button
            type="button"
            onClick={loadTrace}
            className="px-4 py-2 rounded-ifr-sm bg-[#036a53] text-white font-semibold"
          >
            {t("Try again")}
          </button>
        </div>
      ) : nodes && nodes.length === 0 ? (
        <div className="py-10 px-6 text-center border border-dashed border-ifr rounded-ifr-md bg-ifr-hover">
          <Network_3 size={32} className="mx-auto text-ifr-text-secondary" />
          <h4 className="mt-3 mb-1 text-ifr-text-primary font-semibold">{t("No traceability records yet")}</h4>
          <p className="m-0 text-ifr-text-secondary">
            {t("Processes and linked resources will appear here when provenance records are available.")}
          </p>
        </div>
      ) : nodes ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" aria-label={t("Traceability summary")}>
              {[
                [t("Resources"), counts.resources, NODE_COLORS.resource.stroke],
                [t("Processes"), counts.processes, NODE_COLORS.process.stroke],
                [t("Events"), counts.events, NODE_COLORS.event.stroke],
              ].map(([label, count, color]) => (
                <span
                  key={String(label)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-ifr rounded-ifr-full bg-ifr-surface"
                  style={{ fontSize: "var(--ifr-fs-sm)" }}
                >
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: String(color) }} />
                  <strong>{count}</strong> {label}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="inline-flex border border-ifr rounded-ifr-sm overflow-hidden"
                role="group"
                aria-label={t("Trace view")}
              >
                <button
                  type="button"
                  aria-pressed={view === "graph"}
                  onClick={() => setView("graph")}
                  className={`flex items-center gap-1.5 px-3 py-2 ${
                    view === "graph" ? "bg-[#036a53] text-white" : "bg-white text-ifr-text-primary"
                  }`}
                >
                  <Network_3 size={16} /> {t("Graph")}
                </button>
                <button
                  type="button"
                  aria-pressed={view === "outline"}
                  onClick={() => setView("outline")}
                  className={`flex items-center gap-1.5 px-3 py-2 border-l border-ifr ${
                    view === "outline" ? "bg-[#036a53] text-white" : "bg-white text-ifr-text-primary"
                  }`}
                >
                  <List size={16} /> {t("Outline")}
                </button>
              </div>
              <button
                type="button"
                onClick={copyTrace}
                className="flex items-center gap-1.5 px-3 py-2 border border-ifr rounded-ifr-sm bg-white hover:bg-ifr-hover"
              >
                <Copy size={16} /> {copied ? t("Copied") : t("Copy data")}
              </button>
            </div>
          </div>

          <div className="grid gap-4 items-stretch">
            <div className="border border-ifr rounded-ifr-md overflow-hidden bg-[#fbfcfb]" ref={containerRef}>
              {view === "graph" ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2 border-b border-ifr bg-white">
                    <p className="m-0 text-ifr-text-secondary" style={{ fontSize: "var(--ifr-fs-xs)" }}>
                      {t("Drag to pan. Scroll or use the controls to zoom. Select a node for details.")}
                    </p>
                    <div className="flex items-center gap-1" role="group" aria-label={t("Graph controls")}>
                      <button
                        type="button"
                        onClick={() => setZoom(value => Math.max(0.3, value - 0.1))}
                        className="p-2 rounded-ifr-sm hover:bg-ifr-hover"
                        aria-label={t("Zoom out")}
                      >
                        <Subtract size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom(value => Math.min(1.4, value + 0.1))}
                        className="p-2 rounded-ifr-sm hover:bg-ifr-hover"
                        aria-label={t("Zoom in")}
                      >
                        <Add size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={resetGraph}
                        className="p-2 rounded-ifr-sm hover:bg-ifr-hover"
                        aria-label={t("Reset graph view")}
                      >
                        <FitToScreen size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpanded(value => !value)}
                        className="px-2 py-1.5 rounded-ifr-sm hover:bg-ifr-hover text-ifr-text-primary"
                        style={{ fontSize: "var(--ifr-fs-xs)", fontWeight: 600 }}
                      >
                        {expanded ? t("Compact") : t("Expand")}
                      </button>
                    </div>
                  </div>
                  <div
                    className="traceability-graph w-full"
                    style={{ height: expanded ? "min(78vh, 820px)" : "480px" }}
                    role="img"
                    aria-label={t("Project provenance graph with {{count}} records", { count: allNodes.length })}
                  >
                    <Tree
                      key={treeKey}
                      data={graph.data}
                      orientation="horizontal"
                      pathFunc="step"
                      nodeSize={{ x: 330, y: 92 }}
                      separation={{ siblings: 1.1, nonSiblings: 1.35 }}
                      translate={{ x: Math.max(44, canvasWidth * 0.07), y: expanded ? 320 : 240 }}
                      zoom={zoom}
                      scaleExtent={{ min: 0.25, max: 1.5 }}
                      initialDepth={3}
                      centeringTransitionDuration={0}
                      transitionDuration={0}
                      onNodeClick={node => {
                        const key = node.data.attributes?.nodeKey;
                        if (typeof key === "string") setSelected(graph.lookup.get(key));
                      }}
                      renderCustomNodeElement={props => <TraceNode {...props} selectedKey={selectedKey} />}
                    />
                  </div>
                </>
              ) : (
                <div className="p-4 max-h-[620px] overflow-auto">
                  <TraceOutline nodes={nodes} selected={selected} onSelect={setSelected} />
                </div>
              )}
            </div>

            <aside
              className="border border-ifr rounded-ifr-md bg-white overflow-hidden"
              aria-label={t("Selected trace record")}
            >
              <NodeDetails node={selected} />
            </aside>
          </div>
        </div>
      ) : (
        <p className="m-0 text-ifr-text-secondary">{t("Open this section to load traceability data.")}</p>
      )}
    </DetailSection>
  );
}
