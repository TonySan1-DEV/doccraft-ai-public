// MCP Context Block
/*
role: developer,
tier: Pro,
file: "modules/plotStructure/configs/frameworkConfigs.ts",
allowedActions: ["define", "extend", "model"],
theme: "story_framework"
*/

export type PlotBeatPreset = {
  id: string;
  name: string;
  description: string;
  expectedEmotion: string;
  position: number; // 0-100 (% of narrative)
  icon?: string;
  label?: string;
};

export type PlotFrameworkPreset = {
  id: string;
  name: string;
  beats: PlotBeatPreset[];
};

export const plotFrameworkPresets: PlotFrameworkPreset[] = [
  {
    id: 'heros_journey',
    name: "Hero's Journey",
    beats: [
      { id: 'ordinary_world', name: 'Ordinary World', description: 'The hero’s normal life before the adventure begins.', expectedEmotion: 'neutral', position: 0, icon: '🏠' },
      { id: 'call_to_adventure', name: 'Call to Adventure', description: 'The hero is presented with a challenge.', expectedEmotion: 'curiosity', position: 7, icon: '📜' },
      { id: 'refusal', name: 'Refusal of the Call', description: 'The hero hesitates or refuses the challenge.', expectedEmotion: 'doubt', position: 12, icon: '🙅' },
      { id: 'mentor', name: 'Meeting the Mentor', description: 'A mentor appears to guide the hero.', expectedEmotion: 'hope', position: 17, icon: '🧙' },
      { id: 'crossing_threshold', name: 'Crossing the Threshold', description: 'The hero leaves the ordinary world.', expectedEmotion: 'anticipation', position: 22, icon: '🚪' },
      { id: 'tests_allies_enemies', name: 'Tests, Allies, Enemies', description: 'The hero faces challenges and meets allies/enemies.', expectedEmotion: 'tension', position: 32, icon: '⚔️' },
      { id: 'approach', name: 'Approach to the Inmost Cave', description: 'The hero approaches a dangerous place.', expectedEmotion: 'anxiety', position: 50, icon: '🏞️' },
      { id: 'ordeal', name: 'Ordeal', description: 'The hero faces a major challenge or crisis.', expectedEmotion: 'fear', position: 60, icon: '🔥' },
      { id: 'reward', name: 'Reward', description: 'The hero claims a reward after facing death.', expectedEmotion: 'relief', position: 70, icon: '🏆' },
      { id: 'road_back', name: 'The Road Back', description: 'The hero begins the return journey.', expectedEmotion: 'determination', position: 80, icon: '🛣️' },
      { id: 'resurrection', name: 'Resurrection', description: 'The hero faces a final test.', expectedEmotion: 'climax', position: 90, icon: '🌅' },
      { id: 'return', name: 'Return with the Elixir', description: 'The hero returns home transformed.', expectedEmotion: 'fulfillment', position: 100, icon: '🎁' },
    ],
  },
  {
    id: 'save_the_cat',
    name: 'Save the Cat',
    beats: [
      { id: 'opening_image', name: 'Opening Image', description: 'A snapshot of the protagonist’s world.', expectedEmotion: 'neutral', position: 0, icon: '🖼️' },
      { id: 'theme_stated', name: 'Theme Stated', description: 'The story’s theme is stated.', expectedEmotion: 'curiosity', position: 5, icon: '💡' },
      { id: 'set_up', name: 'Set-Up', description: 'Introduce characters and setting.', expectedEmotion: 'interest', position: 10, icon: '🏗️' },
      { id: 'catalyst', name: 'Catalyst', description: 'The inciting incident.', expectedEmotion: 'surprise', position: 12, icon: '⚡' },
      { id: 'debate', name: 'Debate', description: 'The hero debates what to do.', expectedEmotion: 'doubt', position: 18, icon: '🤔' },
      { id: 'break_into_two', name: 'Break Into Two', description: 'The hero makes a choice and the journey begins.', expectedEmotion: 'anticipation', position: 25, icon: '🚀' },
      { id: 'b_story', name: 'B Story', description: 'A subplot begins.', expectedEmotion: 'interest', position: 30, icon: '🧩' },
      { id: 'fun_and_games', name: 'Fun and Games', description: 'The heart of the story; the promise of the premise.', expectedEmotion: 'joy', position: 40, icon: '🎉' },
      { id: 'midpoint', name: 'Midpoint', description: 'A major event changes everything.', expectedEmotion: 'shock', position: 50, icon: '🔄' },
      { id: 'bad_guys_close_in', name: 'Bad Guys Close In', description: 'Obstacles intensify.', expectedEmotion: 'tension', position: 65, icon: '👹' },
      { id: 'all_is_lost', name: 'All Is Lost', description: 'The hero hits rock bottom.', expectedEmotion: 'despair', position: 75, icon: '💀' },
      { id: 'dark_night', name: 'Dark Night of the Soul', description: 'The hero reflects and regroups.', expectedEmotion: 'reflection', position: 80, icon: '🌑' },
      { id: 'break_into_three', name: 'Break Into Three', description: 'A solution is found.', expectedEmotion: 'hope', position: 85, icon: '🌅' },
      { id: 'finale', name: 'Finale', description: 'The climax and resolution.', expectedEmotion: 'triumph', position: 95, icon: '🏁' },
      { id: 'final_image', name: 'Final Image', description: 'A snapshot of the changed world.', expectedEmotion: 'fulfillment', position: 100, icon: '🖼️' },
    ],
  },
  {
    id: 'three_act',
    name: 'Three Act Structure',
    beats: [
      { id: 'setup', name: 'Act I: Setup', description: 'Establish characters, setting, and stakes.', expectedEmotion: 'interest', position: 0, icon: '🎬' },
      { id: 'inciting_incident', name: 'Inciting Incident', description: 'Event that sets the story in motion.', expectedEmotion: 'surprise', position: 10, icon: '⚡' },
      { id: 'first_turning_point', name: 'First Turning Point', description: 'Major event that changes direction.', expectedEmotion: 'anticipation', position: 25, icon: '🔀' },
      { id: 'confrontation', name: 'Act II: Confrontation', description: 'Rising action and obstacles.', expectedEmotion: 'tension', position: 40, icon: '⚔️' },
      { id: 'midpoint', name: 'Midpoint', description: 'A pivotal event.', expectedEmotion: 'shock', position: 50, icon: '🔄' },
      { id: 'second_turning_point', name: 'Second Turning Point', description: 'Another major change.', expectedEmotion: 'anxiety', position: 65, icon: '🔁' },
      { id: 'climax', name: 'Act III: Climax', description: 'The story’s peak conflict.', expectedEmotion: 'climax', position: 85, icon: '🔥' },
      { id: 'resolution', name: 'Resolution', description: 'Loose ends are tied up.', expectedEmotion: 'fulfillment', position: 100, icon: '🎉' },
    ],
  },
];

export type PlotFrameworkId = typeof plotFrameworkPresets[number]['id']; 