const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/openai/chat', async (req, res) => {
  const { messages, model = 'gpt-4', max_tokens = 1000, temperature = 0.7 } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens,
      temperature,
    });
    res.json(completion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`OpenAI proxy server running on port ${PORT}`)); 