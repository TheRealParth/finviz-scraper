import * as fetch from 'node-fetch';
const clonedeep = require('lodash.clonedeep')

const quarterlyIncomeStatementsBaseUrl = 'https://elite.finviz.com/api/statement.ashx?s=IQ&t='
const annualIncomeStatementsBaseUrl = 'https://elite.finviz.com/api/statement.ashx?t='

export async function getTickerListWithIncomeDataApiCalls(tickersWithQuoteData) {


    const annualIncomeStatementApiCalls = tickersWithQuoteData.map((tickerObj, index) => {
        const annualUrl = annualIncomeStatementsBaseUrl + tickerObj['ticker']
        return new Promise(resolve => setTimeout(resolve, 70 * index)).then(() => fetch(annualUrl)
            .then(response => response.json())
            .catch(err => {
                console.log('uh oh, error calling for annual statements: ', err)
            }));
    })

    const quarterlyIncomeStatementApiCalls = tickersWithQuoteData.map((tickerObj, index) => {
        const quarterlyUrl = quarterlyIncomeStatementsBaseUrl + tickerObj['ticker']
        return new Promise(resolve => setTimeout(resolve, 70 * index)).then(() => fetch(quarterlyUrl)
            .then(response => {

                const res = response.json()
                // console.log('2- got data for ', tickerObj['ticker'], res)
                return res
            })
            .catch(err => {

                console.log('uh oh, error calling for quarterly statements: ', err)
                return err
            }));

    })



    // TODO - not scraping correct income statements for Ticker? 🤔

    console.log('calling for annual income Statements...')
    // const annualIncomeStatements = await Promise.all(annualIncomeStatementApiCalls)
    // console.log('calling for quarterly income Statements...')
    // const quarterlyIncomeStatements = await Promise.all(quarterlyIncomeStatementApiCalls)


    // const annualIncomeStatements = annualIncomeStatementApiCalls.forEach(async (apiCall) => {
    const annualIncomeStatements = []
    let annualIncomeStatementCallsMade = 0;

    for await (let apiCall of annualIncomeStatementApiCalls) {
        // console.log('call: ', apiCall)

        
        const result = await makeCall(apiCall);
        
        // if (apiCall === 'https://elite.finviz.com/api/statement.ashx?s=IQ&t=AAME')
        console.log('got annual income data for: ', ' ', result)
        // console.log('got annual income data for: ', apiCall)
        // console.log('inc: ', result)
        
        annualIncomeStatements[annualIncomeStatementCallsMade] = (result);
        annualIncomeStatementCallsMade++;
        console.log('making call for annual income: ', annualIncomeStatementCallsMade);
    }
    
    const quarterlyIncomeStatements = []
    let quarterlyIncomeStatementCallsMade = 0;
    
    for await (let apiCall of quarterlyIncomeStatementApiCalls) {
        
        quarterlyIncomeStatementCallsMade++;
        console.log('making call for quarterly income: ', quarterlyIncomeStatementCallsMade);
        const result = await makeCall(apiCall);
        // console.log('call result: ', result)
        
        console.log('got quarterly income data for: ', ' ', result)
        quarterlyIncomeStatements[quarterlyIncomeStatementCallsMade] = (result);
        quarterlyIncomeStatementCallsMade++;
    }

    async function makeCall(call) {
        const result = await call;
        return result;
    }


    console.log('quarterly incomes: ', JSON.stringify(quarterlyIncomeStatements, null, 2));
    // console.log('quarterly incomes: ', JSON.stringify(quarterlyIncomeStatements.slice(4), null, 2));

    const niceKeysAnnualIncomeStatements = makeObjectKeysNice(annualIncomeStatements)
    const niceKeysQuarterlyIncomeStatements = makeObjectKeysNice(quarterlyIncomeStatements)


    // for await(let apiCall of annualIncomeStatements) {
    //     apiCall
    // }


    //     const sum = await [
    //   Promise.resolve(1),
    //   Promise.resolve(1),
    //   Promise.resolve(1)
    // ].reduce(async (previousPromise, itemPromise) => {
    //   const sum = await previousPromise;
    //   const item = await itemPromise;
    //   return sum + item;
    // }, Promise.resolve(0))

    return tickersWithQuoteData.map((tickerObj, currentIndex) => {

        // await()


        console.log('2323 saving income data for: ', currentIndex, ' - ', tickerObj.ticker, niceKeysQuarterlyIncomeStatements[currentIndex])

        return {
            ...clonedeep(tickerObj),
            income_statements: {
                // ticker: tickers[currentIndex],
                // quarterly: quarterlyIncomeStatements[currentIndex],
                ticker: tickersWithQuoteData[currentIndex].ticker,
                quarterly: niceKeysQuarterlyIncomeStatements[currentIndex],
                annual: niceKeysAnnualIncomeStatements[currentIndex]
            }
        }
    })

}

function makeObjectKeysNice(arrayOfObjects) {

    return arrayOfObjects
        // .filter(obj => !obj.error)
        // .filter(obj => obj.data !== undefined)
        .map(obj => {

        //     // console.log('making keys nice: ', obj)

            if (!obj.currency || !obj.data)
                return {
                    currency: null,
                    data: null
                }

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