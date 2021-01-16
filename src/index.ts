import { getTickerList } from './___old/get-ticker-list/get-ticker-list'
import { scrapeAllTickers } from './scraping/scrape-all-tickers'
import { getFinvizDataForTickers } from './scraping/get-finviz-data-for-tickers'
import { createPuppeteerStuff } from './utils/create-puppeteer-stuff/create-puppeteer-stuff'
import { login } from './login/login'

import { logger } from './utils/logger'
import { Page } from 'puppeteer'

export const main = async () => {
  
  const [_browser, page] = await createPuppeteerStuff();

  await login(<Page>page);

  const scrapedTickerList = await scrapeAllTickers(page)

  const tickerListWithIncomeStatementData = await getFinvizDataForTickers(page, scrapedTickerList)

  logger.info('tickerList with data: ', tickerListWithIncomeStatementData)

  // TODO - runRegressions
  // const tickerListWithRegressionsRun = runRegressionsForTickers(tickerListWithIncomeStatementData)
  
  // TODO - save data to mongo
  // const rankedTickerList = calculateRankings(tickerListWithRegressionsRun)
  
  // TODO - save data to mongo

  // return saveTickerList(rankedTickerList, new Date())
}

main().then(data => {
  logger.info(`data for tickers: ${JSON.stringify(data, null, 2)}`)

  process.exit(0)
})