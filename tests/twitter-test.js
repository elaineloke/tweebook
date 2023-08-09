import { expect } from 'chai'
import twitter from '../twitter.js'
import sinon from 'sinon'

describe('convertToMilliseconds function', () => {
  it('should convert a date string to milliseconds', () => {
    const dateStr = '2023-08-10T12:00:00Z'
    const result = twitter.convertToMilliseconds(dateStr)
    const expectedMilliseconds = new Date(dateStr).getTime()

    expect(result).to.equal(expectedMilliseconds)
  })

  it('should handle invalid date string', () => {
    const invalidDateStr = 'abc123'
    const result = twitter.convertToMilliseconds(invalidDateStr)

    expect(result).to.be.NaN
  })
})

describe('millisecondsUntil function', () => {
  let timer

  beforeEach(() => {
    timer = sinon.useFakeTimers(new Date('2023-08-10T00:00:00Z').getTime())
  })
  afterEach(() => {
    timer.restore()
  })

  it('should calculate the milliseconds until the time now', () => {
    const timeNow = sinon.stub(Date, 'now').returns(new Date('2023-08-10T06:00:00Z').getTime())
    const convertToMilliseconds = twitter.convertToMilliseconds('2023-08-10T12:00:00Z')
    const result = twitter.millisecondsUntil('2023-08-10T12:00:00Z')
    const millisecondsRemaining = convertToMilliseconds - new Date('2023-08-10T06:00:00Z').getTime()

    expect(result).to.equal(millisecondsRemaining)

    timeNow.restore()
  })

  it('should handle invalid date string', () => {
    const invalidDateStr = 'abc123'
    const result = twitter.millisecondsUntil(invalidDateStr)

    expect(result).to.be.NaN
  })
})
