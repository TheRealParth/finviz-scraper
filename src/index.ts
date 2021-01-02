import { getTickerList } from './___old/get-ticker-list/get-ticker-list'
import { scrapeAllTickers } from './scraping/scrape-all-tickers'

import { logger } from './utils/logger'

export const main = async () => {
  const tickerList = getTickerList()
  
  const scrapedTickerList = await scrapeAllTickers()

  logger.info(`Input data: ${JSON.stringify(tickerList, null, 2)}`)
  
  logger.info(`scraped tickers: ${JSON.stringify(scrapedTickerList, null, 2)}`)

  // return getDataForTickers(tickerList)
}

main().then(data => {
  logger.info(`data for tickers: ${JSON.stringify(data, null, 2)}`)
})