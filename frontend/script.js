const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCard = document.querySelector('.quote-card');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const tabs = document.querySelectorAll('.tab');
const carousel = document.getElementById('carousel');
const loadingText = document.getElementById('loadingText');

let allQuotes = [];
let filteredQuotes = [];
let currentIndex = 0;
let autoPlayTimer;

carousel.style.display = 'none';
loadingText.style.display = 'block';

window.addEventListener('DOMContentLoaded', fetchQuotes);

async function fetchQuotes() {
    try {
        const response = await fetch('/scrape');
        const result = await response.json();

        allQuotes = result.data.quotes;
        filteredQuotes = allQuotes;
        currentIndex = 0;

        loadingText.style.display = 'none';
        carousel.style.display = 'flex';

        showQuote();
        startAutoPlay();
    } catch (error) {
        loadingText.textContent = 'Failed to load quotes';
        console.error(error);
    }
}

function showQuote() {
    if (!filteredQuotes.length) return;

    quoteCard.style.opacity = '0';

    setTimeout(() => {
        renderQuote(filteredQuotes[currentIndex]);
        quoteCard.style.opacity = '1';
    }, 300);
}

function renderQuote(q) {
    quoteText.textContent = q.text;
    quoteAuthor.textContent = q.author ? `— ${q.author}` : '';
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tag = tab.dataset.tag;
        filteredQuotes = tag === 'all'
            ? allQuotes
            : allQuotes.filter(q => q.tags.includes(tag));

        currentIndex = 0;
        showQuote();
        restartAutoPlay();
    });
});

nextBtn.addEventListener('click', nextQuote);
prevBtn.addEventListener('click', prevQuote);

function nextQuote() {
    currentIndex = (currentIndex + 1) % filteredQuotes.length;
    showQuote();
}

function prevQuote() {
    currentIndex = (currentIndex - 1 + filteredQuotes.length) % filteredQuotes.length;
    showQuote();
}

function startAutoPlay() {
    autoPlayTimer = setInterval(nextQuote, 5000);
}

function restartAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
}

quoteCard.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
quoteCard.addEventListener('mouseleave', startAutoPlay);
