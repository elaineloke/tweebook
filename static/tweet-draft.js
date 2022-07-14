function createRandomTweetDraft(rowData) {
    var bookLink = " https://openlibrary.org" + rowData.book.key;

    var tweetDraft = 
    [
        "Check out " + rowData[0] + " written by " + rowData[1] + "!" + bookLink, 
        "Looking for your next book? Why not pick " + rowData[0] + " written by " + rowData[1] + "!" + bookLink,
        "Today's read: " + rowData[0] + " written by " + rowData[1] + "." + bookLink,
        "A cuppa coffee while reading " + rowData[0] + " written by " + rowData[1] + "." + bookLink,
        rowData[0] + " written by " + rowData[1] + " is our new fav read! Check it out." + bookLink,
        "What's on your to-read list today? Ours is " + rowData[0] + " written by " + rowData[1] + "!" + bookLink, 
        "Onto your next reading adventure with " + rowData[0] + " written by " + rowData[1] + "!" + bookLink, 
        "Interested in reading " + rowData[0] + " written by " + rowData[1] + "?" + " It is available at Open Library!" + bookLink,
    ]
    var randomTweetDraft = tweetDraft[Math.floor(Math.random() * tweetDraft.length)];

    $('#tweet-area').val(randomTweetDraft);
    countChar();
}

function renderImageTemplate(rowData) {
    $('#image-template').html(
        `<h5 style="text-align: center; font-weight: bold">`+ rowData[0] +`</h5>` +
        `<h6 style="text-align: center">`+ "By " + rowData[1] +`</h6>` +
        `<p style="text-align: center; background-color: #1da1f2; color: white">` + "&quot;" + rowData[3] + "&quot;" + `<span style="font-size: 13px; font-style: italic">` + " – An excerpt from " + rowData[0] + `</span>` + `</p>` + 
        `<p style="text-align: left; font-size: 13px">` + "First publish year: " + rowData[2] +`</p>`
        );
}

function closeDiv(btn) {
    var div = btn.parentNode;
    div.style.display = "none";
}

function resetToDefaultSettings() {
    $("#tweet-area").val('');
    countChar();
    $('#previewImage:checked').prop('checked', false);
    var imageDiv = document.getElementById("image-div");
    imageDiv.style.display = "none";
}
