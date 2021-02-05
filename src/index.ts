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

  const scrapedTickerListNotOvervalued = scrapedTickerList.filter(stockObj => {
    const peString = stockObj['p/e']

    if (peString === '-')
      return false

    if (+peString > 40)
      return false

    return true;
  })

  console.log(`filtered out ${scrapedTickerList.length - scrapedTickerListNotOvervalued.length} overvalued items...`)

  const [tickerListWithIncomeData, tickersWithNoIncomeData] = await getTickerListWithIncomeDataApiCalls(scrapedTickerListNotOvervalued)
  // const tickerListWithIncomeData = await getTickerListWithIncomeDataApiCalls(tickerListPageData)
  // console.log('ticker list with income data: ', JSON.stringify(tickerListWithIncomeData[0], null, 2))
  console.log('scraped pages, num: ', tickerListWithIncomeData.length)
  console.log('tickersWithNoIncomeData num: ', tickersWithNoIncomeData.length)
  console.log('tickersWithNoIncomeData num: ', tickersWithNoIncomeData)

  console.log('no income for these: ', tickerListWithIncomeData.filter(obj => !obj.income_statements.quarterly || !obj.income_statements.quarterly))

  const tickerListWithRegressionsRun = runRegressionsForTickers(tickerListWithIncomeData)
  // console.log('ticker list with regressions run: ', JSON.stringify(tickerListWithRegressionsRun, null, 2))
  console.log('ticker list with regressions num: ', tickerListWithRegressionsRun.length)

  const tickerListWithGrowthCalculations = calculateGrowthStatsForTickers(tickerListWithRegressionsRun)
  console.log('with growth calcs: ', tickerListWithGrowthCalculations.length)
  // console.log('ticker list with growth calcs: ', JSON.stringify(tickerListWithGrowthCalculations, null, 2))

  const [rankedTickerList, rankingsMaxesAndMins] = calculateRankings(tickerListWithGrowthCalculations)
  console.log('with rankings: ', rankedTickerList.length)

  const sortedRankedTickerList = sortByRankings(rankedTickerList)
  console.log('sorted rankings: ', sortedRankedTickerList.length)

  // Remove stocks that are shrinking in all three areas...
  const sortedRankedTickerListGoodOnes = sortedRankedTickerList.filter(tickerObj => {
    if (tickerObj.growth_calculations.revenue['t+1y/max_y_0_to_t'] > 0 &&
      tickerObj.growth_calculations.gross_profit['t+1y/max_y_0_to_t'] > 0 &&
      tickerObj.growth_calculations.net_income['t+1y/max_y_0_to_t'] > 0)
      return tickerObj
  })

  console.log('let\'s save it!')
  console.log(rankingsMaxesAndMins)

  const veryProfitableStocks = []
  const barelyProfitableStocks = []
  const barelyNotProfitableStocks = []

  sortedRankedTickerList.forEach(stockObj => {

    const profitMarginString = stockObj['profit_m']

    if (profitMarginString !== '-') {

      // removes % character
      const profitMarginStringNoPercentageSign = profitMarginString.substring(0, 'foo'.length - 1);

      if (profitMarginStringNoPercentageSign > 20)
        veryProfitableStocks.push(stockObj)

      if (profitMarginStringNoPercentageSign < 20 && profitMarginStringNoPercentageSign > 0)
        barelyProfitableStocks.push(stockObj)

      if (profitMarginStringNoPercentageSign < 0 && profitMarginStringNoPercentageSign > -20)
        barelyNotProfitableStocks.push(stockObj)

    }
  })

  const smallerListOfEverything = sortedRankedTickerList.splice(0, 600)

  await insert({
    date_scraped: new Date(),
    all_stock_list: smallerListOfEverything,
    very_profitables_stock_list: veryProfitableStocks,
    barely_profitable_stock_list: barelyProfitableStocks,
    barely_not_profitable_stock_list: barelyNotProfitableStocks,
    maxes_and_mins: rankingsMaxesAndMins,
    no_income_tickers: tickersWithNoIncomeData
  })

  return 'success!'
}

main().then(data => {
  logger.info(`bazzinga 🎉 ${JSON.stringify(data, null, 2)}`)
  process.exit(0)
})