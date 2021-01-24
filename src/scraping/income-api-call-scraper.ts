import * as fetch from 'node-fetch';
const clonedeep = require('lodash.clonedeep')

const quarterlyIncomeStatementsBaseUrl = 'https://elite.finviz.com/api/statement.ashx?s=IQ&t='
const annualIncomeStatementsBaseUrl = 'https://elite.finviz.com/api/statement.ashx?t='


export async function getTickerListWithIncomeDataApiCalls(tickersWithQuoteData) {

    const annualIncomeStatementApiCalls = tickersWithQuoteData.map(tickerObj => {
        const annualUrl = annualIncomeStatementsBaseUrl + tickerObj.symbol
        return fetch(annualUrl).then(response => response.json())
    })

    const quarterlyIncomeStatementApiCalls = tickersWithQuoteData.map(tickerObj => {
        const quarterlyUrl = quarterlyIncomeStatementsBaseUrl + tickerObj.symbol
        return fetch(quarterlyUrl)
            .then(response => response.json())
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

    return arrayOfObjects.map(obj => {

        return {
            currency: obj.currency,
            data: Object.entries(obj.data).reduce((finalObj, [key, val]) => {
            
                console.log('old key: ', key)
                const validKey = key.toLowerCase().replace(/[.]/g, '').replace(/[ ]/g, '_')
                console.log('new key: ', validKey)
                finalObj[validKey] = val
                return finalObj
            }, {})
        }

    })

}