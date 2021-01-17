
import { Result } from 'regression'

const regression = require('regression');

import { COLUMNS_IN_INCOME_TABLE } from '../../scraping/get-finviz-data-for-tickers'

export function runRegressionsForTickers(tickerListWithIncomeStatementData) {

    console.log('running regression... tickerList with data: ', JSON.stringify(tickerListWithIncomeStatementData, null, 2))

    return tickerListWithIncomeStatementData.map(incomeDataForTicker => {

        console.log('rev data: ', incomeDataForTicker.income_statements.quarterly['Total Revenue'])

        console.log('gross prof data: ', incomeDataForTicker.income_statements.quarterly['Gross Profit'])

        console.log('net prof data: ', incomeDataForTicker.income_statements.quarterly['Net Income'])

        let revenuePoints = []
        let linearModelData: Result | {} = {}
        let exponentialModelData: Result | {} = {}
        let logarithmicModelData: Result | {} = {}

        if (incomeDataForTicker.income_statements.quarterly['Total Revenue']) {

            revenuePoints = incomeDataForTicker.income_statements.quarterly['Total Revenue']
                .reverse().map((revenueDataPoint, index) => [index, +(revenueDataPoint.replace(/,/g, ''))])

            console.log('revenue points: ', revenuePoints)

            const linearRevenueRegModel = regression.linear(revenuePoints)
            const exponentialRevenueRegModel = regression.exponential(revenuePoints)
            const logarithmicRevenueRegModel = regression.logarithmic(revenuePoints)

            linearModelData = linearRevenueRegModel
            exponentialModelData = exponentialRevenueRegModel
            logarithmicModelData = logarithmicRevenueRegModel

        }

        let regression_best_fit_line_type = 'NONE'

        console.log('log result: ', logarithmicModelData)
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

        if (Math.max(...r2s) === linR2) {
            regression_best_fit_line_type = 'LINEAR'
            console.log('its lin')
        }

        if (Math.max(...r2s) === expR2) {

            regression_best_fit_line_type = 'EXPONENTIAL'
            console.log('its exp')
        }

        if (Math.max(...r2s) === logR2) {

            regression_best_fit_line_type = 'LOGARITHMIC'
            console.log('its log')
        }

        let next_year_quarterly_revenue_prediction = null;

        if (regression_best_fit_line_type === 'LINEAR')
            next_year_quarterly_revenue_prediction = (linearModelData as Result).predict(COLUMNS_IN_INCOME_TABLE + 4 - 1)[1]

        if (regression_best_fit_line_type === 'EXPONENTIAL')
            next_year_quarterly_revenue_prediction = (exponentialModelData as Result).predict(COLUMNS_IN_INCOME_TABLE + 4 - 1)[1]

        if (regression_best_fit_line_type === 'LOGARITHMIC')
            next_year_quarterly_revenue_prediction = (logarithmicModelData as Result).predict(COLUMNS_IN_INCOME_TABLE + 4 - 1)[1]

        console.log('ratio calc: ', next_year_quarterly_revenue_prediction, revenuePoints, revenuePoints.length)

        let tPlusRatio = null

        if (next_year_quarterly_revenue_prediction && revenuePoints)
            tPlusRatio = +(next_year_quarterly_revenue_prediction / (revenuePoints[revenuePoints.length - 1])[1]).toFixed(2)

        delete (linearModelData as Result).predict
        delete (exponentialModelData as Result).predict
        delete (logarithmicModelData as Result).predict
        
        incomeDataForTicker.growth_calculations = {
            regressions: {
                revenue: {
                    regression_models: {
                        linear: linearModelData,
                        exponential: exponentialModelData,
                        logarithmic: logarithmicModelData 
                    },
                    regression_best_fit_line_type,
                    next_year_quarterly_revenue_prediction,
                    't+1y/t_ratio': tPlusRatio
                }
            }
        }

        return incomeDataForTicker

    })

}