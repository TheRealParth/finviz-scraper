import { getTickerList } from './get-ticker-list'
import tickerList from '../../config/input-data'

describe('getTickerList', () => {

    it('returns the input data', () => {

        expect(getTickerList()).toEqual(tickerList)

    })

})