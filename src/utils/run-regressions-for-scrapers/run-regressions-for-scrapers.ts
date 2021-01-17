
import { Result } from 'regression'

const regression = require('regression');

export function runQuarterlyRegressionsForTicker(latestFirstDataPoints) {

    let chronologicalDataPoints = []
    let linearModelData: Result | {} = {}
    let exponentialModelData: Result | {} = {}
    let logarithmicModelData: Result | {} = {}

    let numberOfColumns = 0

    if (latestFirstDataPoints) {

        chronologicalDataPoints = latestFirstDataPoints
            .reverse().map((revenueDataPoint, index) => [index, +(revenueDataPoint.replace(/,/g, ''))])

        console.log('chronologicalpoints points: ', chronologicalDataPoints)

        const linearRegModel = regression.linear(chronologicalDataPoints)
        const exponentialRegModel = regression.exponential(chronologicalDataPoints)
        const logarithmicReg = regression.logarithmic(chronologicalDataPoints)

        linearModelData = linearRegModel
        exponentialModelData = exponentialRegModel
        logarithmicModelData = logarithmicReg

        numberOfColumns = chronologicalDataPoints.length
    }

    let regression_best_fit_line_type = 'NONE'
    let regression_best_fit_line_equation = ''

    const linR2 = (linearModelData as Result).r2
    const expR2 = (exponentialModelData as Result).r2
    const logR2 = (logarithmicModelData as Result).r2

    console.log('linR2 ', linR2, ' expR2: ', expR2, ' logR2: ', logR2)

    const r2s = []

    if (linR2 && !isNaN(linR2))
        r2s.push(linR2)

    if (expR2 && !isNaN(expR2))
        r2s.push(expR2)

    if (logR2 && !isNaN(logR2))
        r2s.push(logR2)

    console.log('max of ', linR2, expR2, logR2, ' is: ', Math.max(...r2s))
    
    let next_year_quarterly_revenue_prediction = null;

    if (Math.max(...r2s) === linR2) {
        regression_best_fit_line_type = 'LINEAR'
        regression_best_fit_line_equation = (linearModelData as Result).string
        next_year_quarterly_revenue_prediction = (linearModelData as Result).predict(numberOfColumns + 4 - 1)[1]
    }
    
    if (Math.max(...r2s) === expR2) {
        regression_best_fit_line_type = 'EXPONENTIAL'
        regression_best_fit_line_equation = (exponentialModelData as Result).string
        next_year_quarterly_revenue_prediction = (exponentialModelData as Result).predict(numberOfColumns + 4 - 1)[1]
    }
    
    if (Math.max(...r2s) === logR2) {
        regression_best_fit_line_type = 'LOGARITHMIC'
        regression_best_fit_line_equation = (logarithmicModelData as Result).string
        next_year_quarterly_revenue_prediction = (logarithmicModelData as Result).predict(numberOfColumns + 4 - 1)[1]
    }

    console.log('ratio calc: ', next_year_quarterly_revenue_prediction, chronologicalDataPoints, chronologicalDataPoints.length)

    let tPlusRatio = null

    if (next_year_quarterly_revenue_prediction && chronologicalDataPoints)
        tPlusRatio = +(next_year_quarterly_revenue_prediction / (chronologicalDataPoints[chronologicalDataPoints.length - 1])[1]).toFixed(2)

    delete (linearModelData as Result).predict
    delete (exponentialModelData as Result).predict
    delete (logarithmicModelData as Result).predict

    return {
        regression_models: {
            linear: linearModelData,
            exponential: exponentialModelData,
            logarithmic: logarithmicModelData
        },
        regression_best_fit_line_type,
        regression_best_fit_line_equation,
        next_year_quarterly_revenue_prediction,
        't+1y/t_ratio': tPlusRatio
    }
}

export function runRegressionsForTickers(tickerListWithIncomeStatementData) {

    // console.log('running regression... tickerList with data: ', JSON.stringify(tickerListWithIncomeStatementData, null, 2))

    return tickerListWithIncomeStatementData.map(incomeDataForTicker => {

        console.log('income data for ticker: ', JSON.stringify(incomeDataForTicker, null, 2))

        console.log('rev data: ', incomeDataForTicker.income_statements.quarterly['total_revenue'])

        console.log('gross prof data: ', incomeDataForTicker.income_statements.quarterly['gross_profit'])

        console.log('net prof data: ', incomeDataForTicker.income_statements.quarterly['net_income'])

        incomeDataForTicker.growth_calculations = {
            revenue: runQuarterlyRegressionsForTicker(incomeDataForTicker.income_statements.quarterly['total_revenue']),
            gross_profit: runQuarterlyRegressionsForTicker(incomeDataForTicker.income_statements.quarterly['gross_profit']),
            net_profit: runQuarterlyRegressionsForTicker(incomeDataForTicker.income_statements.quarterly['net_income'])
        }

        return incomeDataForTicker
    })

}