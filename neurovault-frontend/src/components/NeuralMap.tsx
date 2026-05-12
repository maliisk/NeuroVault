"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { api } from "../lib/api";
import { BrainCircuit, MousePointer2 } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function NeuralMap({
  refreshKey,
  onNodeClick,
  searchQuery,
  deletingNodeId,
}: {
  refreshKey: number;
  onNodeClick?: (node: any) => void;
  searchQuery?: string;
  deletingNodeId?: string | null;
}) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(true);

  const [hoverNode, setHoverNode] = useState<any>(null);

  const initialZoomRef = useRef<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [brainImage, setBrainImage] = useState<HTMLImageElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>();

  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = "/brain.svg";
    img.onload = () => setBrainImage(img);
    img.onerror = (err) => console.error("SVG Yüklenemedi!", err);
  }, []);

  useEffect(() => {
    const fetchAndTransformData = async () => {
      try {
        const response = await api.get("/api/v1/query/my-brain");
        const data = response.data;
        const nodes: any[] = [];
        const links: any[] = [];

        nodes.push({
          id: "merkez-kortex",
          name: "Benim Beynim",
          val: 12,
          color: "#3b82f6",
        });

        data.forEach((item: any) => {
          nodes.push({
            id: item.id,
            name: item.summary,
            val: 6,
            color: "#10b981",
            originalContent: item.originalContent,
            isMainNode: true,
          });
          links.push({ source: "merkez-kortex", target: item.id });

          item.keywords.forEach((keyword: string) => {
            if (!nodes.find((n: any) => n.id === keyword)) {
              nodes.push({
                id: keyword,
                name: keyword,
                val: 4,
                color: "#f59e0b",
              });
            }
            links.push({ source: item.id, target: keyword });
          });
        });
        setGraphData({ nodes, links });
      } catch (error) {
        console.error("Veri çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndTransformData();
  }, [refreshKey]);

  useEffect(() => {
    if (!searchQuery || !fgRef.current || graphData.nodes.length === 0) return;
    const targetNode = graphData.nodes.find(
      (n: any) =>
        n.name && n.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (targetNode) {
      fgRef.current.centerAt(targetNode.x, targetNode.y, 1000);
      fgRef.current.zoom(3, 1000);
      const connectedNodes = graphData.links
        .filter((link: any) => {
          const sId =
            typeof link.source === "object" ? link.source.id : link.source;
          const tId =
            typeof link.target === "object" ? link.target.id : link.target;
          return sId === targetNode.id || tId === targetNode.id;
        })
        .map((link: any) => {
          const sId =
            typeof link.source === "object" ? link.source.id : link.source;
          const tId =
            typeof link.target === "object" ? link.target.id : link.target;
          const connectedId = sId === targetNode.id ? tId : sId;
          return graphData.nodes.find((n: any) => n.id === connectedId);
        })
        .filter(Boolean);

      if (onNodeClick)
        onNodeClick({ ...targetNode, connections: connectedNodes });
    }
  }, [searchQuery, graphData, onNodeClick]);

  if (loading)
    return (
      <div className="text-zinc-400 animate-pulse flex justify-center items-center h-[80vh] tracking-widest uppercase text-sm font-semibold">
        Nöral Ağlar Senkronize Ediliyor...
      </div>
    );

  if (graphData.nodes.length <= 1)
    return (
      <div className="text-zinc-500 text-center mt-10 h-[80vh] flex flex-col items-center justify-center gap-4">
        <BrainCircuit className="w-12 h-12 text-zinc-700 animate-pulse" />
        <p>
          Henüz hiç veri yok. Aklındakileri dökerek sinir ağını örmeye başla!
        </p>
      </div>
    );

  const base = initialZoomRef.current || 1;
  const delta = Math.max(0, zoomLevel - base);
  const progress = Math.min(1, delta / 1.5);
  const headOpacity = Math.max(0, 1 - progress / 0.5);
  const headScale = 1 + progress * 4;
  const graphOpacity =
    progress <= 0.5 ? 0 : Math.min(1, (progress - 0.5) / 0.5);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[80vh] min-h-[700px] bg-[#030712] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] cursor-crosshair border border-white/5 transition-all duration-500"
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at center, #3b82f6 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      ></div>

      <div
        className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center origin-center"
        style={{ opacity: headOpacity, transform: `scale(${headScale})` }}
      >
        <img
          src="/neuro.png"
          alt="Kortex İllüzyonu"
          className="w-[500px] h-[500px] object-contain drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] pointer-events-none select-none"
        />
      </div>

      <div
        className="absolute inset-0 z-20"
        style={{ opacity: graphOpacity, transition: "opacity 0.1s ease-out" }}
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeRelSize={6}
          onNodeHover={(node) => setHoverNode(node)}
          linkColor={(link: any) => {
            if (
              deletingNodeId &&
              (link.source.id === deletingNodeId ||
                link.target.id === deletingNodeId)
            ) {
              return Math.random() > 0.4 ? "#ef4444" : "#ffffff";
            }
            if (hoverNode) {
              const isConnected =
                link.source.id === hoverNode.id ||
                link.target.id === hoverNode.id;
              return isConnected
                ? "rgba(16, 185, 129, 0.9)"
                : "rgba(255, 255, 255, 0.02)";
            }
            return "rgba(59, 130, 246, 0.3)";
          }}
          linkWidth={(link: any) => {
            if (
              deletingNodeId &&
              (link.source.id === deletingNodeId ||
                link.target.id === deletingNodeId)
            )
              return 3;
            if (hoverNode) {
              const isConnected =
                link.source.id === hoverNode.id ||
                link.target.id === hoverNode.id;
              return isConnected ? 3 : 1.5;
            }
            return 1.5;
          }}
          linkDirectionalParticles={(link: any) => {
            if (hoverNode) {
              const isConnected =
                link.source.id === hoverNode.id ||
                link.target.id === hoverNode.id;
              return isConnected ? 6 : 0;
            }
            return 3;
          }}
          onZoom={(transform) => {
            if (initialZoomRef.current === null)
              initialZoomRef.current = transform.k;
            setZoomLevel(transform.k);
            if (transform.k - initialZoomRef.current > 0.75) {
              setShowHint(false);
            } else {
              setShowHint(true);
            }
          }}
          onNodeClick={(node) => {
            const connectedNodes = graphData.links
              .filter((link: any) => {
                const sId =
                  typeof link.source === "object"
                    ? link.source.id
                    : link.source;
                const tId =
                  typeof link.target === "object"
                    ? link.target.id
                    : link.target;
                return sId === node.id || tId === node.id;
              })
              .map((link: any) => {
                const sId =
                  typeof link.source === "object"
                    ? link.source.id
                    : link.source;
                const tId =
                  typeof link.target === "object"
                    ? link.target.id
                    : link.target;
                const connectedId = sId === node.id ? tId : sId;
                return graphData.nodes.find((n: any) => n.id === connectedId);
              })
              .filter(Boolean);
            if (onNodeClick)
              onNodeClick({ ...node, connections: connectedNodes });
          }}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const time = Date.now() / 300;
            if (deletingNodeId === node.id) {
              if (!node.explosionStart) {
                node.explosionStart = Date.now();
                node.particles = Array.from({ length: 30 }).map(() => ({
                  angle: Math.random() * Math.PI * 2,
                  speed: 30 + Math.random() * 120,
                  spin: (Math.random() - 0.5) * 15,
                  size: 1 + Math.random() * (node.val * 0.8),
                }));
              }
              const elapsed = Date.now() - node.explosionStart;
              const animProgress = Math.min(1, elapsed / 1000);
              ctx.save();
              if (animProgress < 0.2) {
                const impProgress = animProgress / 0.2;
                ctx.beginPath();
                ctx.arc(
                  node.x,
                  node.y,
                  node.val * (1 - impProgress * 0.5),
                  0,
                  2 * Math.PI,
                );
                ctx.fillStyle = "#ef4444";
                ctx.fill();
              } else {
                const expProgress = (animProgress - 0.2) / 0.8;
                const easeOut = 1 - Math.pow(1 - expProgress, 3);
                node.particles.forEach((p: any) => {
                  const dist = p.speed * easeOut;
                  const px = node.x + Math.cos(p.angle) * dist;
                  const py = node.y + Math.sin(p.angle) * dist;
                  ctx.beginPath();
                  ctx.arc(px, py, p.size * (1 - expProgress), 0, 2 * Math.PI);
                  ctx.fillStyle = `rgba(239, 68, 68, ${1 - expProgress})`;
                  ctx.fill();
                });
              }
              ctx.restore();
              return;
            }

            const isSearched =
              searchQuery &&
              node.name?.toLowerCase().includes(searchQuery.toLowerCase());
            let isHovered = hoverNode && node.id === hoverNode.id;
            let isNeighbor =
              hoverNode &&
              graphData.links.some((l: any) => {
                const sId =
                  typeof l.source === "object" ? l.source.id : l.source;
                const tId =
                  typeof l.target === "object" ? l.target.id : l.target;
                return (
                  (sId === node.id && tId === hoverNode.id) ||
                  (tId === node.id && sId === hoverNode.id)
                );
              });

            ctx.globalAlpha = hoverNode && !isHovered && !isNeighbor ? 0.1 : 1;

            if (isSearched) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val + 8, 0, 2 * Math.PI);
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
            }

            if (node.id === "merkez-kortex") {
              if (brainImage) {
                ctx.drawImage(brainImage, node.x - 25, node.y - 25, 50, 50);
              } else {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI);
                ctx.fillStyle = "#3b82f6";
                ctx.fill();
              }
            } else {
              const color = isHovered ? "#ffffff" : node.color;
              ctx.beginPath();
              ctx.arc(
                node.x,
                node.y,
                isHovered ? node.val * 1.5 : node.val,
                0,
                2 * Math.PI,
              );
              ctx.fillStyle = color;
              ctx.shadowColor = color;
              ctx.shadowBlur = isHovered ? 20 : 10;
              ctx.fill();

              for (let i = 0; i < 5; i++) {
                const angle = ((Math.PI * 2) / 5) * i + time * 0.2;
                const len = node.val * 2 + Math.sin(time * 3 + i) * 3;
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(
                  node.x + Math.cos(angle) * len,
                  node.y + Math.sin(angle) * len,
                );
                ctx.strokeStyle = color;
                ctx.lineWidth = 1 / globalScale;
                ctx.stroke();
              }
            }
            ctx.globalAlpha = 1;
          }}
        />
      </div>

      <div
        className={`absolute top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-1000 flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
          showHint ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <MousePointer2 className="w-4 h-4 text-emerald-400 animate-bounce" />
        <span className="text-xs sm:text-sm text-zinc-300 font-medium tracking-wide">
          Haritayı keşfetmek için beyne doğru zoom yapın
        </span>
      </div>
    </div>
  );
}
