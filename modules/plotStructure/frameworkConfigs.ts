// MCP Context Block
/*
{
  file: "modules/plotStructure/frameworkConfigs.ts",
  role: "developer",
  allowedActions: ["scaffold", "structure", "connect"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "story_engineering"
}
*/

import type { PlotFramework, PlotBeat } from './initPlotEngine';

export const FrameworkConfigs: Record<PlotFramework, PlotBeat[]> = {
  HerosJourney: [
    { id: 'call', label: 'Call to Adventure', description: '', act: 1, position: 0.1, tensionLevel: 30, isStructural: true, framework: 'HerosJourney' },
    { id: 'mentor', label: 'Meeting the Mentor', description: '', act: 1, position: 0.2, tensionLevel: 20, isStructural: false, framework: 'HerosJourney' },
    { id: 'threshold', label: 'Crossing the Threshold', description: '', act: 1, position: 0.25, tensionLevel: 40, isStructural: true, framework: 'HerosJourney' },
    { id: 'ordeal', label: 'Ordeal', description: '', act: 2, position: 0.5, tensionLevel: 80, isStructural: true, framework: 'HerosJourney' },
    { id: 'reward', label: 'Reward', description: '', act: 2, position: 0.6, tensionLevel: 50, isStructural: false, framework: 'HerosJourney' },
    { id: 'roadBack', label: 'The Road Back', description: '', act: 3, position: 0.8, tensionLevel: 60, isStructural: true, framework: 'HerosJourney' },
    { id: 'resurrection', label: 'Resurrection', description: '', act: 3, position: 0.9, tensionLevel: 90, isStructural: true, framework: 'HerosJourney' },
    { id: 'return', label: 'Return with Elixir', description: '', act: 3, position: 1.0, tensionLevel: 40, isStructural: true, framework: 'HerosJourney' }
  ],
  SaveTheCat: [
    { id: 'opening', label: 'Opening Image', description: '', act: 1, position: 0.0, tensionLevel: 10, isStructural: true, framework: 'SaveTheCat' },
    { id: 'theme', label: 'Theme Stated', description: '', act: 1, position: 0.05, tensionLevel: 15, isStructural: false, framework: 'SaveTheCat' },
    { id: 'setup', label: 'Set-Up', description: '', act: 1, position: 0.1, tensionLevel: 20, isStructural: true, framework: 'SaveTheCat' },
    { id: 'catalyst', label: 'Catalyst', description: '', act: 1, position: 0.12, tensionLevel: 30, isStructural: true, framework: 'SaveTheCat' },
    { id: 'debate', label: 'Debate', description: '', act: 1, position: 0.18, tensionLevel: 25, isStructural: false, framework: 'SaveTheCat' },
    { id: 'break1', label: 'Break into Two', description: '', act: 2, position: 0.25, tensionLevel: 35, isStructural: true, framework: 'SaveTheCat' },
    { id: 'bStory', label: 'B Story', description: '', act: 2, position: 0.3, tensionLevel: 20, isStructural: false, framework: 'SaveTheCat' },
    { id: 'funGames', label: 'Fun and Games', description: '', act: 2, position: 0.4, tensionLevel: 30, isStructural: false, framework: 'SaveTheCat' },
    { id: 'midpoint', label: 'Midpoint', description: '', act: 2, position: 0.5, tensionLevel: 60, isStructural: true, framework: 'SaveTheCat' },
    { id: 'badGuys', label: 'Bad Guys Close In', description: '', act: 2, position: 0.65, tensionLevel: 70, isStructural: false, framework: 'SaveTheCat' },
    { id: 'allIsLost', label: 'All Is Lost', description: '', act: 2, position: 0.75, tensionLevel: 90, isStructural: true, framework: 'SaveTheCat' },
    { id: 'break3', label: 'Break into Three', description: '', act: 3, position: 0.85, tensionLevel: 50, isStructural: true, framework: 'SaveTheCat' },
    { id: 'finale', label: 'Finale', description: '', act: 3, position: 0.95, tensionLevel: 80, isStructural: true, framework: 'SaveTheCat' },
    { id: 'finalImage', label: 'Final Image', description: '', act: 3, position: 1.0, tensionLevel: 20, isStructural: true, framework: 'SaveTheCat' }
  ],
  ThreeAct: [
    { id: 'setup', label: 'Set-Up', description: '', act: 1, position: 0.0, tensionLevel: 20, isStructural: true, framework: 'ThreeAct' },
    { id: 'inciting', label: 'Inciting Incident', description: '', act: 1, position: 0.1, tensionLevel: 30, isStructural: true, framework: 'ThreeAct' },
    { id: 'firstTurn', label: 'First Turning Point', description: '', act: 1, position: 0.25, tensionLevel: 40, isStructural: true, framework: 'ThreeAct' },
    { id: 'midpoint', label: 'Midpoint', description: '', act: 2, position: 0.5, tensionLevel: 60, isStructural: true, framework: 'ThreeAct' },
    { id: 'secondTurn', label: 'Second Turning Point', description: '', act: 2, position: 0.75, tensionLevel: 80, isStructural: true, framework: 'ThreeAct' },
    { id: 'climax', label: 'Climax', description: '', act: 3, position: 0.9, tensionLevel: 90, isStructural: true, framework: 'ThreeAct' },
    { id: 'resolution', label: 'Resolution', description: '', act: 3, position: 1.0, tensionLevel: 30, isStructural: true, framework: 'ThreeAct' }
  ],
  Custom: []
}; 