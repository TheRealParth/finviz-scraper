import { getTickerList } from './___old/get-ticker-list/get-ticker-list'
import { scrapeAllTickers } from './scraping/scrape-all-tickers'
// import { scrapeDataForSingleTicker } from './scraping/single-ticker-scraping/scrape-data-for-single-ticker'
import { getFinvizDataForTickers } from './scraping/get-finviz-data-for-tickers'
const puppeteer = require('puppeteer')
import { handleRequest } from './utils/handle-request/handle-request'


import { logger } from './utils/logger'

export const main = async () => {
  const tickerList = getTickerList()
  
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.setViewport({ width: 1200, height: 800 })
  await page.setRequestInterception(true)

  page.on('request', handleRequest)

  const scrapedTickerList = await scrapeAllTickers(page)

  const tickerListWithData = await getFinvizDataForTickers(page, scrapedTickerList)

  logger.info('tickerList with data: ', tickerListWithData)

  logger.info(`Input data: ${JSON.stringify(tickerList, null, 2)}`)
  
  logger.info(`scraped tickers: ${JSON.stringify(scrapedTickerList, null, 2)}`)

  // return getDataForTickers(tickerList)
}

main().then(data => {
  logger.info(`data for tickers: ${JSON.stringify(data, null, 2)}`)

  process.exit(0)
})