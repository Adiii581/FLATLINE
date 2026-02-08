import React from 'react';

const ActionDeck = ({ phase, options, onSelect }) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="border-t-2 border-bio-dark-green pt-6">
      <h3 className="mb-4 text-bio-orange font-bold text-center text-xl animate-pulse tracking-wider">
        {phase === 'TEST' ? 'SELECT DIAGNOSTIC PROTOCOL' : 'SELECT DIAGNOSIS'}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(opt)}
            className={`
              p-4 border-2 text-lg transition-all uppercase font-bold tracking-wide
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