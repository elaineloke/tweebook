import { expect } from 'chai'
import fetchMock from 'fetch-mock'

describe('Fetch API', function() {
  const tweetId = 'abc123'

  afterEach(function() {
    fetchMock.restore()
  })

  it('should retweet a tweet', async () => {
    fetchMock.get('/retweet?id=' + tweetId, {
      status: 200,
      body: JSON.stringify({ result: 'success', id: 'def456' }),
    })

    const response = await fetch('/retweet?id=' + tweetId)
    const retweetId = 'def456'
    const text = await response.text()
    const textParsed = JSON.parse(text)

    expect(textParsed.id).to.equal(retweetId)
    expect(textParsed.result).to.equal('success')
  })

  it('should undo a retweet', async () => {
    fetchMock.get('/undoRetweet?id=' + tweetId, {
      status: 200,
      body: JSON.stringify({ result: 'success', id: 'def456' }),
    })

    const response = await fetch('/undoRetweet?id=' + tweetId)
    const retweetId = 'def456'
    const text = await response.text()
    const textParsed = JSON.parse(text)

    expect(textParsed.id).to.equal(retweetId)
    expect(textParsed.result).to.equal('success')
  })

  it('should favourite a tweet', async () => {
    fetchMock.get('/favtweet?id=' + tweetId, {
      status: 200,
      body: JSON.stringify({ result: 'success', id: 'def456' }),
    })

    const response = await fetch('/favtweet?id=' + tweetId)
    const favTweetId = 'def456'
    const text = await response.text()
    const textParsed = JSON.parse(text)

    expect(textParsed.id).to.equal(favTweetId)
    expect(textParsed.result).to.equal('success')
  })

  it('should undo favourite tweet', async () => {
    fetchMock.get('/undoFavTweet?id=' + tweetId, {
      status: 200,
      body: JSON.stringify({ result: 'success', id: 'def456' }),
    })

    const response = await fetch('/undoFavTweet?id=' + tweetId)
    const favTweetId = 'def456'
    const text = await response.text()
    const textParsed = JSON.parse(text)

    expect(textParsed.id).to.equal(favTweetId)
    expect(textParsed.result).to.equal('success')
  })

  it('should schedule tweet', async () => {
    const body = 'This is a test tweet'
    const date = '2023-08-10'

    fetchMock.post('/scheduleTweet', {
      status: 200,
      body: 'Tweet scheduled successfully',
    });

    const response = await fetch('/scheduleTweet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: body, date: date }),
    });

    const responseData = await response.text()

    expect(responseData).to.equal('Tweet scheduled successfully')
  })
  
  it('should delete a scheduled tweet', async () => {
    const body = 'This is a test tweet'
    const date = '2023-08-10'

    fetchMock.post('/deleteScheduledTweet', {
      status: 200,
      body: 'Tweet deleted successfully',
    });

    const response = await fetch('/deleteScheduledTweet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: body, date: date }),
    });

    const responseData = await response.text()

    expect(responseData).to.equal('Tweet deleted successfully')
  })
})

