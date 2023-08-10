import { TwitterApi } from 'twitter-api-v2'

export function getRequestClient() {
  return new TwitterApi({
    appKey: 'PSNm4qM4IHnoi9S8X0NHnOXr2',
    appSecret: 'ZRppRjZAeZboyllYDKMVk5hOWmUaBjkuKyjAQtHZ4LtkrOWilr',
    accessToken: '1487423447504498688-rWQ8tT7DQ2gIOkigEFI2OZh3tPARD1',
    accessSecret: '4HmAzkwWNB2Ar2lfKKSWnchbwSOAPggEQ2F4tepqWn8ik'
  })
}
