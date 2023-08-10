import chai, { expect } from 'chai'
import mongoose from 'mongoose'
import ScheduledTweet from '../database/tweet-schema.js'
import chaiAsPromised from 'chai-as-promised'
import { MongoMemoryServer } from 'mongodb-memory-server'
chai.use(chaiAsPromised)

describe('Scheduled tweet database schema', () => {
  let database

  before(async () => {
    database = await MongoMemoryServer.create()
    const uri = await database.getUri()
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  })

  afterEach(async () => {
    await mongoose.disconnect()
    await database.stop()
  })

  it('should validate the scheduled tweet', async () => {
    const validScheduledTweet = new ScheduledTweet({
      body: 'This is a test tweet',
      date: '2023-08-10T00:00:00Z',
    })

    await expect(validScheduledTweet.validate()).to.be.fulfilled
  })

  it('should require username field', async () => {
    const invalidScheduledTweet = new ScheduledTweet({
      body: 'This is a test tweet',
    })

    await expect(invalidScheduledTweet.validate()).to.be.rejected
  })
})
