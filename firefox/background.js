// background.js

let articlesTree = {};
let lastJourneyDate = '';

// Convert date to local ISO string (YYYY-MM-DD)
function toLocalISOString(date) {
    var localOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    var localTime = new Date(date.getTime() - localOffset);
    return localTime.toISOString().split('T')[0];
}

// Add article to the tree
function addArticleToTree(title, url, parentUrl) {
    if (!parentUrl) {
        // Root article
        articlesTree[url] = articlesTree[url] || { title, children: {} };
    } else {
        // Search for parent node
        const parentNode = findParentNode(articlesTree, parentUrl);
        if (parentNode) {
            // Add under parent
            parentNode.children[url] = parentNode.children[url] || { title, children: {} };
        } else {
            // If parent not found, treat as root article
            articlesTree[url] = articlesTree[url] || { title, children: {} };
        }
    }
    // Save updated tree to storage
    saveCurrentDayJourney();
}

// Find parent node in the tree
function findParentNode(tree, parentUrl) {
    for (const url in tree) {
        if (url === parentUrl) {
            return tree[url];
        }
        const foundInChildren = findParentNode(tree[url].children, parentUrl);
        if (foundInChildren) {
            return foundInChildren;
        }
    }
    return null;
}

// Handle incoming messages
async function handleMessage(request, sender, sendResponse) {
    if (request.article) {
        await checkNewDay(); // Ensure this completes before proceeding
        const { title, url, parent } = request.article;
        addArticleToTree(title, url, parent);
    }
}

// Save current day's journey to storage
function saveCurrentDayJourney() {
    const dateString = toLocalISOString(new Date());
    const key = `journey_${dateString}`;
    browser.storage.local.set({ [key]: articlesTree });
}

// Load the articles tree from storage or start a new one each day
function loadOrInitializeTree() {
    const dateString = toLocalISOString(new Date());
    const key = `journey_${dateString}`;
    browser.storage.local.get([key], (result) => {
        if (result[key]) {
            articlesTree = result[key];
        } else {
            articlesTree = {}; // If no entry for today, start a new tree
            browser.storage.local.set({ [key]: articlesTree });
        }
    });
}

// Check if a new day has started
function checkNewDay() {
    const dateString = toLocalISOString(new Date());
    const key = `journey_${dateString}`;
    return new Promise((resolve, reject) => {
        browser.storage.local.get([key], (result) => {
            if (result[key]) {
                articlesTree = result[key];
                resolve();
            } else {
                articlesTree = {}; // If no entry for today, start a new tree
                browser.storage.local.set({ [key]: articlesTree }, resolve);
            }
        });
    });
}

// Initial load
loadOrInitializeTree();

// Listen for messages
browser.runtime.onMessage.addListener(handleMessage);