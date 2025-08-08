export interface PlotFramework {
  id: string;
  name: string;
  beats: PlotBeat[];
  description: string;
  genre: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface PlotBeat {
  id: string;
  name: string;
  description: string;
  // Additional properties used by components
  label?: string;
  position?: number;
  act?: number;
  isStructural?: boolean;
  tensionLevel?: number;
  framework?: PlotFramework;
  emotionalArc?: string;
  characterArcs?: string[];
  requiredElements?: string[];
}

export interface PlotGap {
  id: string;
  beatId: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export interface ScenePlacementSuggestion {
  sceneId: string;
  suggestedBeatId: string;
  confidence: number;
  // Additional properties used by components
  recommendedAct?: number;
  recommendedBeat?: string;
  notes?: string[];
  alternativePlacements?: Array<{
    beatId: string;
    confidence: number;
    reasoning: string;
  }>;
}

export interface PlotStructureAnalysis {
  missingBeats: string[];
  extraScenes: string[];
  structureScore: number;
  actBreakdown: {
    act1: { scenes: number; beats: number; tension: number };
    act2: { scenes: number; beats: number; tension: number };
    act3: { scenes: number; beats: number; tension: number };
  };
  pacingIssues: Array<{
    type: 'slow' | 'fast' | 'uneven';
    location: string;
    severity: number;
    suggestion: string;
  }>;
  characterArcAlignment: Array<{
    characterId: string;
    alignment: number;
    issues: string[];
  }>;
}

export interface Event {
  id: string;
  text: string;
  type: 'action' | 'dialogue' | 'description' | 'transition';
  characters?: string[];
  location?: string;
  emotionalTone?: string;
  tensionLevel?: number;
}

export interface Scene {
  id: string;
  text: string;
  events: Event[];
  characters: string[];
  location?: string;
  emotionalTone?: string;
  tensionLevel?: number;
  wordCount: number;
}

export class PlotEngine {
  private frameworks: Map<string, PlotFramework> = new Map();
  private analysisCache: Map<string, PlotStructureAnalysis> = new Map();

  constructor() {
    this.initializeDefaultFrameworks();
  }

  private initializeDefaultFrameworks(): void {
    const threeActStructure: PlotFramework = {
      id: 'three-act',
      name: 'Three-Act Structure',
      description: 'Classic three-act dramatic structure',
      genre: 'drama',
      complexity: 'moderate',
      beats: [
        {
          id: 'setup',
          name: 'Setup',
          description: 'Establish world and characters',
          act: 1,
          position: 0.25,
          tensionLevel: 2,
        },
        {
          id: 'inciting-incident',
          name: 'Inciting Incident',
          description: 'Catalyst for the story',
          act: 1,
          position: 0.25,
          tensionLevel: 4,
        },
        {
          id: 'plot-point-1',
          name: 'Plot Point 1',
          description: 'End of Act 1',
          act: 1,
          position: 0.25,
          tensionLevel: 6,
        },
        {
          id: 'rising-action',
          name: 'Rising Action',
          description: 'Complications and obstacles',
          act: 2,
          position: 0.5,
          tensionLevel: 7,
        },
        {
          id: 'midpoint',
          name: 'Midpoint',
          description: 'Major turning point',
          act: 2,
          position: 0.5,
          tensionLevel: 8,
        },
        {
          id: 'plot-point-2',
          name: 'Plot Point 2',
          description: 'End of Act 2',
          act: 2,
          position: 0.75,
          tensionLevel: 9,
        },
        {
          id: 'climax',
          name: 'Climax',
          description: 'Final confrontation',
          act: 3,
          position: 0.9,
          tensionLevel: 10,
        },
        {
          id: 'resolution',
          name: 'Resolution',
          description: 'Wrap up loose ends',
          act: 3,
          position: 1.0,
          tensionLevel: 3,
        },
      ],
    };

    this.frameworks.set('three-act', threeActStructure);
  }

  mapEventsToFramework(events: Event[]): PlotBeat[] {
    if (events.length === 0) return [];

    const framework = this.frameworks.get('three-act');
    if (!framework) return [];

    const mappedBeats: PlotBeat[] = [];
    const eventCount = events.length;

    events.forEach((event, index) => {
      const position = index / (eventCount - 1);
      const beat = this.findClosestBeat(framework.beats, position);

      if (beat) {
        mappedBeats.push({
          ...beat,
          position,
          tensionLevel: this.calculateTensionLevel(event, position),
        });
      }
    });

    return mappedBeats;
  }

  private findClosestBeat(
    beats: PlotBeat[],
    position: number
  ): PlotBeat | null {
    return beats.reduce(
      (closest, beat) => {
        if (!closest) return beat;
        return Math.abs(beat.position! - position) <
          Math.abs(closest.position! - position)
          ? beat
          : closest;
      },
      null as PlotBeat | null
    );
  }

  private calculateTensionLevel(event: Event, position: number): number {
    const baseTension = event.tensionLevel || 5;
    const positionMultiplier = Math.sin(position * Math.PI) * 0.3 + 1;
    return Math.min(10, Math.max(1, baseTension * positionMultiplier));
  }

  suggestScenePlacements(scenes: Scene[]): ScenePlacementSuggestion[] {
    const framework = this.frameworks.get('three-act');
    if (!framework) return [];

    return scenes.map(scene => {
      // Calculate average tension (unused but kept for future use)
      // const avgTension =
      //   scene.events.reduce(
      //     (sum, event) => sum + (event.tensionLevel || 5),
      //     0
      //   ) / scene.events.length;
      const position = this.estimateScenePosition(scene);
      const suggestedBeat = this.findClosestBeat(framework.beats, position);

      return {
        sceneId: scene.id,
        suggestedBeatId: suggestedBeat?.id || 'setup',
        confidence: this.calculatePlacementConfidence(scene, suggestedBeat),
        recommendedAct: suggestedBeat?.act,
        recommendedBeat: suggestedBeat?.name,
        notes: this.generatePlacementNotes(scene, suggestedBeat),
        alternativePlacements: this.findAlternativePlacements(
          scene,
          framework.beats
        ),
      };
    });
  }

  private estimateScenePosition(scene: Scene): number {
    // Simple heuristic based on scene content and length
    const tensionLevel = scene.tensionLevel || 5;
    const wordCount = scene.wordCount;

    // Assume longer scenes with higher tension are later in the story
    const tensionFactor = tensionLevel / 10;
    const lengthFactor = Math.min(wordCount / 1000, 1);

    return Math.min(1, (tensionFactor + lengthFactor) / 2);
  }

  private calculatePlacementConfidence(
    scene: Scene,
    beat: PlotBeat | null
  ): number {
    if (!beat) return 0.1;

    const tensionMatch =
      1 - Math.abs((scene.tensionLevel || 5) - (beat.tensionLevel || 5)) / 10;
    const contentMatch = this.analyzeContentAlignment(scene, beat);

    return (tensionMatch + contentMatch) / 2;
  }

  private analyzeContentAlignment(scene: Scene, beat: PlotBeat): number {
    // Simple content analysis - could be enhanced with NLP
    const sceneText = scene.text.toLowerCase();
    const beatKeywords = beat.name.toLowerCase().split(' ');

    const keywordMatches = beatKeywords.filter(keyword =>
      sceneText.includes(keyword)
    ).length;

    return Math.min(1, keywordMatches / beatKeywords.length);
  }

  private generatePlacementNotes(
    scene: Scene,
    beat: PlotBeat | null
  ): string[] {
    const notes: string[] = [];

    if (!beat) {
      notes.push('Unable to determine optimal placement');
      return notes;
    }

    if (scene.tensionLevel && beat.tensionLevel) {
      const tensionDiff = Math.abs(scene.tensionLevel - beat.tensionLevel);
      if (tensionDiff > 3) {
        notes.push(
          `Tension level mismatch: scene (${scene.tensionLevel}) vs beat (${beat.tensionLevel})`
        );
      }
    }

    if (scene.wordCount < 100) {
      notes.push('Scene may be too short for this beat');
    } else if (scene.wordCount > 2000) {
      notes.push('Scene may be too long for this beat');
    }

    return notes;
  }

  private findAlternativePlacements(
    scene: Scene,
    beats: PlotBeat[]
  ): Array<{ beatId: string; confidence: number; reasoning: string }> {
    return beats
      .map(beat => ({
        beatId: beat.id,
        confidence: this.calculatePlacementConfidence(scene, beat),
        reasoning: `Alternative placement based on ${beat.name} characteristics`,
      }))
      .filter(alt => alt.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  analyzePlotStructure(scenes: Scene[]): PlotStructureAnalysis {
    const cacheKey = scenes.map(s => s.id).join(',');
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    const framework = this.frameworks.get('three-act');
    if (!framework) {
      return this.createEmptyAnalysis();
    }

    const analysis: PlotStructureAnalysis = {
      missingBeats: this.findMissingBeats(scenes, framework),
      extraScenes: this.findExtraScenes(scenes, framework),
      structureScore: this.calculateStructureScore(scenes, framework),
      actBreakdown: this.analyzeActBreakdown(scenes),
      pacingIssues: this.analyzePacing(scenes),
      characterArcAlignment: this.analyzeCharacterArcs(scenes),
    };

    this.analysisCache.set(cacheKey, analysis);
    return analysis;
  }

  private findMissingBeats(
    scenes: Scene[],
    framework: PlotFramework
  ): string[] {
    const coveredBeats = new Set<string>();

    scenes.forEach(scene => {
      const position = this.estimateScenePosition(scene);
      const beat = this.findClosestBeat(framework.beats, position);
      if (beat) coveredBeats.add(beat.id);
    });

    return framework.beats
      .filter(beat => !coveredBeats.has(beat.id))
      .map(beat => beat.name);
  }

  private findExtraScenes(scenes: Scene[], framework: PlotFramework): string[] {
    // Identify scenes that don't clearly align with any beat
    return scenes
      .filter(scene => {
        const position = this.estimateScenePosition(scene);
        const beat = this.findClosestBeat(framework.beats, position);
        return !beat || this.calculatePlacementConfidence(scene, beat) < 0.3;
      })
      .map(scene => scene.id);
  }

  private calculateStructureScore(
    scenes: Scene[],
    framework: PlotFramework
  ): number {
    if (scenes.length === 0) return 0;

    let score = 0;
    const totalScenes = scenes.length;

    scenes.forEach(scene => {
      const position = this.estimateScenePosition(scene);
      const beat = this.findClosestBeat(framework.beats, position);
      if (beat) {
        score += this.calculatePlacementConfidence(scene, beat);
      }
    });

    return Math.round((score / totalScenes) * 100);
  }

  private analyzeActBreakdown(
    scenes: Scene[]
  ): PlotStructureAnalysis['actBreakdown'] {
    const acts = {
      act1: { scenes: 0, beats: 0, tension: 0 },
      act2: { scenes: 0, beats: 0, tension: 0 },
      act3: { scenes: 0, beats: 0, tension: 0 },
    };

    scenes.forEach(scene => {
      const position = this.estimateScenePosition(scene);
      let act: keyof typeof acts;

      if (position < 0.25) act = 'act1';
      else if (position < 0.75) act = 'act2';
      else act = 'act3';

      acts[act].scenes++;
      acts[act].tension += scene.tensionLevel || 5;
    });

    // Calculate average tension
    Object.keys(acts).forEach(actKey => {
      const act = acts[actKey as keyof typeof acts];
      act.tension = act.scenes > 0 ? Math.round(act.tension / act.scenes) : 0;
    });

    return acts;
  }

  private analyzePacing(
    scenes: Scene[]
  ): PlotStructureAnalysis['pacingIssues'] {
    const issues: PlotStructureAnalysis['pacingIssues'] = [];

    if (scenes.length < 3) {
      issues.push({
        type: 'slow',
        location: 'overall',
        severity: 8,
        suggestion: 'Story may need more scenes to develop properly',
      });
      return issues;
    }

    // Analyze scene length distribution
    const avgLength =
      scenes.reduce((sum, scene) => sum + scene.wordCount, 0) / scenes.length;
    const longScenes = scenes.filter(
      scene => scene.wordCount > avgLength * 1.5
    );
    const shortScenes = scenes.filter(
      scene => scene.wordCount < avgLength * 0.5
    );

    if (longScenes.length > scenes.length * 0.3) {
      issues.push({
        type: 'slow',
        location: 'multiple scenes',
        severity: 6,
        suggestion: 'Consider breaking up longer scenes to improve pacing',
      });
    }

    if (shortScenes.length > scenes.length * 0.4) {
      issues.push({
        type: 'fast',
        location: 'multiple scenes',
        severity: 5,
        suggestion: 'Some scenes may need more development',
      });
    }

    return issues;
  }

  private analyzeCharacterArcs(
    scenes: Scene[]
  ): PlotStructureAnalysis['characterArcAlignment'] {
    const characterAppearances = new Map<string, number>();

    scenes.forEach(scene => {
      scene.characters.forEach(character => {
        characterAppearances.set(
          character,
          (characterAppearances.get(character) || 0) + 1
        );
      });
    });

    return Array.from(characterAppearances.entries()).map(
      ([characterId, appearances]) => ({
        characterId,
        alignment: Math.min(10, appearances * 2), // Simple heuristic
        issues: appearances < 3 ? ['Character appears too infrequently'] : [],
      })
    );
  }

  private createEmptyAnalysis(): PlotStructureAnalysis {
    return {
      missingBeats: [],
      extraScenes: [],
      structureScore: 0,
      actBreakdown: {
        act1: { scenes: 0, beats: 0, tension: 0 },
        act2: { scenes: 0, beats: 0, tension: 0 },
        act3: { scenes: 0, beats: 0, tension: 0 },
      },
      pacingIssues: [],
      characterArcAlignment: [],
    };
  }

  recommendStructuralEdits(analysis: PlotStructureAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.missingBeats.length > 0) {
      recommendations.push(
        `Add scenes to cover missing beats: ${analysis.missingBeats.join(', ')}`
      );
    }

    if (analysis.extraScenes.length > 0) {
      recommendations.push(
        `Review scenes that don't align with structure: ${analysis.extraScenes.join(', ')}`
      );
    }

    if (analysis.structureScore < 70) {
      recommendations.push(
        'Consider restructuring to better align with chosen framework'
      );
    }

    analysis.pacingIssues.forEach(issue => {
      recommendations.push(`Pacing issue: ${issue.suggestion}`);
    });

    analysis.characterArcAlignment
      .filter(arc => arc.alignment < 5)
      .forEach(arc => {
        recommendations.push(
          `Develop character arc for ${arc.characterId}: appears too infrequently`
        );
      });

    return recommendations;
  }
}
