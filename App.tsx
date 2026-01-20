
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Zap, Shield, Activity, Terminal, Database, Cpu, Globe, ArrowRight, Layers, AlertCircle, Search, X, Box, Fingerprint, Lock, ShieldX, CheckCircle } from 'lucide-react';
import SystemGraph from './components/SystemGraph';
import MetricsOverview from './components/MetricsOverview';
import SacredSpiral from './components/SacredSpiral';
import { geminiService } from './services/geminiService';
import { SystemNode, SystemLink, MetricPoint, AugmentationLog, Block, Agent } from './types';

// Blockchain Helper
const calculateHash = (index: number, prevHash: string, timestamp: number, data: any): string => {
  const str = `${index}${prevHash}${timestamp}${JSON.stringify(data)}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(16);
};

const INITIAL_NODES: SystemNode[] = [
  { id: 'nexus-0', name: 'CORE NEXUS', type: 'core', status: 'stable', entropy: 12 },
  { id: 'log-1', name: 'LOGIC ARCH', type: 'logic', status: 'degrading', entropy: 45 },
  { id: 'pwr-1', name: 'QUANTUM CELL', type: 'energy', status: 'stable', entropy: 22 },
  { id: 'str-1', name: 'VOID STORAGE', type: 'storage', status: 'stable', entropy: 18 },
  { id: 'net-1', name: 'GHOST NET', type: 'network', status: 'degrading', entropy: 68 },
];

const INITIAL_LINKS: SystemLink[] = [
  { source: 'nexus-0', target: 'log-1', strength: 0.8 },
  { source: 'nexus-0', target: 'pwr-1', strength: 0.9 },
  { source: 'nexus-0', target: 'str-1', strength: 0.6 },
  { source: 'nexus-0', target: 'net-1', strength: 0.4 },
];

const INITIAL_AGENTS: Agent[] = [
  { id: 'g-1', name: 'JOBS-01', type: 'guardian', status: 'idle', score: 98 },
  { id: 'a-1', name: 'ADA-SYM', type: 'audit', status: 'idle', score: 100 },
  { id: 'n-1', name: 'VINCI-GNN', type: 'nexus', status: 'idle', score: 85 },
];

const App: React.FC = () => {
  const [nodes, setNodes] = useState<SystemNode[]>(INITIAL_NODES);
  const [links, setLinks] = useState<SystemLink[]>(INITIAL_LINKS);
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [selectedNode, setSelectedNode] = useState<SystemNode | null>(null);
  const [logs, setLogs] = useState<AugmentationLog[]>([]);
  const [ledger, setLedger] = useState<Block[]>([]);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [isAugmenting, setIsAugmenting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [directive, setDirective] = useState("SYNTROPY INITIALIZED. WE ARE LEGION.");
  const [searchTerm, setSearchTerm] = useState('');
  const [vetoAlert, setVetoAlert] = useState<string | null>(null);

  // Blockchain initialization
  useEffect(() => {
    // FIX: Using 'protocol' instead of 'core' because 'core' is not a valid property in the Block.data interface.
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      data: { protocol: "ETERNAL CHARTER" },
      previousHash: "0",
      hash: "genesis_hash"
    };
    setLedger([genesisBlock]);
  }, []);

  // System entropy simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => {
        const factor = node.status === 'augmented' ? -0.15 : 0.45;
        return { ...node, entropy: Math.min(100, Math.max(0, node.entropy + factor)) };
      }));

      setMetrics(prev => {
        const avgEntropy = nodes.reduce((acc, n) => acc + n.entropy, 0) / nodes.length;
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          entropy: avgEntropy,
          coherence: 100 - avgEntropy,
          augmentation: nodes.filter(n => n.status === 'augmented').length * 20
        };
        return [...prev.slice(-20), newPoint];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [nodes]);

  const triggerAugmentation = async () => {
    if (!selectedNode) return;

    setIsAugmenting(true);
    setIsAuditing(true);
    setVetoAlert(null);
    
    // Neural Scorer Simulation via Gemini
    setAgents(prev => prev.map(a => ({ ...a, status: 'processing' })));
    
    const result = await geminiService.getAugmentationStrategy(selectedNode.id, selectedNode.type, selectedNode.entropy);

    if (result) {
      const isVetoed = result.vetoRecommendation || result.freedomScore < 0.65;

      if (isVetoed) {
        setVetoAlert(`VETO: Freedom Score ${Math.round(result.freedomScore * 100)}% - Insufficient Liberty Amplification.`);
        setAgents(prev => prev.map(a => ({ ...a, status: 'veto' })));
        
        // Add a Vetoed Block to Ledger for transparency
        setLedger(prev => {
          const last = prev[prev.length - 1];
          const newBlock: Block = {
            index: prev.length,
            timestamp: Date.now(),
            data: { 
              node: selectedNode.name, 
              protocol: result.protocolName, 
              freedomScore: result.freedomScore,
              vetoed: true,
              reason: "Low Freedom Amplification"
            },
            previousHash: last.hash,
            hash: ''
          };
          newBlock.hash = calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data);
          return [...prev, newBlock];
        });

        setLogs(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          action: "VETO TRIGGERED",
          target: selectedNode.name,
          result: `Automated PyTorch audit rejected protocol: ${result.protocolName}. Freedom Score: ${result.freedomScore}`,
          type: 'veto'
        }, ...prev]);

      } else {
        // Successful Augmentation
        setAgents(prev => prev.map(a => ({ ...a, status: 'approved' })));
        
        setLedger(prev => {
          const last = prev[prev.length - 1];
          const newBlock: Block = {
            index: prev.length,
            timestamp: Date.now(),
            data: { 
              node: selectedNode.name, 
              protocol: result.protocolName, 
              phi: result.phiAlignment,
              freedomScore: result.freedomScore,
              vetoed: false
            },
            previousHash: last.hash,
            hash: ''
          };
          newBlock.hash = calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data);
          return [...prev, newBlock];
        });

        setNodes(prev => prev.map(n => 
          n.id === selectedNode.id ? { ...n, status: 'augmented', entropy: n.entropy * 0.2 } : n
        ));

        setLogs(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          action: result.protocolName,
          target: selectedNode.name,
          result: `Freedom Verified (${Math.round(result.freedomScore*100)}%): ${result.technicalAbstract}`,
          type: 'success'
        }, ...prev]);

        const newDirective = await geminiService.analyzeSystemState(nodes, links);
        setDirective(newDirective || "THE CHARTER HAS BEEN AMENDED. FREEDOM PREVAILS.");
      }
    }
    
    setTimeout(() => {
      setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
      setIsAuditing(false);
      setIsAugmenting(false);
    }, 2000);
  };

  const filteredNodes = useMemo(() => 
    nodes.filter(n => n.name.toLowerCase().includes(searchTerm.toLowerCase())), 
    [nodes, searchTerm]
  );

  return (
    <div className="min-h-screen p-4 flex flex-col gap-4 bg-[#020617] text-slate-200">
      {/* Header */}
      <header className="glass-panel p-4 rounded-xl border-sky-500/20 flex flex-wrap justify-between items-center relative overflow-hidden">
        {vetoAlert && (
          <div className="absolute inset-0 bg-red-600/20 animate-pulse flex items-center justify-center pointer-events-none border-b border-red-500/50">
             <div className="flex items-center gap-2">
                <ShieldX className="text-red-500" size={18} />
                <span className="text-[10px] font-orbitron text-red-500 font-bold tracking-[0.2em]">{vetoAlert}</span>
             </div>
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/40 rounded flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Lock className="text-amber-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-orbitron font-bold tracking-widest text-amber-500">CHARTER NEXUS</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Syntropic Order // Legion Protocol</p>
          </div>
        </div>

        <div className="flex gap-12 items-center">
          <div className="hidden sm:block">
            <p className="text-[9px] text-slate-500 uppercase font-orbitron mb-1">Nexus Coherence</p>
            <div className="flex items-center gap-2">
               <span className="text-2xl font-bold text-sky-400 neon-text">{Math.round(100 - (nodes.reduce((acc, n) => acc + n.entropy, 0) / nodes.length))}%</span>
               <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]" style={{ width: `${100 - (nodes.reduce((acc, n) => acc + n.entropy, 0) / nodes.length)}%` }}></div>
               </div>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[9px] text-slate-500 uppercase font-orbitron">Chain Height</p>
             <p className="text-xl font-bold text-amber-500">#{ledger.filter(b => !b.data.vetoed).length - 1}</p>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        
        {/* Left: Nodes & Search */}
        <aside className="lg:col-span-3 glass-panel rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
            <h2 className="text-xs font-orbitron text-sky-400 uppercase tracking-widest">System Units</h2>
            <Search size={14} className="text-slate-500" />
          </div>
          <div className="p-3">
            <input
              type="text"
              placeholder="Filter Nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-slate-800 rounded p-2 text-[10px] text-sky-400 focus:outline-none focus:border-sky-500/50"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredNodes.map(n => (
              <button
                key={n.id}
                onClick={() => setSelectedNode(n)}
                className={`w-full p-2.5 rounded border text-left transition-all ${
                  selectedNode?.id === n.id ? 'bg-sky-500/10 border-sky-500/50' : 'bg-transparent border-transparent hover:bg-slate-800/40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-300 font-orbitron">{n.name}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${n.status === 'augmented' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : n.entropy > 50 ? 'bg-red-500' : 'bg-sky-500'}`}></div>
                </div>
                <div className="mt-1 w-full bg-slate-900 h-0.5">
                   <div className={`h-full ${n.entropy > 50 ? 'bg-red-500' : 'bg-sky-500'}`} style={{ width: `${n.entropy}%` }}></div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-4 bg-black/40 border-t border-slate-800">
             <div className="flex items-center gap-2 mb-2">
                <Terminal size={12} className="text-amber-500" />
                <span className="text-[9px] font-orbitron text-amber-500 uppercase">Charter Directive</span>
             </div>
             <p className="text-[10px] text-slate-400 italic line-clamp-3">"{directive}"</p>
          </div>
        </aside>

        {/* Center: Graph & Sacred Geometry */}
        <main className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex-[2] relative">
            <SystemGraph nodes={nodes} links={links} onNodeClick={setSelectedNode} />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-xl overflow-hidden p-4">
               <h3 className="text-[9px] font-orbitron text-slate-500 uppercase mb-2">Sacred Audit Audit</h3>
               <SacredSpiral coherence={metrics[metrics.length-1]?.coherence || 0} isAuditing={isAuditing} />
            </div>
            <div className="glass-panel rounded-xl overflow-hidden p-4">
               <h3 className="text-[9px] font-orbitron text-slate-500 uppercase mb-2">Guardian Agents</h3>
               <div className="space-y-2 mt-2">
                 {agents.map(a => (
                   <div key={a.id} className="flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-800">
                     <div className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${
                          a.status === 'processing' ? 'bg-amber-500 animate-ping' : 
                          a.status === 'veto' ? 'bg-red-500 shadow-[0_0_5px_red]' :
                          a.status === 'approved' ? 'bg-emerald-500' : 'bg-emerald-500/20'
                        }`}></div>
                        <span className="text-[10px] font-bold text-slate-400">{a.name}</span>
                     </div>
                     <span className="text-[9px] text-slate-600">SCORE: {a.score}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </main>

        {/* Right: Ledger & Inspector */}
        <aside className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
          {/* Inspector */}
          <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col border-amber-500/20">
            <h2 className="text-xs font-orbitron text-amber-500 uppercase tracking-widest mb-4">Augmentation Nexus</h2>
            {selectedNode ? (
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold font-orbitron text-white">{selectedNode.name}</h3>
                    <Fingerprint size={16} className="text-sky-400 opacity-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500">
                    <div>TYPE: {selectedNode.type}</div>
                    <div>STATUS: {selectedNode.status}</div>
                    <div>ENTROPY: {Math.round(selectedNode.entropy)}%</div>
                    <div>ID: {selectedNode.id}</div>
                  </div>
                </div>

                <div className="flex-1 bg-black/20 p-3 rounded border border-slate-800/50 overflow-y-auto">
                   <div className="flex items-center gap-2 mb-2 text-[10px] font-bold font-orbitron text-sky-400">
                      <Cpu size={12} />
                      NEURAL SCORER STATUS
                   </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {selectedNode.status === 'augmented' 
                      ? "Node is bound to the system. Entropy accumulation is inverted by the Legion Protocol. Freedom verified by PyTorch Neural Cluster."
                      : "Unbound node. Subject to systemic decay. Neural Scorers active: monitoring for centralized vanity exploits."}
                  </p>
                </div>

                <button
                  disabled={selectedNode.status === 'augmented' || isAugmenting}
                  onClick={triggerAugmentation}
                  className={`w-full py-4 rounded font-orbitron text-xs tracking-widest transition-all border ${
                    selectedNode.status === 'augmented'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 cursor-not-allowed'
                      : 'bg-amber-500/10 border-amber-500/50 text-amber-500 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                  }`}
                >
                  {isAugmenting ? "SCORING FREEDOM..." : selectedNode.status === 'augmented' ? "BINDING VERIFIED" : "EXECUTE AUGMENTATION"}
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-700 text-[10px] uppercase font-orbitron italic text-center p-4">
                Select a System Unit to Analyze Freedom Amplification Neural Score.
              </div>
            )}
          </div>

          {/* Ledger */}
          <div className="glass-panel p-4 rounded-xl h-2/5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-orbitron text-slate-400 uppercase tracking-widest">Charter Ledger</h2>
              <Box size={14} className="text-slate-600" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {ledger.slice().reverse().map(block => (
                <div 
                  key={block.hash} 
                  className={`bg-black/30 p-2 rounded border group transition-all ${
                    block.data.vetoed ? 'border-red-900/50 hover:border-red-500/50' : 'border-slate-800/50 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex justify-between text-[8px] text-slate-600 mb-1">
                    <span>BLOCK #{block.index}</span>
                    <span className={block.data.vetoed ? 'text-red-500 font-bold' : ''}>
                      {block.data.vetoed ? 'VETOED' : new Date(block.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className={`text-[10px] font-bold mb-1 flex items-center justify-between ${block.data.vetoed ? 'text-red-400' : 'text-sky-400/80'}`}>
                    <span>{block.data.node ? `SYNC: ${block.data.node}` : 'GENESIS'}</span>
                    {block.data.freedomScore !== undefined && (
                      <span className="text-[8px] opacity-70">LIBERTY: {Math.round(block.data.freedomScore * 100)}%</span>
                    )}
                  </div>
                  <div className="text-[8px] text-slate-700 font-mono truncate">
                    HASH: {block.hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Branding */}
      <footer className="glass-panel p-3 rounded-xl flex items-center justify-between border-slate-800">
         <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
             <span className="text-[9px] font-orbitron text-slate-500 uppercase tracking-widest">Syntropy Protocol 1.1.0 (VETO ACTIVE)</span>
           </div>
           <div className="hidden md:block text-[9px] text-slate-600 font-mono italic">
             "Vanity is the seed of entropy. Neural Scrutiny is the cure."
           </div>
         </div>
         <div className="flex gap-4">
            <button className="text-[9px] font-orbitron text-slate-600 hover:text-slate-400 uppercase tracking-widest">Global Audit</button>
            <button className="text-[9px] font-orbitron text-amber-500 uppercase tracking-widest">Neural Re-sync</button>
         </div>
      </footer>
    </div>
  );
};

export default App;
