const puppeteer = require('puppeteer')

import { handleRequest } from '../utils/handle-request/handle-request'
import { scrapeDataForSingleTicker } from './single-ticker-scraping/scrape-data-for-single-ticker'

async function getSymbolsForPage(page, pageNumber) {

    const firstRowIndex = 1 + 20 * (pageNumber - 1)
    console.log('firstRowIndex: ', firstRowIndex)

    // const page = await browser.newPage()
    // await page.setViewport({ width: 1200, height: 800 })
    // await page.setRequestInterception(true);

    // page.on('request', handleRequest)

    await page.goto(`https://finviz.com/screener.ashx?r=${firstRowIndex}`, { waitUntil: 'networkidle2' })

    const symbolsOnPage = await page.evaluate(() => {
        const symbols = Array.from(document.querySelectorAll('.screener-link-primary'))
            .map(cell => cell.textContent)

        return symbols
    })

    return symbolsOnPage

}

export const scrapeAllTickers = async (page) => {
    return new Promise(async resolve => {

        console.log('page 1: ', page)

        // const page = await browser.newPage()
        // await page.setViewport({ width: 1200, height: 800 })
        // await page.setRequestInterception(true)

        // page.on('request', handleRequest)

        await page.goto(`https://finviz.com/screener.ashx`)

        const results = []
        let symbols = []

        const numberOfPages = await page.evaluate(() => {
            const pageNumberLinks = document.querySelectorAll('.screener-pages')
            return pageNumberLinks[pageNumberLinks.length - 1].textContent
        })

        console.log('number of pages: ', numberOfPages);

        const numOfElements = 3

        const pageNumbers = (new Array(numOfElements)).fill(0).map((_, indx) => indx + 1)

        for (const pageNumber of pageNumbers) {

            console.log('pageNumber is: ', pageNumber)

            const symbolsInPage = await getSymbolsForPage(page, pageNumber);

            console.log('symbolsInPage: ', symbolsInPage)

            symbols = [...symbols, ...symbolsInPage]

        }

        // console.log('done! ', JSON.stringify(results))

        // resolve(results)
        resolve(symbols)

    })

}

