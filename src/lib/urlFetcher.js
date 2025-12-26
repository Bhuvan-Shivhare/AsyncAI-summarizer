const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetch URL content and extract readable text
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} - Extracted text content
 * @throws {Error} - If fetch or parsing fails
 */
async function fetchURLContent(url) {
    if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL: must be a non-empty string');
    }

    try {
        // Fetch HTML content with timeout
        const response = await axios.get(url, {
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ContentSummarizer/1.0)',
            },
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 300,
        });

        const html = response.data;

        // Extract text from HTML
        const text = extractTextFromHTML(html);

        if (!text || text.trim().length === 0) {
            throw new Error('No readable text found in webpage');
        }

        return text;
    } catch (error) {
        // Handle specific errors
        if (error.code === 'ENOTFOUND') {
            throw new Error('URL not found or DNS resolution failed');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            throw new Error('Request timeout');
        } else if (error.response) {
            throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
        }

        throw new Error(`Failed to fetch URL: ${error.message}`);
    }
}

/**
 * Extract clean text from HTML
 * @param {string} html - HTML content
 * @returns {string} - Extracted and cleaned text
 */
function extractTextFromHTML(html) {
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, noscript, iframe, svg, nav, header, footer, aside').remove();

    // Extract text from body (or full HTML if no body tag)
    const body = $('body').length > 0 ? $('body') : $.root();
    let text = body.text();

    // Clean text
    text = text
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n+/g, '\n') // Normalize newlines
        .trim();

    // Limit content length to 4000 characters for LLM cost control
    const MAX_LENGTH = 4000;
    if (text.length > MAX_LENGTH) {
        text = text.substring(0, MAX_LENGTH) + '...';
    }

    return text;
}

module.exports = {
    fetchURLContent,
    extractTextFromHTML,
};
