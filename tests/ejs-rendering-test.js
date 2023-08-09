import { expect } from 'chai'
import ejs from 'ejs'
import fs from 'fs'
import path from 'path'

describe('EJS rendering', () => {
  it('should render the correct text with a hashtag/term', () => {
    const templatePath = path.join('views', 'hashtag.ejs')
    const template = fs.readFileSync(templatePath, 'utf8')
    const hashtag = { hashtag: 'abc123' }
    const result = ejs.render(template, hashtag)

    expect(result).to.include('All popular tweets for: abc123')
  })

  it('should render the twitterData', () => {
    const templatePath = path.join('views', 'search-results.ejs')
    const template = fs.readFileSync(templatePath, 'utf8')
    const twitterData = {
      twitterData: {
        text: 'This is a test tweet result'
      }
    }
    const result = ejs.render(template, twitterData)

    expect(result).to.include('This is a test tweet result')
  })

  it('should render the scheduled tweet', () => {
    const templatePath = path.join('views', 'content-curation.ejs')
    const template = fs.readFileSync(templatePath, 'utf8')
    const scheduledTweets = {
      scheduledTweets: {
        body: 'This is a test scheduled tweet'
      }
    }
    const result = ejs.render(template, scheduledTweets)

    expect(result).to.include('This is a test scheduled tweet')
  })
})
