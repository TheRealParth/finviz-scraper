
import { getDataForTickers } from './scrape-data-for-tickers'

describe('getDataForTickers', () => {

  it('gets data for tickers...', () => {

    const tickerList = {
      tickers: ['tsla', 'arkk', 'aapl', 'goog'],
      values: ['P/E', 'Short Ratio'],
    }

    // TODO - mock the puppeteer stuff?
    
    getDataForTickers(tickerList)
    
    expect('something...').toBeTruthy()

    // TODO - expect some stuff to have happened?

  })

})