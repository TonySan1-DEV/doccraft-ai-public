// MCP Context Block
/*
role: qa-engineer,
tier: Pro,
file: "modules/agent/services/agentSummaryReport.ts",
allowedActions: ["test", "report", "summarize"],
theme: "agent_qa"
*/

interface TelemetryEvent {
  type: string;
  timestamp: number;
  tier: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

interface TestOutcome {
  testName: string;
  passed: boolean;
  duration: number;
  timestamp: number;
  error?: string;
}

interface AgentSummaryReport {
  totalSessions: number;
  suggestionAcceptedRate: number;
  fallbackUsedCount: number;
  onboardingCompletedRate: number;
  proactiveTipClicks: number;
  averageResponseTime: number;
  errorRate: number;
  tierBreakdown: {
    Free: number;
    Pro: number;
    Admin: number;
  };
  topSuggestions: Array<{
    label: string;
    shown: number;
    accepted: number;
    rate: number;
  }>;
  llmUsage: {
    totalFallbacks: number;
    modelsUsed: Record<string, number>;
    averageTokens: number;
  };
  proactiveTips: {
    totalShown: number;
    totalClicked: number;
    totalDismissed: number;
    clickThroughRate: number;
    topTips: Array<{
      tipId: string;
      shown: number;
      clicked: number;
      rate: number;
    }>;
  };
  testResults: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
    averageDuration: number;
  };
}

export function generateAgentSummaryReport(
  telemetryEvents: TelemetryEvent[],
  testOutcomes: TestOutcome[],
  timeRange: { start: number; end: number }
): AgentSummaryReport {
  // Filter events by time range
  const filteredEvents = telemetryEvents.filter(
    event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
  );

  // Calculate session count
  const uniqueSessions = new Set(filteredEvents.map(e => e.sessionId));
  const totalSessions = uniqueSessions.size;

  // Calculate suggestion acceptance rate
  const suggestionEvents = filteredEvents.filter(e => 
    e.type === 'suggestionShown' || e.type === 'suggestionClicked'
  );
  const suggestionShown = suggestionEvents.filter(e => e.type === 'suggestionShown').length;
  const suggestionClicked = suggestionEvents.filter(e => e.type === 'suggestionClicked').length;
  const suggestionAcceptedRate = suggestionShown > 0 ? suggestionClicked / suggestionShown : 0;

  // Calculate LLM fallback usage
  const fallbackEvents = filteredEvents.filter(e => e.type === 'llmFallbackUsed');
  const fallbackUsedCount = fallbackEvents.length;

  // Calculate onboarding completion rate
  const onboardingEvents = filteredEvents.filter(e => 
    e.type === 'onboardingStarted' || e.type === 'onboardingCompleted'
  );
  const onboardingStarted = onboardingEvents.filter(e => e.type === 'onboardingStarted').length;
  const onboardingCompleted = onboardingEvents.filter(e => e.type === 'onboardingCompleted').length;
  const onboardingCompletedRate = onboardingStarted > 0 ? onboardingCompleted / onboardingStarted : 0;

  // Calculate proactive tip clicks
  const proactiveEvents = filteredEvents.filter(e => 
    e.type === 'proactiveTipShown' || e.type === 'proactiveTipClicked'
  );
  const proactiveTipClicks = proactiveEvents.filter(e => e.type === 'proactiveTipClicked').length;

  // Calculate average response time
  const responseTimeEvents = filteredEvents.filter(e => e.metadata?.responseTime);
  const averageResponseTime = responseTimeEvents.length > 0 
    ? responseTimeEvents.reduce((sum, e) => sum + (e.metadata?.responseTime || 0), 0) / responseTimeEvents.length
    : 0;

  // Calculate error rate
  const errorEvents = filteredEvents.filter(e => e.type === 'error');
  const errorRate = filteredEvents.length > 0 ? errorEvents.length / filteredEvents.length : 0;

  // Calculate tier breakdown
  const tierBreakdown = {
    Free: filteredEvents.filter(e => e.tier === 'Free').length,
    Pro: filteredEvents.filter(e => e.tier === 'Pro').length,
    Admin: filteredEvents.filter(e => e.tier === 'Admin').length
  };

  // Calculate top suggestions
  const suggestionLabels = new Map<string, { shown: number; accepted: number }>();
  suggestionEvents.forEach(event => {
    const label = event.metadata?.label || 'unknown';
    const current = suggestionLabels.get(label) || { shown: 0, accepted: 0 };
    
    if (event.type === 'suggestionShown') {
      current.shown++;
    } else if (event.type === 'suggestionClicked') {
      current.accepted++;
    }
    
    suggestionLabels.set(label, current);
  });

  const topSuggestions = Array.from(suggestionLabels.entries())
    .map(([label, stats]) => ({
      label,
      shown: stats.shown,
      accepted: stats.accepted,
      rate: stats.shown > 0 ? stats.accepted / stats.shown : 0
    }))
    .sort((a, b) => b.shown - a.shown)
    .slice(0, 10);

  // Calculate LLM usage statistics
  const llmModels = new Map<string, number>();
  let totalTokens = 0;
  fallbackEvents.forEach(event => {
    const model = event.metadata?.model || 'unknown';
    llmModels.set(model, (llmModels.get(model) || 0) + 1);
    totalTokens += event.metadata?.tokens || 0;
  });

  const llmUsage = {
    totalFallbacks: fallbackUsedCount,
    modelsUsed: Object.fromEntries(llmModels),
    averageTokens: fallbackEvents.length > 0 ? totalTokens / fallbackEvents.length : 0
  };

  // Calculate proactive tips statistics
  const tipStats = new Map<string, { shown: number; clicked: number; dismissed: number }>();
  const tipEvents = filteredEvents.filter(e => 
    e.type === 'proactiveTipShown' || e.type === 'proactiveTipClicked' || e.type === 'proactiveTipDismissed'
  );

  tipEvents.forEach(event => {
    const tipId = event.metadata?.tipId || 'unknown';
    const current = tipStats.get(tipId) || { shown: 0, clicked: 0, dismissed: 0 };
    
    if (event.type === 'proactiveTipShown') {
      current.shown++;
    } else if (event.type === 'proactiveTipClicked') {
      current.clicked++;
    } else if (event.type === 'proactiveTipDismissed') {
      current.dismissed++;
    }
    
    tipStats.set(tipId, current);
  });

  const totalTipShown = tipEvents.filter(e => e.type === 'proactiveTipShown').length;
  const totalTipClicked = tipEvents.filter(e => e.type === 'proactiveTipClicked').length;
  const totalTipDismissed = tipEvents.filter(e => e.type === 'proactiveTipDismissed').length;

  const topTips = Array.from(tipStats.entries())
    .map(([tipId, stats]) => ({
      tipId,
      shown: stats.shown,
      clicked: stats.clicked,
      rate: stats.shown > 0 ? stats.clicked / stats.shown : 0
    }))
    .sort((a, b) => b.shown - a.shown)
    .slice(0, 5);

  const proactiveTips = {
    totalShown: totalTipShown,
    totalClicked: totalTipClicked,
    totalDismissed: totalTipDismissed,
    clickThroughRate: totalTipShown > 0 ? totalTipClicked / totalTipShown : 0,
    topTips
  };

  // Calculate test results
  const filteredTests = testOutcomes.filter(
    test => test.timestamp >= timeRange.start && test.timestamp <= timeRange.end
  );
  
  const testResults = {
    totalTests: filteredTests.length,
    passedTests: filteredTests.filter(t => t.passed).length,
    failedTests: filteredTests.filter(t => !t.passed).length,
    passRate: filteredTests.length > 0 
      ? filteredTests.filter(t => t.passed).length / filteredTests.length 
      : 0,
    averageDuration: filteredTests.length > 0
      ? filteredTests.reduce((sum, t) => sum + t.duration, 0) / filteredTests.length
      : 0
  };

  return {
    totalSessions,
    suggestionAcceptedRate,
    fallbackUsedCount,
    onboardingCompletedRate,
    proactiveTipClicks,
    averageResponseTime,
    errorRate,
    tierBreakdown,
    topSuggestions,
    llmUsage,
    proactiveTips,
    testResults
  };
}

export function generateAgentSummaryMarkdown(report: AgentSummaryReport): string {
  return `# DocCraft Agent Summary Report

## Overview
- **Total Sessions:** ${report.totalSessions}
- **Suggestion Acceptance Rate:** ${(report.suggestionAcceptedRate * 100).toFixed(1)}%
- **LLM Fallback Usage:** ${report.fallbackUsedCount}
- **Onboarding Completion Rate:** ${(report.onboardingCompletedRate * 100).toFixed(1)}%
- **Proactive Tip Clicks:** ${report.proactiveTipClicks}
- **Average Response Time:** ${report.averageResponseTime.toFixed(2)}ms
- **Error Rate:** ${(report.errorRate * 100).toFixed(1)}%

## Tier Breakdown
- **Free:** ${report.tierBreakdown.Free} events
- **Pro:** ${report.tierBreakdown.Pro} events
- **Admin:** ${report.tierBreakdown.Admin} events

## Top Suggestions
${report.topSuggestions.map(s => `- **${s.label}:** ${s.shown} shown, ${s.accepted} accepted (${(s.rate * 100).toFixed(1)}%)`).join('\n')}

## LLM Usage
- **Total Fallbacks:** ${report.llmUsage.totalFallbacks}
- **Models Used:** ${Object.entries(report.llmUsage.modelsUsed).map(([model, count]) => `${model}: ${count}`).join(', ')}
- **Average Tokens:** ${report.llmUsage.averageTokens.toFixed(0)}

## Proactive Tips
- **Total Shown:** ${report.proactiveTips.totalShown}
- **Total Clicked:** ${report.proactiveTips.totalClicked}
- **Click-Through Rate:** ${(report.proactiveTips.clickThroughRate * 100).toFixed(1)}%
- **Top Tips:**
${report.proactiveTips.topTips.map(t => `  - **${t.tipId}:** ${t.shown} shown, ${t.clicked} clicked (${(t.rate * 100).toFixed(1)}%)`).join('\n')}

## Test Results
- **Total Tests:** ${report.testResults.totalTests}
- **Passed Tests:** ${report.testResults.passedTests}
- **Failed Tests:** ${report.testResults.failedTests}
- **Pass Rate:** ${(report.testResults.passRate * 100).toFixed(1)}%
- **Average Duration:** ${report.testResults.averageDuration.toFixed(2)}ms

---
*Generated on ${new Date().toISOString()}*
`;
}

export function generateAgentSummaryJSON(report: AgentSummaryReport): string {
  return JSON.stringify(report, null, 2);
} 