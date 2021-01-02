
jest.mock('./utils/scrape-data-for-tickers/scrape-data-for-tickers')

import * as getDataForTickersModule from './___old/scrape-data-for-single-ticker/scrape-data-for-tickers'
// import * as getTickerListModule from './utils/get-ticker-list/get-ticker-list'

import { main } from './index';

describe('main', () => {

    it.only('returns what "getDataForTickers" returns', async () => {

        const mockTickerList = { tickers: ['foo'], values: ['bar'] }
        const mockResult = 'derp'

        jest.spyOn(getDataForTickersModule, 'getDataForTickers').mockResolvedValue(mockResult)
        // jest.spyOn(getTickerListModule, 'getTickerList').mockReturnValue(mockTickerList)

        const result = await main()

        expect(result).toEqual(result)
    })

})
