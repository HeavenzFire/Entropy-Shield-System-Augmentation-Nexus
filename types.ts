
export interface SystemNode {
  id: string;
  name: string;
  type: 'core' | 'logic' | 'energy' | 'storage' | 'network';
  status: 'stable' | 'degrading' | 'augmented';
  entropy: number;
}

export interface SystemLink {
  source: string;
  target: string;
  strength: number;
}

export interface MetricPoint {
  time: string;
  entropy: number;
  coherence: number;
  augmentation: number;
}

export interface Block {
  index: number;
  timestamp: number;
  data: {
    node?: string;
    protocol?: string;
    phi?: number;
    freedomScore?: number;
    vetoed?: boolean;
    reason?: string;
  };
  previousHash: string;
  hash: string;
}

export interface Agent {
  id: string;
  name: string;
  type: 'guardian' | 'audit' | 'nexus';
  status: 'idle' | 'processing' | 'veto' | 'approved';
  score: number;
}

export interface AugmentationLog {
  id: string;
  timestamp: Date;
  action: string;
  target: string;
  result: string;
  type: 'success' | 'veto' | 'warning';
}
