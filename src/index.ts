import { getTickerList } from './___old/get-ticker-list/get-ticker-list'
import { scrapeAllTickers } from './scraping/scrape-all-tickers'
import { getFinvizIncomeDataForTickers } from './scraping/get-finviz-data-for-tickers'
import { runRegressionsForTickers } from './utils/run-regressions-for-scrapers/run-regressions-for-scrapers'
import { createPuppeteerStuff } from './utils/create-puppeteer-stuff/create-puppeteer-stuff'
import { login } from './login/login'

import { logger } from './utils/logger'
import { Page } from 'puppeteer'

export const main = async () => {
  
  const [_browser, page] = await createPuppeteerStuff();

  await login(<Page>page);

  const scrapedTickerList = await scrapeAllTickers(page)

  console.log('list is: ', scrapedTickerList)

  const tickerListWithIncomeStatementData = await getFinvizIncomeDataForTickers(page, scrapedTickerList.slice(0,7))

  // console.log('tickerList with data: ', JSON.stringify(tickerListWithIncomeStatementData, null, 2))
  
  // TODO - runRegressions
  const tickerListWithRegressionsRun = runRegressionsForTickers(tickerListWithIncomeStatementData)
  console.log('tickerList with regressions: ', JSON.stringify(tickerListWithRegressionsRun, null, 2))
  
  // TODO - save data to mongo
  // const rankedTickerList = calculateRankings(tickerListWithRegressionsRun)
  
  // TODO - save data to mongo

  // return saveTickerList(rankedTickerList, new Date())
}

main().then(data => {
  logger.info(`data for tickers: ${JSON.stringify(data, null, 2)}`)

  process.exit(0)
})