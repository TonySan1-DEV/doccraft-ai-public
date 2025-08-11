/**
 * @fileoverview Doc-to-Video Pipeline Controls
 * @module modules/agent/components/DocToVideoControls
 *
 * MCP Context Block:
 * - role: "Pipeline Control Interface"
 * - tier: "Premium"
 * - file: "modules/agent/components/DocToVideoControls.tsx"
 * - allowedActions: ["renderControls", "handleUserInput", "updateState", "validateOptions"]
 * - theme: "User Interface"
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  Settings,
  Download,
  Eye,
  FileText,
  Volume2,
  Image as ImageIcon,
  Zap,
} from 'lucide-react';
import { VoiceSelector } from '@/components/VoiceSelector';
import { ConfirmNarrationDialog } from '@/components/ConfirmNarrationDialog';
import { createVoiceId } from '@/types/voiceTypes';

export interface DocToVideoOptions {
  mode: 'auto' | 'hybrid' | 'manual';
  generateScript: boolean;
  generateSlides: boolean;
  generateNarration: boolean;
  includeImages: boolean;
  slideCount?: number;
  narrationStyle: 'professional' | 'casual' | 'educational';
  ttsVoice: string;
  speakingPace: 'slow' | 'normal' | 'fast';
}

interface DocToVideoControlsProps {
  onExecute: (command: string, options: DocToVideoOptions) => void;
  onPreview?: (type: 'script' | 'slides' | 'narration') => void;
  onDownload?: (type: 'ppt' | 'audio' | 'timeline') => void;
  isProcessing?: boolean;
  currentProgress?: number;
}

/**
 * Doc-to-Video Pipeline Controls Component
 * Provides UI controls for the document-to-video pipeline
 */
export const DocToVideoControls: React.FC<DocToVideoControlsProps> = ({
  onExecute,
  onPreview,
  onDownload,
  isProcessing = false,
  currentProgress = 0,
}) => {
  const [options, setOptions] = useState<DocToVideoOptions>({
    mode: 'auto',
    generateScript: true,
    generateSlides: true,
    generateNarration: true,
    includeImages: false,
    slideCount: 5,
    narrationStyle: 'professional',
    ttsVoice: 'en-US-JennyNeural',
    speakingPace: 'normal',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('emma');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleOptionChange = (key: keyof DocToVideoOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleExecute = () => {
    const command = `/doc2video ${options.mode}`;
    // Include the selected voice in the pipeline options
    const pipelineOptions = {
      ...options,
      voice: selectedVoice,
    };
    onExecute(command, pipelineOptions);
  };

  const handleStartNarration = () => {
    setConfirmOpen(true);
  };

  const handleConfirmNarration = () => {
    setConfirmOpen(false);
    // Execute narration pipeline with current settings
    const command = '/doc2video voiceoverOnly';
    const pipelineOptions = {
      ...options,
      voice: selectedVoice,
    };
    onExecute(command, pipelineOptions);
  };

  const handleCancelNarration = () => {
    setConfirmOpen(false);
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'auto':
        return <Zap className="w-4 h-4" />;
      case 'hybrid':
        return <Settings className="w-4 h-4" />;
      case 'manual':
        return <Pause className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case 'auto':
        return 'Fully automated pipeline';
      case 'hybrid':
        return 'AI-assisted with manual review';
      case 'manual':
        return 'Manual control with AI suggestions';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🎬 Doc-to-Video Pipeline
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Transform documents into video presentations
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Pipeline Mode
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['auto', 'hybrid', 'manual'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => handleOptionChange('mode', mode)}
              className={`p-3 rounded-lg border-2 transition-all ${
                options.mode === mode
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                {getModeIcon(mode)}
              </div>
              <div className="text-xs font-medium capitalize">{mode}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getModeDescription(mode)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Generation Options */}
      <div className="mb-6">
        <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Generate Components
        </div>
        <div className="space-y-3">
          {[
            {
              key: 'generateSlides',
              label: 'Slides',
              icon: <FileText className="w-4 h-4" />,
            },
            {
              key: 'generateScript',
              label: 'Script',
              icon: <FileText className="w-4 h-4" />,
            },
            {
              key: 'generateNarration',
              label: 'Narration',
              icon: <Volume2 className="w-4 h-4" />,
            },
            {
              key: 'includeImages',
              label: 'AI Images',
              icon: <ImageIcon className="w-4 h-4" />,
            },
          ].map(({ key, label, icon }) => (
            <label
              key={key}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                id={`checkbox-${key}`}
                checked={options[key as keyof DocToVideoOptions] as boolean}
                onChange={e =>
                  handleOptionChange(
                    key as keyof DocToVideoOptions,
                    e.target.checked
                  )
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex items-center space-x-2">
                {icon}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="mb-6 space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Advanced Settings
          </h4>

          {/* Slide Count */}
          <div>
            <label
              htmlFor="slide-count"
              className="block text-sm text-gray-700 dark:text-gray-300 mb-2"
            >
              Number of Slides
            </label>
            <input
              id="slide-count"
              type="number"
              min="1"
              max="50"
              value={options.slideCount}
              onChange={e =>
                handleOptionChange('slideCount', parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Narration Style */}
          <div>
            <label
              htmlFor="narration-style"
              className="block text-sm text-gray-700 dark:text-gray-300 mb-2"
            >
              Narration Style
            </label>
            <select
              id="narration-style"
              value={options.narrationStyle}
              onChange={e =>
                handleOptionChange('narrationStyle', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="educational">Educational</option>
            </select>
          </div>

          {/* Narration Voice */}
          <section aria-label="Narration Voice" className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Narration Voice</h3>
            <VoiceSelector
              selectedVoice={createVoiceId(selectedVoice)}
              onChange={voiceId => setSelectedVoice(voiceId)}
            />
          </section>

          {/* Speaking Pace */}
          <div>
            <label
              htmlFor="speaking-pace"
              className="block text-sm text-gray-700 dark:text-gray-300 mb-2"
            >
              Speaking Pace
            </label>
            <select
              id="speaking-pace"
              value={options.speakingPace}
              onChange={e => handleOptionChange('speakingPace', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Processing...</span>
            <span>{Math.round(currentProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExecute}
          disabled={isProcessing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>{isProcessing ? 'Processing...' : 'Execute Pipeline'}</span>
        </button>

        {onPreview && (
          <>
            <button
              onClick={() => onPreview('slides')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Slides</span>
            </button>
            <button
              onClick={handleStartNarration}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Start Narration</span>
            </button>
          </>
        )}

        {onDownload && (
          <button
            onClick={() => onDownload('ppt')}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PPT</span>
          </button>
        )}
      </div>

      {/* Quick Commands */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Quick Commands:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            '/doc2video auto',
            '/doc2video scriptOnly',
            '/doc2video slidesOnly',
            '/doc2video voiceoverOnly',
          ].map(cmd => (
            <button
              key={cmd}
              onClick={() => onExecute(cmd, options)}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmNarrationDialog
        open={confirmOpen}
        onClose={handleCancelNarration}
        onConfirm={handleConfirmNarration}
        summary={{
          genre: options.narrationStyle,
          voice: selectedVoice,
          preview: `Narration will be generated in ${options.narrationStyle} style with ${selectedVoice} voice.`,
        }}
      />
    </div>
  );
};
