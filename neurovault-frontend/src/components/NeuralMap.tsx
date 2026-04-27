"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { api } from "../lib/api";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function NeuralMap({ refreshKey }: { refreshKey: number }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
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
        const response = await api.get("/api/v1/query/user/user-999");
        const data = response.data;

        const nodes: any[] = [];
        const links: any[] = [];

        nodes.push({
          id: "user-999",
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
          });
          links.push({ source: "user-999", target: item.id });

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

  if (loading)
    return (
      <div className="text-zinc-400 animate-pulse flex justify-center items-center h-64">
        Sinir ağları örülüyor...
      </div>
    );

  if (graphData.nodes.length <= 1)
    return (
      <div className="text-zinc-500 text-center mt-10">
        Henüz hiç veri yok. Postman'den veri eklemeye başla!
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] border border-zinc-800 rounded-xl overflow-hidden bg-black shadow-2xl shadow-blue-900/20"
    >
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        nodeRelSize={6}
        linkColor={() => "rgba(255,255,255,0.15)"}
      />
    </div>
  );
}
