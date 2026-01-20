
import React, { useEffect, useRef } from 'react';

interface SacredSpiralProps {
  coherence: number;
  isAuditing: boolean;
}

const SacredSpiral: React.FC<SacredSpiralProps> = ({ coherence, isAuditing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const phi = (1 + Math.sqrt(5)) / 2;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.beginPath();
      ctx.strokeStyle = isAuditing ? '#fbbf24' : `rgba(56, 189, 248, ${coherence / 100})`;
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 500; i++) {
        const theta = 0.1 * i;
        const r = Math.exp(theta / phi) * (coherence / 100) * 2;
        const x = centerX + r * Math.cos(theta + angle);
        const y = centerY + r * Math.sin(theta + angle);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      angle += isAuditing ? 0.05 : 0.01;
      animationFrameId = window.requestAnimationFrame(draw);
    };

    draw();
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [coherence, isAuditing]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} width={300} height={300} className="max-w-full max-h-full" />
      <div className="absolute text-[8px] font-orbitron text-amber-500/50 uppercase tracking-widest bottom-2">
        Sacred Phi Audit Active
      </div>
    </div>
  );
};

export default SacredSpiral;
