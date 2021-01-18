const puppeteer = require('puppeteer')

import { handleRequest } from '../utils/handle-request/handle-request'
import { scrapeDataForSingleTicker } from './single-ticker-scraping/scrape-data-for-single-ticker'

async function getSymbolsForPage(page, pageNumber): Promise<string[]> {

    return new Promise(async resolve => {

        const firstRowIndex = 1 + 20 * (pageNumber - 1)
        console.log('firstRowIndex: ', firstRowIndex)

        
        await page.goto(`https://finviz.com/screener.ashx?r=${firstRowIndex}`, { waitUntil: 'networkidle2' })
        // await page.waitForNavigation()
        
        const symbolsOnPage: string[] = await page.evaluate(() => {
            const symbols = Array.from(document.querySelectorAll('.screener-link-primary'))
            .map(cell => cell.textContent)
            
            return symbols
        })
        
        resolve(symbolsOnPage)
    })

}

export async function scrapeAllTickers(page): Promise<string[]> {
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

        // const smallerNumberOfElements = 3
        // const pageNumbers = (new Array(smallerNumberOfElements)).fill(0).map((_, indx) => indx + 1)


        const cappedNumberOfPages = process.env.MAX_PAGES_TO_SCRAPE ? Math.min(+process.env.MAX_PAGES_TO_SCRAPE, numberOfPages) : numberOfPages

        const pageNumbers = (new Array(cappedNumberOfPages - 1)).fill(0).map((_, indx) => indx + 1)

        console.log('scraping data for: ', pageNumbers.length, ' pages.')

        for (const pageNumber of pageNumbers) {

            console.log('pageNumber is: ', pageNumber)

            const symbolsInPage = await getSymbolsForPage(page, pageNumber);

            console.log('symbolsInPage: ', symbolsInPage)

            symbols = [...symbols, ...symbolsInPage]

        }

        // console.log('scraped symbols: ', JSON.stringify(results))

        console.log(`Scraped ${symbols.length} symbols.`)

        resolve(symbols)
    })

}

