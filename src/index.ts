require('dotenv').config()

import { scrapeAllTickersWithCluster } from './scraping/scrape-all-tickers-with-data'
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

  console.log('ok...')

  const scrapedTickerList = await scrapeAllTickersWithCluster(page)

  console.log(`found ${scrapedTickerList.length} tickers...`)
  console.log(`found at zero: ${JSON.stringify(scrapedTickerList[0]), null, 2}`)
  // console.table(scrapedTickerList)

  // const tickerListPageData = await getFinvizQuoteDataForTickersWithCluster(page, scrapedTickerList)
  // // console.log('ticker list with page data: ', JSON.stringify(tickerListPageData, null, 2))

  // console.log('got quote data!')

  const tickerListWithIncomeData = await getTickerListWithIncomeDataApiCalls(scrapedTickerList)
  // const tickerListWithIncomeData = await getTickerListWithIncomeDataApiCalls(tickerListPageData)
  // console.log('ticker list with income data: ', JSON.stringify(tickerListWithIncomeData[0], null, 2))
  console.log('scraped pages, num: ', tickerListWithIncomeData.length)

  const tickerListWithRegressionsRun = runRegressionsForTickers(tickerListWithIncomeData)
  // console.log('ticker list with regressions run: ', JSON.stringify(tickerListWithRegressionsRun, null, 2))

  const tickerListWithGrowthCalculations = calculateGrowthStatsForTickers(tickerListWithRegressionsRun)
  // console.log('ticker list with growth calcs: ', JSON.stringify(tickerListWithGrowthCalculations, null, 2))

  const [rankedTickerList, rankingsMaxesAndMins] = calculateRankings(tickerListWithGrowthCalculations)

  const sortedRankedTickerList = sortByRankings(rankedTickerList)

  const sortedRankedTickerListGoodOnes = sortedRankedTickerList.filter(tickerObj => {

    if (tickerObj.growth_calculations.revenue['t+1y/t_difference'] > 0 &&
      tickerObj.growth_calculations.gross_profit['t+1y/t_difference']  > 0 &&
      tickerObj.growth_calculations.net_profit['t+1y/t_difference'] > 0)
      return tickerObj
  })

  await insert({
    date_scraped: new Date(),
    stock_list: sortedRankedTickerList,
    stock_list_good_ones: sortedRankedTickerListGoodOnes,
    maxes_and_mins: rankingsMaxesAndMins
  })

  return 'success!'
}

main().then(data => {
  logger.info(`bazzinga 🎉 ${JSON.stringify(data, null, 2)}`)
  process.exit(0)
})