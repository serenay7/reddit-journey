function isValidSubreddit() {
    // Check if the URL follows the typical pattern for subreddit pages
    // This regex matches subreddit pages but excludes special Reddit pages, user pages, etc.
    const urlRegex = /^https?:\/\/(www\.)?reddit\.com\/r\/[^\/]+\/?$/;
    return urlRegex.test(window.location.href);
}

function sendSubredditInfo() {
    if (isValidSubreddit()) {
        const title = document.querySelector('h1').innerText; // Assuming the subreddit title is in an <h1> tag
        const url = window.location.href;
        const parent = document.referrer.includes("reddit.com/r/") && isValidSubreddit(document.referrer) ? document.referrer : null;

        browser.runtime.sendMessage({
            subreddit: { title, url, parent }
        });
    }
}

// Execute when the script loads
sendSubredditInfo();