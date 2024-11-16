import express from 'express'; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import cors from 'cors';  // Import the cors package

const app = express();
dotenv.config();

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API key not found. Please set the API_KEY environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const generationConfig = { temperature: 0.9, topP: 1, topK: 1, maxOutputTokens: 4096 };

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig });

// Middleware to parse JSON request body
app.use(express.json());

// Enable CORS for all origins (this allows all domains to access your API)
app.use(cors());

// Function to generate a response based on the prompt
async function generateResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();  // Return the generated text
  } catch (error) {
    console.error('Error generating content: ', error);
    throw error;  // Rethrow error to be handled in the route
  }
}

// POST route to generate a response based on the prompt sent in the request body
app.post('/api/generate', async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const responseText = await generateResponse(prompt);
    res.json({ response: responseText });
  } catch (error) {
    console.error('Error generating content: ', error);
    res.status(500).json({ error: 'Error generating response' });
  }
});

// Start the Express server
const port = process.env.PORT || 5000;  // Use port 5000 or from environment
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
