/*
role: ui-engineer,
tier: Pro,
file: "modules/agent/components/ScriptEditor.tsx",
allowedActions: ["subscribe", "listen", "update", "regenerate"],
theme: "script_editing"
*/

/* MCP: doc2video_ui */

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseStorage';
import VoiceSwitcher from './VoiceSwitcher';
import AudioPreviewPlayer from './AudioPreviewPlayer';
import { regenerateFromScript } from '../services/ttsSyncEngine';
import {
  exportScript,
  canExport,
  getUpgradeMessage,
} from '../../../src/utils/exportUtils';
import ProUpgradeNudge from '../../../src/components/ProUpgradeNudge';
import { Download, FileText, FileDown } from 'lucide-react';

interface ScriptEditorProps {
  pipelineId: string;
  initialScript: string;
  onApprove: (editedScript: string) => void;
  onEditAgain: () => void;
  onCancel: () => void;
  tier: string;
}

interface ScriptEditorState {
  script: string;
  isEditing: boolean;
  hasChanges: boolean;
  wordCount: number;
  estimatedDuration: number;
  selectedVoice: string;
  audioUrl?: string;
  voiceName?: string;
  isRegenerating: boolean;
  regenerationError?: string;
  isExporting: boolean;
  exportError?: string;
  showUpgradeNudge: boolean;
}

/**
 * Script Editor Component for reviewing and editing AI-generated video scripts
 * @component
 * @returns {JSX.Element}
 */
const ScriptEditor: React.FC<ScriptEditorProps> = ({
  pipelineId,
  initialScript,
  onApprove,
  onEditAgain,
  onCancel,
  tier,
}) => {
  const [state, setState] = useState<ScriptEditorState>({
    script: initialScript,
    isEditing: false,
    hasChanges: false,
    wordCount: initialScript.split(' ').length,
    estimatedDuration: Math.ceil(initialScript.split(' ').length / 150), // ~150 words per minute
    selectedVoice: 'en-US-JennyNeural',
    isRegenerating: false,
    isExporting: false,
    showUpgradeNudge: false,
  });

  // Update word count and duration when script changes
  useEffect(() => {
    const wordCount = state.script.split(' ').length;
    const estimatedDuration = Math.ceil(wordCount / 150);

    setState(prev => ({
      ...prev,
      wordCount,
      estimatedDuration,
      hasChanges: state.script !== initialScript,
    }));
  }, [state.script, initialScript]);

  // Load existing TTS narration if available
  useEffect(() => {
    const loadExistingNarration = async () => {
      try {
        const { data: pipeline } = await supabase
          .from('pipelines')
          .select('ttsNarrationId, mode')
          .eq('id', pipelineId)
          .single();

        if (pipeline?.ttsNarrationId) {
          const { data: ttsNarration } = await supabase
            .from('tts_narrations')
            .select('audio_file_url, voice, model_used')
            .eq('id', pipeline.ttsNarrationId)
            .single();

          if (ttsNarration) {
            setState(prev => ({
              ...prev,
              audioUrl: ttsNarration.audio_file_url,
              selectedVoice: ttsNarration.voice || 'en-US-JennyNeural',
              voiceName: ttsNarration.model_used || 'Jenny',
            }));
          }
        }
      } catch (error) {
        console.error('Error loading existing narration:', error);
      }
    };

    loadExistingNarration();
  }, [pipelineId]);

  // Pipeline status subscription for real-time updates
  useEffect(() => {
    if (!pipelineId) return;

    const channel = supabase
      .channel(`pipeline-${pipelineId}-script-editor`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipelines',
          filter: `id=eq.${pipelineId}`,
        },
        async (payload: any) => {
          console.log('Pipeline status update in ScriptEditor:', payload);

          if (payload.new) {
            const pipeline = payload.new;

            // Check if TTS regeneration completed
            if (
              pipeline.status === 'success' &&
              pipeline.currentStep === 'tts_regeneration_completed' &&
              pipeline.ttsNarrationId
            ) {
              console.log(
                'TTS regeneration completed, refreshing audio preview'
              );

              try {
                const { data: ttsNarration } = await supabase
                  .from('tts_narrations')
                  .select('audio_file_url, voice, model_used')
                  .eq('id', pipeline.ttsNarrationId)
                  .single();

                if (ttsNarration) {
                  setState(prev => ({
                    ...prev,
                    audioUrl: ttsNarration.audio_file_url,
                    selectedVoice: ttsNarration.voice || 'en-US-JennyNeural',
                    voiceName: ttsNarration.model_used || 'Jenny',
                    isRegenerating: false,
                    regenerationError: undefined,
                  }));
                }
              } catch (error) {
                console.error('Error refreshing audio preview:', error);
              }
            }

            // Check if regeneration failed
            if (
              pipeline.status === 'failed' &&
              pipeline.currentStep?.includes('tts_regeneration')
            ) {
              setState(prev => ({
                ...prev,
                isRegenerating: false,
                regenerationError:
                  pipeline.errorMessage || 'Regeneration failed',
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pipelineId]);

  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({
      ...prev,
      script: e.target.value,
    }));
  };

  const handleVoiceChange = (voice: string) => {
    setState(prev => ({
      ...prev,
      selectedVoice: voice,
    }));
  };

  const handleRegenerateAudio = async () => {
    if (state.isRegenerating) return;

    setState(prev => ({
      ...prev,
      isRegenerating: true,
      regenerationError: undefined,
    }));

    try {
      // MCP: Log regeneration attempt for audit
      if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
        (window as any).logTelemetryEvent('tts_regeneration_attempted', {
          pipelineId,
          voice: state.selectedVoice,
          userTier: tier,
          timestamp: new Date().toISOString(),
        });
      }

      const ttsNarration = await regenerateFromScript(
        pipelineId,
        state.selectedVoice
      );

      setState(prev => ({
        ...prev,
        audioUrl: ttsNarration.audioFileUrl,
        voiceName: ttsNarration.modelUsed || 'Jenny',
        isRegenerating: false,
      }));

      // MCP: Log successful regeneration
      if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
        (window as any).logTelemetryEvent('tts_regeneration_success', {
          pipelineId,
          voice: state.selectedVoice,
          userTier: tier,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Regeneration error:', error);
      setState(prev => ({
        ...prev,
        isRegenerating: false,
        regenerationError:
          error instanceof Error ? error.message : 'Regeneration failed',
      }));

      // MCP: Log regeneration failure
      if (typeof window !== 'undefined' && (window as any).logTelemetryEvent) {
        (window as any).logTelemetryEvent('tts_regeneration_failed', {
          pipelineId,
          voice: state.selectedVoice,
          userTier: tier,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const handleApprove = async () => {
    try {
      // Store the edited script in the database
      const { error } = await supabase
        .from('narrated_decks')
        .update({
          edited_script: state.script,
          script_edited_at: new Date().toISOString(),
          script_edited_by: 'user', // TODO: Get actual user ID
        })
        .eq('pipeline_id', pipelineId);

      if (error) {
        console.error('Failed to store edited script:', error);
        // Continue anyway - the script will be used for narration
      }

      onApprove(state.script);
    } catch (error) {
      console.error('Error approving script:', error);
      // Continue with approval even if storage fails
      onApprove(state.script);
    }
  };

  const handleEditAgain = () => {
    setState(prev => ({
      ...prev,
      isEditing: true,
    }));
    onEditAgain();
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      script: initialScript,
      hasChanges: false,
    }));
  };

  const handleExport = async (format: 'pdf' | 'md') => {
    if (!canExport(tier, format)) {
      setState(prev => ({ ...prev, showUpgradeNudge: true }));
      return;
    }

    setState(prev => ({ ...prev, isExporting: true, exportError: undefined }));

    try {
      const result = await exportScript(state.script, {
        format,
        includeWatermark: tier === 'Free',
        userTier: tier,
        fileName: `script_${pipelineId}_${Date.now()}`,
        metadata: {
          title: 'DocCraft Video Script',
          author: 'DocCraft AI',
          date: new Date().toISOString().split('T')[0],
          wordCount: state.wordCount,
        },
      });

      if (result.success && result.downloadUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `script_${pipelineId}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up URL
        URL.revokeObjectURL(result.downloadUrl);
      } else {
        setState(prev => ({
          ...prev,
          exportError: result.error || 'Export failed',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        exportError: error instanceof Error ? error.message : 'Export failed',
      }));
    } finally {
      setState(prev => ({ ...prev, isExporting: false }));
    }
  };

  const handleUpgradeNudgeDismiss = () => {
    setState(prev => ({ ...prev, showUpgradeNudge: false }));
  };

  const canEdit = tier === 'Pro' || tier === 'Premium';
  const canRegenerate = tier === 'Pro' || tier === 'Premium';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Review & Edit Script
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review the AI-generated script before narration
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{state.wordCount} words</span>
          <span>•</span>
          <span>~{state.estimatedDuration}s</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Script Editor */}
        <div>
          {/* Script Editor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Script
            </label>
            <textarea
              value={state.script}
              onChange={handleScriptChange}
              className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none font-mono text-sm leading-relaxed"
              placeholder="Edit the AI-generated script here..."
              disabled={!canEdit}
            />
            {!canEdit && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Script editing requires Pro tier. Upgrade to edit scripts.
              </p>
            )}
          </div>

          {/* Script Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {state.wordCount}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Words
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {state.estimatedDuration}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Seconds
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round((state.wordCount / state.estimatedDuration) * 60)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                WPM
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Voice & Audio */}
        <div className="space-y-4">
          {/* Voice Switcher */}
          <VoiceSwitcher
            selectedVoice={state.selectedVoice}
            onVoiceChange={handleVoiceChange}
            userTier={tier}
            pipelineId={pipelineId}
            disabled={state.isRegenerating}
          />

          {/* Audio Preview */}
          <AudioPreviewPlayer
            audioUrl={state.audioUrl}
            voiceName={state.voiceName}
            voiceId={state.selectedVoice}
            duration={state.estimatedDuration}
            pipelineId={pipelineId}
          />

          {/* Regenerate Button */}
          {canRegenerate && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Regenerate Audio
                </h4>
                {state.isRegenerating && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Regenerating...
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                Generate new audio with the selected voice and current script
              </p>
              <button
                onClick={handleRegenerateAudio}
                disabled={state.isRegenerating}
                className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 
                           hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                           rounded-md transition-colors"
              >
                {state.isRegenerating
                  ? 'Regenerating...'
                  : 'Regenerate Audio with Selected Voice'}
              </button>
            </div>
          )}

          {/* Regeneration Error */}
          {state.regenerationError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-xs text-red-700 dark:text-red-300">
                ⚠️ {state.regenerationError}
              </p>
            </div>
          )}

          {/* Tier Information */}
          {!canRegenerate && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                💡 Upgrade to Pro tier to regenerate audio with different voices
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          {state.hasChanges && (
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                         hover:text-gray-800 dark:hover:text-gray-200
                         border border-gray-300 dark:border-gray-600 rounded-md
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset to Original
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 
                       hover:text-gray-800 dark:hover:text-gray-200
                       border border-gray-300 dark:border-gray-600 rounded-md
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Export Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('md')}
              disabled={state.isExporting}
              className="px-3 py-2 text-sm text-green-600 dark:text-green-400 
                         hover:text-green-800 dark:hover:text-green-200
                         border border-green-300 dark:border-green-600 rounded-md
                         hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <FileText className="w-4 h-4" />
              <span>Export MD</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={state.isExporting || !canExport(tier, 'pdf')}
              className="px-3 py-2 text-sm text-purple-600 dark:text-purple-400 
                         hover:text-purple-800 dark:hover:text-purple-200
                         border border-purple-300 dark:border-purple-600 rounded-md
                         hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>

          <button
            onClick={handleEditAgain}
            className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 
                       hover:text-blue-800 dark:hover:text-blue-200
                       border border-blue-300 dark:border-blue-600 rounded-md
                       hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Generate New Script
          </button>
          <button
            onClick={handleApprove}
            disabled={!canEdit && state.hasChanges}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                       hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                       rounded-md transition-colors"
          >
            Approve & Narrate
          </button>
        </div>
      </div>

      {/* Export Error */}
      {state.exportError && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-700 dark:text-red-300">
            ⚠️ Export failed: {state.exportError}
          </p>
        </div>
      )}

      {/* Export Loading */}
      {state.isExporting && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-xs text-blue-700 dark:text-blue-300">
              Exporting...
            </span>
          </div>
        </div>
      )}

      {/* Changes Indicator */}
      {state.hasChanges && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            ✏️ Script has been modified. Your changes will be used for
            narration.
          </p>
        </div>
      )}

      {/* Upgrade Nudge */}
      {state.showUpgradeNudge && (
        <div className="mt-4">
          <ProUpgradeNudge
            message={getUpgradeMessage('pdf')}
            feature="pdf_export"
            userTier={tier}
            onDismiss={handleUpgradeNudgeDismiss}
            variant="inline"
          />
        </div>
      )}
    </div>
  );
};

export default ScriptEditor;
