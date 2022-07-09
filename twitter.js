const fs = require('fs');

function convertToMilliseconds(dateStr) {
    var dateObj = new Date(dateStr);
    var dateMS = dateObj.getTime();
    return dateMS;
}

function millisecondsUntil(dateStr) {
    var milliseconds = convertToMilliseconds(dateStr);
    return milliseconds - Date.now();
}

function filterOldTweets(tweets){
    var updatedScheduledTweets = [];
    for(let i=0; i < tweets.length; i++) {
        var date = tweets[i].date;
        if(millisecondsUntil(date) > 0) {
            updatedScheduledTweets.push(tweets[i]);
        }   
    }
    return updatedScheduledTweets;
}

function postTweetAtScheduledTime(body, date, twitterClient, file){
    setTimeout(() => {
        twitterClient.post('statuses/update', {status: body}, function(err, data, response){
          console.log("tweeted");
          var updatedScheduledTweets = filterOldTweets(file);
          var content = JSON.stringify(updatedScheduledTweets);
          fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content);
        })
      }, millisecondsUntil(date));
}

module.exports = {millisecondsUntil, postTweetAtScheduledTime, filterOldTweets};

