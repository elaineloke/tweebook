function tweetSuccess() {
  showNotification('Success! ', 'Your tweet was posted successfully.')
}

function tweetFail() {
  showNotification(
    'Error! ',
    'There was an issue posting your tweet. Please try again.',
    '#fadcdc',
    '#bb0e10'
  )
}

function scheduleTweetSuccess() {
  showNotification('Success! ', 'Your tweet was scheduled successfully.')
}

function scheduleTweetFail() {
  showNotification(
    'Error! ',
    'There was an issue scheduling your tweet. Please try again.',
    '#fadcdc',
    '#bb0e10'
  )
}

function scheduleRepeatedTweetFail() {
  showNotification(
    'Error! ',
    'Repeated tweets are not allowed.',
    '#fadcdc',
    '#bb0e10'
  )
}

function retweetFail() {
  showNotification(
    'Error! ',
    'There was an issue retweeting your tweet. Please try again.',
    '#fadcdc',
    '#bb0e10'
  )
}

function undoRetweetFail() {
  showNotification(
    'Error! ',
    'There was an issue to undo your retweet. Please try again.',
    '#fadcdc',
    '#bb0e10'
  )
}

function favoriteFail() {
  showNotification(
    'Error! ',
    'There was an issue favoriting your tweet. Please try again.',
    '#fadcdc',
    '#bb0e10'
  )
}

function undoFavoriteFail() {
  showNotification(
    'Error! ',
    'There was an issue to undo favoriting your tweet. Please try again.',
    '#fadcdc',
    '#bb0e10'
  )
}

function deleteTweetSuccess() {
  showNotification(
    'Success! ',
    'Your tweet was deleted from the database successfully.'
  )
}

function deleteTweetFail() {
  showNotification(
    'Error! ',
    'There was an issue deleting your tweet from the database.',
    '#fadcdc',
    '#bb0e10'
  )
}

function showNotification(
  header,
  content,
  backgroundColour,
  textColour,
  duration
) {
  //set default values
  duration = typeof duration !== 'undefined' ? duration : 3000
  backgroundColour = typeof backgroundColour !== 'undefined' ? backgroundColour : '#dff0d8'
  textColour = typeof textColour !== 'undefined' ? textColour : '#3c763d'
  height = 40

  //create notification div bar
  if ($('#notification-bar').length == 0) {
    let HTMLmessage =
      "<div style='line-height: " +
      height +
      "px;'> " +
      "<strong style='margin-left: 20px'>" +
      header +
      '</strong>' +
      content +
      ' </div>'
    $('body').prepend(
      "<div id='notification-bar' style='display:none; width:100%; height:" +
        height +
        'px; background-color: ' +
        backgroundColour +
        '; position: fixed; z-index: 1; color: ' +
        textColour +
        ";'>" +
        HTMLmessage +
        '</div>'
    )
  }

  //create notification sliding animation and remove div after timeout
  $('#notification-bar').slideDown(function () {
    setTimeout(function () {
      $('#notification-bar').slideUp(function () {})
      $('#notification-bar').remove()
    }, duration)
  })
}
