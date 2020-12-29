import { getTickerList } from './utils/get-ticker-list'
import { getDataForTickers } from './utils/scrape-data-for-tickers'

import { logger } from './utils/logger'

const main = async () => {
  const tickerList = getTickerList()

  logger.info(`Input data: ${JSON.stringify(tickerList, null, 2)}`)

  return getDataForTickers(tickerList)
}

main().then(data => {
  logger.info(`data for tickers: ${JSON.stringify(data, null, 2)}`)
  process.exit(0)
})
