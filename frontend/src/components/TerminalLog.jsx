import React, { useEffect, useRef } from 'react';

const TerminalLog = ({ logs }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 border-2 border-bio-dark-green bg-black p-6 mb-6 overflow-y-auto font-mono text-lg h-64 shadow-[inset_0_0_20px_#001100]">
      {logs.map((log, idx) => (
        <div key={idx} className="mb-3 leading-relaxed">
          <span className="text-gray-500 text-base">[{new Date().toLocaleTimeString()}]</span>
          {log.type === 'system' && <span className="text-bio-orange font-bold"> SYSTEM: </span>}
          {log.type === 'narrative' && <span className="text-bio-green"> {'>'} </span>}
          {log.type === 'action' && <span className="text-cyan-400"> CMD: </span>}
          {log.type === 'diagnosis' && <span className="text-bio-red"> ALERT: </span>}
          <span className={log.type === 'narrative' ? 'text-white' : 'text-bio-green'}>
            {log.text}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default TerminalLog;