// const puppeteer = require('puppeteer')

// import { handleRequest } from '../utils/handle-request/handle-request'


export async function getFinvizDataForTickers(page, tickers) {

    let currentTickerIndex = 0

    while (currentTickerIndex < tickers.length) {

        await scrapeDataForSingleTicker(page, tickers[currentTickerIndex])

        currentTickerIndex += 1;
    }

}

async function scrapeDataForSingleTicker(page, ticker) {

    return new Promise(async resolve => {

        console.log('scraping data for ticker: ', ticker)

        // const browser = await puppeteer.launch({ headless: false })
        // const page = await browser.newPage()
        // await page.setViewport({ width: 1200, height: 800 })
        // await page.setRequestInterception(true)

        // page.on('request', handleRequest)

        await page.goto(`https://finviz.com/quote.ashx?t=${ticker}`)

        // await page.waitForSelector('.statements-table');

        try {

            const selector = '.statements-table'

            const quarterlyATag = 'a[contains(quarterly)]'
            await page.waitForSelector(quarterlyATag, { timeout: 2000 });

            // quarterlyATag.cl

            await page.evaluate(async () => {
                await document.querySelector(quarterlyATag)[0].click()
                // .map(cell => cell.textContent)    
            })
            // (await page.$$eval(quarterlyATag, a => a
            //     .filter(a => a.textContent === 'target text')
            // ))[0].click()


            await page.waitForSelector(selector, { timeout: 2000 });

            // await page.waitForSelector(selector, { timeout: 2000 });



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

            resolve({})

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