
export function calculateGrowthStatsForTickers(tickersWithQuoteAndGrowthCalcs) {

    return tickersWithQuoteAndGrowthCalcs.map(tickerObj => {

        const millOrBillMarketCapCharacter = tickerObj.quote_data.market_cap.slice(tickerObj.quote_data.market_cap.length - 1)

        let marketCapMillionsNumber = +tickerObj.quote_data.market_cap.slice(0, tickerObj.quote_data.market_cap.length - 2)

        if (millOrBillMarketCapCharacter === 'M') {
            // (already in millions)
        }

        if (millOrBillMarketCapCharacter === 'B')
            marketCapMillionsNumber *= 1000

        console.log(`market cap number for ${tickerObj.symbol}: ${marketCapMillionsNumber}`)

        tickerObj.growth_calculations.revenue['t+1y/t_quarterly_PGpD'] = (tickerObj.growth_calculations.revenue['t+1y/t_difference'] / marketCapMillionsNumber).toFixed(2)
        tickerObj.growth_calculations.gross_profit['t+1y/t_quarterly_PGpD'] = (tickerObj.growth_calculations.gross_profit['t+1y/t_difference'] / marketCapMillionsNumber).toFixed(2)
        tickerObj.growth_calculations.net_profit['t+1y/t_quarterly_PGpD'] = (tickerObj.growth_calculations.net_profit['t+1y/t_difference'] / marketCapMillionsNumber).toFixed(2)

        return tickerObj
    })

}