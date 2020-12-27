import { getTickerList } from './utils/get-ticker-list'
import { getDataForTickers } from './utils/scrape-data-for-tickers'

const main = async () => {
  const tickerList = getTickerList()

  console.log('Input data: ', tickerList)

  return getDataForTickers(tickerList)
}

main().then(data => {
  console.log('data for tickers: ', data)
  process.exit(0)
})
