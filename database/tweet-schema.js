import mongoose from 'mongoose'

const tweetSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  { collection: 'tweebook' }
)

const ScheduledTweet = mongoose.model('tweebook', tweetSchema)

export default ScheduledTweet
