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

function postScheduledTweetWithoutMedia(body, date, twitterClient, file){
    setTimeout(() => {
        twitterClient.post('statuses/update', {status: body}, function(err, data, response){
          console.log("tweeted");
          var updatedScheduledTweets = filterOldTweets(file);
          var content = JSON.stringify(updatedScheduledTweets);
          fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content);
        })
      }, millisecondsUntil(date));
}


function postScheduledTweetWithMedia (body, image, date, twitterClient, file) {
    setTimeout( () => {
        twitterClient.post('media/upload', { media_data: image }, function (err, data, response) {
          var mediaIdStr = data.media_id_string
          var altText = body
          var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
    
          twitterClient.post('media/metadata/create', meta_params, function (err, data, response) {
            if (!err) {
              var params = { status: body, media_ids: [mediaIdStr] }
      
              twitterClient.post('statuses/update', params, function (err, data, response) {
                  console.log("tweeted");
                  var updatedScheduledTweets = filterOldTweets(file);
                  var content = JSON.stringify(updatedScheduledTweets);
                  fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content);
              })
            }
          })
        })
    }, millisecondsUntil(date));
}

function loadSchedulingFile() {
  var fileExists = fs.existsSync(__dirname +'/tmp/scheduling.txt');
  var file = [];
  if(fileExists){
    var data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8');
    file = JSON.parse(data);
  }
}

module.exports = {millisecondsUntil, postScheduledTweetWithoutMedia, filterOldTweets, postScheduledTweetWithMedia, loadSchedulingFile};


