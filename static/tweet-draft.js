function createRandomTweetDraft(rowData) {
  let bookLink = ' https://openlibrary.org' + rowData.book.key
  let hashtags =
    ' #book #books #read #reads #reading #bibliophile #DailyReads #GreatReads #WhatToRead'

  let tweetDraft = [
    'Check out ' +
      rowData[0] +
      ' written by ' +
      rowData[1] +
      '!' +
      bookLink +
      hashtags,
    'Looking for your next book? Why not pick ' +
      rowData[0] +
      ' written by ' +
      rowData[1] +
      '!' +
      bookLink +
      hashtags,
    "Today's read: " +
      rowData[0] +
      ' written by ' +
      rowData[1] +
      '.' +
      bookLink +
      hashtags,
    'Have a cuppa coffee while reading ' +
      rowData[0] +
      ' written by ' +
      rowData[1] +
      '.' +
      bookLink +
      hashtags,
    rowData[0] +
      ' written by ' +
      rowData[1] +
      ' is our new fav read! Check it out.' +
      bookLink +
      hashtags,
    "What's on your to-read list today? Ours is " +
      rowData[0] +
      ' written by ' +
      rowData[1] +
      '!' +
      bookLink +
      hashtags,
    'Onto your next reading adventure with ' +
      rowData[0] +
      ' written by ' +
      rowData[1] +
      '!' +
      bookLink +
      hashtags,
    'Interested in reading ' +
      rowData[0] +
      ' written by ' +
      rowData[1] +
      '?' +
      ' It is available at Open Library!' +
      bookLink +
      hashtags,
  ]
  let randomTweetDraft =
    tweetDraft[Math.floor(Math.random() * tweetDraft.length)]

  $('#tweet-area').val(randomTweetDraft)
  countChar()
}

function renderImageTemplate(rowData) {
  $('#image-template').html(
    `<h5 style="text-align: center; font-weight: bold">` +
      rowData[0] +
      `</h5>` +
      `<h6 style="text-align: center">` +
      'By ' +
      rowData[1] +
      `</h6>` +
      `<p style="text-align: center; background-color: #1da1f2; color: #fff">` +
      '&quot;' +
      rowData[3] +
      '&quot;' +
      `<span style="font-size: 13px; font-style: italic">` +
      ' – An excerpt from ' +
      rowData[0] +
      `</span>` +
      `</p>` +
      `<p style="text-align: left; font-size: 13px">` +
      'First publish year: ' +
      rowData[2] +
      `</p>`
  )
}

function closeDiv(btn) {
  let div = btn.parentNode
  div.style.display = 'none'
}

function resetToDefaultSettings() {
  $('#tweet-area').val('')
  countChar()
  $('#previewImage:checked').prop('checked', false)
  let imageDiv = document.getElementById('image-div')
  imageDiv.style.display = 'none'
}

function displayNewlyScheduledTweet(scheduledTweet) {
  let scheduledContainer = document.getElementById('scheduledTweetContainer')

  if (scheduledTweet.image) {
    scheduledContainer.innerHTML +=
      '<div class="col-sm-12"><div class="card mb-3">' +
      '<div class="card-body">' +
      '<h6 class="card-subtitle mb-2 text-muted scheduledDate">' +
      scheduledTweet.date +
      '</h6>' +
      '<p class="card-text scheduledBody">' +
      scheduledTweet.body +
      '</p>' +
      '<div class="card-text">' +
      '<img src="data:image/png;base64,' +
      scheduledTweet.image +
      '"/ style="width: 400px">' +
      '</div>' +
      '<p class="card-text"><span onclick="deleteScheduledTweet(this)" class="retweetButton" style="cursor: pointer; color: red; font-size: 12px"><i class="fas fa-trash" style="cursor: pointer"></i> Delete</span> ' +
      '</div>' +
      '</div>' +
      '</div>'
  } else {
    scheduledContainer.innerHTML +=
      '<div class="col-sm-12"><div class="card mb-3">' +
      '<div class="card-body">' +
      '<h6 class="card-subtitle mb-2 text-muted scheduledDate">' +
      scheduledTweet.date +
      '</h6>' +
      '<p class="card-text scheduledBody">' +
      scheduledTweet.body +
      '</p>' +
      '<p class="card-text"><span onclick="deleteScheduledTweet(this)" class="retweetButton" style="cursor: pointer; color: red; font-size: 12px"><i class="fas fa-trash" style="cursor: pointer"></i> Delete</span> ' +
      '</div>' +
      '</div>' +
      '</div>'
  }
}
