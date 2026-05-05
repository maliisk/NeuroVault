"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { api } from "../lib/api";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }

    const fetchAndTransformData = async () => {
      try {
        const response = await api.get("/api/v1/query/my-brain");
        const data = response.data;

        const nodes: any[] = [];
        const links: any[] = [];

        nodes.push({
          id: "merkez-kortex",
          name: "Benim Beynim",
          val: 10,
          color: "#3b82f6",
        });

        data.forEach((item: any) => {
          nodes.push({
            id: item.id,
            name: item.summary,
            val: 5,
            color: "#10b981",
            originalContent: item.originalContent,
          });
          links.push({ source: "merkez-kortex", target: item.id });

          item.keywords.forEach((keyword: string) => {
            if (!nodes.find((n) => n.id === keyword)) {
              nodes.push({
                id: keyword,
                name: keyword,
                val: 3,
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
      if (onNodeClick) onNodeClick(targetNode);
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
      <div className="text-zinc-400 animate-pulse flex justify-center items-center h-64">
        Sinir ağları örülüyor...
      </div>
    );

  if (graphData.nodes.length <= 1)
    return (
      <div className="text-zinc-500 text-center mt-10">
        Henüz hiç veri yok. Aklındakileri dökerek sinir ağını örmeye başla!
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] border border-zinc-800 rounded-xl overflow-hidden bg-black shadow-2xl shadow-blue-900/20 cursor-crosshair"
    >
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        nodeRelSize={6}
        linkColor={() => "rgba(255,255,255,0.15)"}
        onNodeClick={(node) => {
          if (onNodeClick) onNodeClick(node);
        }}
        nodeCanvasObjectMode={(node: any) => {
          if (
            searchQuery &&
            node.name?.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return "before";
          }
          return undefined;
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          if (
            searchQuery &&
            node.name?.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            const MathPI2 = 2 * Math.PI;
            const time = Date.now();

            let r = 255,
              g = 255,
              b = 255;
            if (node.color === "#10b981") {
              r = 16;
              g = 185;
              b = 129;
            } else if (node.color === "#f59e0b") {
              r = 245;
              g = 158;
              b = 11;
            } else if (node.color === "#3b82f6") {
              r = 59;
              g = 130;
              b = 246;
            }

            const t1 = (time % 1500) / 1500;
            const radius1 = 6 + t1 * 25;
            const opacity1 = 1 - t1;

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius1, 0, MathPI2, false);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity1})`;
            ctx.lineWidth = 4 / globalScale;
            ctx.stroke();

            const t2 = ((time + 750) % 1500) / 1500;
            const radius2 = 6 + t2 * 25;
            const opacity2 = 1 - t2;

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius2, 0, MathPI2, false);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity2})`;
            ctx.lineWidth = 4 / globalScale;
            ctx.stroke();
          }
        }}
      />
    </div>
  );
}
