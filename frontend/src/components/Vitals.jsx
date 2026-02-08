import React from 'react';
import { HeartPulse } from 'lucide-react';

const Vitals = ({ hp, maxHp, difficulty }) => {
  const hpPercent = (hp / maxHp) * 100;
  const color = hpPercent > 30 ? 'text-bio-green' : 'text-bio-red';

  return (
    <div className="border-2 border-bio-dark-green bg-black p-4 rounded mb-4 shadow-[0_0_10px_#0f0]">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xl font-bold">PATIENT VITALS</span>
        <span className="text-sm uppercase animate-pulse">{difficulty} MODE</span>
      </div>
      
      <div className="flex items-center gap-4">
        <HeartPulse className={`w-12 h-12 ${color} animate-bounce`} />
        <div className="w-full">
          <div className="flex justify-between mb-1">
            <span>INTEGRITY</span>
            <span>{hp}/{maxHp}</span>
          </div>
          <div className="w-full h-4 bg-bio-dark-green rounded overflow-hidden">
             <div 
               className={`h-full transition-all duration-500 ${hpPercent > 30 ? 'bg-bio-green' : 'bg-bio-red'}`}
               style={{ width: `${hpPercent}%` }}
             ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vitals;