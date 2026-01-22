const axios = require("axios");
const cheerio = require("cheerio");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// async function scrapeMultiplePages() {
//     const urls = [
//         "https://example.com",
//         "https://example.com",
//         "https://example.com"
//     ];

//     for (let i = 0; i < urls.length; i++) {
//         try {
//             console.log(`Scraping page ${i + 1}...`);

//             await sleep(2000); // rate limit

//             const response = await axios.get(urls[i]);
//             const $ = cheerio.load(response.data);

//             const title = $("h1").text();
//             console.log("Title:", title);
//             console.log("----------------------");

//         } catch (error) {
//             console.log("Error scraping page:", error.message);
//         }
//     }
// }

async function scrapeMultiplePages() {
    const urls = [
        "https://example.com",
        "https://example.com",
        "https://example.com"
    ];

    const results = [];

    for (let i = 0; i < urls.length; i++) {
        try {
            await sleep(2000);

            const response = await axios.get(urls[i]);
            const $ = cheerio.load(response.data);

            const title = $("h1").text();

            results.push({
                url: urls[i],
                title: title
            });

        } catch (error) {
            console.log("Error:", error.message);
        }
    }

    console.log("Final scraped data:", results);
}

scrapeMultiplePages();
