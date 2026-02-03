// Import required libraries
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(express.static('frontend'));
const PORT = process.env.PORT || 3000;

// Tags we want to filter
const ALLOWED_TAGS = [
    'inspirational',
    'life',
    'humor',
    'books',
    'reading',
    'friendship',
    'friends',
    'love',
    'truth',
    'simile'
];

const scrapeData = async (url) => {
    try {
        // Make an HTTP GET request to the URL
        const response = await axios.get(url);

        // Load the HTML into Cheerio
        const $ = cheerio.load(response.data);

        // Array to store filtered quotes from this page
        const quotes = [];

        $('.quote').each((index, element) => {

            // Get quote text
            const text = $(element).find('.text').text().trim();

            // Get author name
            const author = $(element).find('.author').text().trim();

            // Get all tags for this quote
            const tags = [];
            $(element).find('.tags .tag').each((i, tag) => {
                tags.push($(tag).text().trim().toLowerCase());
            });

            // CHECK: does this quote contain any allowed tag?
            const hasAllowedTag = tags.some(tag =>
                ALLOWED_TAGS.includes(tag)
            );

            // Only push quote if tag matches
            if (hasAllowedTag) {
                quotes.push({ text, author, tags });
            }
        });

        return quotes; // Return filtered quotes

    } catch (error) {
        console.error('Error Fetching the URL:', error.message);
        return [];
    }
};

// RATE-LIMITED SCRAPING FUNCTION
const scrapeWithRateLimit = async (urls, delay) => {
    const allQuotes = [];

    for (const url of urls) {
        console.log(`Scraping: ${url}`);

        const pageQuotes = await scrapeData(url);
        allQuotes.push(...pageQuotes);

        console.log(`Waiting ${delay}ms before the next request`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    return allQuotes;
};

// API Endpoint
app.get('/scrape', async (req, res) => {
    try {
        const urls = [
            'https://quotes.toscrape.com/page/1/',
            'https://quotes.toscrape.com/page/2/',
            'https://quotes.toscrape.com/page/3/',
            'https://quotes.toscrape.com/page/4/'
        ];

        const delay = 2000;
        const quotes = await scrapeWithRateLimit(urls, delay);

        res.json({
            status: 'success',
            count: quotes.length,
            filteredBy: ALLOWED_TAGS,
            data: {
                quotes
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port${PORT}`);
});
