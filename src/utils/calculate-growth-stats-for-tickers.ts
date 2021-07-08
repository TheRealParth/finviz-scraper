
export function calculateGrowthStatsForTickers(tickersWithQuoteAndGrowthCalcs) {

    return tickersWithQuoteAndGrowthCalcs.map(tickerObj => {

        // console.log('ticker objL ', JSON.stringify(tickerObj, null, 2))
        
        const millOrBillMarketCapCharacter = tickerObj['market_cap'].slice(tickerObj['market_cap'].length - 1)
        
        let marketCapMillionsNumber = +tickerObj['market_cap'].slice(0, tickerObj['market_cap'].length - 2)
        
        
        console.log('market cap is:  ',tickerObj['market_cap'])


        if (millOrBillMarketCapCharacter === 'M') {
            // (already in millions)
        }

        if (millOrBillMarketCapCharacter === 'B')
            marketCapMillionsNumber *= 1000

        console.log(`market cap number for ${tickerObj.ticker}: ${marketCapMillionsNumber}`)
        // console.log(`calcs: ${JSON.stringify(tickerObj.growth_calculations)}`)

        if (tickerObj.growth_calculations.revenue &&
        tickerObj.growth_calculations.gross_profit &&
        tickerObj.growth_calculations.net_income
        ) {

            tickerObj.growth_calculations.revenue['t+1y/t_quarterly_PGpD'] = (tickerObj.growth_calculations.revenue['t+1y/max_y_0_to_t'] / marketCapMillionsNumber).toFixed(2)
            tickerObj.growth_calculations.gross_profit['t+1y/t_quarterly_PGpD'] = (tickerObj.growth_calculations.gross_profit['t+1y/max_y_0_to_t'] / marketCapMillionsNumber).toFixed(2)
            tickerObj.growth_calculations.net_income['t+1y/t_quarterly_PGpD'] = (tickerObj.growth_calculations.net_income['t+1y/max_y_0_to_t'] / marketCapMillionsNumber).toFixed(2)
        }
        else
            tickerObj.growth_calculations = { revenue: null, gross_profit: null, net_income: null }

        return tickerObj
    })

}