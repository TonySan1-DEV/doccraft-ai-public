// MCP Context Block
/*
{
  file: "modules/plotStructure/structureSuggestionEngine.ts",
  role: "developer",
  allowedActions: ["simulate", "analyze", "connect"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "emotional_alignment"
}
*/

import type {
  PlotStructureAnalysis,
  PlotGap,
  ScenePlacementSuggestion,
  PlotBeat,
} from './initPlotEngine';
import type {
  EmotionalBeat,
  TensionCurve,
  SceneEmotionData,
} from '../emotionArc/types/emotionTypes';
import { ArcSimulator } from '../emotionArc/services/arcSimulator';

export interface ArcPlotOverlay {
  sceneId: string;
  beatId: string;
  beatLabel: string;
  emotionalBeat: EmotionalBeat;
  tensionLevel: number;
  empathyLevel: number;
  engagementLevel: number;
  emotionalComplexity: number;
  alignment: 'strong' | 'moderate' | 'weak' | 'mismatch';
  suggestions: string[];
}

export interface EmotionalGapAnalysis {
  position: number;
  gapType:
    | 'tension_drop'
    | 'empathy_drop'
    | 'engagement_drop'
    | 'complexity_spike';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestedImprovements: string[];
}

export interface EmotionalTensionAnalysis {
  act: string;
  expectedTension: number;
  actualTension: number;
  variance: number;
  consistency: 'consistent' | 'inconsistent' | 'problematic';
  recommendations: string[];
}

export interface StructuralAIWarning {
  sceneId: string;
  beatId: string;
  note: string;
  severity: 'info' | 'warning' | 'critical';
  impact: number; // 1-10
  suggestion?: string;
}

export class StructureSuggestionEngine {
  private arcSimulator: ArcSimulator;

  constructor() {
    this.arcSimulator = new ArcSimulator();
  }

  /**
   * Maps emotional beats to plot framework beats
   */
  mapEmotionalBeatsToFramework(
    sceneData: SceneEmotionData[],
    frameworkBeats: PlotBeat[]
  ): ArcPlotOverlay[] {
    const overlays: ArcPlotOverlay[] = [];

    // Generate arc simulation
    const simulation = this.arcSimulator.generateArcSimulation(sceneData);

    sceneData.forEach((scene, index) => {
      // Find corresponding framework beat based on narrative position
      const position = index / (sceneData.length - 1);
      const beat = this.findBeatAtPosition(frameworkBeats, position);

      if (beat) {
        const tensionCurve = simulation.tensionCurve?.[index];
        const emotionalBeat = this.createEmotionalBeat(scene, position);

        const overlay: ArcPlotOverlay = {
          sceneId: scene.sceneId,
          beatId: beat.id,
          beatLabel: beat.label || 'Unknown Beat',
          emotionalBeat,
          tensionLevel:
            typeof tensionCurve === 'number'
              ? tensionCurve
              : (tensionCurve as any).tension || 0,
          empathyLevel:
            typeof tensionCurve === 'number'
              ? 0
              : (tensionCurve as any).empathy || 0,
          engagementLevel:
            typeof tensionCurve === 'number'
              ? 0
              : (tensionCurve as any).engagement || 0,
          emotionalComplexity:
            typeof tensionCurve === 'number'
              ? 0
              : (tensionCurve as any).emotionalComplexity || 0,
          alignment: this.calculateAlignment(tensionCurve as any, beat),
          suggestions: this.generateEmotionalSuggestions(
            tensionCurve as any,
            beat
          ),
        };

        overlays.push(overlay);
      }
    });

    return overlays;
  }

  /**
   * Detects emotional gaps across acts
   */
  detectEmotionalGaps(
    overlays: ArcPlotOverlay[],
    _frameworkBeats: PlotBeat[]
  ): EmotionalGapAnalysis[] {
    const gaps: EmotionalGapAnalysis[] = [];

    // Group overlays by acts (assuming 3-act structure)
    const act1Overlays = overlays.filter(o => this.isInAct1(o.beatId));
    const act2Overlays = overlays.filter(o => this.isInAct2(o.beatId));
    const act3Overlays = overlays.filter(o => this.isInAct3(o.beatId));

    // Analyze each act for gaps
    gaps.push(...this.analyzeActGaps(act1Overlays, 'Act 1'));
    gaps.push(...this.analyzeActGaps(act2Overlays, 'Act 2'));
    gaps.push(...this.analyzeActGaps(act3Overlays, 'Act 3'));

    return gaps;
  }

  /**
   * Analyzes tension consistency across acts
   */
  analyzeTensionConsistency(
    overlays: ArcPlotOverlay[]
  ): EmotionalTensionAnalysis[] {
    const analyses: EmotionalTensionAnalysis[] = [];

    // Define expected tension patterns for each act
    const actExpectations = {
      'Act 1': { min: 30, max: 60, expected: 45 },
      'Act 2': { min: 50, max: 90, expected: 70 },
      'Act 3': { min: 70, max: 100, expected: 85 },
    };

    // Group overlays by acts
    const actGroups = {
      'Act 1': overlays.filter(o => this.isInAct1(o.beatId)),
      'Act 2': overlays.filter(o => this.isInAct2(o.beatId)),
      'Act 3': overlays.filter(o => this.isInAct3(o.beatId)),
    };

    Object.entries(actGroups).forEach(([act, actOverlays]) => {
      if (actOverlays.length === 0) return;

      const avgTension =
        actOverlays.reduce((sum, o) => sum + o.tensionLevel, 0) /
        actOverlays.length;
      const expectation = actExpectations[act as keyof typeof actExpectations];
      const variance = Math.abs(avgTension - expectation.expected);

      const consistency = this.determineConsistency(
        avgTension,
        expectation,
        variance
      );
      const recommendations = this.generateTensionRecommendations(
        avgTension,
        expectation,
        consistency
      );

      analyses.push({
        act,
        expectedTension: expectation.expected,
        actualTension: avgTension,
        variance,
        consistency,
        recommendations,
      });
    });

    return analyses;
  }

  /**
   * Generates improvement suggestions when emotional curve diverges from plot intent
   */
  generateEmotionalImprovements(
    overlays: ArcPlotOverlay[],
    gaps: EmotionalGapAnalysis[],
    tensionAnalysis: EmotionalTensionAnalysis[]
  ): string[] {
    const suggestions: string[] = [];

    // Analyze alignment issues
    const weakAlignments = overlays.filter(
      o => o.alignment === 'weak' || o.alignment === 'mismatch'
    );
    if (weakAlignments.length > 0) {
      suggestions.push(
        `Found ${weakAlignments.length} scenes with weak emotional alignment to plot structure.`
      );
    }

    // Address gaps
    gaps.forEach(gap => {
      if (gap.severity === 'high') {
        suggestions.push(
          `Critical gap at ${Math.round(gap.position * 100)}%: ${gap.description}`
        );
      }
    });

    // Address tension inconsistencies
    tensionAnalysis.forEach(analysis => {
      if (analysis.consistency === 'problematic') {
        suggestions.push(
          `${analysis.act} tension (${Math.round(analysis.actualTension)}) significantly differs from expected (${analysis.expectedTension}).`
        );
      }
    });

    return suggestions;
  }

  /**
   * Generate AI warnings based on emotional and character arc validation
   */
  generateStructuralAIWarnings(
    overlays: ArcPlotOverlay[],
    protagonist?: { flaw?: string; flawResolved?: boolean },
    frameworkBeats?: PlotBeat[]
  ): StructuralAIWarning[] {
    const warnings: StructuralAIWarning[] = [];

    // 1. Protagonist flaw unresolved but climax suggests resolution
    if (protagonist && frameworkBeats) {
      const climaxOverlay = overlays.find(o => o.beatId === 'climax');
      if (
        climaxOverlay &&
        protagonist.flaw &&
        protagonist.flawResolved === false
      ) {
        warnings.push({
          sceneId: climaxOverlay.sceneId,
          beatId: climaxOverlay.beatId,
          note: `Climax suggests resolution, but protagonist flaw ('${protagonist.flaw}') is unresolved.`,
          severity: 'critical',
          impact: 9,
          suggestion:
            'Clarify flaw resolution in climax or adjust character arc.',
        });
      }
    }

    // 2. Final act has flat empathy score
    const finalActOverlays = overlays.filter(o =>
      ['road', 'climax', 'resurrection', 'return'].includes(o.beatId)
    );
    if (finalActOverlays.length > 0) {
      const avgEmpathy =
        finalActOverlays.reduce((sum, o) => sum + o.empathyLevel, 0) /
        finalActOverlays.length;
      if (avgEmpathy < 30) {
        finalActOverlays.forEach(o => {
          warnings.push({
            sceneId: o.sceneId,
            beatId: o.beatId,
            note: 'Final act has flat empathy score. Consider reinforcing emotional stakes.',
            severity: 'warning',
            impact: 7,
            suggestion:
              'Add character vulnerability or deepen relationships in final act.',
          });
        });
      }
    }

    // 3. Save the Cat 'Fun and Games' beat is emotionally flat
    const funAndGamesOverlay = overlays.find(o => o.beatId === 'fun_and_games');
    if (funAndGamesOverlay && funAndGamesOverlay.tensionLevel < 30) {
      warnings.push({
        sceneId: funAndGamesOverlay.sceneId,
        beatId: funAndGamesOverlay.beatId,
        note: "'Fun and Games' beat is emotionally flat. Raise stakes or tension.",
        severity: 'warning',
        impact: 6,
        suggestion:
          'Introduce conflict, surprise, or challenge in this section.',
      });
    }

    // Suggest beat reassignment or narrative edits for mismatches
    overlays.forEach(o => {
      if (o.alignment === 'mismatch') {
        warnings.push({
          sceneId: o.sceneId,
          beatId: o.beatId,
          note: `Emotional arc diverges from structural intent at '${o.beatLabel}'.`,
          severity: 'warning',
          impact: 8,
          suggestion:
            'Reassign scene to a more fitting beat or revise emotional content.',
        });
      }
    });

    return warnings;
  }

  recommendEdits(_analysis: PlotStructureAnalysis): string[] {
    // TODO: Use AI/heuristics to suggest structural edits
    return [];
  }

  suggestGapFills(_gaps: PlotGap[]): string[] {
    // TODO: Suggest how to fill missing beats
    return [];
  }

  suggestScenePlacements(_suggestions: ScenePlacementSuggestion[]): string[] {
    // TODO: Suggest scene reordering or placement
    return [];
  }

  // Private helper methods
  private findBeatAtPosition(
    beats: PlotBeat[],
    position: number
  ): PlotBeat | null {
    // Simple mapping: assume beats are evenly distributed
    const beatIndex = Math.floor(position * beats.length);
    return beats[beatIndex] || null;
  }

  private createEmotionalBeat(
    scene: SceneEmotionData,
    position: number
  ): EmotionalBeat {
    // Create emotional beat from scene data
    const avgIntensity = scene.characterEmotions
      ? Array.from(scene.characterEmotions.values()).reduce(
          (sum, emotion: any) => sum + emotion.intensity,
          0
        ) / scene.characterEmotions.size
      : 0;

    return {
      id: `beat_${scene.sceneId}_${position}`,
      sceneId: scene.sceneId,
      characterId: scene.characterEmotions
        ? Array.from(scene.characterEmotions.keys())[0] || ''
        : '',
      emotion: scene.overallSentiment || 'neutral',
      intensity: avgIntensity,
      narrativePosition: position,
      timestamp: Date.now(),
      context: scene.sceneText ? scene.sceneText.substring(0, 100) : '',
    };
  }

  private calculateAlignment(
    tensionCurve: TensionCurve,
    beat: PlotBeat
  ): 'strong' | 'moderate' | 'weak' | 'mismatch' {
    // Determine alignment based on beat type and emotional intensity
    const isHighTensionBeat = ['climax', 'crisis', 'confrontation'].includes(
      beat.id
    );
    const isLowTensionBeat = ['resolution', 'denouement', 'setup'].includes(
      beat.id
    );

    if (isHighTensionBeat && (tensionCurve as any).tension > 70)
      return 'strong';
    if (isLowTensionBeat && (tensionCurve as any).tension < 40) return 'strong';
    if (isHighTensionBeat && (tensionCurve as any).tension < 30)
      return 'mismatch';
    if (isLowTensionBeat && (tensionCurve as any).tension > 80)
      return 'mismatch';
    if ((tensionCurve as any).engagement > 60) return 'moderate';
    return 'weak';
  }

  private generateEmotionalSuggestions(
    tensionCurve: TensionCurve,
    beat: PlotBeat
  ): string[] {
    const suggestions: string[] = [];

    if (
      (tensionCurve as any).tension < 30 &&
      ['climax', 'crisis'].includes(beat.id)
    ) {
      suggestions.push('Consider increasing tension for this critical beat');
    }

    if ((tensionCurve as any).empathy < 40) {
      suggestions.push('Add character vulnerability to increase empathy');
    }

    if ((tensionCurve as any).engagement < 50) {
      suggestions.push(
        'Risk of reader disengagement - consider adding stakes or conflict'
      );
    }

    return suggestions;
  }

  private isInAct1(beatId: string): boolean {
    return ['setup', 'catalyst', 'call'].includes(beatId);
  }

  private isInAct2(beatId: string): boolean {
    return [
      'refusal',
      'meeting',
      'tests',
      'approach',
      'ordeal',
      'reward',
    ].includes(beatId);
  }

  private isInAct3(beatId: string): boolean {
    return ['road', 'climax', 'resurrection', 'return'].includes(beatId);
  }

  private analyzeActGaps(
    overlays: ArcPlotOverlay[],
    actName: string
  ): EmotionalGapAnalysis[] {
    const gaps: EmotionalGapAnalysis[] = [];

    if (overlays.length === 0) return gaps;

    // Check for tension drops
    const avgTension =
      overlays.reduce((sum, o) => sum + o.tensionLevel, 0) / overlays.length;
    if (avgTension < 30) {
      gaps.push({
        position: overlays[0].emotionalBeat.narrativePosition || 0,
        gapType: 'tension_drop',
        severity: 'high',
        description: `${actName} has low average tension (${Math.round(avgTension)})`,
        suggestedImprovements: [
          'Add conflict',
          'Increase stakes',
          'Introduce obstacles',
        ],
      });
    }

    // Check for engagement drops
    const avgEngagement =
      overlays.reduce((sum, o) => sum + o.engagementLevel, 0) / overlays.length;
    if (avgEngagement < 40) {
      gaps.push({
        position: overlays[0].emotionalBeat.narrativePosition || 0,
        gapType: 'engagement_drop',
        severity: 'medium',
        description: `${actName} has low engagement (${Math.round(avgEngagement)})`,
        suggestedImprovements: [
          'Add character development',
          'Increase pacing',
          'Introduce new elements',
        ],
      });
    }

    return gaps;
  }

  private determineConsistency(
    _actualTension: number,
    _expectation: { min: number; max: number; expected: number },
    variance: number
  ): 'consistent' | 'inconsistent' | 'problematic' {
    if (variance < 15) return 'consistent';
    if (variance < 30) return 'inconsistent';
    return 'problematic';
  }

  private generateTensionRecommendations(
    actualTension: number,
    expectation: { min: number; max: number; expected: number },
    consistency: string
  ): string[] {
    const recommendations: string[] = [];

    if (consistency === 'problematic') {
      if (actualTension < expectation.min) {
        recommendations.push(
          'Significantly increase tension to meet act expectations'
        );
      } else if (actualTension > expectation.max) {
        recommendations.push(
          'Consider reducing tension to avoid overwhelming readers'
        );
      }
    } else if (consistency === 'inconsistent') {
      recommendations.push(
        'Fine-tune tension to better align with act structure'
      );
    }

    return recommendations;
  }
}
