export function isFeatureAgenticsEnabled(): boolean {
  return (process.env.FEATURE_AGENTICS ?? 'false').toLowerCase() === 'true';
}

export function isAudiobookEnabled(): boolean {
  return (process.env.FEATURE_AUDIOBOOK ?? 'false').toLowerCase() === 'true';
}
