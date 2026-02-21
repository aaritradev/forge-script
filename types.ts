
export enum Tone {
  AGGRESSIVE = 'Aggressive',
  STOIC = 'Stoic',
  CALM = 'Calm'
}

export interface ScriptRequest {
  topic: string;
  tone: Tone;
  duration: 15 | 30 | 60;
}

export interface ScriptVariation {
  hook: string;
  struggle: string;
  realization: string;
  declaration: string;
  cta: string;
  estimatedDuration: number;
}

export interface ScriptOutput {
  variations: ScriptVariation[];
  visualSuggestions: string[];
  caption: string;
  hashtags: string[];
  remainingCredits: number;
}

export interface User {
  name: string;
  email: string;
  picture: string;
}
