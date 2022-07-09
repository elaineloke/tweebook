src="https://code.jquery.com/jquery-3.6.0.min.js";

function retweetTweet(btn) {
    var cardBody = btn.parentNode.parentNode;
    var spanWithId = cardBody.querySelector(".tweetId");
    var tweetId = spanWithId.innerText;

    fetch('/retweet?id=' + tweetId).
        then(response => response.text()).
        then(text => console.log(text));

    $("#tweets").click(function(){
        $(this).find(btn).css('color','green');
    });
}


function favTweet(btn) {
    var cardBody = btn.parentNode.parentNode;
    var spanWithId = cardBody.querySelector(".tweetId");
    var tweetId = spanWithId.innerText;

    fetch('/favtweet?id=' + tweetId).
        then(response => response.text()).
        then(text => console.log(text));

    $("#tweets").click(function(){
        $(this).find(btn).css('color','red');
    });    
}

function tweetSuccess() {
    const toastShow = document.getElementById('tweeted')
        const toast = new bootstrap.Toast(toastShow, {delay: 3000});
        toast.show();           
}

function tweetFail() {
const toastShow = document.getElementById('tweetFail')
    const toast = new bootstrap.Toast(toastShow, {delay: 3000});
    toast.show();           
}

function postTweet(event) {
    var tweet = textArea.value;
    var data = {text: tweet};
    
    fetch('/postTweet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), 
        }).
        then(response => response.text()).
        then(text => {
            console.log(text);
            if(text == "success") {
                tweetSuccess();
            }
            if(text == "error") {
                tweetFail();
            }
        });

    $("#tweet-area").val('');
    countChar();
}

function scheduleTweet(event) {
    var tweet = textArea.value;
    var data = {text: tweet};

    var calendar = document.querySelector("#calendar");
    var calendarVal = calendar.value;
    var datetime = {text: calendarVal};

    var scheduledTweet = {body: data.text, date: datetime.text};

    if(tweet == '' || calendarVal == ''){
        console.log("error");
        return("error");
    } else {
    fetch('/scheduleTweet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduledTweet), 
        }).
        then(response => response.text()).
        then(text => console.log(text));

    var scheduledContainer = document.getElementById("scheduledTweetContainer");
    scheduledContainer.innerHTML += '<div class="col-sm-12"><div class="card mb-3">' +
        '<div class="card-body">' +
        '<h6 class="card-subtitle mb-2 text-muted scheduledDate">' + scheduledTweet.date + '</h6>' +
        '<p class="card-text scheduledBody">' + scheduledTweet.body + '</p>' +
        '<p class="card-text"><span onclick="deleteScheduledTweet(this)" class="retweetButton" style="cursor: pointer"><i class="fas fa-trash" style="cursor: pointer"></i> Delete</span> '+ 
        '</div>' +
        '</div>' +
        '</div>';

    $("#tweet-area").val('');
    countChar();
    }
}

function deleteScheduledTweet(btn) {
    var cardBody = btn.parentNode.parentNode;
    var spanWithId = cardBody.querySelector(".scheduledDate");
    var scheduledDate = spanWithId.innerText;

    var cardBodyB = btn.parentNode.parentNode;
    var spanWithIdB = cardBodyB.querySelector(".scheduledBody");
    var scheduledBody = spanWithIdB.innerText;

    fetch('/deleteScheduledTweet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({body: scheduledBody, date: scheduledDate}), 
        }).
        then(response => response.text()).
        then(text => console.log(text));
    cardBody.parentNode.parentNode.remove();
}

function loadIntoTable(url) {
    fetch(url).
        then((data) => {
            return data.json();
        }).
        then((objectData) => {
            console.log(objectData);
            bookTable.clear();

            var tableData = objectData.docs.map((book) => {
                var arr = [
                    book.title,
                    book.author_name[0],
                    book.first_publish_year,
                    book.first_sentence ? book.first_sentence : ''
                ];
                arr.book = book;
                return arr;
            });

            bookTable.rows.add(tableData).draw();

            $('#api-body').on('click', 'tr', function () {
                const tr = $(this).closest('tr');
                const row = bookTable.row(tr);
                if(!row.data()){
                    return;
                }

                var bookLink = " https://openlibrary.org" + row.data().book.key;

                var tweetDraft = 
                [
                    "Check out " + row.data()[0] + " written by " + row.data()[1] + "!" + bookLink, 
                    "Looking for your next book? Why not pick " + row.data()[0] + " written by " + row.data()[1] + "!" + bookLink,
                    "Today's read: " + row.data()[0] + " written by " + row.data()[1] + "." + bookLink,
                    "A cuppa coffee while reading " + row.data()[0] + " written by " + row.data()[1] + "." + bookLink,
                    row.data()[0] + " written by " + row.data()[1] + " is our new fav read! Check it out." + bookLink,
                    "What's on your to-read list today? Ours is " + row.data()[0] + " written by " + row.data()[1] + "!" + bookLink, 
                    "Onto your next reading adventure with " + row.data()[0] + " written by " + row.data()[1] + "!" + bookLink, 
                    "Interested in reading " + row.data()[0] + " written by " + row.data()[1] + "?" + " We've got it at Open Library!" + bookLink,
                ]
                var randomTweetDraft = tweetDraft[Math.floor(Math.random() * tweetDraft.length)];

                $('#tweet-area').val(randomTweetDraft);
                countChar();

                
            })
        })
}



