const express = require('express')
const app = express()
const path = require('path')

const twit = require("twit")
const bodyParser = require('body-parser')
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());

//start serv & listen on port 3000.
app.listen(3000, function () {
  console.log('Node listening on port 3000')
})

//listen for get request for hashtag and twitter data
app.get('/', function (req, res) {
  res.render('index',  {
    hashtag: null, 
    twitterData: null, 
    tweetbox: null
  });
})


//listen for get request on root url. eg. http://localhost:3000
app.set('view engine', 'ejs')


//connect to Twitter profile
let Twitter = new twit({
  consumer_key: 'OfmDdnZrNe68Otrz3a14XfCu6',
  consumer_secret: 'qyaT2USeBZtw0BYVQGVl3SUOzyzYbUVHnyscs5gdwIb4KidV0R',
  access_token: '1487423447504498688-geVD4HEkyXQCctUFQTC34uQg4s48Qe',
  access_token_secret: 'dj7MgryefjKWiLeydLQmvUAnIOmAxryTvMlTsLauG0vdc',
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
});
  
//retrieve and display results 
app.post('/', function (req, res) {

  if (req.body.hashtag !== null) {

  Twitter.get('search/tweets', {
    q: req.body.hashtag, 
    count: 100,
    result_type: "mixed" 

  }).catch(function (err) {
    console.log('caught error', err.stack)
    res.render('index', {
        hashtag: null,
        twitterData: null,
        error: err.stack
    });
  }).then(function (result) {
  //render the index page passing in the hashtag and the Twitter API results
    res.render('index', {
        hashtag: req.body.hashtag, 
        twitterData: result.data,
        error: null
    });
  });
  }
});

//post tweets
app.post('/postTweet', function (req, res) {

  Twitter.post('statuses/update', {status: req.body.text}, function(err, data, response){
    if(err){
      res.send("error");
    } else {
      console.log("tweeted");
      res.send("success");
  }
  })
});

//schedule tweets
app.post('/scheduleTweet', function (req, res) {

  var tweet = req.body;
  var fileExists = fs.existsSync(__dirname +'/tmp/scheduling.txt');
  
  if(fileExists){
    try {
      var data = fs.readFileSync(__dirname +'/tmp/scheduling.txt', 'utf-8');
      const file = JSON.parse(data);
      file.push(tweet);
      console.log(file);

      var content = JSON.stringify(file);
      fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content);
    } catch (err) {
      console.log('Error parsing', err);
    }
  }

  if(!fileExists){
    try {
      const file = [];
      file.push(tweet);
      console.log(file);

      var content = JSON.stringify(file);
      fs.writeFileSync(__dirname +'/tmp/scheduling.txt', content);
    } catch (err) {
      console.log('Error parsing', err);
    }
  }

})

//retweet tweet to profile when clicked 
app.get('/retweet', function (req, res) {
  Twitter.post('statuses/retweet/:id', {id: req.query.id}, function(err, response){
    if(response){
      console.log("retweeted");
    }
    if(err){
      console.log("error with retweeting");
    }
  })
});

//favorite tweet on profile when clicked 
app.get('/favtweet', function (req, res) {
  Twitter.post('favorites/create', {id: req.query.id}, function(err, response){
    if(response){
      console.log("favorited");
    }
    if(err){
      console.log("error with favoriting");
    }
  })
});


