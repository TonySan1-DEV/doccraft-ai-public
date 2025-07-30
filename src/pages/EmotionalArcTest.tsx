// MCP Context Block
/*
{
  file: "EmotionalArcTest.tsx",
  role: "developer",
  allowedActions: ["analyze", "simulate", "visualize", "suggest"],
  tier: "Pro",
  contentSensitivity: "medium",
  theme: "writing_suite"
}
*/

import { useState } from 'react';
import EmotionalArcModule from '../components/EmotionalArcModule';
import { useMCP } from '../useMCP';

export default function EmotionalArcTest() {
  const mcpContext = useMCP('EmotionalArcTest.tsx');
  
  const [storyText, setStoryText] = useState(`Sarah felt a deep sadness as she walked through the empty house. The memories of her grandmother's laughter echoed in her mind, but now there was only silence. She picked up the old photo album, her hands trembling with emotion.

"Grandma, I miss you so much," she whispered, tears streaming down her face. The pain was almost unbearable, but somehow she found strength in remembering their last conversation.

Suddenly, the doorbell rang, startling her out of her grief. Her heart raced with fear and anticipation. Who could be here at this hour? She wiped her tears and took a deep breath, trying to compose herself.

"Sarah? It's me, your cousin Emma," came a familiar voice through the door. Relief flooded through Sarah's body, and she felt a surge of joy at the unexpected visit. She rushed to open the door, her sadness momentarily forgotten.

"Emma! What are you doing here?" Sarah exclaimed, her voice filled with happiness and surprise. The two cousins embraced, and Sarah felt a warmth she hadn't experienced in days.

"I knew you'd be struggling today," Emma said gently, her eyes filled with love and understanding. "I wanted to be here for you, just like Grandma would have wanted."

Sarah felt overwhelmed with gratitude and love. The sadness was still there, but now it was mixed with hope and comfort. She realized that even in her darkest moments, she wasn't alone.`);

  const [characterIds] = useState(['Sarah', 'Emma']);

  const handleArcUpdate = (arc: any) => {
    console.log('Emotional arc updated:', arc);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Emotional Arc Analysis Test
          </h1>
          <p className="text-gray-600">
            Test the emotional arc modeling system with sample story data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Story Input */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Story Text
              </h2>
              <textarea
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your story text here..."
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Sample Story Features
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Multiple emotional states (sadness, fear, joy, love)</li>
                <li>• Character interactions and dialogue</li>
                <li>• Emotional progression and resolution</li>
                <li>• Tension building and release</li>
                <li>• Empathy-inducing moments</li>
              </ul>
            </div>
          </div>

          {/* Emotional Arc Analysis */}
          <div>
            <EmotionalArcModule
              storyText={storyText}
              characterIds={characterIds}
              onArcUpdate={handleArcUpdate}
              readerProfile={{
                empathyLevel: 70,
                tensionTolerance: 65
              }}
            />
          </div>
        </div>

        {/* MCP Context Display */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            MCP Context Information
          </h3>
          <div className="text-sm text-gray-600">
            <p><strong>Role:</strong> {mcpContext.role}</p>
            <p><strong>Allowed Actions:</strong> {mcpContext.allowedActions.join(', ')}</p>
            <p><strong>Theme:</strong> {mcpContext.theme}</p>
            <p><strong>Tier:</strong> {mcpContext.tier}</p>
            <p><strong>Content Sensitivity:</strong> {mcpContext.contentSensitivity}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 