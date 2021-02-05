
/**
 *  Called with either revenueing_upwards or revenueing_downwards arrays
 *  
 *  The previous rankings filler step consider if it
 * 
 **/
export function sortByRankings(unsortedRankingGrowthDataTickers) {

    return unsortedRankingGrowthDataTickers
        .filter(stockObj => stockObj.rankings.revenue > 0 ||
            stockObj.rankings.gross_profit > 0 ||
            stockObj.rankings.net_income > 0)
        .sort((stockObjA, stockObjB) => {

            return (stockObjA.rankings.revenue + stockObjA.rankings.gross_profit + stockObjA.rankings.net_income) <
                (stockObjB.rankings.revenue + stockObjB.rankings.gross_profit + stockObjB.rankings.net_income) ?
                1 : -1
        })
}
