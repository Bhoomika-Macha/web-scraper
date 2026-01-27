//Import required libraries
const axios = require('axios')
const cheerio = require('cheerio')

const scrapeData = async (url) => {
    try {
        //Make a HTTP GET request to the URL
        const response = await axios.get(url);

        //use cherrio to parse the HTML content
        const $ = cheerio.load(response.data)

        //Extract quotes and their authors
        const quotes = [];
        $('.quote').each((index, element)=> {
            const text = $(element).find('.text').text().trim(); //Quote text
            const author = $(element).find('.author').text().trim(); //Author name

        const tags = [];
        $(element).find('.tags .tag').each((index, tag) => {
            tags.push($(tag).text().trim());
        });

            quotes.push({text, author, tags});
        });
        console.log('Scraped Quotes:', quotes);
    } catch (error) {
        console.error('Error Fetching the url: ', error.message);
    }
}

//Function for rate-limitied scraping
const scrapeWithRateLimit = async (urls, delay) =>{
    for(const url of urls){
        console.log(`Scraping: ${url}`);
        await scrapeData(url);
        console.log(`Waiting ${delay}ms before the next request`);
        await new Promise(resolve => setTimeout(resolve, delay)); //Delay
    }
}

//Example usage 
const urlsToScope = [
    'https://quotes.toscrape.com/page/1/',
    'https://quotes.toscrape.com/page/2/',
    'https://quotes.toscrape.com/page/3/',
    'https://quotes.toscrape.com/page/4/'
];

const rateLimitDealy = 2000; //2-seconds delay between requests
scrapeWithRateLimit(urlsToScope, rateLimitDealy);