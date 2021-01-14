const puppeteer = require('puppeteer')

import { handleRequest } from '../utils/handle-request/handle-request'


export async function getFinvizDataForTickers(tickers) {

    let currentTickerIndex = 0

    while (currentTickerIndex < tickers.length) {

        await scrapeDataForSingleTicker(tickers[currentTickerIndex])

        currentTickerIndex += 1;
    }

}

async function scrapeDataForSingleTicker(ticker) {

    return new Promise(async resolve => {

        console.log('scraping data for ticker: ', ticker)

        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()
        await page.setViewport({ width: 1200, height: 800 })
        await page.setRequestInterception(true)

        page.on('request', handleRequest)

        await page.goto(`https://finviz.com/quote.ashx?t=${ticker}`)

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
                
                return Array.from(document.querySelectorAll('table.statements-table td'))
                    .map(cell => cell.textContent)
        
                // return symbols
            // })

            // const pageNumberLinks = 
            // return pageNumberLinks[pageNumberLinks.length - 1].textContent
        })

        console.log('got statements data: ', statementsData)

        resolve(statementsData)

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