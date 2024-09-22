export const parseTweets = (text) => {
    const lines = text.split("\n");

    // Skip the first line and extract header information
    const [partnerName, partnerHandle, _] = lines.slice(1, 4);

    // Join the remaining lines for tweet parsing
    const tweetContent = lines.slice(4).join("\n");

    // Create a regex to match individual tweets
    const tweetRegex = /·\n(.*?)\n([\s\S]*?)(?=\n·\n|$)/g;

    let tweets = [];
    let currentYear = new Date().getFullYear();
    let lastKnownYear = currentYear;
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    let match;
    while ((match = tweetRegex.exec(tweetContent)) !== null) {
        let [, date, content] = match;
        date = date.trim();

        // Interpolate year if missing
        if (!date.includes(",")) {
            const [month, day] = date.split(" ");
            const monthIndex = months.indexOf(month);

            // If the month is later in the year than current month, assume it's from last year
            if (monthIndex > new Date().getMonth()) {
                lastKnownYear--;
            }

            date = `${month} ${day}, ${lastKnownYear}`;
        } else {
            // If the date includes a year, update the lastKnownYear
            lastKnownYear = parseInt(date.split(", ")[1]);
        }

        // Remove new lines and extra whitespace from content
        content = content.replace(/\s+/g, " ").trim();

        tweets.push({
            date: date,
            content: content,
        });
    }

    return {
        partnerName: partnerName.trim(),
        partnerHandle: partnerHandle.trim(),
        tweets: tweets.filter(tweet => {
            const date = new Date(tweet.date);
            return !isNaN(date.getTime());
        }).sort((a, b) => new Date(b.date) - new Date(a.date))
    };
};
