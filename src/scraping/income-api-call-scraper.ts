import * as fetch from 'node-fetch';
const clonedeep = require('lodash.clonedeep')

const quarterlyIncomeStatementsBaseUrl = 'https://elite.finviz.com/api/statement.ashx?s=IQ&t='
const annualIncomeStatementsBaseUrl = 'https://elite.finviz.com/api/statement.ashx?t='

export async function getTickerListWithIncomeDataApiCalls(tickersWithQuoteData) {

    const annualIncomeStatementApiCalls = tickersWithQuoteData.map((tickerObj, index) => {
        const annualUrl = annualIncomeStatementsBaseUrl + tickerObj.symbol
        return new Promise(resolve => setTimeout(resolve, 50 * index)).then(() => fetch(annualUrl)
            .then(response => response.json())
            .catch(err => {
                console.log('uh oh, error calling for annual statements: ', err)
            }));
    })

    const quarterlyIncomeStatementApiCalls = tickersWithQuoteData.map((tickerObj, index) => {
        const quarterlyUrl = quarterlyIncomeStatementsBaseUrl + tickerObj.symbol
        return new Promise(resolve => setTimeout(resolve, 40 * index)).then(() => fetch(quarterlyUrl)
            .then(response => response.json())
            .catch(err => {
                console.log('uh oh, error calling for quarterly statements: ', err)
            }));

    })

    const annualIncomeStatements = await Promise.all(annualIncomeStatementApiCalls)
    const quarterlyIncomeStatements = await Promise.all(quarterlyIncomeStatementApiCalls)

    const niceKeysAnnualIncomeStatements = makeObjectKeysNice(annualIncomeStatements)
    const niceKeysQuarterlyIncomeStatements = makeObjectKeysNice(quarterlyIncomeStatements)

    return tickersWithQuoteData.map((tickerObj, currentIndex) => ({
        ...clonedeep(tickerObj),
        income_statements: {
            quarterly: niceKeysQuarterlyIncomeStatements[currentIndex],
            annual: niceKeysAnnualIncomeStatements[currentIndex]
        }
    }))

}

function makeObjectKeysNice(arrayOfObjects) {

    return arrayOfObjects
        .filter(obj => !arrayOfObjects.error)
        .filter(obj => obj.data !== undefined)
        .map(obj => {
            return {
                currency: obj.currency,
                data: Object.entries(obj.data).reduce((finalObj, [key, val]) => {
                    const validKey = key.toLowerCase().replace(/[.]/g, '').replace(/[ ]/g, '_')
                    finalObj[validKey] = val
                    return finalObj
                }, {})
            }

        })
}