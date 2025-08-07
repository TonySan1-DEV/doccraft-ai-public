/*
role: ui-engineer,
tier: free+,
file: "modules/agent/components/videoDeliveryPanel.tsx",
allowedActions: ["viewPipelineResults"],
theme: "pipeline_delivery"
*/

/* MCP: video_delivery_panel */

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseStorage';
import {
  logAssetDownloadEnhanced,
  logShareableLinkEventEnhanced,
} from '../services/auditLogger';
import {
  Download,
  Share2,
  FileText,
  Play,
  Presentation,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  FileDown,
} from 'lucide-react';
import {
  exportScript,
  canExport,
  getUpgradeMessage,
} from '../../../src/utils/exportUtils';
import ProUpgradeNudge from '../../../src/components/ProUpgradeNudge';

// MCP BLOCK
export const mcp = {
  role: 'agent',
  tier: 'free+',
  allowedActions: ['viewPipelineResults'],
};

interface PipelineStatus {
  id: string;
  user_id?: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'paused';
  mode: 'auto' | 'hybrid' | 'manual';
  features: string[];
  currentStep?: string;
  progress: number;
  errorMessage?: string;
  errorDetails?: any;
  processingTimeMs?: number;
  durationSeconds?: number;
  tier: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  slideDeckId?: string;
  narratedDeckId?: string;
  ttsNarrationId?: string;
  slideDeckTitle?: string;
  narratedDeckTitle?: string;
  ttsAudioUrl?: string;
  pausedAt?: string;
  pauseReason?: string;
}

interface VideoDeliveryPanelProps {
  pipeline: PipelineStatus;
  userTier?: string;
  className?: string;
}

interface DownloadableAsset {
  id: string;
  title: string;
  type: 'pptx' | 'script' | 'audio';
  url?: string;
  fileName?: string;
  size?: string;
  duration?: number;
  wordCount?: number;
}

export const VideoDeliveryPanel: React.FC<VideoDeliveryPanelProps> = ({
  pipeline,
  userTier = 'Free',
  className = '',
}) => {
  const [assets, setAssets] = useState<DownloadableAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copyingLink, setCopyingLink] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [publicViewEnabled, setPublicViewEnabled] = useState(false);
  const [creatingPublicLink, setCreatingPublicLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showUpgradeNudge, setShowUpgradeNudge] = useState(false);

  // Fetch pipeline assets
  useEffect(() => {
    const fetchAssets = async () => {
      if (pipeline.status !== 'success') return;

      try {
        setLoading(true);
        const fetchedAssets: DownloadableAsset[] = [];

        // Fetch slide deck
        if (pipeline.slideDeckId) {
          try {
            const { data: slideDeck } = await supabase
              .from('slide_decks')
              .select('*')
              .eq('id', pipeline.slideDeckId)
              .single();

            if (slideDeck) {
              // Generate signed URL for PPTX download
              const pptxUrl = await generateSignedUrl(
                'slide_decks',
                slideDeck.file_path
              );

              fetchedAssets.push({
                id: slideDeck.id,
                title: slideDeck.title || 'Slide Deck',
                type: 'pptx',
                url: pptxUrl,
                fileName: `${slideDeck.title || 'presentation'}.pptx`,
                size: formatFileSize(slideDeck.file_size || 0),
              });
            }
          } catch (error) {
            console.error('Error fetching slide deck:', error);
          }
        }

        // Fetch narrated deck (script)
        if (pipeline.narratedDeckId) {
          try {
            const { data: narratedDeck } = await supabase
              .from('narrated_decks')
              .select('*')
              .eq('id', pipeline.narratedDeckId)
              .single();

            if (narratedDeck) {
              const script =
                narratedDeck.slides
                  ?.map((slide: any) => slide.narration)
                  .join('\n\n') || '';

              fetchedAssets.push({
                id: narratedDeck.id,
                title: narratedDeck.title || 'Script',
                type: 'script',
                fileName: `${narratedDeck.title || 'script'}.txt`,
                wordCount: script.split(/\s+/).length,
                duration: narratedDeck.total_duration || 0,
              });
            }
          } catch (error) {
            console.error('Error fetching narrated deck:', error);
          }
        }

        // Fetch TTS narration (audio) - Pro tier only
        if (
          pipeline.ttsNarrationId &&
          (userTier === 'Pro' || userTier === 'Premium')
        ) {
          try {
            const { data: ttsNarration } = await supabase
              .from('tts_narrations')
              .select('*')
              .eq('id', pipeline.ttsNarrationId)
              .single();

            if (ttsNarration && ttsNarration.audio_file_url) {
              fetchedAssets.push({
                id: ttsNarration.id,
                title: ttsNarration.title || 'Narration',
                type: 'audio',
                url: ttsNarration.audio_file_url,
                fileName: `${ttsNarration.title || 'narration'}.mp3`,
                duration: ttsNarration.duration || 0,
              });
            }
          } catch (error) {
            console.error('Error fetching TTS narration:', error);
          }
        }

        setAssets(fetchedAssets);
      } catch (error) {
        console.error('Error fetching pipeline assets:', error);
        setError('Failed to load pipeline results');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [pipeline, userTier]);

  // Generate signed URL for file download
  const generateSignedUrl = async (
    bucket: string,
    filePath: string
  ): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle asset download
  const handleDownload = async (asset: DownloadableAsset) => {
    setDownloading(asset.id);

    try {
      // Log download attempt
      await logAssetDownloadEnhanced({
        user_id: pipeline.user_id || 'unknown',
        pipeline_id: pipeline.id,
        asset_type:
          asset.type === 'pptx'
            ? 'slide'
            : asset.type === 'script'
              ? 'script'
              : 'audio',
        asset_id: asset.id,
        tier_at_time: userTier,
        download_method: 'signed_url',
        file_size_bytes: asset.size
          ? parseInt(asset.size.split(' ')[0]) * 1024
          : undefined,
        success: true,
        referrer: document.referrer,
      });

      if (asset.type === 'script') {
        // For script, create and download text file
        const scriptContent = await fetchScriptContent(asset.id);
        const blob = new Blob([scriptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = asset.fileName || 'script.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (asset.url) {
        // For files with URLs, trigger download
        const a = document.createElement('a');
        a.href = asset.url;
        a.download = asset.fileName || 'download';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);

      // Log failed download
      try {
        await logAssetDownloadEnhanced({
          user_id: pipeline.user_id || 'unknown',
          pipeline_id: pipeline.id,
          asset_type:
            asset.type === 'pptx'
              ? 'slide'
              : asset.type === 'script'
                ? 'script'
                : 'audio',
          asset_id: asset.id,
          tier_at_time: userTier,
          download_method: 'signed_url',
          file_size_bytes: asset.size
            ? parseInt(asset.size.split(' ')[0]) * 1024
            : undefined,
          success: false,
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
          referrer: document.referrer,
        });
      } catch (logError) {
        console.error('Failed to log download error:', logError);
      }

      setError('Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  // Fetch script content
  const fetchScriptContent = async (
    narratedDeckId: string
  ): Promise<string> => {
    try {
      const { data } = await supabase
        .from('narrated_decks')
        .select('slides')
        .eq('id', narratedDeckId)
        .single();

      if (data?.slides) {
        return data.slides.map((slide: any) => slide.narration).join('\n\n');
      }
      return '';
    } catch (error) {
      console.error('Error fetching script content:', error);
      return '';
    }
  };

  // Create shareable link
  const createSharableLink = async (pipelineId: string): Promise<string> => {
    // This would typically call a backend function to create a shareable link
    // For now, we'll create a simple URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/pipeline/${pipelineId}`;
  };

  // Create public shareable link (Pro tier only)
  const createPublicShareableLink = async (
    pipelineId: string
  ): Promise<string> => {
    try {
      // Call Supabase function to create a shareable link
      const { data, error } = await supabase.rpc('create_shareable_link', {
        p_pipeline_id: pipelineId,
        p_user_id: pipeline.user_id,
      });

      if (error) {
        throw new Error(error.message);
      }

      const baseUrl = window.location.origin;
      return `${baseUrl}/share/${data}`;
    } catch (error) {
      console.error('Error creating public shareable link:', error);
      throw error;
    }
  };

  // Handle share link
  const handleShareLink = async () => {
    setCopyingLink(true);

    try {
      const link = await createSharableLink(pipeline.id);
      setShareLink(link);

      // Copy to clipboard
      await navigator.clipboard.writeText(link);

      // Log shareable link creation
      await logShareableLinkEventEnhanced({
        user_id: pipeline.user_id || 'unknown',
        pipeline_id: pipeline.id,
        event_type: 'created',
        tier_at_time: userTier,
        referrer: document.referrer,
      });

      // Show success message (you might want to use a toast library)
      console.log('Link copied to clipboard');
    } catch (error) {
      console.error('Error creating share link:', error);

      // Log failed share link creation
      try {
        await logShareableLinkEventEnhanced({
          user_id: pipeline.user_id || 'unknown',
          pipeline_id: pipeline.id,
          event_type: 'created',
          tier_at_time: userTier,
          referrer: document.referrer,
        });
      } catch (logError) {
        console.error('Failed to log share link error:', logError);
      }

      setError('Failed to create share link');
    } finally {
      setCopyingLink(false);
    }
  };

  // Handle public share link (Pro tier only)
  const handlePublicShareLink = async () => {
    if (userTier !== 'Pro' && userTier !== 'Premium' && userTier !== 'Admin') {
      setError('Public sharing requires Pro tier or higher');
      return;
    }

    setCreatingPublicLink(true);

    try {
      const link = await createPublicShareableLink(pipeline.id);
      setShareLink(link);
      setPublicViewEnabled(true);

      // Copy to clipboard
      await navigator.clipboard.writeText(link);

      // Log public shareable link creation
      await logShareableLinkEventEnhanced({
        user_id: pipeline.user_id || 'unknown',
        pipeline_id: pipeline.id,
        event_type: 'created',
        tier_at_time: userTier,
        referrer: document.referrer,
        link_token: link.split('/').pop(), // Extract token from URL
      });

      console.log('Public link copied to clipboard');
    } catch (error) {
      console.error('Error creating public share link:', error);
      setError('Failed to create public share link');
    } finally {
      setCreatingPublicLink(false);
    }
  };

  // Calculate summary stats
  const summaryStats = {
    totalSlides: assets.filter(a => a.type === 'pptx').length,
    totalWords: assets
      .filter(a => a.type === 'script')
      .reduce((sum, a) => sum + (a.wordCount || 0), 0),
    totalDuration: assets
      .filter(a => a.type === 'audio')
      .reduce((sum, a) => sum + (a.duration || 0), 0),
  };

  // Handle script export
  const handleExportScript = async (format: 'pdf' | 'md') => {
    if (!canExport(userTier, format)) {
      setShowUpgradeNudge(true);
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      // Find script asset
      const scriptAsset = assets.find(a => a.type === 'script');
      if (!scriptAsset) {
        throw new Error('No script available for export');
      }

      // Fetch script content
      const scriptContent = await fetchScriptContent(
        pipeline.narratedDeckId || ''
      );

      const result = await exportScript(scriptContent, {
        format,
        includeWatermark: userTier === 'Free',
        userTier,
        fileName: `script_${pipeline.id}_${Date.now()}`,
        metadata: {
          title: scriptAsset.title || 'DocCraft Video Script',
          author: 'DocCraft AI',
          date: new Date().toISOString().split('T')[0],
          wordCount: scriptAsset.wordCount || 0,
        },
      });

      if (result.success && result.downloadUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `script_${pipeline.id}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up URL
        URL.revokeObjectURL(result.downloadUrl);
      } else {
        setExportError(result.error || 'Export failed');
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpgradeNudgeDismiss = () => {
    setShowUpgradeNudge(false);
  };

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading pipeline results...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      >
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Success Banner */}
      {pipeline.status === 'success' && (
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200 font-medium">
              Pipeline completed successfully!
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Summary View */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Generated Content Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Presentation className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slides
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {summaryStats.totalSlides}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Words
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {summaryStats.totalWords.toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatDuration(summaryStats.totalDuration)}
              </p>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Download Assets
          </h3>

          {/* Export Script Buttons */}
          {assets.some(a => a.type === 'script') && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Export Script
              </h4>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleExportScript('md')}
                  disabled={isExporting}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-green-600 dark:text-green-400 
                             hover:text-green-800 dark:hover:text-green-200
                             border border-green-300 dark:border-green-600 rounded-md
                             hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4" />
                  <span>Export MD</span>
                </button>
                <button
                  onClick={() => handleExportScript('pdf')}
                  disabled={isExporting || !canExport(userTier, 'pdf')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 
                             hover:text-purple-800 dark:hover:text-purple-200
                             border border-purple-300 dark:border-purple-600 rounded-md
                             hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Export PDF</span>
                </button>
              </div>
              {isExporting && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                  <span>Exporting...</span>
                </div>
              )}
              {exportError && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                  ⚠️ {exportError}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            {assets.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No assets available for download</p>
              </div>
            ) : (
              assets.map(asset => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center space-x-3">
                    {asset.type === 'pptx' && (
                      <Presentation className="w-5 h-5 text-blue-600" />
                    )}
                    {asset.type === 'script' && (
                      <FileText className="w-5 h-5 text-green-600" />
                    )}
                    {asset.type === 'audio' && (
                      <Play className="w-5 h-5 text-purple-600" />
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {asset.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        {asset.size && <span>{asset.size}</span>}
                        {asset.wordCount && (
                          <span>{asset.wordCount.toLocaleString()} words</span>
                        )}
                        {asset.duration && (
                          <span>{formatDuration(asset.duration)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(asset)}
                    disabled={downloading === asset.id}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    {downloading === asset.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Download</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Share Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Share Results
          </h3>

          <div className="space-y-4">
            {/* Private Share */}
            <div>
              <button
                onClick={handleShareLink}
                disabled={copyingLink}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {copyingLink ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>
                  {shareLink && !publicViewEnabled
                    ? 'Copy Link'
                    : 'Share via Link'}
                </span>
              </button>
            </div>

            {/* Public Share (Pro tier only) */}
            {(userTier === 'Pro' ||
              userTier === 'Premium' ||
              userTier === 'Admin') && (
              <div>
                <button
                  onClick={handlePublicShareLink}
                  disabled={creatingPublicLink}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {creatingPublicLink ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  <span>Create Public Link</span>
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Anyone with the link can view your presentation
                </p>
              </div>
            )}

            {/* Share Link Display */}
            {shareLink && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Public Link Notice */}
            {publicViewEnabled && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Public link created! Anyone with this link can view your
                    presentation.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tier Restrictions Notice */}
        {userTier === 'Free' && assets.some(a => a.type === 'audio') && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                Audio narration download requires Pro tier or higher
              </span>
            </div>
          </div>
        )}

        {/* Upgrade Nudge */}
        {showUpgradeNudge && (
          <div className="mt-4">
            <ProUpgradeNudge
              message={getUpgradeMessage('pdf')}
              feature="pdf_export"
              userTier={userTier}
              onDismiss={handleUpgradeNudgeDismiss}
              variant="inline"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDeliveryPanel;
