
import React, { useState } from 'react';
import { ScriptOutput, ScriptVariation } from '../types';

interface ScriptDisplayProps {
  script: ScriptOutput;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const triggerFeedback = (id: string) => {
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyFull = () => {
    let fullText = "";
    script.variations.forEach((v, i) => {
      fullText += `VARIATION ${i + 1}\n\n`;
      fullText += `HOOK: ${v.hook}\n`;
      fullText += `STRUGGLE: ${v.struggle}\n`;
      fullText += `REALIZATION: ${v.realization}\n`;
      fullText += `DECLARATION: ${v.declaration}\n`;
      fullText += `CTA: ${v.cta}\n`;
      fullText += `ESTIMATED DURATION: ${v.estimatedDuration}s\n\n`;
    });

    fullText += `---\n\n`;
    fullText += `VISUAL SCENES:\n${script.visualSuggestions.map(s => `- ${s}`).join('\n')}\n\n`;
    fullText += `CAPTION:\n${script.caption}\n\n`;
    fullText += `HASHTAGS:\n${script.hashtags.map(h => `#${h}`).join(' ')}`;
    
    navigator.clipboard.writeText(fullText);
    triggerFeedback('full');
  };

  const handleCopyVariation = (v: ScriptVariation, index: number) => {
    const text = `VARIATION ${index + 1}\n\nHOOK: ${v.hook}\nSTRUGGLE: ${v.struggle}\nREALIZATION: ${v.realization}\nDECLARATION: ${v.declaration}\nCTA: ${v.cta}`;
    navigator.clipboard.writeText(text);
    triggerFeedback(`var-${index}`);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(script.caption);
    triggerFeedback('caption');
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(script.hashtags.map(h => `#${h}`).join(' '));
    triggerFeedback('hashtags');
  };

  const current = script.variations[activeTab];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Variation Selector Tabs */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-center gap-2 p-1 bg-neutral-900/50 border border-neutral-800 rounded-none w-fit mx-auto">
          {script.variations.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                activeTab === i 
                  ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              Forge 0{i + 1}
            </button>
          ))}
        </div>

        <button 
          onClick={() => handleCopyVariation(current, activeTab)}
          className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
        >
          {copiedSection === `var-${activeTab}` ? '✓ Script Copied' : 'Copy Current Script'}
        </button>
      </div>

      <div className="grid gap-6">
        {[
          { label: 'The Hook', content: current.hook },
          { label: 'The Struggle', content: current.struggle },
          { label: 'The Realization', content: current.realization },
          { label: 'The Declaration', content: current.declaration, special: true },
          { label: 'The Call to Action', content: current.cta },
        ].map((section, idx) => (
          <div 
            key={idx} 
            className={`glass p-8 group border-l-2 transition-all duration-700 hover:bg-white/[0.01] ${
              section.special ? 'border-l-red-600 bg-red-600/[0.03]' : 'border-l-transparent hover:border-l-zinc-700'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${section.special ? 'text-red-500' : 'text-zinc-600'}`}>
                Phase 0{idx + 1}
              </span>
              <span className={`font-display text-[10px] font-black uppercase tracking-tighter ${section.special ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-400'}`}>
                {section.label}
              </span>
            </div>
            <p className={`text-xl md:text-2xl font-bold leading-[1.2] tracking-tight whitespace-pre-line ${section.special ? 'text-white' : 'text-neutral-200'}`}>
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between glass p-6 border-b border-b-zinc-800">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">VO Length Estimate</span>
        <span className="font-display text-xl font-black text-white">{current.estimatedDuration} SECONDS</span>
      </div>

      {/* Shared Metadata */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="glass p-8 border border-zinc-900 h-full">
            <h3 className="font-display text-[10px] font-black uppercase mb-6 tracking-[0.3em] text-red-500">Visual Blueprint</h3>
            <ul className="space-y-4">
              {script.visualSuggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-4 text-xs text-neutral-400 group">
                  <span className="text-red-600 font-bold">0{i+1}</span>
                  <span className="leading-relaxed group-hover:text-neutral-200 transition-colors">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 border border-zinc-900 h-full relative">
            <h3 className="font-display text-[10px] font-black uppercase mb-6 tracking-[0.3em] text-red-500">Post Metadata</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase">Caption</p>
                  <button onClick={handleCopyCaption} className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                    {copiedSection === 'caption' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm italic text-neutral-300 leading-relaxed whitespace-pre-line">
                  {script.caption}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase">Hashtags</p>
                  <button onClick={handleCopyHashtags} className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                    {copiedSection === 'hashtags' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {script.hashtags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-bold text-red-600/60 uppercase">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 pt-10">
        <button 
          onClick={handleCopyFull}
          className="group relative px-12 py-6 bg-white border-none overflow-hidden transition-all duration-500 active:scale-[0.98] w-full max-w-md shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(220,38,38,0.2)]"
        >
          <span className="relative z-10 font-display text-xs font-black uppercase tracking-[0.4em] text-black">
            {copiedSection === 'full' ? 'Execution Complete' : 'Copy Triple Bundle'}
          </span>
          <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          <span className="absolute inset-0 z-20 flex items-center justify-center font-display text-xs font-black uppercase tracking-[0.4em] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             {copiedSection === 'full' ? 'Copied to Clipboard' : 'Execute Copy'}
          </span>
        </button>
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-zinc-800"></div>
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.5em]">High Retention Forged</p>
          <div className="h-px w-8 bg-zinc-800"></div>
        </div>
      </div>
    </div>
  );
};

export default ScriptDisplay;
