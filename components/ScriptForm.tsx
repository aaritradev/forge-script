
import React from 'react';
import { Tone, ScriptRequest } from '../types';
import Button from './Button';

interface ScriptFormProps {
  onGenerate: (data: ScriptRequest) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ScriptForm: React.FC<ScriptFormProps> = ({ onGenerate, isLoading, disabled }) => {
  const [topic, setTopic] = React.useState('');
  const [tone, setTone] = React.useState<Tone>(Tone.AGGRESSIVE);
  const [duration, setDuration] = React.useState<15 | 30 | 60>(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || disabled) return;
    onGenerate({ topic, tone, duration });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-xl mx-auto">
      <div className="space-y-2 group">
        <label className="text-xs font-bold uppercase tracking-tighter text-neutral-500 group-focus-within:text-red-500 transition-colors">Subject Matter</label>
        <input 
          type="text"
          placeholder="e.g., Fear, Heartbreak, Lack of Discipline"
          className="w-full bg-neutral-900 border border-neutral-800 focus:border-red-600 focus:ring-0 text-white px-4 py-3 outline-none transition-all placeholder:text-zinc-700"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          disabled={disabled || isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-tighter text-neutral-500">Atmosphere</label>
          <select 
            className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 outline-none focus:border-red-600 appearance-none transition-colors"
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            disabled={disabled || isLoading}
          >
            <option value={Tone.AGGRESSIVE}>Aggressive</option>
            <option value={Tone.STOIC}>Stoic</option>
            <option value={Tone.CALM}>Wise / Calm</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-tighter text-neutral-500">Duration</label>
          <select 
            className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-3 outline-none focus:border-red-600 appearance-none transition-colors"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) as 15 | 30 | 60)}
            disabled={disabled || isLoading}
          >
            <option value={15}>15s (Short)</option>
            <option value={30}>30 Seconds</option>
            <option value={60}>60 Seconds</option>
          </select>
        </div>
      </div>

      <Button 
        type="submit" 
        isLoading={isLoading} 
        disabled={disabled} 
        className="w-full h-14"
      >
        Forge Script
      </Button>
    </form>
  );
};

export default ScriptForm;
