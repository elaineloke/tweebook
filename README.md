# TweeBook
## Easy Twitter Content Creation and Management
Tweebook is a web application built for books related society such as libraries and book clubs. It provides easy Twitter account management with its hashtag viewing tool and automated tweet content creation to share, promote and/or advertise books available online. <br><br>

Social media is a great tool for marketing and promotion, however, it can be time consuming to create contents every single day. Tweebook delivers some key features to support tweets curation, such as: <br>
- retrieving metadata of books available online (currently using Open Library books API only) 
- one-click curation of tweet draft 
- image generator to make tweets more appealing and informative. [Tweets with images get 3X more engagement than those without.](https://rethinkmedia.org/blog/how-using-images-greatly-improves-your-twitter-engagement#:~:text=to%20your%20Tweets%3F-,It's%20simple%3A%20add%20images.,favorites%20is%20by%20engagement%20rate.)
- hashtag viewing tool allows users to search for related terms and hashtags on Twitter, and interact with them with retweeting and favouriting functions
<br>

## Tweebook Is Built With
- NodeJS
- ExpressJS 
- EJS
- MongoDB
- jQuery
- Bootstrap
- Twitter-api-v2 library 
- [Flatpickr](https://flatpickr.js.org/)
- [Twit](https://github.com/ttezel/twit)
- [Font Awesome](https://fontawesome.com/)

### To Build
Initialise on port 3000 <br>
```npm run start``` <br>
The server will connect to MongoDB and automatically open a web browser window to request permission to read and write for your Twitter profile. You must sign in and authenticate the app to proceed. After authorising the app, you will be directed to http://localhost:3000/.

### Unit tests
Unit tests are stored in the tests/ folder and labeled with *-test.js<br>
```npm test``` will run all unit tests