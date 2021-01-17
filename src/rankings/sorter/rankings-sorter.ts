
/**
 *  Called with either revenueing_upwards or revenueing_downwards arrays
 *  
 *  The previous rankings filler step consider if it
 * 
 **/
export function sortByRankings(unsortedRankingGrowthDataTickers) {

    return unsortedRankingGrowthDataTickers.sort((stockObjA, stockObjB) => {

        return (stockObjA.rankings.revenue + stockObjA.rankings.gross_profit + stockObjA.rankings.net_profit) <
            (stockObjB.rankings.revenue + stockObjB.rankings.gross_profit + stockObjB.rankings.net_profit) ?
            1 : -1
    })
}
