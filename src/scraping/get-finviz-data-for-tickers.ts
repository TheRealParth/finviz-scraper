// const puppeteer = require('puppeteer')

// import { handleRequest } from '../utils/handle-request/handle-request'

export const COLUMNS_IN_INCOME_TABLE = 10

export function getFinvizIncomeDataForTickers(page, tickers) {

    return new Promise(async resolve => {

        let currentTickerIndex = 1  // start at 1 to skip the headers row

        const finvizTickersWithData = []

        while (currentTickerIndex < tickers.length) {

            const incomeStatementCellsText: string[] = await scrapeDataForSingleTicker(page, tickers[currentTickerIndex])

            const incomeDataObj = {}

            for (let i = 0; i < incomeStatementCellsText.length; i++) {

                if (i % COLUMNS_IN_INCOME_TABLE === 0) {
                    
                    incomeDataObj[incomeStatementCellsText[i]] = incomeStatementCellsText.filter( (el, index) => {

                        if (index > i && index < (i + COLUMNS_IN_INCOME_TABLE))
                            return el

                    })
                }
            }

            const niceKeysIncomeDataObj = Object.entries(incomeDataObj).reduce( (acc, [key, val]) => {

                const validKey = key.toLowerCase().replace(/[.]/g, '').replace(/[ ]/g, '_')

                const v1 = key.toLowerCase()

                console.log('v1 ', v1)
                
                const v2 = v1.replace(/[.]/g, '')

                console.log('v2 ', v2)
                
                const v3 = v2.replace(/[ ]/g, '_')

                console.log('v3 ', v3)

                console.log('gggg ', key, val)
                console.log('gggg valid', validKey)

                return {...acc, [validKey]: val}

            }, {})

            finvizTickersWithData.push({ 
                symbol: tickers[currentTickerIndex],   
                income_statements: {
                   quarterly: niceKeysIncomeDataObj
                }
            })

            currentTickerIndex += 1;

            console.log('index now: ', currentTickerIndex)

            if (currentTickerIndex === tickers.length) {

                console.log('returning finviz income data: ', finvizTickersWithData)

                resolve(finvizTickersWithData)
            }
        }
    })

}

async function scrapeDataForSingleTicker(page, ticker): Promise<string[]> {

    return new Promise(async resolve => {

        console.log('scraping data for ticker: ', ticker)

        // const browser = await puppeteer.launch({ headless: true })
        // const page = await browser.newPage()
        // await page.setViewport({ width: 1200, height: 800 })
        // await page.setRequestInterception(true)

        // page.on('request', handleRequest)

        await page.goto(`https://finviz.com/quote.ashx?t=${ticker}`)

        // await page.waitForSelector('.statements-table');

        try {

            const selector = '.statements-table'

            // const quarterlyATag = 'a[contains(quarterly)]'
            // await page.waitForSelector(quarterlyATag, { timeout: 2000 });

            // quarterlyATag.cl

            // await page.evaluate(async () => {
            //     await document.querySelector(quarterlyATag)[0].click()
            // .map(cell => cell.textContent)    
            // })
            // (await page.$$eval(quarterlyATag, a => a
            //     .filter(a => a.textContent === 'target text')
            // ))[0].click()


            console.log('waiting for statements table...')
            
            await page.waitForSelector(selector, { timeout: 2000 });
            
            // await page.waitForSelector(selector, { timeout: 2000 });
            
            // await page.click("a[contains('quarterly')");
            
            console.log('evaluating a tags...')
            const aTagElements = await page.evaluate(() => {
                
                // return new Promise(resolve => {
                    
                    console.log('evaluating a tags yep...')

                return Array.from(document.querySelectorAll<HTMLElement>('a.tab-link'))
                    .map((cell) => {
                        console.log('checking cell: ', cell)
                        if (cell.textContent === 'quarterly') {
                            cell.click()
                            console.log('clicking quarterly!!!');
                            // resolve(true)
                            return true
                        }

                        return false

                        // if (i === list.length - 1)
                        //     resolve(null)
                    })


                // })

                // return symbols
                // })

                // const pageNumberLinks = 
                // return pageNumberLinks[pageNumberLinks.length - 1].textContent
            })

            console.log('ok: ', JSON.stringify(aTagElements, null, 2))

            // if (aTagElements)
            //     aTagElements.forEach(async cell => {
            //         console.log('checking a tag: ', cell.textContent)
            //         if (cell.textContent === 'quarterly')
            //             await cell.click()
            //     })


            await page.waitForSelector(selector, { timeout: 2000 });
            await page.waitForSelector(selector, { timeout: 2000 });

            console.log('waiting again...')

            const statementsData = await page.evaluate(() => {

                // return Array.from(document
                //     .querySelectorAll('td'))
                //     // .querySelectorAll('.fullview-profile'))
                //     .map( td => {

                //         console.log('the shit isss: ', td)

                //         td.textContent

                //     })

                // const symbolsOnPage = await page.evaluate(() => {
                // const symbols = 

                // await page.evaluate(async () => {
                return Array.from(document.querySelectorAll('.statements-table td'))
                    .map(cell => cell.textContent)

                // return symbols
                // })

                // const pageNumberLinks = 
                // return pageNumberLinks[pageNumberLinks.length - 1].textContent
            })

            console.log('got statements data: ', JSON.stringify(statementsData, null, 2))
            console.log('statements data length: ', statementsData.length)
            console.log('statements[0]: ', statementsData[0])

            resolve(statementsData)



        } catch (error) {

            console.log('errored: ', error)

            resolve([])

        }

        // const results = []
        // let symbols = []

        // const numberOfPages = await page.evaluate(() => {
        //     const pageNumberLinks = document.querySelectorAll('.screener-pages')
        //     return pageNumberLinks[pageNumberLinks.length - 1].textContent
        // })

        // const page = await browser.newPage()
        // await page.setViewport({ width: 1200, height: 800 })
        // await page.setRequestInterception(true);

        // page.on('request', handleRequest)

        // await page.goto(`https://finviz.com/screener.ashx?r=${firstRowIndex}`, { waitUntil: 'networkidle2' })

        // const symbolsOnPage = await page.evaluate(() => {
        //     // const darkRows = document.querySelectorAll('table-dark-row-cp')
        //     //     .reduce((acc, curr) => acc.push(curr.))

        //     // return pageNumberLinks[pageNumberLinks.length - 1].textContent

        //     const symbols = Array.from(document.querySelectorAll('.screener-link-primary'))
        //         .map(cell => cell.textContent)

        //     return symbols
        // })

        // return symbolsOnPage

        // setTimeout(() => {

        //     resolve({symbol: ticker, lastReportedRevenues: [1, 2, 3]})

        // }, 900)

    })

}