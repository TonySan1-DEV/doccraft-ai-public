// MCP Context Block
/*
{
  file: "modules/emotionArc/utils/validation.ts",
  role: "developer",
  allowedActions: ["scaffold", "structure", "define"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import {
  EmotionalBeat,
  EmotionalArc,
  EmotionAnalysis,
  ValidationResult,
  SceneEmotionData,
  getDominantEmotion,
  getIntensity,
} from '../types/emotionTypes';
import { EMOTION_CATEGORIES } from '../constants/emotions';

/**
 * Validates an EmotionalBeat object
 */
export function validateEmotionalBeat(beat: EmotionalBeat): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Required fields validation
  if (!beat.sceneId) {
    errors.push('sceneId is required');
  }

  if (!beat.characterId) {
    errors.push('characterId is required');
  }

  if (!beat.emotion) {
    errors.push('emotion is required');
  } else if (!Object.keys(EMOTION_CATEGORIES).includes(beat.emotion)) {
    warnings.push(`Unknown emotion: ${beat.emotion}`);
    suggestions.push('Consider using a standard emotion category');
  }

  // Numeric range validation (0-100 scale)
  if (beat.intensity < 0 || beat.intensity > 100) {
    errors.push('intensity must be between 0 and 100');
  }

  if ((beat.narrativePosition || 0) < 0 || (beat.narrativePosition || 0) > 1) {
    errors.push('narrativePosition must be between 0 and 1');
  }

  if (beat.timestamp < 0) {
    errors.push('timestamp must be positive');
  }

  // Optional fields validation
  if (beat.confidence !== undefined) {
    if (beat.confidence < 0 || beat.confidence > 100) {
      errors.push('confidence must be between 0 and 100');
    }
  }

  if (beat.secondaryEmotions) {
    beat.secondaryEmotions.forEach(emotion => {
      if (!Object.keys(EMOTION_CATEGORIES).includes(emotion)) {
        warnings.push(`Unknown secondary emotion: ${emotion}`);
      }
    });
  }

  // Business logic validation
  if (beat.intensity > 80 && beat.confidence && beat.confidence < 50) {
    warnings.push(
      'High intensity with low confidence - consider manual review'
    );
  }

  if (beat.narrativePosition === 0 && beat.intensity > 70) {
    suggestions.push(
      'High intensity at story start - consider building tension gradually'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates an EmotionalArc object
 */
export function validateEmotionalArc(arc: EmotionalArc): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Required fields validation
  if (!arc.id) {
    errors.push('id is required');
  }

  if (!arc.name) {
    errors.push('name is required');
  }

  if (!Array.isArray(arc.beats)) {
    errors.push('beats must be an array');
  } else {
    // Validate each beat
    arc.beats.forEach((beat, index) => {
      const beatValidation = validateEmotionalBeat(beat);
      if (!beatValidation.isValid) {
        errors.push(
          `Beat ${index}: ${beatValidation.errors?.join(', ') || 'Unknown error'}`
        );
      }
      warnings.push(
        ...(beatValidation.warnings || []).map(w => `Beat ${index}: ${w}`)
      );
      if (beatValidation.suggestions) {
        suggestions.push(
          ...beatValidation.suggestions.map(s => `Beat ${index}: ${s}`)
        );
      }
    });
  }

  if (arc.segments && !Array.isArray(arc.segments)) {
    errors.push('segments must be an array');
  }

  // Numeric range validation (0-100 scale)
  if (
    arc.overallTension !== undefined &&
    (arc.overallTension < 0 || arc.overallTension > 100)
  ) {
    errors.push('overallTension must be between 0 and 100');
  }

  if (
    arc.emotionalComplexity !== undefined &&
    (arc.emotionalComplexity < 0 || arc.emotionalComplexity > 100)
  ) {
    errors.push('emotionalComplexity must be between 0 and 100');
  }

  if (
    arc.pacingScore !== undefined &&
    (arc.pacingScore < 0 || arc.pacingScore > 100)
  ) {
    errors.push('pacingScore must be between 0 and 100');
  }

  // Business logic validation
  if (arc.beats.length === 0) {
    warnings.push(
      'No emotional beats found - story may lack emotional content'
    );
  }

  if (arc.beats.length > 0) {
    const avgIntensity =
      arc.beats.reduce((sum, beat) => sum + beat.intensity, 0) /
      arc.beats.length;
    if (avgIntensity < 20) {
      warnings.push(
        'Low average emotional intensity - consider adding more emotional content'
      );
    }
    if (avgIntensity > 80) {
      warnings.push(
        'High average emotional intensity - consider adding relief moments'
      );
    }
  }

  // Check for emotional progression
  if (arc.beats.length > 1) {
    const sortedBeats = [...arc.beats].sort(
      (a, b) => (a.narrativePosition || 0) - (b.narrativePosition || 0)
    );
    const hasProgression = sortedBeats.some(
      (beat, index) =>
        index > 0 &&
        Math.abs(beat.intensity - (sortedBeats[index - 1]?.intensity || 0)) > 10
    );

    if (!hasProgression) {
      suggestions.push(
        'Consider adding more emotional variation throughout the story'
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates an EmotionAnalysisResult object with null safety
 */
export function validateEmotionAnalysisResult(
  result: EmotionAnalysis
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Required fields validation
  const dominantEmotion = getDominantEmotion(result);
  if (!dominantEmotion || dominantEmotion === 'neutral') {
    warnings.push('No dominant emotion detected');
  } else if (!Object.keys(EMOTION_CATEGORIES).includes(dominantEmotion)) {
    warnings.push(`Unknown dominant emotion: ${dominantEmotion}`);
  }

  // Numeric range validation (0-100 scale)
  const intensity = getIntensity(result);
  if (intensity < 0 || intensity > 100) {
    errors.push('intensity must be between 0 and 100');
  }

  if (
    result.tensionScore !== undefined &&
    (result.tensionScore < 0 || result.tensionScore > 100)
  ) {
    errors.push('tensionScore must be between 0 and 100');
  }

  if (
    result.empathyScore !== undefined &&
    (result.empathyScore < 0 || result.empathyScore > 100)
  ) {
    errors.push('empathyScore must be between 0 and 100');
  }

  if (
    result.emotionalComplexity !== undefined &&
    (result.emotionalComplexity < 0 || result.emotionalComplexity > 100)
  ) {
    errors.push('emotionalComplexity must be between 0 and 100');
  }

  // Array validation with null safety
  if (result.secondaryEmotions && !Array.isArray(result.secondaryEmotions)) {
    errors.push('secondaryEmotions must be an array');
  } else if (result.secondaryEmotions) {
    result.secondaryEmotions.forEach(emotion => {
      if (!Object.keys(EMOTION_CATEGORIES).includes(emotion)) {
        warnings.push(`Unknown secondary emotion: ${emotion}`);
      }
    });
  }

  // Business logic validation
  if (
    result.emotionalComplexity !== undefined &&
    result.emotionalComplexity > 80 &&
    result.secondaryEmotions &&
    result.secondaryEmotions.length < 2
  ) {
    suggestions.push(
      'High complexity with few secondary emotions - consider adding more emotional layers'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates a SceneEmotionData object with null safety
 */
export function validateSceneEmotionData(
  scene: SceneEmotionData
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Required fields validation
  if (!scene.sceneId) {
    errors.push('sceneId is required');
  }

  if (!scene.sceneText) {
    errors.push('sceneText is required');
  }

  if (!scene.overallSentiment) {
    errors.push('overallSentiment is required');
  }

  // Numeric range validation (0-100 scale)
  if (
    scene.tensionLevel !== undefined &&
    (scene.tensionLevel < 0 || scene.tensionLevel > 100)
  ) {
    errors.push('tensionLevel must be between 0 and 100');
  }

  // Array validation with null safety
  if (scene.emotionalBeats && !Array.isArray(scene.emotionalBeats)) {
    errors.push('emotionalBeats must be an array');
  } else if (scene.emotionalBeats) {
    scene.emotionalBeats.forEach((beat, index) => {
      const beatValidation = validateEmotionalBeat(beat);
      if (!beatValidation.isValid) {
        errors.push(
          `Emotional beat ${index}: ${beatValidation.errors?.join(', ') || 'Unknown error'}`
        );
      }
    });
  }

  // Business logic validation
  if (scene.characterEmotions && scene.characterEmotions.size === 0) {
    warnings.push(
      'No character emotions found - scene may lack character interaction'
    );
  }

  if (scene.sceneText && scene.sceneText.length < 50) {
    warnings.push(
      'Short scene text - may not provide enough context for analysis'
    );
  }

  if (scene.tensionLevel !== undefined && scene.tensionLevel > 80) {
    suggestions.push('High tension scene - consider adding relief moments');
  }

  if (scene.tensionLevel !== undefined && scene.tensionLevel < 20) {
    suggestions.push('Low tension scene - consider adding conflict or stakes');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Validates an array of emotional beats for consistency
 */
export function validateEmotionalBeatArray(
  beats: EmotionalBeat[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!Array.isArray(beats)) {
    errors.push('Input must be an array');
    return { isValid: false, errors, warnings, suggestions };
  }

  // Validate each beat
  beats.forEach((beat, index) => {
    const beatValidation = validateEmotionalBeat(beat);
    if (!beatValidation.isValid) {
      errors.push(
        `Beat ${index}: ${beatValidation.errors?.join(', ') || 'Unknown error'}`
      );
    }
    warnings.push(
      ...(beatValidation.warnings || []).map(w => `Beat ${index}: ${w}`)
    );
    suggestions.push(
      ...(beatValidation.suggestions || []).map(s => `Beat ${index}: ${s}`)
    );
  });

  // Check for consistency across beats
  if (beats.length > 1) {
    const characterIds = new Set(beats.map(beat => beat.characterId));
    const sceneIds = new Set(beats.map(beat => beat.sceneId));

    if (characterIds.size === 1) {
      suggestions.push(
        'All beats are for the same character - consider multi-character analysis'
      );
    }

    if (sceneIds.size === 1) {
      suggestions.push(
        'All beats are from the same scene - consider cross-scene analysis'
      );
    }

    // Check for emotional progression
    const sortedBeats = [...beats].sort(
      (a, b) => (a.narrativePosition || 0) - (b.narrativePosition || 0)
    );
    const hasProgression = sortedBeats.some(
      (beat, index) =>
        index > 0 &&
        Math.abs(beat.intensity - (sortedBeats[index - 1]?.intensity || 0)) > 15
    );

    if (!hasProgression) {
      suggestions.push(
        'Limited emotional variation - consider adding more emotional dynamics'
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}

/**
 * Creates a comprehensive validation report for the entire emotional arc system
 */
export function createValidationReport(
  arc: EmotionalArc,
  sceneData: SceneEmotionData[]
): {
  arcValidation: ValidationResult;
  sceneValidations: ValidationResult[];
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
} {
  const arcValidation = validateEmotionalArc(arc);
  const sceneValidations = sceneData.map(scene =>
    validateSceneEmotionData(scene)
  );

  const totalErrors =
    (arcValidation.errors?.length || 0) +
    sceneValidations.reduce(
      (sum, validation) => sum + (validation.errors?.length || 0),
      0
    );

  const totalWarnings =
    (arcValidation.warnings?.length || 0) +
    sceneValidations.reduce(
      (sum, validation) => sum + (validation.warnings?.length || 0),
      0
    );

  let overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  if (totalErrors === 0 && totalWarnings === 0) {
    overallHealth = 'excellent';
  } else if (totalErrors === 0 && totalWarnings < 5) {
    overallHealth = 'good';
  } else if (totalErrors < 3) {
    overallHealth = 'fair';
  } else {
    overallHealth = 'poor';
  }

  const recommendations = [
    ...(arcValidation.suggestions || []),
    ...sceneValidations.flatMap(validation => validation.suggestions),
  ].filter((r): r is string => r !== undefined);

  return {
    arcValidation,
    sceneValidations,
    overallHealth,
    recommendations,
  };
}
