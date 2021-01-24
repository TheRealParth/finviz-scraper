require('dotenv').config()

import { scrapeAllTickersWithCluster } from './scraping/scrape-all-tickers'
import { getFinvizIncomeDataForTickers, getFinvizIncomeDataForTickersWithCluster } from './scraping/get-finviz-data-for-tickers'
import { getTickerListWithIncomeDataApiCalls } from './scraping/income-api-call-scraper'
import { calculateGrowthStatsForTickers } from './utils/calculate-growth-stats-for-tickers'
import { getFinvizQuoteDataForTickersWithCluster } from './scraping/get-finviz-quote-data'
import { runRegressionsForTickers } from './utils/run-regressions-for-scrapers/run-regressions-for-scrapers'
import { createPuppeteerStuff } from './utils/create-puppeteer-stuff/create-puppeteer-stuff'
import { login } from './login/login'
import { insert } from './db/mongo-functions'
import { calculateRankings } from './rankings/filler/rankings-filler'
import { sortByRankings } from './rankings/sorter/rankings-sorter'
import { logger } from './utils/logger'

export const main = async () => {

  const page = await createPuppeteerStuff();

  await login(page);
  
  const scrapedTickerList = await scrapeAllTickersWithCluster(page)

  console.log('tickers: ', scrapedTickerList)
  
  // const tickerListPageData = await getFinvizIncomeDataForTickers(page, scrapedTickerList.slice(20, 30))
  // const tickerListPageData = await getFinvizIncomeDataForTickersWithCluster(page, scrapedTickerList)
  // console.log('ticker list with page data: ', JSON.stringify(tickerListPageData))  
  
  
  // nice!

  const tickerListPageData = await getFinvizQuoteDataForTickersWithCluster(page, scrapedTickerList.slice(7, 10))
  // console.log('ticker list with page data: ', JSON.stringify(tickerListPageData, null, 2))

  const tickerListWithIncomeData = await getTickerListWithIncomeDataApiCalls(tickerListPageData)
  // console.log('ticker list with income data: ', JSON.stringify(tickerListWithIncomeData, null, 2))
    
  const tickerListWithRegressionsRun = runRegressionsForTickers(tickerListWithIncomeData)
  console.log('ticker list with regressions run: ', JSON.stringify(tickerListWithRegressionsRun, null, 2))
  
  const tickerListWithGrowthCalculations = calculateGrowthStatsForTickers(tickerListWithRegressionsRun)
  console.log('ticker list with growth calcs: ', JSON.stringify(tickerListWithGrowthCalculations, null, 2))

  const [rankedTickerList, rankingsMaxesAndMins] = calculateRankings(tickerListWithGrowthCalculations)

  const sortedRankedTickerList = sortByRankings(rankedTickerList)

  await insert({
    date_scraped: new Date(),
    stock_list: sortedRankedTickerList,
    stock_list_good_ones: sortedRankedTickerList,
    maxes_and_mins: rankingsMaxesAndMins
  })

  return 'success!'
}

main().then(data => {
  logger.info(`data for tickers: ${JSON.stringify(data, null, 2)}`)
  process.exit(0)
})