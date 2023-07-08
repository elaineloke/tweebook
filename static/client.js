// retweet tweet
let retweetCount = 0;
let retweetId = 0;

function retweetTweet(btn) {
	let cardBody = btn.parentNode.parentNode;
	let spanWithId = cardBody.querySelector(".tweetId");
	let tweetId = spanWithId.innerText;

	retweetCount++;

	if(retweetCount%2 == 1){
			fetch('/retweet?id=' + tweetId).
			then(response => response.text()).
			then(text => {
					retweetId = text;
			});
			
			$("#tweets").click(function(){
					$(this).find(btn).css('color','green');
			});        
	} 
	if(retweetCount%2 == 0){
			fetch('/undoRetweet?id=' + retweetId).
			then(response => response.text()).
			then(text => console.log(text));

			$("#tweets").click(function(){
					$(this).find(btn).css('color','black');
			});
	}  
}

// like tweet
let favCount = 0;
let favTweetId = 0;

function favTweet(btn) {
	let cardBody = btn.parentNode.parentNode;
	let spanWithId = cardBody.querySelector(".tweetId");
	let tweetId = spanWithId.innerText;

	favCount++;

	if(favCount%2 == 1){
			fetch('/favtweet?id=' + tweetId).
			then(response => response.text()).
			then(text => {
					favTweetId = text;
			});

			$("#tweets").click(function(){
					$(this).find(btn).css('color','red');
			}); 
	}
	if(favCount%2 == 0){
			console.log(favTweetId);
			fetch('/undoFavTweet?id=' + favTweetId).
			then(response => response.text()).
			then(text => console.log(text));

			$("#tweets").click(function(){
					$(this).find(btn).css('color','black');
			});
	}  
		
}

// post tweet
async function postTweet(event) {
	
	let tweet = textArea.value;
	let data = {text: tweet};

	if ($("#previewImage").is(':checked')) {
			let image = document.getElementById("image-template");
			let canvas = await html2canvas(image);
			let canvasURL = canvas.toDataURL().split(',');
			data.image = canvasURL[1];
	} 
	
	let response = await fetch('/postTweet', {
			method: 'POST',
			headers: {
					'Content-Type': 'application/json',
			},
			body: JSON.stringify(data), 
	});

	let text = await response.text();
			
	if(text == "success") {
			tweetSuccess();
	}
	if(text == "error") {
			tweetFail();
	}
	
	resetToDefaultSettings();
}

// schedule tweet
async function scheduleTweet(event) {
	let tweet = textArea.value;
	let data = {text: tweet};

	let calendar = document.querySelector("#calendar");
	let calendarVal = calendar.value;
	let datetime = {text: calendarVal};

	let scheduledTweet = {body: data.text, date: datetime.text};

	if ($("#previewImage").is(':checked')) {
			let image = document.getElementById("image-template");
			let canvas = await html2canvas(image);
			let canvasURL = canvas.toDataURL().split(',');
			scheduledTweet.image = canvasURL[1];
	} 

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
			then(text => {
					console.log(text);
					if(text == "success") {
							scheduleTweetSuccess();
					}
					if(text == "error") {
							scheduleTweetFail();
					}
			});

	let scheduledContainer = document.getElementById("scheduledTweetContainer");

	if(scheduledTweet.image) {
			scheduledContainer.innerHTML += '<div class="col-sm-12"><div class="card mb-3">' +
			'<div class="card-body">' +
			'<h6 class="card-subtitle mb-2 text-muted scheduledDate">' + scheduledTweet.date + '</h6>' +
			'<p class="card-text scheduledBody">' + scheduledTweet.body + '</p>' +
			'<div class="card-text">' + '<img src="data:image/png;base64,' + scheduledTweet.image + '"/ style="width: 400px">' + '</div>' +
			'<p class="card-text"><span onclick="deleteScheduledTweet(this)" class="retweetButton" style="cursor: pointer; color: red; font-size: 12px"><i class="fas fa-trash" style="cursor: pointer"></i> Delete</span> '+ 
			'</div>' +
			'</div>' +
			'</div>';
	} else {
			scheduledContainer.innerHTML += '<div class="col-sm-12"><div class="card mb-3">' +
			'<div class="card-body">' +
			'<h6 class="card-subtitle mb-2 text-muted scheduledDate">' + scheduledTweet.date + '</h6>' +
			'<p class="card-text scheduledBody">' + scheduledTweet.body + '</p>' +
			'<p class="card-text"><span onclick="deleteScheduledTweet(this)" class="retweetButton" style="cursor: pointer; color: red; font-size: 12px"><i class="fas fa-trash" style="cursor: pointer"></i> Delete</span> '+ 
			'</div>' +
			'</div>' +
			'</div>';
	}

	resetToDefaultSettings();
	}
}

// delete scheduled tweet
function deleteScheduledTweet(btn) {
	let cardBody = btn.parentNode.parentNode;
	let spanWithId = cardBody.querySelector(".scheduledDate");
	let scheduledDate = spanWithId.innerText;

	let cardBodyB = btn.parentNode.parentNode;
	let spanWithIdB = cardBodyB.querySelector(".scheduledBody");
	let scheduledBody = spanWithIdB.innerText;
	console.log('reached here')

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

// populate datatables with books details
function loadIntoTable(url) {
	fetch(url).
			then((data) => {
					return data.json();
			}).
			then((objectData) => {
					bookTable.clear();
					let imageDiv = document.getElementById("book-api-div");
					imageDiv.style.display = "block";

					let tableData = objectData.docs.map((book) => {
							let arr = [
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

							let imageDiv = document.getElementById("image-div");
							imageDiv.style.display = "block";
					})
			})
}
