import React from 'react';

const ActionDeck = ({ phase, options, onSelect }) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="border-t-2 border-bio-dark-green pt-4">
      <h3 className="mb-2 text-bio-orange font-bold text-center animate-pulse">
        {phase === 'TEST' ? 'SELECT DIAGNOSTIC PROTOCOL' : 'SELECT DIAGNOSIS'}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(opt)}
            className={`
              p-3 border text-sm transition-all uppercase font-bold
              ${phase === 'DIAGNOSE' 
                ? 'border-bio-orange text-bio-orange hover:bg-bio-orange hover:text-black' 
                : 'border-bio-green text-bio-green hover:bg-bio-green hover:text-black'}
            `}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionDeck;