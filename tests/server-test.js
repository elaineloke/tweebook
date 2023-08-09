import { expect } from 'chai'
import { getRequestClient } from './utils.js'
import * as path from 'path'

describe('Connect to Twitter profile', () => {
  const client = getRequestClient()

  it('should authenticate the user profile', async () => {
    const tokens = await client.generateAuthLink('oob')

    expect(tokens.url).to.be.a('string')
    expect(tokens.oauth_token).to.be.a('string')
    expect(tokens.oauth_token_secret).to.be.a('string')
    expect(tokens.oauth_callback_confirmed).to.be.equal('true')
  })

  it('should upload a jpeg image from filepath', async () => {
    const jpeg = path.resolve('tests/', '../temp', 'twitter.jpeg')
    const uploadedImage = await client.v1.uploadMedia(jpeg)

    expect(uploadedImage).to.be.an('string')
  })

  it('should create a tweet', async () => {
    const status = 'This is a test tweet to be posted'
    const { data: { text, id } } = await client.v2.tweet(status)

    expect(text).to.equal(status)

    // tweet created is deleted 
    // otherwise twitter will flag the status as repeat and the test will fail
    const { data: { deleted } } = await client.v2.deleteTweet(id);
    expect(deleted).to.equal(true);
  })
})
