import React, { useState } from 'react';
import Vitals from './components/Vitals';
import TerminalLog from './components/TerminalLog';
import ActionDeck from './components/ActionDeck';

const API_URL = 'http://localhost:8000';

function App() {
  const [gameId, setGameId] = useState(null);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [difficulty, setDifficulty] = useState(null);
  const [logs, setLogs] = useState([]);
  const [phase, setPhase] = useState('START'); 
  const [options, setOptions] = useState([]);
  // We don't strictly need a separate testOptions state anymore because the backend returns it on failure,
  // but it's good practice to keep it if we want to add a "Review" feature later.
  
  const [modal, setModal] = useState(null); 

  const addLog = (type, text) => {
    setLogs(prev => [...prev, { type, text }]);
  };

  const startGame = async (diff) => {
    setDifficulty(diff);
    addLog('system', `INITIALIZING BIO-LOGIC ENGINE (${diff})...`);
    
    try {
      const res = await fetch(`${API_URL}/start_game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: diff })
      });
      const data = await res.json();
      
      setGameId(data.game_id);
      setHp(data.hp);
      setMaxHp(data.max_hp);
      addLog('narrative', data.patient_intro);
      setOptions(data.test_options);
      setPhase('TEST');
    } catch (err) {
      addLog('system', 'ERROR: COULD NOT CONNECT TO BACKEND. IS SERVER RUNNING?');
      console.error(err);
    }
  };

  const handleAction = async (selection) => {
    if (phase === 'TEST') {
      addLog('action', `PERFORMING: ${selection}`);
      
      const res = await fetch(`${API_URL}/submit_test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, test_name: selection })
      });
      const data = await res.json();
      
      addLog('narrative', data.narrative);
      setOptions(data.diagnosis_options);
      setPhase('DIAGNOSE');
      
    } else if (phase === 'DIAGNOSE') {
      addLog('action', `DIAGNOSING: ${selection}`);
      
      const res = await fetch(`${API_URL}/submit_diagnosis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, diagnosis_name: selection })
      });
      const data = await res.json();

      if (data.status === 'WIN') {
        setModal({ title: 'PATIENT SAVED', msg: data.analysis, type: 'win' });
        setPhase('END');
      } else if (data.status === 'LOSE') {
        setHp(0);
        setModal({ title: 'PATIENT DECEASED', msg: data.analysis, type: 'lose' });
        setPhase('END');
      } else {
        // CONTINUE: Update HP and loop back to Tests
        setHp(data.hp);
        addLog('diagnosis', `INCORRECT. ${data.message}`);
        addLog('system', 'RE-INITIALIZING TEST PROTOCOLS...');
        
        // Backend returns the original test list again
        if (data.test_options) {
             setOptions(data.test_options);
        }
        setPhase('TEST');
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col relative crt-flicker">
      <div className="scanlines"></div>
      
      <h1 className="text-3xl text-center mb-6 font-bold tracking-widest text-shadow-glow">
        BIO-LOGIC PROTOCOL v2.5
      </h1>

      {phase === 'START' && (
        <div className="max-w-md mx-auto border border-bio-green p-8 text-center bg-black z-10 relative shadow-[0_0_20px_#0f0]">
          <p className="mb-4 text-xl">SELECT DIFFICULTY MODULE</p>
          <div className="flex flex-col gap-4">
            <button onClick={() => startGame('easy')} className="border border-bio-green p-3 hover:bg-bio-green hover:text-black transition-all font-bold">
              EASY (100 HP - 5 Tries)
            </button>
            <button onClick={() => startGame('medium')} className="border border-bio-orange p-3 hover:bg-bio-orange hover:text-black text-bio-orange transition-all font-bold">
              MEDIUM (60 HP - 3 Tries)
            </button>
            <button onClick={() => startGame('hard')} className="border border-bio-red p-3 hover:bg-bio-red hover:text-black text-bio-red transition-all font-bold">
              HARD (20 HP - 1 Try)
            </button>
          </div>
        </div>
      )}

      {phase !== 'START' && (
        <div className="max-w-4xl mx-auto w-full z-10 flex flex-col h-[80vh]">
          <Vitals hp={hp} maxHp={maxHp} difficulty={difficulty} />
          <TerminalLog logs={logs} />
          {phase !== 'END' && (
             <ActionDeck phase={phase} options={options} onSelect={handleAction} />
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className={`border-4 p-6 md:p-8 max-w-xl text-center ${modal.type === 'win' ? 'border-bio-green text-bio-green shadow-[0_0_50px_#0f0]' : 'border-bio-red text-bio-red shadow-[0_0_50px_#f00]'}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{modal.title}</h2>
            <div className="text-white font-mono text-sm md:text-base mb-8 text-left border border-gray-700 p-4 bg-gray-900 overflow-y-auto max-h-60">
                {modal.msg}
            </div>
            <button onClick={() => window.location.reload()} className="border px-8 py-3 hover:bg-white hover:text-black uppercase font-bold text-lg">
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
