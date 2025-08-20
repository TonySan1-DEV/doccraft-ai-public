// Mock Agent Services for Demo Component Testing
export const mockAgentServices = {
  ResearchAgent: {
    name: 'Research Agent',
    description: 'Specializes in gathering relevant information for writing projects',
    execute: jest.fn().mockResolvedValue({
      findings: [
        {
          id: '1',
          content: 'Found 3 relevant character archetypes for your detective story',
          relevance: 0.95,
          source: 'Character Psychology Database',
          category: 'character_archetypes',
          timestamp: new Date(),
          confidence: 0.92,
        },
      ],
      insights: [
        {
          id: '1',
          insight: 'The World-Weary Investigator archetype shows strong emotional depth',
          significance: 0.89,
          supportingEvidence: ['Internal conflict between justice and cynicism'],
          implications: ['Adds complexity to protagonist', 'Creates internal tension'],
          confidence: 0.88,
        },
      ],
      sources: [
        {
          id: '1',
          url: 'https://example.com/character-archetypes',
          title: 'Modern Detective Character Archetypes',
          author: 'Dr. Jane Smith',
          publicationDate: new Date('2023-01-15'),
          credibility: 0.95,
          relevance: 0.92,
        },
      ],
      recommendedNextSteps: ['Research specific archetype variations', 'Analyze modern examples'],
      confidence: 0.89,
      metadata: {
        researchTime: Date.now(),
        sourcesAnalyzed: 5,
        qualityScore: 0.91,
        coverage: 0.87,
      },
    }),
  },

  StructureAgent: {
    name: 'Structure Agent',
    description: 'Focuses on narrative architecture and story pacing',
    execute: jest.fn().mockResolvedValue({
      outline: {
        id: '1',
        title: 'Detective Story Structure',
        sections: [
          { id: '1', title: 'Opening Hook', content: 'Mysterious crime scene discovery' },
          { id: '2', title: 'Inciting Incident', content: 'Detective assigned to case' },
          { id: '3', title: 'Rising Action', content: 'Investigation and clues' },
          { id: '4', title: 'Climax', content: 'Confrontation with suspect' },
          { id: '5', title: 'Resolution', content: 'Case solved and justice served' },
        ],
        metadata: {
          totalSections: 5,
          estimatedWordCount: 5000,
          complexity: 3,
          flow: 'linear_progressive',
        },
      },
      structure: {
        type: 'Hero\'s Journey',
        pacing: 'optimal',
        tensionCurve: 'rising_with_relief',
        characterArcs: ['protagonist_growth', 'antagonist_reveal'],
      },
      estimatedWordCounts: [
        { section: 'Opening Hook', words: 800 },
        { section: 'Inciting Incident', words: 1000 },
        { section: 'Rising Action', words: 1500 },
        { section: 'Climax', words: 1200 },
        { section: 'Resolution', words: 500 },
      ],
      writingGuidance: [
        'Maintain suspense through investigation',
        'Build character relationships gradually',
        'Create clear cause-and-effect connections',
      ],
      qualityMetrics: {
        overall: 0.87,
        coherence: 0.91,
        engagement: 0.89,
        technical: 0.85,
        style: 0.88,
      },
    }),
  },

  WritingAgent: {
    name: 'Writing Agent',
    description: 'Creative powerhouse for prose composition and improvement',
    execute: jest.fn().mockResolvedValue({
      content: 'Rain drummed against the precinct windows like impatient fingers, each drop carrying the weight of another unsolved case. Detective Sarah Chen stared at the crime scene photos spread across her desk, the coffee in her hand long since gone cold.',
      improvements: [
        'Enhanced atmospheric description',
        'Stronger opening hook',
        'Character introduction through action',
      ],
      style: 'noir_detective',
      tone: 'atmospheric_suspenseful',
      wordCount: 45,
      quality: 0.91,
      suggestions: [
        'Consider adding sensory details for the coffee',
        'Expand on the detective\'s internal thoughts',
        'Include more specific crime scene details',
      ],
    }),
  },

  CharacterAgent: {
    name: 'Character Agent',
    description: 'Specializes in psychological depth and character development',
    execute: jest.fn().mockResolvedValue({
      characterProfiles: [
        {
          id: '1',
          personality: 'INTJ',
          motivations: ['justice', 'truth'],
          fears: ['failure', 'vulnerability'],
          strengths: ['intelligence', 'determination'],
          weaknesses: ['emotional expression', 'trust issues'],
        },
      ],
      arcMappings: {
        protagonist: { arc: 'Hero\'s Journey', stages: ['call', 'refusal', 'crossing', 'trials', 'return'] },
        antagonist: { arc: 'Villain\'s Descent', stages: ['corruption', 'escalation', 'confrontation', 'defeat'] },
      },
      dialogueSuggestions: [
        {
          characterId: '1',
          speechPatterns: 'precise_clipped',
          vocabulary: 'technical_formal',
          emotionalExpression: 'reserved_controlled',
        },
      ],
      consistencyChecks: {
        overallConsistency: 0.87,
        voiceConsistency: 0.92,
        behaviorConsistency: 0.85,
        motivationConsistency: 0.89,
        issues: ['minor personality shift in chapter 3'],
      },
      developmentPath: 'character_development_plan',
      confidence: 0.88,
      metadata: {
        analysisTime: Date.now(),
        charactersAnalyzed: 3,
        qualityScore: 0.86,
        depth: 0.84,
      },
    }),
  },

  EmotionAgent: {
    name: 'Emotion Agent',
    description: 'Maps emotional journey and optimizes emotional pacing',
    execute: jest.fn().mockResolvedValue({
      emotionalBeats: [
        { scene: 'opening', emotion: 'curiosity', intensity: 0.7, position: 0.1 },
        { scene: 'conflict', emotion: 'tension', intensity: 0.9, position: 0.3 },
        { scene: 'climax', emotion: 'excitement', intensity: 1.0, position: 0.8 },
        { scene: 'resolution', emotion: 'satisfaction', intensity: 0.8, position: 0.95 },
      ],
      tensionCurves: {
        overallTension: 0.85,
        tensionDistribution: 'well_distributed',
        peakMoments: [0.3, 0.6, 0.8],
        reliefValleys: [0.45, 0.75],
        pacing: 'optimal',
      },
      empathyMapping: [
        {
          sceneId: '1',
          empathyScore: 0.82,
          emotionalInvestment: 0.78,
          readerResponse: 'engaged',
        },
      ],
      pacingAnalysis: {
        emotionalFlow: 'smooth_progressive',
        engagementLevels: 'consistent_high',
        reliefDistribution: 'well_timed',
        climaxPositioning: 'optimal',
      },
      optimizationSuggestions: [
        'Add relief moment at 60% to prevent reader fatigue',
        'Increase tension at 75% for stronger climax',
        'Smooth emotional transitions between scenes',
      ],
      confidence: 0.85,
      metadata: {
        analysisTime: Date.now(),
        scenesAnalyzed: 4,
        qualityScore: 0.87,
        engagement: 0.84,
      },
    }),
  },

  StyleAgent: {
    name: 'Style Agent',
    description: 'Ensures voice consistency and stylistic coherence',
    execute: jest.fn().mockResolvedValue({
      styleProfile: {
        primaryStyle: 'noir_detective',
        sentenceStructure: 'varied_complex',
        vocabulary: 'intermediate_advanced',
        pacing: 'moderate_controlled',
        voice: 'authoritative_detached',
        uniqueFeatures: ['atmospheric descriptions', 'technical precision', 'emotional restraint'],
      },
      consistencyScore: {
        overallConsistency: 0.94,
        voiceStability: 0.91,
        toneConsistency: 0.89,
        styleCoherence: 0.93,
        inconsistencies: ['minor tone shift in chapter 2'],
      },
      toneAnalysis: {
        currentTone: 'professional_detached',
        targetTone: 'accessible_engaging',
        adjustments: [
          'Simplify complex sentences',
          'Add conversational elements',
          'Maintain professional credibility',
        ],
        impact: 'moderate',
      },
      genreAlignment: {
        genre: 'detective_noir',
        alignment: 0.87,
        conventions: ['character_development', 'plot_structure', 'thematic_elements'],
        deviations: ['unusual pacing', 'atypical character arc'],
        recommendations: ['Strengthen genre conventions', 'Maintain unique elements'],
      },
      improvementSuggestions: [
        'Maintain consistent voice throughout narrative',
        'Optimize tone for target audience',
        'Strengthen genre conventions while preserving uniqueness',
      ],
      confidence: 0.91,
      metadata: {
        analysisTime: Date.now(),
        sectionsAnalyzed: 5,
        qualityScore: 0.89,
        coherence: 0.87,
      },
    }),
  },
};

// Mock agent execution with realistic delays
export const executeAgentWithDelay = async (agentType: string, context: any) => {
  const agent = mockAgentServices[agentType as keyof typeof mockAgentServices];
  if (!agent) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }

  // Simulate realistic processing delay
  const delay = 1000 + Math.random() * 2000; // 1-3 seconds
  await new Promise(resolve => setTimeout(resolve, delay));

  return agent.execute(context);
};

// Mock agent orchestration
export const mockAgentOrchestrator = {
  orchestrateWritingTask: jest.fn().mockImplementation(async (task: any, mode: string) => {
    const results = {};
    const agentTypes = ['research', 'outline', 'writing', 'character', 'emotion', 'style'];
    
    for (const agentType of agentTypes) {
      try {
        results[agentType] = await executeAgentWithDelay(agentType, task.context);
      } catch (error) {
        results[agentType] = { error: error.message };
      }
    }

    return {
      taskId: task.id,
      content: 'Synthesized content from all agents',
      sections: Object.values(results),
      qualityMetrics: {
        overall: 0.88,
        coherence: 0.91,
        engagement: 0.89,
        technical: 0.85,
        style: 0.87,
      },
      analysis: results,
      recommendations: [
        'Integrate character development with plot structure',
        'Optimize emotional pacing for reader engagement',
        'Maintain consistent style throughout narrative',
      ],
      executionTime: 8000,
      cacheHit: false,
      metadata: {
        agentsUsed: agentTypes,
        modulesCoordinated: ['emotionArc', 'plotStructure', 'styleProfile'],
        cacheEfficiency: 0.0,
        costSavings: 0.0,
      },
    };
  }),
};

// Export mock functions for testing
export const {
  ResearchAgent,
  StructureAgent,
  WritingAgent,
  CharacterAgent,
  EmotionAgent,
  StyleAgent,
} = mockAgentServices;
