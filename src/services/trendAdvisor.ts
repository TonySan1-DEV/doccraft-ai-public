import { supabase } from '../lib/supabase';
import { 
  MarketTrend, 
  TrendMatchResult, 
  MarketAnalysis, 

  GenreTrendSummary,
  TrendRecommendation,

} from '../types/MarketTrend';

export async function getTrendsByGenre(genre: string): Promise<MarketTrend[]> {
  try {
    if (!genre) {
      throw new Error('Genre is required');
    }

    const { data, error } = await supabase
      .from('market_trends')
      .select('*')
      .eq('genre', genre)
      .order('score', { ascending: false });

    if (error) {
      console.error('Error fetching trends by genre:', error);
      throw new Error('Failed to fetch market trends');
    }

    return data as MarketTrend[];
  } catch (error) {
    console.error('Error in getTrendsByGenre:', error);
    throw error;
  }
}

export async function analyzeAgainstTrends(
  content: string, 
  genre: string
): Promise<TrendMatchResult[]> {
  try {
    if (!content.trim() || !genre) {
      return [];
    }

    const trends = await getTrendsByGenre(genre);
    if (trends.length === 0) {
      return [];
    }

    const matchResults: TrendMatchResult[] = [];

    for (const trend of trends) {
      const matchScore = calculateTrendMatch(content, trend);
      const recommendation = generateRecommendation(trend, matchScore);
      const evidence = findEvidence(content, trend);
      const confidence = calculateConfidence(matchScore, trend.score, evidence.length);

      if (matchScore > 0.1) { // Only include meaningful matches
        matchResults.push({
          trend,
          matchScore,
          recommendation,
          confidence,
          evidence,
          severity: getSeverity(matchScore, trend.score)
        });
      }
    }

    // Sort by match score and trend popularity
    return matchResults.sort((a, b) => {
      const scoreA = a.matchScore * a.trend.score;
      const scoreB = b.matchScore * b.trend.score;
      return scoreB - scoreA;
    });

  } catch (error) {
    console.error('Error in analyzeAgainstTrends:', error);
    return [];
  }
}

function calculateTrendMatch(content: string, trend: MarketTrend): number {
  const contentLower = content.toLowerCase();
  const trendLower = trend.label.toLowerCase();
  
  let matchScore = 0;

  // Check for exact trend label matches
  if (contentLower.includes(trendLower)) {
    matchScore += 0.4;
  }

  // Check for example keyword matches
  if (trend.examples) {
    for (const example of trend.examples) {
      const exampleLower = example.toLowerCase();
      if (contentLower.includes(exampleLower)) {
        matchScore += 0.2;
      }
    }
  }

  // Check for semantic similarity based on trend type
  const semanticMatches = checkSemanticSimilarity(content, trend);
  matchScore += semanticMatches * 0.3;

  // Normalize score
  return Math.min(matchScore, 1.0);
}

function checkSemanticSimilarity(content: string, trend: MarketTrend): number {
  const contentWords = content.toLowerCase().split(/\s+/);
  let semanticScore = 0;

  // Topic-based semantic matching
  if (trend.trend_type === 'topic') {
    const topicKeywords = getTopicKeywords(trend.label);
    const matches = topicKeywords.filter(keyword => 
      contentWords.some(word => word.includes(keyword))
    ).length;
    semanticScore = matches / topicKeywords.length;
  }

  // Tone-based semantic matching
  if (trend.trend_type === 'tone') {
    const toneKeywords = getToneKeywords(trend.label);
    const matches = toneKeywords.filter(keyword => 
      contentWords.some(word => word.includes(keyword))
    ).length;
    semanticScore = matches / toneKeywords.length;
  }

  // Structure-based semantic matching
  if (trend.trend_type === 'structure') {
    const structureKeywords = getStructureKeywords(trend.label);
    const matches = structureKeywords.filter(keyword => 
      contentWords.some(word => word.includes(keyword))
    ).length;
    semanticScore = matches / structureKeywords.length;
  }

  // Theme-based semantic matching
  if (trend.trend_type === 'theme') {
    const themeKeywords = getThemeKeywords(trend.label);
    const matches = themeKeywords.filter(keyword => 
      contentWords.some(word => word.includes(keyword))
    ).length;
    semanticScore = matches / themeKeywords.length;
  }

  return semanticScore;
}

function getTopicKeywords(trendLabel: string): string[] {
  const topicMap: { [key: string]: string[] } = {
    'Enemies to Lovers': ['enemy', 'rival', 'hate', 'love', 'romance', 'conflict'],
    'Small Town Secrets': ['small', 'town', 'community', 'secret', 'hidden', 'local'],
    'Chosen One Reluctance': ['chosen', 'destiny', 'reluctant', 'hero', 'prophecy'],
    'AI Consciousness': ['ai', 'artificial', 'intelligence', 'consciousness', 'robot'],
    'Psychological Manipulation': ['manipulation', 'psychological', 'mind', 'control', 'gaslight'],
    'Untold Stories': ['untold', 'forgotten', 'hidden', 'history', 'story']
  };
  return topicMap[trendLabel] || [];
}

function getToneKeywords(trendLabel: string): string[] {
  const toneMap: { [key: string]: string[] } = {
    'Slow Burn': ['gradual', 'slow', 'build', 'tension', 'delayed'],
    'Atmospheric Suspense': ['moody', 'atmosphere', 'suspense', 'creeping', 'dread'],
    'Epic Scale': ['epic', 'grand', 'world', 'changing', 'mythological'],
    'Speculative Realism': ['realistic', 'plausible', 'scientific', 'accurate'],
    'High Stakes Tension': ['danger', 'stakes', 'tension', 'urgent', 'critical'],
    'Immersive Period': ['authentic', 'period', 'historical', 'immersive']
  };
  return toneMap[trendLabel] || [];
}

function getStructureKeywords(trendLabel: string): string[] {
  const structureMap: { [key: string]: string[] } = {
    'Dual POV': ['perspective', 'viewpoint', 'alternating', 'both', 'sides'],
    'Multiple Suspects': ['suspect', 'red', 'herring', 'motive', 'reveal'],
    'Quest Journey': ['quest', 'journey', 'hero', 'companion', 'challenge'],
    'Time Manipulation': ['time', 'travel', 'timeline', 'parallel', 'loop'],
    'Race Against Time': ['race', 'time', 'deadline', 'urgent', 'countdown'],
    'Dual Timeline': ['timeline', 'past', 'present', 'generation', 'parallel']
  };
  return structureMap[trendLabel] || [];
}

function getThemeKeywords(trendLabel: string): string[] {
  const themeMap: { [key: string]: string[] } = {
    'Second Chance Love': ['second', 'chance', 'redemption', 'past', 'mistake'],
    'Justice vs Revenge': ['justice', 'revenge', 'moral', 'ambiguity', 'vendetta'],
    'Power and Responsibility': ['power', 'responsibility', 'burden', 'sacrifice'],
    'Humanity vs Technology': ['humanity', 'technology', 'dependency', 'integration'],
    'Trust and Betrayal': ['trust', 'betrayal', 'ally', 'agenda', 'loyalty'],
    'Progress vs Tradition': ['progress', 'tradition', 'change', 'cultural', 'shift']
  };
  return themeMap[trendLabel] || [];
}

function generateRecommendation(trend: MarketTrend, matchScore: number): string {
  if (matchScore > 0.7) {
    return `Excellent alignment with "${trend.label}" trend. Consider emphasizing this element further.`;
  } else if (matchScore > 0.4) {
    return `Good alignment with "${trend.label}" trend. You could strengthen this aspect.`;
  } else if (matchScore > 0.1) {
    return `Consider incorporating more elements of "${trend.label}" to align with current market trends.`;
  } else {
    return `"${trend.label}" is a high-performing trend in ${trend.genre}. Consider exploring this direction.`;
  }
}

function findEvidence(content: string, trend: MarketTrend): string[] {
  const evidence: string[] = [];
  const contentLower = content.toLowerCase();
  const trendLower = trend.label.toLowerCase();

  // Check for direct matches
  if (contentLower.includes(trendLower)) {
    evidence.push(`Contains "${trend.label}" elements`);
  }

  // Check for example matches
  if (trend.examples) {
    for (const example of trend.examples) {
      if (contentLower.includes(example.toLowerCase())) {
        evidence.push(`Includes "${example}" elements`);
      }
    }
  }

  return evidence;
}

function calculateConfidence(matchScore: number, trendScore: number, evidenceCount: number): number {
  const baseConfidence = (matchScore + trendScore) / 2;
  const evidenceBonus = Math.min(evidenceCount * 0.1, 0.2);
  return Math.min(baseConfidence + evidenceBonus, 1.0);
}

function getSeverity(matchScore: number, trendScore: number): 'high' | 'medium' | 'low' {
  const combinedScore = (matchScore + trendScore) / 2;
  if (combinedScore > 0.7) return 'high';
  if (combinedScore > 0.4) return 'medium';
  return 'low';
}

export async function getMarketAnalysis(
  content: string, 
  genre: string
): Promise<MarketAnalysis> {
  try {
    const trends = await getTrendsByGenre(genre);
    const matchResults = await analyzeAgainstTrends(content, genre);

    const overallAlignment = calculateOverallAlignment(matchResults);
    const topRecommendations = generateTopRecommendations(matchResults);
    const marketOpportunities = identifyMarketOpportunities(trends, matchResults);
    const riskFactors = identifyRiskFactors(matchResults);

    const summary = {
      totalTrends: trends.length,
      highMatches: matchResults.filter(r => r.severity === 'high').length,
      mediumMatches: matchResults.filter(r => r.severity === 'medium').length,
      lowMatches: matchResults.filter(r => r.severity === 'low').length,
      averageAlignment: overallAlignment
    };

    return {
      genre,
      content,
      trends,
      matchResults,
      overallAlignment,
      topRecommendations,
      marketOpportunities,
      riskFactors,
      summary
    };

  } catch (error) {
    console.error('Error in getMarketAnalysis:', error);
    throw error;
  }
}

function calculateOverallAlignment(matchResults: TrendMatchResult[]): number {
  if (matchResults.length === 0) return 0;

  const weightedScores = matchResults.map(result => 
    result.matchScore * result.trend.score * result.confidence
  );
  
  return weightedScores.reduce((sum, score) => sum + score, 0) / matchResults.length;
}

function generateTopRecommendations(matchResults: TrendMatchResult[]): string[] {
  const recommendations: string[] = [];
  
  // High-scoring trends that are missing
  const highTrends = matchResults.filter(r => r.trend.score > 0.8 && r.matchScore < 0.3);
  highTrends.slice(0, 3).forEach(result => {
    recommendations.push(`Consider incorporating "${result.trend.label}" elements`);
  });

  // Strong matches to emphasize
  const strongMatches = matchResults.filter(r => r.matchScore > 0.6);
  strongMatches.slice(0, 2).forEach(result => {
    recommendations.push(`Emphasize your "${result.trend.label}" elements`);
  });

  return recommendations;
}

function identifyMarketOpportunities(trends: MarketTrend[], matchResults: TrendMatchResult[]): string[] {
  const opportunities: string[] = [];
  
  // High-scoring trends with low competition
  const highValueTrends = trends
    .filter(t => t.score > 0.85)
    .filter(t => !matchResults.some(m => m.trend.id === t.id && m.matchScore > 0.3));

  highValueTrends.slice(0, 3).forEach(trend => {
    opportunities.push(`"${trend.label}" is trending strongly in ${trend.genre}`);
  });

  return opportunities;
}

function identifyRiskFactors(matchResults: TrendMatchResult[]): string[] {
  const risks: string[] = [];
  
  // Low-scoring trends that are over-represented
  const lowValueMatches = matchResults.filter(r => r.trend.score < 0.5 && r.matchScore > 0.5);
  lowValueMatches.slice(0, 2).forEach(result => {
    risks.push(`"${result.trend.label}" is declining in popularity`);
  });

  return risks;
}

export async function getGenreTrendSummary(genre: string): Promise<GenreTrendSummary> {
  try {
    const trends = await getTrendsByGenre(genre);
    
    const trendCounts = {
      topic: trends.filter(t => t.trend_type === 'topic').length,
      tone: trends.filter(t => t.trend_type === 'tone').length,
      structure: trends.filter(t => t.trend_type === 'structure').length,
      theme: trends.filter(t => t.trend_type === 'theme').length
    };

    const averageScore = trends.reduce((sum, t) => sum + t.score, 0) / trends.length;

    return {
      genre,
      topTrends: trends.slice(0, 5),
      trendCounts,
      averageScore,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in getGenreTrendSummary:', error);
    throw error;
  }
}

export async function generateTrendRecommendations(
  content: string, 
  genre: string
): Promise<TrendRecommendation[]> {
  try {
    const analysis = await getMarketAnalysis(content, genre);
    const recommendations: TrendRecommendation[] = [];

    // Alignment recommendations
    const highMatches = analysis.matchResults.filter(r => r.severity === 'high');
    highMatches.slice(0, 2).forEach(result => {
      recommendations.push({
        type: 'alignment',
        title: `Strong Alignment: ${result.trend.label}`,
        description: result.recommendation,
        impact: 'high',
        confidence: result.confidence,
        actionableSteps: [`Emphasize ${result.trend.label} elements`, 'Highlight this in marketing'],
        relatedTrends: [result.trend.label]
      });
    });

    // Opportunity recommendations
    analysis.marketOpportunities.slice(0, 2).forEach(opportunity => {
      recommendations.push({
        type: 'opportunity',
        title: 'Market Opportunity',
        description: opportunity,
        impact: 'medium',
        confidence: 0.7,
        actionableSteps: ['Research this trend', 'Consider incorporating elements'],
        relatedTrends: []
      });
    });

    // Risk recommendations
    analysis.riskFactors.slice(0, 1).forEach(risk => {
      recommendations.push({
        type: 'risk',
        title: 'Market Risk',
        description: risk,
        impact: 'medium',
        confidence: 0.6,
        actionableSteps: ['Consider alternative approaches', 'Research current trends'],
        relatedTrends: []
      });
    });

    return recommendations;

  } catch (error) {
    console.error('Error in generateTrendRecommendations:', error);
    return [];
  }
} 