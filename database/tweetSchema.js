import mongoose from "mongoose"

const tweetSchema = new mongoose.Schema(
	{
		body: {
			type: String,
			require: true
		},
		date: {
			type: String,
			require: true
		},
		image: {
			type: String
		},
	},
		{ collection: 'tweebook' }
)

const ScheduledTweet = mongoose.model('tweebook', tweetSchema)

export default ScheduledTweet