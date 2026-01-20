
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MetricPoint } from '../types';

interface MetricsOverviewProps {
  data: MetricPoint[];
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <div className="glass-panel p-4 rounded-xl flex flex-col">
        <h3 className="text-xs font-orbitron text-sky-400 mb-4 tracking-widest uppercase">Entropy Decay Delta</h3>
        <div className="flex-1 min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorEntropy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8' }}
                itemStyle={{ color: '#ef4444' }}
              />
              <Area type="monotone" dataKey="entropy" stroke="#ef4444" fillOpacity={1} fill="url(#colorEntropy)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl flex flex-col">
        <h3 className="text-xs font-orbitron text-emerald-400 mb-4 tracking-widest uppercase">System Coherence</h3>
        <div className="flex-1 min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #38bdf8' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Line type="stepAfter" dataKey="coherence" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="augmentation" stroke="#38bdf8" strokeWidth={2} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MetricsOverview;
