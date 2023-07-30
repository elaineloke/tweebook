// Retweet tweet
let retweetCount = 0
let retweetId = 0

function retweetTweet(btn) {
  let cardBody = btn.parentNode.parentNode
  let spanWithId = cardBody.querySelector('.tweetId')
  let tweetId = spanWithId.innerText

  retweetCount++

  if (retweetCount % 2 == 1) {
    fetch('/retweet?id=' + tweetId)
      .then((response) => response.text())
      .then((text) => {
        retweetId = text.id
        if (text.result = 'success') {
          $('#tweets').find(btn).css('color', 'green')
        } else {
          retweetFail()
        }
      })
  }
  if (retweetCount % 2 == 0) {
    fetch('/undoRetweet?id=' + retweetId)
      .then((response) => response.text())
      .then((text) => {
        if (text.result = 'success') {
          $('#tweets').find(btn).css('color', 'black')
        } else {
          undoRetweetFail()
        }
      })
  }
}

// Favourite tweet
let favCount = 0
let favTweetId = 0

function favTweet(btn) {
  let cardBody = btn.parentNode.parentNode
  let spanWithId = cardBody.querySelector('.tweetId')
  let tweetId = spanWithId.innerText

  favCount++

  if (favCount % 2 == 1) {
    fetch('/favtweet?id=' + tweetId)
      .then((response) => response.text())
      .then((text) => {
        favTweetId = text.id
        if (text.result = 'success') {
          $('#tweets').find(btn).css('color', 'red')
        } else {
          favoriteFail()
        }
      })
  }
  if (favCount % 2 == 0) {
    fetch('/undoFavTweet?id=' + favTweetId)
      .then((response) => response.text())
      .then((text) => {
        favTweetId = text.id
        if (text.result = 'success') {
          $('#tweets').find(btn).css('color', 'black')
        } else {
          undoFavoriteFail()
        }
      })
  }
}

// Post tweet
async function postTweet(event) {
  let tweet = textArea.value
  let data = { text: tweet }

  if ($('#previewImage').is(':checked')) {
    let image = document.getElementById('image-template')
    let canvas = await html2canvas(image)
    let canvasURL = canvas.toDataURL().split(',')
    data.image = canvasURL[1]
  }

  let response = await fetch('/postTweet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  let text = await response.text()

  if (text == 'success') {
    tweetSuccess()
  }
  if (text == 'error') {
    tweetFail()
  }

  resetToDefaultSettings()
}

// Schedule tweet
async function scheduleTweet(event) {
  let tweet = textArea.value
  let data = { text: tweet }

  let calendar = document.querySelector('#calendar')
  let calendarVal = calendar.value
  let datetime = { text: calendarVal }

  let scheduledTweet = { body: data.text, date: datetime.text }

  if ($('#previewImage').is(':checked')) {
    let image = document.getElementById('image-template')
    let canvas = await html2canvas(image)
    let canvasURL = canvas.toDataURL().split(',')
    scheduledTweet.image = canvasURL[1]
  }

  if (tweet == '' || calendarVal == '') {
    return 'error'
  } else {
    fetch('/scheduleTweet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduledTweet),
    })
      .then((response) => response.text())
      .then((text) => {
        if (text == 'success') {
          scheduleTweetSuccess()
          displayNewlyScheduledTweet(scheduledTweet)
        }
        if (text == 'error') {
          scheduleTweetFail()
        }
        if (text == 'repeated') {
          scheduleRepeatedTweetFail()
        }
      })

    resetToDefaultSettings()
  }
}

// Delete scheduled tweet
function deleteScheduledTweet(btn) {
  let cardBody = btn.parentNode.parentNode
  let spanWithId = cardBody.querySelector('.scheduledDate')
  let scheduledDate = spanWithId.innerText

  let cardBodyB = btn.parentNode.parentNode
  let spanWithIdB = cardBodyB.querySelector('.scheduledBody')
  let scheduledBody = spanWithIdB.textContent

  fetch('/deleteScheduledTweet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: scheduledBody, date: scheduledDate }),
  })
    .then((response) => response.text())
    .then((text) => {
      if (text == 'success') {
        deleteTweetSuccess()
      } else {
        deleteTweetFail()
      }
    })
  cardBody.parentNode.parentNode.remove()
}

// Populate datatables with books details
function loadIntoTable(url) {
  fetch(url)
    .then((data) => {
      return data.json()
    })
    .then((objectData) => {
      bookTable.clear()
      let imageDiv = document.getElementById('book-api-div')
      imageDiv.style.display = 'block'

      let tableData = objectData.docs.map((book) => {
        let arr = [
          book.title,
          book.author_name[0],
          book.first_publish_year,
          book.first_sentence ? book.first_sentence : '',
        ]
        arr.book = book
        return arr
      })

      bookTable.rows.add(tableData).draw()

      $('#api-body').on('click', 'tr', function () {
        const tr = $(this).closest('tr')
        const row = bookTable.row(tr)
        const rowData = row.data()
        if (!rowData) {
          return
        }

        createRandomTweetDraft(rowData)
        renderImageTemplate(rowData)

        let imageDiv = document.getElementById('image-div')
        imageDiv.style.display = 'block'
      })
    })
}
