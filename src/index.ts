require('dotenv').config()

import { scrapeAllTickers, scrapeAllTickersWithCluster } from './scraping/scrape-all-tickers'
import { getFinvizIncomeDataForTickers, getFinvizIncomeDataForTickersWithCluster } from './scraping/get-finviz-data-for-tickers'
import { runRegressionsForTickers } from './utils/run-regressions-for-scrapers/run-regressions-for-scrapers'
import { createPuppeteerStuff } from './utils/create-puppeteer-stuff/create-puppeteer-stuff'
import { login } from './login/login'
import { insert } from './db/mongo-functions'
import { calculateRankings } from './rankings/filler/rankings-filler'
import { sortByRankings } from './rankings/sorter/rankings-sorter'
import { logger } from './utils/logger'

export const main = async () => {


  console.log('foo1')
  const page = await createPuppeteerStuff();
  console.log('foo2')
  
  await login(page);
  
  console.log('foo3')
  const scrapedTickerList = await scrapeAllTickersWithCluster(page)

  // const scrapedTickerList = await scrapeAllTickers(page)
  // console.log('here we go ', scrapedTickerList)

  // const tickerListWithIncomeStatementData = await getFinvizIncomeDataForTickers(page, scrapedTickerList.slice(20, 30))
  // TODO -const tickerListWithIncomeStatementData = await getFinvizIncomeDataForTickersWithCluster(page, scrapedTickerList)

  // console.log('here we go2: ', JSON.stringify(tickerListWithIncomeStatementData))

  // const tickerListWithRegressionsRun = runRegressionsForTickers(tickerListWithIncomeStatementData)

  // const [rankedTickerList, rankingsMaxesAndMins] = calculateRankings(tickerListWithRegressionsRun)

  // const sortedRankedTickerList = sortByRankings(rankedTickerList)

  // await insert({
  //   date_scraped: new Date(),
  //   stock_list: sortedRankedTickerList,
  //   maxes_and_mins: rankingsMaxesAndMins
  // })

  // return 'success!'

  return 'done'

}

main().then(data => {
  logger.info(`data for tickers: ${JSON.stringify(data, null, 2)}`)
  process.exit(0)
})