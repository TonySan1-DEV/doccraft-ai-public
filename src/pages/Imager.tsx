import { useState } from 'react';
import { useMCP } from '../useMCP';
import { AccessWarning } from '../components/AccessWarning';
import { ImagingModeSelector } from '../components/ImagingModeSelector';
import DocumentUpload from '../components/DocumentUpload';
import { ImageSuggestions } from '../components/ImageSuggestions';

interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  sections: Array<{
    id: string;
    content: string;
    topicTags: string[];
    tone: string;
    intent: string;
  }>;
}

export default function Imager() {
  const ctx = useMCP('Imager.tsx');
  const [document, setDocument] = useState<ProcessedDocument | null>(null);

  if (ctx.tier === 'Free') {
    return <AccessWarning tier="Pro" feature="Image Workspace" />;
  }

  const handleFileUpload = (file: File) => {
    setTimeout(() => {
      const mockProcessedDoc: ProcessedDocument = {
        id: 'mock-id',
        title: file.name,
        content: 'This is a mock document content for demonstration purposes.',
        sections: [
          {
            id: 'mock-section-1',
            content:
              'This is a mock section content for demonstration purposes.',
            topicTags: ['mock', 'demo'],
            tone: 'Neutral',
            intent: 'Informational',
          },
        ],
      };
      setDocument(mockProcessedDoc);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🖼️ Image Enhancement Workspace
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Upload a document and let AI assist in selecting and placing images
          intelligently.
        </p>
      </div>

      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-700/20 p-6 shadow-lg space-y-6">
        <ImagingModeSelector />
        <DocumentUpload onDocumentUpload={handleFileUpload} />
        {document && <ImageSuggestions document={document} />}
      </div>
    </div>
  );
}
