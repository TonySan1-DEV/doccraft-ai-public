import { useState } from 'react';
import { useMCP } from '../useMCP';
import { AccessWarning } from '../components/AccessWarning';
import { EditorPanel } from '../components/EditorPanel';
import { AIPreviewModal } from '../components/common/AIPreviewModal';
import { useAIHelper } from '../lib/hooks/useAIHelper';
import {
  Users,
  Loader2,
  Sparkles,
  Wand2,
  FileText,
  BookOpen,
  FileDown,
  Share2,
} from 'lucide-react';

// DocBuilder component with AI helper integration, preview modal, and collaboration
const DocBuilder = () => {
  const [content, setContent] = useState('');
  const { runAI, loading } = useAIHelper();
  const [editor, setEditor] = useState<Record<string, unknown> | null>(null);

  // AI Preview Modal state
  const [aiResult, setAiResult] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [lastSelection, setLastSelection] = useState('');
  const [lastAction, setLastAction] = useState<
    'rewrite' | 'summarize' | 'suggest'
  >('rewrite');

  // Collaboration state
  const [docId] = useState('builder-doc-' + Date.now()); // Generate unique doc ID
  const [userId] = useState('user-' + Math.floor(Math.random() * 1000000)); // Generate user ID
  const [userName] = useState('User ' + Math.floor(Math.random() * 100)); // Generate user name

  const handleEditorReady = (editorInstance: Record<string, unknown>) => {
    setEditor(editorInstance);
  };

  const getSelectedText = (): string => {
    if (!editor) return '';

    const { from, to } = (editor.state as any).selection;
    if (from === to) return '';

    return (editor.state as any).doc.textBetween(from, to, ' ');
  };

  const replaceSelectedText = (newText: string) => {
    if (!editor || !newText) return;

    const { from, to } = (editor.state as any).selection;
    if (from === to) return;

    (editor as any)
      .chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent(newText)
      .run();
  };

  const replaceEntireContent = (newText: string) => {
    if (!editor || !newText) return;
    (editor as any).commands.setContent(newText);
  };

  const handleAIAction = async (
    action: 'rewrite' | 'summarize' | 'suggest'
  ) => {
    const selectedText = getSelectedText();
    setLastAction(action);

    if (!selectedText.trim()) {
      // If no text is selected, use the entire content
      const fullContent = (editor as any)?.getHTML() || '';
      if (!fullContent.trim()) return;

      setLastSelection('');
      const result = await runAI(action, fullContent);
      if (result && result !== fullContent) {
        setAiResult(result);
        setShowPreview(true);
      }
      return;
    }

    setLastSelection(selectedText);
    const result = await runAI(action, selectedText);
    if (result && result !== selectedText) {
      setAiResult(result);
      setShowPreview(true);
    }
  };

  const handleApplyAIResult = () => {
    if (lastSelection) {
      // Replace selected text
      replaceSelectedText(aiResult);
    } else {
      // Replace entire content
      replaceEntireContent(aiResult);
    }
    setShowPreview(false);
    setAiResult('');
    setLastSelection('');
  };

  const handleCancelAIResult = () => {
    setShowPreview(false);
    setAiResult('');
    setLastSelection('');
  };

  const handleRegenerateAIResult = async () => {
    if (lastSelection) {
      const result = await runAI(lastAction, lastSelection);
      if (result && result !== lastSelection) {
        setAiResult(result);
      }
    } else {
      const fullContent = (editor as any)?.getHTML() || '';
      if (fullContent.trim()) {
        const result = await runAI(lastAction, fullContent);
        if (result && result !== fullContent) {
          setAiResult(result);
        }
      }
    }
  };

  const aiEnhancements = [
    {
      icon: Sparkles,
      label: 'AI Rewrite',
      action: () => handleAIAction('rewrite'),
      description: 'Rewrite selected text clearly and concisely',
    },
    {
      icon: Wand2,
      label: 'Smart Format',
      action: () => handleAIAction('suggest'),
      description: 'Get suggestions to improve the text',
    },
    {
      icon: FileText,
      label: 'Auto-Summarize',
      action: () => handleAIAction('summarize'),
      description: 'Summarize the selected content',
    },
    {
      icon: BookOpen,
      label: 'Expand Section',
      action: () => handleAIAction('rewrite'),
      description: 'Expand and enhance the selected section',
    },
  ];

  const exportOptions = [
    {
      icon: FileDown,
      label: 'PDF',
      format: 'pdf',
      action: () => {},
    },
    {
      icon: FileText,
      label: 'DOCX',
      format: 'docx',
      action: () => {},
    },
    {
      icon: BookOpen,
      label: 'EPUB',
      format: 'epub',
      action: () => {},
    },
    {
      icon: Share2,
      label: 'Share',
      action: () => {},
    },
  ];

  return (
    <>
      <div className="flex h-full">
        {/* Main Editor */}
        <div className="flex-1">
          <EditorPanel
            content={content}
            onContentChange={setContent}
            onEditorReady={handleEditorReady}
            placeholder="Start writing your document here... Use AI tools in the sidebar to enhance your content."
            className="h-full"
            docId={docId}
            userId={userId}
            userName={userName}
            enableCollaboration={true} // Enable collaboration for Pro+ users
          />
        </div>

        {/* AI Tools Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="p-4">
            {/* Collaboration Status */}
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Live Collaboration
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Document: {docId.slice(-8)} • User: {userName}
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              AI Enhancements
            </h3>
            <div className="space-y-2">
              {aiEnhancements.map((tool, index) => (
                <button
                  key={index}
                  onClick={tool.action}
                  disabled={loading}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={tool.description}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  ) : (
                    <tool.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                  <div className="flex-1">
                    <span className="text-gray-700 dark:text-gray-300">
                      {tool.label}
                    </span>
                    {loading && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Thinking...
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Export Options
              </h3>
              <div className="space-y-2">
                {exportOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={option.action}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <option.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Preview Modal */}
      <AIPreviewModal
        open={showPreview}
        result={aiResult}
        originalText={lastSelection}
        onApply={handleApplyAIResult}
        onCancel={handleCancelAIResult}
        onRegenerate={handleRegenerateAIResult}
        loading={loading}
      />
    </>
  );
};

export default function Builder() {
  const ctx = useMCP('Builder.tsx');

  // Only Pro+ users get collaboration features
  const enableCollaboration = ctx.tier === 'Pro' || ctx.tier === 'Admin';

  if (ctx.tier === 'Free') {
    return <AccessWarning tier="Pro" feature="AI Document Builder" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ✍️ Document Builder
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Compose, edit, and enhance your documents with AI tools and export
          capabilities.
          {enableCollaboration && (
            <span className="ml-2 inline-flex items-center space-x-1 text-green-600 dark:text-green-400">
              <Users className="h-4 w-4" />
              <span className="text-sm">Live collaboration enabled</span>
            </span>
          )}
        </p>
      </div>

      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 shadow-lg">
        <div className="h-[600px] rounded-lg overflow-hidden">
          <DocBuilder />
        </div>
      </div>
    </div>
  );
}
