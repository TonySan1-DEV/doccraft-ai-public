import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AccessWarning } from '../components/AccessWarning';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
  Share2,
  History,
  Brain,
} from 'lucide-react';
import { saveOutlineToSupabase } from '../services/saveOutline';
import { BookOutline } from '../services/saveOutline';
import SavedOutlines from '../components/SavedOutlines';
import PersonalizedSuggestions from '../components/PersonalizedSuggestions';
import SuggestionPanel from '../components/SuggestionPanel';
import MarketTrendPanel from '../components/MarketTrendPanel';
import { useWriterProfile } from '../hooks/useWriterProfile';
import toast from 'react-hot-toast';

interface Chapter {
  title: string;
  summary: string;
}

const BookOutliner: React.FC = () => {
  const { user }: { user: { id: string; tier: string } } = useAuth() as {
    user: { id: string; tier: string };
  };
  const { profile, recordAction } = useWriterProfile();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [outline, setOutline] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSavedOutlines, setShowSavedOutlines] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (user?.tier === 'Free') {
    return <AccessWarning tier="Pro" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutline([]);

    try {
      const res = await fetch('/api/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre, tone }),
      });

      if (!res.ok) throw new Error('Failed to generate outline');
      const data: Chapter[] = await res.json();
      setOutline(data);

      // Record successful outline generation for AI learning
      if (data.length > 0 && user?.id) {
        await recordAction('outline_generation', 'book_outliner', 'success');

        setSaving(true);
        try {
          await saveOutlineToSupabase(user.id, title, genre, tone, data);
          toast.success('Outline generated and saved successfully!');
        } catch (saveError: unknown) {
          const errorMessage =
            saveError instanceof Error
              ? saveError.message
              : 'Failed to save outline';
          console.error('Failed to save outline:', errorMessage);
          toast.error(
            'Outline generated but failed to save. Please try again.'
          );
        } finally {
          setSaving(false);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error('Failed to generate outline. Please try again.');

      // Record failed outline generation for AI learning
      if (user?.id) {
        await recordAction('outline_generation', 'book_outliner', 'failure');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadOutline = (savedOutline: BookOutline) => {
    setTitle(savedOutline.title);
    setGenre(savedOutline.genre);
    setTone(savedOutline.tone);
    setOutline(savedOutline.outline);
    setShowSavedOutlines(false);
    toast.success('Outline loaded successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">AI Book Outliner</h1>
        <div className="flex items-center gap-3">
          {profile && (
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <Brain className="w-4 h-4" />
              {showSuggestions ? 'Hide' : 'Show'} AI Suggestions
            </button>
          )}
          <button
            onClick={() => setShowSavedOutlines(!showSavedOutlines)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <History className="w-4 h-4" />
            {showSavedOutlines ? 'Hide' : 'Show'} Saved Outlines
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Outliner */}
        <div className="lg:col-span-2">
          {showSuggestions && profile && (
            <div className="mb-6 space-y-4">
              <PersonalizedSuggestions
                context="outline"
                currentContent={`Title: ${title}, Genre: ${genre}, Tone: ${tone}`}
                onSuggestionAccepted={() => {
                  toast.success(
                    'Suggestion applied! AI is learning from your preferences.'
                  );
                }}
                onSuggestionRejected={() => {
                  toast(
                    'Suggestion dismissed. AI will adjust future recommendations.'
                  );
                }}
              />

              <SuggestionPanel
                text={`Title: ${title}\nGenre: ${genre}\nTone: ${tone}`}
                profile={profile}
                context={{
                  text: title,
                  genre: genre,
                  tone: tone,
                  documentType: 'outline',
                }}
                showSummary={true}
                maxSuggestions={5}
              />

              <MarketTrendPanel
                genre={genre}
                content={`Title: ${title}\nGenre: ${genre}\nTone: ${tone}`}
                maxItems={5}
                showSummary={true}
                showRecommendations={true}
              />
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white dark:bg-zinc-900 rounded-lg shadow p-6"
          >
            <div>
              <label htmlFor="book-title" className="block font-medium mb-1">
                Book Title
              </label>
              <input
                id="book-title"
                className="w-full border rounded px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="e.g. The Art of AI Writing"
              />
            </div>
            <div>
              <label htmlFor="book-genre" className="block font-medium mb-1">
                Genre
              </label>
              <input
                id="book-genre"
                className="w-full border rounded px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                required
                placeholder="e.g. Nonfiction, Sci-Fi, Business"
              />
            </div>
            <div>
              <label htmlFor="book-tone" className="block font-medium mb-1">
                Tone
              </label>
              <input
                id="book-tone"
                className="w-full border rounded px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
                value={tone}
                onChange={e => setTone(e.target.value)}
                required
                placeholder="e.g. Inspirational, Technical, Friendly"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:opacity-60"
              disabled={loading || saving}
            >
              {loading && <Loader2 className="animate-spin w-5 h-5" />}
              {saving && <Loader2 className="animate-spin w-5 h-5" />}
              {loading
                ? 'Generating Outline...'
                : saving
                  ? 'Saving...'
                  : 'Generate Outline'}
            </button>
          </form>

          {error && (
            <div className="text-red-600 mt-6 text-center">{error}</div>
          )}

          {!loading && outline.length > 0 && (
            <>
              <div className="flex gap-4 mt-8 justify-end">
                <button
                  className="flex items-center gap-2 px-4 py-2 border rounded text-sm font-medium text-blue-600 hover:bg-blue-50"
                  onClick={() => alert('Export placeholder')}
                >
                  <Download className="w-4 h-4" /> Export
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 border rounded text-sm font-medium text-blue-600 hover:bg-blue-50"
                  onClick={() => alert('Share placeholder')}
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {outline.map((chapter, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg bg-white dark:bg-zinc-900 shadow"
                  >
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-lg focus:outline-none"
                      onClick={() => setExpanded(expanded === idx ? null : idx)}
                      type="button"
                    >
                      <span>{chapter.title}</span>
                      {expanded === idx ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expanded === idx && (
                      <div className="px-4 pb-4 text-zinc-700 dark:text-zinc-200 animate-fade-in">
                        {chapter.summary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Saved Outlines Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6 h-fit">
            <SavedOutlines onLoadOutline={handleLoadOutline} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookOutliner;
