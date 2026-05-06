"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { api } from "../lib/api";
import { BrainCircuit } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function NeuralMap({
  refreshKey,
  onNodeClick,
  searchQuery,
}: {
  refreshKey: number;
  onNodeClick?: (node: any) => void;
  searchQuery?: string;
}) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  const [hoverNode, setHoverNode] = useState<any>(null);

  const initialZoomRef = useRef<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [brainImage, setBrainImage] = useState<HTMLImageElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>();

  const [dimensions, setDimensions] = useState({ width: 1200, height: 750 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries && entries.length > 0) {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = "/brain.svg";

    img.onload = () => {
      console.log("Siber Beyin SVG başarıyla yüklendi!");
      setBrainImage(img);
    };

    img.onerror = (err) => {
      console.error(
        "SVG Yüklenemedi! Lütfen dosya adının public/brain.svg olduğundan emin ol.",
        err,
      );
    };
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
          });
          links.push({ source: "merkez-kortex", target: item.id });

          item.keywords.forEach((keyword: string) => {
            if (!nodes.find((n) => n.id === keyword)) {
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
          const sourceId =
            typeof link.source === "object" ? link.source.id : link.source;
          const targetId =
            typeof link.target === "object" ? link.target.id : link.target;
          return sourceId === targetNode.id || targetId === targetNode.id;
        })
        .map((link: any) => {
          const sourceId =
            typeof link.source === "object" ? link.source.id : link.source;
          const targetId =
            typeof link.target === "object" ? link.target.id : link.target;
          const connectedId = sourceId === targetNode.id ? targetId : sourceId;
          return graphData.nodes.find((n: any) => n.id === connectedId);
        })
        .filter(Boolean);

      const nodeWithConnections = {
        ...targetNode,
        connections: connectedNodes,
      };

      if (onNodeClick) onNodeClick(nodeWithConnections);
    }
  }, [searchQuery, graphData, onNodeClick]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (searchQuery && fgRef.current) {
      interval = setInterval(() => {
        const currentZoom = fgRef.current.zoom();
        fgRef.current.zoom(currentZoom);
      }, 1000 / 60);
    }
    return () => clearInterval(interval);
  }, [searchQuery]);

  if (loading)
    return (
      <div className="text-zinc-400 animate-pulse flex justify-center items-center h-[750px] tracking-widest uppercase text-sm font-semibold">
        Nöral Ağlar Senkronize Ediliyor...
      </div>
    );

  if (graphData.nodes.length <= 1)
    return (
      <div className="text-zinc-500 text-center mt-10 h-[750px] flex flex-col items-center justify-center gap-4">
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
      className="relative w-full h-[750px] bg-[#030712] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] cursor-crosshair border border-white/5 transition-all duration-500 hover:shadow-[0_0_60px_rgba(16,185,129,0.2)]"
    >
      {/* 1. KATMAN: NOKTA IZGARASI (Z-0) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at center, #3b82f6 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      ></div>

      {/* 2. KATMAN: NEBULA PARLAMASI (Z-0) */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>

      {/* 3. KATMAN: İNSAN KAFASI GÖRSELİ (Z-10) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center origin-center"
        style={{
          opacity: headOpacity,
          transform: `scale(${headScale})`,
        }}
      >
        <img
          src="/neuro.png"
          alt="Kortex İllüzyonu"
          className="w-[500px] h-[500px] object-contain drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] pointer-events-none select-none"
        />
      </div>

      {/* 4. KATMAN: CANVAS / SİNİR AĞI (Z-20 - EN ÜSTTE) */}
      <div
        className="absolute inset-0 z-20"
        style={{
          opacity: graphOpacity,
          transition: "opacity 0.1s ease-out",
        }}
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
          linkDirectionalParticleWidth={(link: any) =>
            hoverNode &&
            (link.source.id === hoverNode.id || link.target.id === hoverNode.id)
              ? 4
              : 2
          }
          linkDirectionalParticleSpeed={(link: any) =>
            hoverNode &&
            (link.source.id === hoverNode.id || link.target.id === hoverNode.id)
              ? 0.015
              : 0.005
          }
          onZoom={(transform) => {
            if (initialZoomRef.current === null) {
              initialZoomRef.current = transform.k;
            }
            setZoomLevel(transform.k);
          }}
          onNodeClick={(node) => {
            const connectedNodes = graphData.links
              .filter((link: any) => {
                const sourceId =
                  typeof link.source === "object"
                    ? link.source.id
                    : link.source;
                const targetId =
                  typeof link.target === "object"
                    ? link.target.id
                    : link.target;
                return sourceId === node.id || targetId === node.id;
              })
              .map((link: any) => {
                const sourceId =
                  typeof link.source === "object"
                    ? link.source.id
                    : link.source;
                const targetId =
                  typeof link.target === "object"
                    ? link.target.id
                    : link.target;
                const connectedId = sourceId === node.id ? targetId : sourceId;
                return graphData.nodes.find((n: any) => n.id === connectedId);
              })
              .filter(Boolean);

            const nodeWithConnections = {
              ...node,
              connections: connectedNodes,
            };

            if (onNodeClick) onNodeClick(nodeWithConnections);
          }}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const time = Date.now() / 300;
            const isSearched =
              searchQuery &&
              node.name?.toLowerCase().includes(searchQuery.toLowerCase());

            let isHovered = false;
            let isNeighbor = false;

            if (hoverNode) {
              isHovered = node.id === hoverNode.id;
              isNeighbor = graphData.links.some((l: any) => {
                const sId =
                  typeof l.source === "object" ? l.source.id : l.source;
                const tId =
                  typeof l.target === "object" ? l.target.id : l.target;
                return (
                  (sId === node.id && tId === hoverNode.id) ||
                  (tId === node.id && sId === hoverNode.id)
                );
              });
            }

            const isDimmed = hoverNode && !isHovered && !isNeighbor;
            ctx.globalAlpha = isDimmed ? 0.1 : 1;

            if (isSearched) {
              const pulseRadius = node.val + 5 + Math.sin(time * 2) * 5;
              ctx.beginPath();
              ctx.arc(node.x, node.y, pulseRadius, 0, 2 * Math.PI, false);
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(time * 2) * 0.5})`;
              ctx.lineWidth = 4 / globalScale;
              ctx.stroke();
            }

            if (node.id === "merkez-kortex") {
              const size = 50;
              if (brainImage) {
                ctx.save();
                ctx.shadowColor =
                  hoverNode && isHovered ? "#10b981" : "#3b82f6";
                ctx.shadowBlur =
                  (hoverNode && isHovered ? 50 : 30) + Math.sin(time) * 15;
                ctx.drawImage(
                  brainImage,
                  node.x - size / 2,
                  node.y - size / 2,
                  size,
                  size,
                );
                ctx.restore();
              } else {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI, false);
                ctx.fillStyle = node.color;
                ctx.shadowColor = node.color;
                ctx.shadowBlur = 20;
                ctx.fill();
              }
            } else {
              const size = isHovered ? node.val * 1.5 : node.val;
              const color = isHovered ? "#ffffff" : node.color;
              const spikes = 5;

              ctx.save();
              ctx.shadowColor = color;
              ctx.shadowBlur =
                (isHovered ? 30 : 15) + Math.sin(time + node.x) * 5;
              ctx.fillStyle = color;

              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
              ctx.fill();

              ctx.strokeStyle = color;
              ctx.lineWidth = (isHovered ? 3 : 1.5) / globalScale;

              for (let i = 0; i < spikes; i++) {
                const speedMult = isHovered ? 0.6 : 0.2;
                const angle = ((Math.PI * 2) / spikes) * i + time * speedMult;
                const length =
                  size * 1.8 + Math.sin(time * 3 + i + node.x) * (size * 0.5);

                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.quadraticCurveTo(
                  node.x + Math.cos(angle + 0.5) * length * 0.5,
                  node.y + Math.sin(angle + 0.5) * length * 0.5,
                  node.x + Math.cos(angle) * length,
                  node.y + Math.sin(angle) * length,
                );
                ctx.stroke();
              }
              ctx.restore();
            }

            ctx.globalAlpha = 1;
          }}
        />
      </div>
    </div>
  );
}
