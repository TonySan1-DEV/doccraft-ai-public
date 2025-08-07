import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AccessWarning from '../components/AccessWarning';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface Chapter {
  title: string;
  summary: string;
}

const OutlineBuilder: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [tone, setTone] = useState('');
  const [outline, setOutline] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

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
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">AI Book Outliner</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white dark:bg-zinc-900 rounded-lg shadow p-6"
      >
        <div>
          <label htmlFor="outline-title" className="block font-medium mb-1">
            Book Title
          </label>
          <input
            id="outline-title"
            className="w-full border rounded px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="e.g. The Art of AI Writing"
          />
        </div>
        <div>
          <label htmlFor="outline-genre" className="block font-medium mb-1">
            Genre
          </label>
          <input
            id="outline-genre"
            className="w-full border rounded px-3 py-2 bg-zinc-50 dark:bg-zinc-800"
            value={genre}
            onChange={e => setGenre(e.target.value)}
            required
            placeholder="e.g. Nonfiction, Sci-Fi, Business"
          />
        </div>
        <div>
          <label htmlFor="outline-tone" className="block font-medium mb-1">
            Tone
          </label>
          <input
            id="outline-tone"
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
          disabled={loading}
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />} Generate
          Outline
        </button>
      </form>
      <div className="mt-8">
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {!loading && outline.length === 0 && !error && (
          <div className="text-zinc-500 text-center">
            Enter your book details to generate an outline.
          </div>
        )}
        {outline.map((chapter, idx) => (
          <div
            key={idx}
            className="mb-4 border rounded-lg bg-white dark:bg-zinc-900 shadow"
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
    </div>
  );
};

export default OutlineBuilder;
