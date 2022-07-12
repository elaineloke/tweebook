src="https://code.jquery.com/jquery-3.6.0.min.js";
var tweetDraft = src="./tweet-draft.js"

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

async function postTweet(event) {
    
    var tweet = textArea.value;
    var data = {text: tweet};

    if ($("#previewImage").is(':checked')) {
        var image = document.getElementById("image-template");
        var canvas = await html2canvas(image);
        data.image = canvas.toDataURL();
    } 
    
    var response = await fetch('/postTweet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), 
        });

    var text = await response.text();
        
        console.log(text);
        if(text == "success") {
            tweetSuccess();
        }
        if(text == "error") {
            tweetFail();
        }

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
            bookTable.clear();
            var imageDiv = document.getElementById("book-api-div");
            imageDiv.style.display = "block";

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
                const rowData = row.data();
                if(!rowData){
                    return;
                }

                createRandomTweetDraft(rowData);
                renderImageTemplate(rowData);

                var imageDiv = document.getElementById("image-div");
                imageDiv.style.display = "block";
            })
        })
}


function getFinalImageTemplate() {

    var image = document.getElementById("image-template");
    var preview = html2canvas(image).
        then(function (canvas) {
            var tweetImage = document.createElement("img");
            tweetImage.src = canvas.toDataURL();
        }); 

}

