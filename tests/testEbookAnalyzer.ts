/**
 * Test file for eBook Analyzer Service
 * Tests the analyzeSection() function with sample text
 */

import { analyzeSection } from "../src/services/ebookAnalyzer";

// CLI Banner
console.log("🧪 Running eBook Section Analysis Test");
console.log("=" .repeat(50));

// Sample text for analysis
const sampleText = `
  The rise of artificial intelligence in education has transformed traditional classrooms into adaptive learning environments.
  Students now interact with intelligent tutors, personalized content, and AI-driven feedback systems.
  However, these innovations also raise ethical concerns and accessibility challenges.
`;

async function runTest() {
  try {
    console.log("📝 Analyzing sample text...");
    console.log("Text:", sampleText.trim());
    console.log("\n" + "-".repeat(50));
    
    const result = await analyzeSection(sampleText);
    
    console.log("📘 Section Analysis Results:");
    console.log(JSON.stringify(result, null, 2));
    
    console.log("\n" + "=" .repeat(50));
    console.log("✅ Test completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.log("\n💡 Make sure to set VITE_OPENAI_API_KEY in your .env.local file");
  }
}

// Check for API key
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.log("⚠️  Warning: VITE_OPENAI_API_KEY not found");
  console.log("   The test will use fallback analysis");
  console.log("   Add your OpenAI API key to .env.local for full functionality");
  console.log("\n" + "-".repeat(50));
}

runTest(); 