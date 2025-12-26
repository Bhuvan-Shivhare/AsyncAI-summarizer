const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Summarize text using Groq LLM
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} - The generated summary
 * @throws {Error} - If the LLM call fails
 */
async function summarizeTextWithLLM(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a non-empty string');
    }

    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "system",
                    "content": 'You are a professional summarizer. Create a concise, accurate summary of the text provided by the user in 5-7 sentences.'
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            "model": "llama-3.1-8b-instant",
            "temperature": 1,
            "max_completion_tokens": 1024,
            "top_p": 1,
            "stream": true,
            "stop": null
        });

        let summary = '';
        for await (const chunk of chatCompletion) {
            summary += chunk.choices[0]?.delta?.content || '';
        }

        if (!summary) {
            throw new Error('LLM returned empty summary');
        }

        return summary;
    } catch (error) {
        console.error('LLM Generation Error:', error);
        throw new Error(`LLM summarization failed: ${error.message}`);
    }
}

module.exports = {
    summarizeTextWithLLM,
};
