import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { getOpenAIApiKey } from '../utils/supabaseClient.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get documentation content for AI context
function getDocumentationContext() {
  const docsPath = path.join(__dirname, '../../../docs');
  const assetsPath = path.join(__dirname, '../../../frontend/public/assets');

  let context = '';

  // Read docs files
  const docFiles = ['PRD.md', 'CUSTOMER_OEM_FACILITY_MODULES.md', 'BACKUP_SYSTEM.md'];
  docFiles.forEach(file => {
    try {
      const filePath = path.join(docsPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        context += `\n=== ${file} ===\n${content}\n`;
      }
    } catch (error) {
      console.warn(`Failed to read ${file}:`, error.message);
    }
  });

  // Read assets files
  try {
    const readmePath = path.join(assetsPath, 'README.txt');
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf8');
      context += `\n=== README.txt (Assets) ===\n${content}\n`;
    }
  } catch (error) {
    console.warn('Failed to read assets README:', error.message);
  }

  return context;
}

// POST /api/oem/ask-ai - Ask AI questions about BridgeLineUSA
router.post('/ask-ai', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Question is required and must be a string'
      });
    }

    // Get OpenAI API key
    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'AI service is not configured. Please contact your administrator.'
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Get documentation context
    const documentationContext = getDocumentationContext();

    // Create the prompt with context
    const systemPrompt = `You are an AI assistant for BridgeLineUSA, a manufacturing operations and collaboration platform.

You have access to the following documentation about BridgeLineUSA:
${documentationContext}

When answering questions:
1. Be helpful, professional, and focused on BridgeLineUSA's capabilities
2. Reference specific features, modules, or processes from the documentation when relevant
3. If the question is about OEM functionality, emphasize transparency, real-time tracking, and collaboration
4. Keep answers concise but informative
5. If you don't have specific information in the provided context, say so rather than making assumptions
6. Always maintain a positive, solution-oriented tone

BridgeLineUSA connects OEMs with manufacturers through:
- Quote management and approval workflows
- Real-time production tracking and router visibility
- Quality assurance with digital signatures
- AI-powered insights and automation
- Comprehensive analytics and reporting`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using a cost-effective model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const answer = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try rephrasing your question.';

      res.json({
        success: true,
        answer: answer.trim()
      });

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      res.status(500).json({
        success: false,
        error: 'AI service temporarily unavailable. Please try again later.'
      });
    }

  } catch (error) {
    console.error('OEM AI chat error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    });
  }
});

export default router;