
const MAXIMUM_NET_PROFIT_RATIO = 10;
const MINIMUM_NET_PROFIT_RATIO = -10;

const MAXIMUM_GROSS_PROFIT_RATIO = 10;
const MINIMUM_GROSS_PROFIT_RATIO = -10;

const MAXIMUM_REVENUE_RATIO = 10;
const MINIMUM_REVENUE_RATIO = -10;

/**
 * @param { Array<TtStats> } tickerDataWithGrowthCalcs - calc'd growth raios object with arrays of pre-ranking'ed stats objects
 * 
 * @returns { Array<TtStats | RankingsMaxesAndMins> } 
 * 
 * maxesAndMins and straight up mathematical comparison maxes and mins
 *
 * rankings takes into account upwards or downwards
 */
export function calculateRankings(tickerDataWithGrowthCalcs) {

    const rankingsMaxMinsHolder = {
        revenue: {
            max: -Infinity,
            min: Infinity
        },
        gross_profit: {
            max: -Infinity,
            min: Infinity

        },
        net_profit: {
            max: -Infinity,
            min: Infinity
        }
    }

    console.log('ticker data with ', tickerDataWithGrowthCalcs)

    tickerDataWithGrowthCalcs.forEach(stockObj => {

        const revenue_1y_ratio = stockObj.growth_calculations.revenue['t+1y/t_quarterly_PGpD']
        const gross_profit_1y_ratio = stockObj.growth_calculations.gross_profit['t+1y/t_quarterly_PGpD']
        const net_profit_1y_ratio = stockObj.growth_calculations.net_profit['t+1y/t_quarterly_PGpD']

        console.log('filling rankings for ', stockObj.symbol, ' ', revenue_1y_ratio, ', ', gross_profit_1y_ratio, ', ', net_profit_1y_ratio, ', ')

        // revenue
        if (revenue_1y_ratio) {
            if (revenue_1y_ratio > rankingsMaxMinsHolder.revenue.max)
                rankingsMaxMinsHolder.revenue.max = revenue_1y_ratio

            if (revenue_1y_ratio < rankingsMaxMinsHolder.revenue.min)
                rankingsMaxMinsHolder.revenue.min = revenue_1y_ratio

            if (rankingsMaxMinsHolder.revenue.max > MAXIMUM_REVENUE_RATIO)
                rankingsMaxMinsHolder.revenue.max = MAXIMUM_REVENUE_RATIO

            if (rankingsMaxMinsHolder.revenue.min > MINIMUM_REVENUE_RATIO)
                rankingsMaxMinsHolder.revenue.min = MINIMUM_REVENUE_RATIO
        }

        // gross profit
        if (gross_profit_1y_ratio) {
            if (gross_profit_1y_ratio > rankingsMaxMinsHolder.gross_profit.max)
                rankingsMaxMinsHolder.gross_profit.max = gross_profit_1y_ratio

            if (gross_profit_1y_ratio < rankingsMaxMinsHolder.gross_profit.min)
                rankingsMaxMinsHolder.gross_profit.min = gross_profit_1y_ratio



            if (rankingsMaxMinsHolder.gross_profit.max > MAXIMUM_GROSS_PROFIT_RATIO)
                rankingsMaxMinsHolder.gross_profit.max = MAXIMUM_GROSS_PROFIT_RATIO

            if (rankingsMaxMinsHolder.gross_profit.min > MINIMUM_GROSS_PROFIT_RATIO)
                rankingsMaxMinsHolder.gross_profit.min = MINIMUM_GROSS_PROFIT_RATIO
        }

        // net_profit 
        if (net_profit_1y_ratio) {
            if (net_profit_1y_ratio > rankingsMaxMinsHolder.net_profit.max)
                rankingsMaxMinsHolder.net_profit.max = net_profit_1y_ratio

            if (net_profit_1y_ratio < rankingsMaxMinsHolder.net_profit.min)
                rankingsMaxMinsHolder.net_profit.min = net_profit_1y_ratio

            if (rankingsMaxMinsHolder.net_profit.max > MAXIMUM_NET_PROFIT_RATIO)
                rankingsMaxMinsHolder.net_profit.max = MAXIMUM_NET_PROFIT_RATIO

            if (rankingsMaxMinsHolder.net_profit.min > MINIMUM_NET_PROFIT_RATIO)
                rankingsMaxMinsHolder.net_profit.min = MINIMUM_NET_PROFIT_RATIO
        }

    });

    console.log(`mins and maxes raw: `, rankingsMaxMinsHolder)

    console.log(`mins and maxes with limits: `, rankingsMaxMinsHolder)

    const rankedStatsArray = tickerDataWithGrowthCalcs
        .map(stockObj => {

            const revenue_1y_ratio = stockObj.growth_calculations.revenue['t+1y/t_ratio']
            const gross_profit_1y_ratio = stockObj.growth_calculations.gross_profit['t+1y/t_ratio']
            const net_profit_1y_ratio = stockObj.growth_calculations.net_profit['t+1y/t_ratio']

            let revenueRanking = 0
            let grossProfitRanking = 0
            let netProfitRanking = 0

            if (revenue_1y_ratio) {

                const revenueDistFromMin = revenue_1y_ratio - rankingsMaxMinsHolder.revenue.min
                const revenueDistFromMax = rankingsMaxMinsHolder.revenue.max - revenue_1y_ratio

                revenueRanking = (revenueDistFromMin === revenueDistFromMax) ?
                    1 : revenueDistFromMin / (revenueDistFromMin + revenueDistFromMax)

                if (!revenueRanking || revenueRanking < 0)
                    revenueRanking = 0

                if (revenueRanking > 1)
                    revenueRanking = 1

                console.log('caculating rev ranking: ', stockObj.symbol, ' ', revenueDistFromMin, ' ', revenueDistFromMax)
                console.log('caculating rev ranking: ', revenue_1y_ratio, 'h  max: ', rankingsMaxMinsHolder.revenue.max, 'min: ', rankingsMaxMinsHolder.revenue.min, ' ', stockObj.symbol, ' ', revenueDistFromMax, ' ', revenueDistFromMin )
            }
            
            if (gross_profit_1y_ratio) {
                const grossProfitDistFromMin = gross_profit_1y_ratio - rankingsMaxMinsHolder.gross_profit.min
                const grossProfitDistFromMax = rankingsMaxMinsHolder.gross_profit.max - gross_profit_1y_ratio
                
                grossProfitRanking = (grossProfitDistFromMin === grossProfitDistFromMax) ?
                1 : grossProfitDistFromMin / (grossProfitDistFromMin + grossProfitDistFromMax)
                
                if (!grossProfitRanking || grossProfitRanking < 0)
                grossProfitRanking = 0
                
                if (grossProfitRanking > 1)
                grossProfitRanking = 1
                
                // console.log('caculating gross p ranking: ', gross_profit_1y_ratio, ' ', stockObj.symbol, ' ', grossProfitDistFromMin, ' ', grossProfitDistFromMax)
                console.log('caculating gross p ranking: ', gross_profit_1y_ratio, 'h  max: ', rankingsMaxMinsHolder.gross_profit.max, 'min: ', rankingsMaxMinsHolder.gross_profit.min, ' ', stockObj.symbol, ' ', grossProfitDistFromMax, ' ', grossProfitDistFromMin )
            }
            
            
            if (net_profit_1y_ratio) {
                const netProfitDistFromMin = net_profit_1y_ratio - rankingsMaxMinsHolder.net_profit.min
                const netProfitDistFromMax = rankingsMaxMinsHolder.net_profit.max - net_profit_1y_ratio
                
                netProfitRanking = (netProfitDistFromMin === netProfitDistFromMax) ?
                1 : netProfitDistFromMin / (netProfitDistFromMin + netProfitDistFromMax)
                
                console.log('caculating net p ranking: ', net_profit_1y_ratio, 'h  max: ', rankingsMaxMinsHolder.net_profit.max, 'min: ', rankingsMaxMinsHolder.net_profit.min, ' ', stockObj.symbol, ' ', netProfitDistFromMax, ' ', netProfitDistFromMin )
                console.log('net p ranking: ',  netProfitRanking)
                
                if (!netProfitRanking || netProfitRanking < 0) {
                    console.log('setting to zero...')
                    netProfitRanking = 0
                }
                
                if (netProfitRanking > 1)
                netProfitRanking = 1   
            }

            stockObj.rankings = {
                revenue: +revenueRanking.toFixed(2),
                gross_profit: +grossProfitRanking.toFixed(2),
                net_profit: +netProfitRanking.toFixed(2),
            }

            return stockObj
        })

    return [rankedStatsArray, rankingsMaxMinsHolder]
}
