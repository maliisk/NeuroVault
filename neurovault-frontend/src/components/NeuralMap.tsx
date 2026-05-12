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
      setBrainImage(img);
    };

    img.onerror = (err) => {
      console.error("SVG Yüklenemedi!", err);
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
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at center, #3b82f6 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      ></div>
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>

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
              return Math.random() > 0.4
                ? "rgba(239, 68, 68, 0.9)"
                : "rgba(255, 255, 255, 0.8)";
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
                const offsetX = (Math.random() - 0.5) * impProgress * 15;
                const offsetY = (Math.random() - 0.5) * impProgress * 15;

                ctx.beginPath();
                ctx.arc(
                  node.x + offsetX,
                  node.y + offsetY,
                  node.val * (1 - impProgress * 0.5),
                  0,
                  2 * Math.PI,
                );
                ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#ef4444";
                ctx.shadowBlur = 40;
                ctx.shadowColor = "#ef4444";
                ctx.fill();
              } else {
                const expProgress = (animProgress - 0.2) / 0.8;
                const easeOut = 1 - Math.pow(1 - expProgress, 3);

                node.particles.forEach((p: any) => {
                  const dist = p.speed * easeOut;
                  const currentRot = p.spin * easeOut;
                  const px = node.x + Math.cos(p.angle) * dist;
                  const py = node.y + Math.sin(p.angle) * dist;

                  ctx.save();
                  ctx.translate(px, py);
                  ctx.rotate(currentRot);

                  ctx.beginPath();
                  ctx.moveTo(0, -p.size);
                  ctx.lineTo(p.size * 0.866, p.size * 0.5);
                  ctx.lineTo(-p.size * 0.866, p.size * 0.5);
                  ctx.closePath();

                  ctx.fillStyle = `rgba(239, 68, 68, ${1 - expProgress})`;
                  ctx.shadowBlur = 15;
                  ctx.shadowColor = "#ef4444";
                  ctx.fill();
                  ctx.restore();
                });

                ctx.beginPath();
                ctx.arc(node.x, node.y, easeOut * 120, 0, 2 * Math.PI);
                ctx.lineWidth = 4 * (1 - expProgress);
                ctx.strokeStyle = `rgba(239, 68, 68, ${1 - expProgress})`;
                ctx.stroke();
              }

              ctx.restore();
              return;
            } else {
              if (node.explosionStart) {
                delete node.explosionStart;
                delete node.particles;
              }
            }

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
