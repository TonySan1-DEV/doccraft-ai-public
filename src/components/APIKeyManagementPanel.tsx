import { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, Check, X, Plus } from 'lucide-react';

interface APIKeyConfig {
  provider: string;
  apiKey: string;
  isActive: boolean;
  lastUsed?: Date;
  usageCount: number;
}

interface APIKeyManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: APIKeyConfig[]) => void;
  currentKeys?: APIKeyConfig[];
}

const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 Turbo',
    color: 'bg-green-500',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3 Opus, Sonnet, Haiku',
    color: 'bg-orange-500',
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Gemini Pro, Gemini Pro Vision',
    color: 'bg-blue-500',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large, Medium, Small',
    color: 'bg-purple-500',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Command, Command Light',
    color: 'bg-indigo-500',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local models (no key required)',
    color: 'bg-gray-500',
  },
];

export default function APIKeyManagementPanel({
  isOpen,
  onClose,
  onSave,
  currentKeys = [],
}: APIKeyManagementPanelProps) {
  const [apiKeys, setApiKeys] = useState<APIKeyConfig[]>(currentKeys);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  const [newKey, setNewKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (isOpen) {
      setApiKeys(currentKeys);
      // Initialize show/hide state for existing keys
      const showState: { [key: string]: boolean } = {};
      currentKeys.forEach(key => {
        showState[key.provider] = false;
      });
      setShowKeys(showState);
    }
  }, [isOpen, currentKeys]);

  const handleAddKey = () => {
    if (!selectedProvider || !newKey.trim()) return;

    const newApiKey: APIKeyConfig = {
      provider: selectedProvider,
      apiKey: newKey.trim(),
      isActive: true,
      usageCount: 0,
    };

    setApiKeys(prev => [
      ...prev.filter(k => k.provider !== selectedProvider),
      newApiKey,
    ]);
    setNewKey('');
    setSelectedProvider('');
    setShowKeys(prev => ({ ...prev, [selectedProvider]: false }));
  };

  const handleRemoveKey = (provider: string) => {
    setApiKeys(prev => prev.filter(k => k.provider !== provider));
    setShowKeys(prev => {
      const newState = { ...prev };
      delete newState[provider];
      return newState;
    });
  };

  const handleToggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleValidateKey = async (provider: string, apiKey: string) => {
    setIsValidating(true);
    try {
      // Here you would call your LLM service to validate the key
      // For now, we'll simulate validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const isValid = apiKey.length > 10; // Simple validation
      setValidationResults(prev => ({ ...prev, [provider]: isValid }));
    } catch (error) {
      setValidationResults(prev => ({ ...prev, [provider]: false }));
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    onSave(apiKeys);
    onClose();
  };

  const getProviderInfo = (providerId: string) => {
    return PROVIDERS.find(p => p.id === providerId);
  };

  const formatUsageCount = (count: number) => {
    if (count === 0) return 'Never used';
    if (count === 1) return 'Used once';
    return `Used ${count} times`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                API Key Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Manage your LLM provider API keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add New Key Section */}
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add New API Key
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="provider-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Provider
                </label>
                <select
                  id="provider-select"
                  value={selectedProvider}
                  onChange={e => setSelectedProvider(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a provider</option>
                  {PROVIDERS.filter(p => p.id !== 'ollama').map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} - {provider.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="api-key-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  API Key
                </label>
                <div className="relative">
                  <input
                    id="api-key-input"
                    type="password"
                    value={newKey}
                    onChange={e => setNewKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAddKey}
                disabled={!selectedProvider || !newKey.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Key</span>
              </button>
            </div>
          </div>

          {/* Existing Keys */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Your API Keys
            </h3>
            <div className="space-y-4">
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys configured</p>
                  <p className="text-sm">
                    Add your first API key above to get started
                  </p>
                </div>
              ) : (
                apiKeys.map(key => {
                  const providerInfo = getProviderInfo(key.provider);
                  return (
                    <div
                      key={key.provider}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 ${providerInfo?.color} rounded-lg flex items-center justify-center`}
                          >
                            <span className="text-white text-sm font-medium">
                              {providerInfo?.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {providerInfo?.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {providerInfo?.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatUsageCount(key.usageCount)}
                              {key.lastUsed &&
                                ` • Last used ${key.lastUsed.toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Validation Status */}
                          {validationResults[key.provider] !== undefined && (
                            <div className="flex items-center space-x-1">
                              {validationResults[key.provider] ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-xs text-gray-500">
                                {validationResults[key.provider]
                                  ? 'Valid'
                                  : 'Invalid'}
                              </span>
                            </div>
                          )}

                          {/* Show/Hide Key */}
                          <button
                            onClick={() =>
                              handleToggleKeyVisibility(key.provider)
                            }
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            {showKeys[key.provider] ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-500" />
                            )}
                          </button>

                          {/* Validate Key */}
                          <button
                            onClick={() =>
                              handleValidateKey(key.provider, key.apiKey)
                            }
                            disabled={isValidating}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                          >
                            {isValidating ? 'Validating...' : 'Validate'}
                          </button>

                          {/* Remove Key */}
                          <button
                            onClick={() => handleRemoveKey(key.provider)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* API Key Display */}
                      {showKeys[key.provider] && (
                        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-600 rounded">
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                              {key.apiKey.substring(0, 8)}...
                              {key.apiKey.substring(key.apiKey.length - 4)}
                            </code>
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(key.apiKey)
                              }
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Ollama Note */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-medium">i</span>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Local Ollama Setup
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                  For local Ollama models, no API key is required. Simply
                  install Ollama and run{' '}
                  <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">
                    ollama serve
                  </code>{' '}
                  to start the local server.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''} configured
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
