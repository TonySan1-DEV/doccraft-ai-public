import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings, Download, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import DocumentPreview from '../components/DocumentPreview';
import EnhancementPanel from '../components/EnhancementPanel';

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface DocumentSection {
  id: string;
  content: string;
  topic_tags: string[];
  tone: string;
  intent: string;
  section_order: number;
}

interface Image {
  id: string;
  section_id: string;
  source: 'ai' | 'stock' | 'upload';
  source_metadata: any;
  caption: string;
  relevance_score: number;
  image_url: string;
}

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'preview' | 'enhance'>('preview');

  useEffect(() => {
    if (id && user) {
      fetchDocument();
    }
  }, [id, user]);

  const fetchDocument = async () => {
    try {
      // Fetch document
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', user!.id)
        .single();

      if (docError) throw docError;
      setDocument(docData);

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('document_sections')
        .select('*')
        .eq('document_id', id)
        .order('section_order');

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from('images')
        .select('*')
        .in(
          'section_id',
          (sectionsData || []).map((s: any) => s.id)
        );

      if (imagesError) throw imagesError;
      setImages(imagesData || []);
    } catch (error: unknown) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Please sign in to view documents.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading document...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Document not found.</p>
        <Link to="/" className="btn btn-primary mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {document.title}
            </h1>
            <p className="text-gray-600">
              Created {new Date(document.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'preview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Preview
            </button>
            <button
              onClick={() => setViewMode('enhance')}
              className={`px-3 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'enhance'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Enhance
            </button>
          </div>

          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'preview' ? (
        <DocumentPreview
          document={document}
          sections={sections}
          images={images}
        />
      ) : (
        <EnhancementPanel
          sections={sections}
          images={images}
          onImagesUpdate={setImages}
        />
      )}
    </div>
  );
}
