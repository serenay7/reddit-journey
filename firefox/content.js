// content.js
(function() {
    function isValidSubreddit(url = window.location.href) {
        return /^https:\/\/(www\.)?reddit\.com\/r\/[^\/]+\/?$/.test(url);
    }

    function sendSubredditInfo() {
        if (isValidSubreddit()) {
            const title = document.querySelector('h1').innerText; // Assuming the subreddit title is in an <h1> tag
            const url = window.location.href;
            const parent = document.referrer.includes("reddit.com/r/") && isValidSubreddit(document.referrer) ? document.referrer : null;

            browser.runtime.sendMessage({
                action: "storeVisit",
                subreddit: { title, url, parent }
            });
        }
    }

    // Execute when the script loads
    sendSubredditInfo();

    // Optionally, listen for navigation changes (e.g., clicking on links)
    window.addEventListener('click', sendSubredditInfo);
})();
