const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCard = document.querySelector('.quote-card');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const carousel = document.getElementById('carousel');
const loadingText = document.getElementById('loadingText');
const tabsContainer = document.querySelector('.tabs');

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

        setAllTabActive();

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
    if (!filteredQuotes.length) {
        quoteText.textContent = 'No quotes available';
        quoteAuthor.textContent = '';
        return;
    }

    quoteCard.style.opacity = '0';

    setTimeout(() => {
        const q = filteredQuotes[currentIndex];
        quoteText.textContent = q.text;
        quoteAuthor.textContent = `— ${q.author}`;
        quoteCard.style.opacity = '1';
    }, 300);
}

tabsContainer.addEventListener('click', async (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;

    const tag = tab.dataset.tag;

    if (e.target.classList.contains('fa-x')) {
        e.stopPropagation();
        if (tag === 'all') return;

        await fetch(`/tags/${tag}`, { method: 'DELETE' });

        tab.remove();
        allQuotes = allQuotes.filter(q => !q.tags.includes(tag));
        applyFilters();
        restartAutoPlay();
        return;
    }

    if (tag === 'all') {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filteredQuotes = allQuotes;
    } else {
        const allTab = document.querySelector('[data-tag="all"]');
        if (allTab) allTab.classList.remove('active');

        tab.classList.toggle('active');
        applyFilters();
    }

    currentIndex = 0;
    showQuote();
    restartAutoPlay();
});

function applyFilters() {
    const activeTabs = document.querySelectorAll('.tab.active');
    const activeTags = Array.from(activeTabs).map(tab => tab.dataset.tag);

    if (activeTags.length === 0) {
        filteredQuotes = allQuotes;
        setAllTabActive();
    } else {
        filteredQuotes = allQuotes.filter(q =>
            q.tags.some(tag => activeTags.includes(tag))
        );
    }

    currentIndex = 0;
    showQuote();
}

function setAllTabActive() {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const allTab = document.querySelector('[data-tag="all"]');
    if (allTab) allTab.classList.add('active');
}

nextBtn.addEventListener('click', nextQuote);
prevBtn.addEventListener('click', prevQuote);

function nextQuote() {
    if (filteredQuotes.length <= 1) return;
    currentIndex = (currentIndex + 1) % filteredQuotes.length;
    showQuote();
}

function prevQuote() {
    if (filteredQuotes.length <= 1) return;
    currentIndex = (currentIndex - 1 + filteredQuotes.length) % filteredQuotes.length;
    showQuote();
}

function startAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(nextQuote, 5000);
}

function restartAutoPlay() {
    startAutoPlay();
}

quoteCard.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
quoteCard.addEventListener('mouseleave', startAutoPlay);
