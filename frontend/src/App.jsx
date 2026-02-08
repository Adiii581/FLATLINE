import React, { useState } from 'react';
import Vitals from './components/Vitals';
import TerminalLog from './components/TerminalLog';
import ActionDeck from './components/ActionDeck';
import { Syringe, Activity } from 'lucide-react'; // Import icons

const API_URL = 'http://localhost:8000';

function App() {
  const [gameId, setGameId] = useState(null);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [difficulty, setDifficulty] = useState(null);
  const [logs, setLogs] = useState([]);
  const [phase, setPhase] = useState('START'); 
  const [options, setOptions] = useState([]);
  const [modal, setModal] = useState(null); 

  const addLog = (type, text) => {
    setLogs(prev => [...prev, { type, text }]);
  };

  const startGame = async (diff) => {
    setDifficulty(diff);
    addLog('system', `INITIALIZING BIO-LOGIC ENGINE (${diff.toUpperCase()})...`);
    
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
        setHp(data.hp);
        addLog('diagnosis', `INCORRECT. ${data.message}`);
        addLog('system', 'RE-INITIALIZING TEST PROTOCOLS...');
        
        if (data.test_options) {
             setOptions(data.test_options);
        }
        setPhase('TEST');
      }
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col relative crt-flicker font-mono">
      <div className="scanlines"></div>
      
      <h1 className="text-4xl text-center mb-8 font-bold tracking-widest text-shadow-glow">
        BIO-LOGIC PROTOCOL v2.5
      </h1>

      {phase === 'START' && (
        <div className="flex-1 flex items-center justify-center z-10 gap-12">
            
            {/* Left Decoration: Injection */}
            <div className="hidden md:flex flex-col items-center opacity-80">
                <Syringe size={120} className="text-bio-green rotate-[-45deg] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]" />
            </div>

            {/* Main Menu Box */}
            <div className="w-full max-w-lg border-2 border-bio-green p-10 text-center bg-black relative shadow-[0_0_30px_rgba(0,255,0,0.2)]">
            <p className="mb-8 text-3xl font-bold tracking-wider text-bio-green">DIFFICULTY</p>
            <div className="flex flex-col gap-6">
                <button onClick={() => startGame('easy')} className="border-2 border-bio-green p-4 text-xl hover:bg-bio-green hover:text-black transition-all font-bold tracking-widest">
                EASY
                </button>
                <button onClick={() => startGame('medium')} className="border-2 border-bio-orange p-4 text-xl hover:bg-bio-orange hover:text-black text-bio-orange transition-all font-bold tracking-widest">
                MEDIUM
                </button>
                <button onClick={() => startGame('hard')} className="border-2 border-bio-red p-4 text-xl hover:bg-bio-red hover:text-black text-bio-red transition-all font-bold tracking-widest">
                HARD
                </button>
            </div>
            </div>

            {/* Right Decoration: Heart Monitor */}
            <div className="hidden md:flex flex-col items-center opacity-80">
                <Activity size={120} className="text-bio-green animate-pulse drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]" />
            </div>
        </div>
      )}

      {phase !== 'START' && (
        <div className="max-w-5xl mx-auto w-full z-10 flex flex-col h-[85vh]">
          <Vitals hp={hp} maxHp={maxHp} difficulty={difficulty} />
          <TerminalLog logs={logs} />
          {phase !== 'END' && (
             <ActionDeck phase={phase} options={options} onSelect={handleAction} />
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className={`border-4 p-10 max-w-4xl w-full text-center ${modal.type === 'win' ? 'border-bio-green text-bio-green shadow-[0_0_50px_#0f0]' : 'border-bio-red text-bio-red shadow-[0_0_50px_#f00]'}`}>
            <h2 className="text-5xl font-bold mb-6 tracking-widest">{modal.title}</h2>
            
            <div className="text-white font-mono text-xl leading-relaxed mb-10 text-left border-2 border-gray-700 p-6 bg-gray-900 overflow-y-auto max-h-[60vh]">
                {modal.msg}
            </div>
            
            <button onClick={() => window.location.reload()} className="border-2 px-10 py-4 hover:bg-white hover:text-black uppercase font-bold text-2xl tracking-widest transition-colors">
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;