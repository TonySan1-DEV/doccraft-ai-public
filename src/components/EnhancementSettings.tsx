interface EnhancementSettingsProps {
  settings: {
    aiEnhancement: boolean;
    imageSuggestions: boolean;
    toneAnalysis: boolean;
  };
  onSettingsChange: (settings: {
    aiEnhancement: boolean;
    imageSuggestions: boolean;
    toneAnalysis: boolean;
  }) => void;
}

export default function EnhancementSettings({
  settings,
  onSettingsChange,
}: EnhancementSettingsProps) {
  const handleToggle = (key: string) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key as keyof typeof settings],
    });
  };

  return (
    <div className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Enhancement Settings</h3>

      <div className="space-y-3">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.aiEnhancement}
            onChange={() => handleToggle("aiEnhancement")}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">AI Content Enhancement</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.imageSuggestions}
            onChange={() => handleToggle("imageSuggestions")}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">Image Suggestions</span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.toneAnalysis}
            onChange={() => handleToggle("toneAnalysis")}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">Tone Analysis</span>
        </label>
      </div>
    </div>
  );
}
