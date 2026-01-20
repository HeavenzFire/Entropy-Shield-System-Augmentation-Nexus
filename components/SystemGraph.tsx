
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SystemNode, SystemLink } from '../types';

interface SystemGraphProps {
  nodes: SystemNode[];
  links: SystemLink[];
  onNodeClick: (node: SystemNode) => void;
}

const SystemGraph: React.FC<SystemGraphProps> = ({ nodes, links, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => `rgba(56, 189, 248, ${0.1 + d.strength * 0.5})`)
      .attr('stroke-width', (d) => d.strength * 3)
      .attr('stroke-dasharray', '5,5');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => onNodeClick(d))
      .call(d3.drag<SVGGElement, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);

    node.append('circle')
      .attr('r', (d) => d.type === 'core' ? 30 : 20)
      .attr('fill', (d) => {
        if (d.status === 'augmented') return '#10b981';
        if (d.status === 'degrading') return '#ef4444';
        return d.type === 'core' ? '#38bdf8' : '#1e293b';
      })
      .attr('stroke', (d) => d.status === 'augmented' ? '#34d399' : '#38bdf8')
      .attr('stroke-width', 2)
      .attr('class', 'transition-all duration-500');

    node.append('text')
      .text((d) => d.name)
      .attr('dy', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'Orbitron');

    node.append('text')
      .text((d) => `${Math.round(d.entropy)}%`)
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '8px');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [nodes, links, onNodeClick]);

  return (
    <div className="w-full h-full relative glass-panel rounded-xl overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-xs font-orbitron text-sky-400 opacity-70 tracking-widest uppercase">System Topology Map</h3>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default SystemGraph;
