const puppeteer = require('puppeteer')

import { handleRequest } from '../utils/handle-request/handle-request'
import { scrapeDataForSingleTicker } from './single-ticker-scraping/scrape-data-for-single-ticker'

const { Cluster } = require('puppeteer-cluster');

export async function scrapeAllTickersWithCluster(page) {

    console.log('foo4')
    await page.goto(`https://finviz.com/screener.ashx`)

    // await page.waitForNavigation();

    // await page.wait(1000)

    const results = []
    let symbols = []

    console.log('foo5')

    const numberOfPages = await page.evaluate(() => {
        console.log('foo6')
        const pageNumberLinks = document.querySelectorAll('.screener-pages')

        console.log('page number links: ', pageNumberLinks)

        return pageNumberLinks[pageNumberLinks.length - 1].textContent
    })

    console.log('number of pages: ', numberOfPages);
    console.log('MAX_PAGES_TO_SCRAPE: ', process.env.MAX_PAGES_TO_SCRAPE);

    const cappedNumberOfPages = process.env.MAX_PAGES_TO_SCRAPE ? Math.min(+process.env.MAX_PAGES_TO_SCRAPE, numberOfPages) : numberOfPages;

    const pageNumbers = (new Array(cappedNumberOfPages)).fill(0).map((_, indx) => indx + 1);

    await (async () => {
        console.log('foo7')
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 5,
        });

        console.log('foo7.5')
        await cluster.task(async ({ page, data: url }) => {

            console.log('foo8')
            await page.goto(url, { waitUntil: 'networkidle2' })
            console.log('foo9')

            const symbolsOnPage: string[] = await page.evaluate(() => {
                const symbols = Array.from(document.querySelectorAll('.screener-link-primary'))
                    .map(cell => cell.textContent)

                return symbols
            })

            console.log('adding symbols to list: ', symbolsOnPage )
            
            symbols = [...symbols, ...symbolsOnPage]
            
            console.log('list now: ', symbols  )

        });

        // for (const pageNumber of pageNumbers) {
        // const firstRowIndex = 1 + 20 * (pageNumber - 1)

        // console.log('first row: ', firstRowIndex)
        cluster.queue(`https://finviz.com/screener.ashx?r=${1}`);
        // }

        console.log('queueing finished...')

        console.log('foo10')

        await cluster.idle();
        console.log('idle...')
        await cluster.close();
        console.log('closing...')
        console.log('resolving symbols: ', symbols)

        return Promise.resolve(symbols)
    })();

}

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

        const pageNumbers = (new Array(cappedNumberOfPages)).fill(0).map((_, indx) => indx + 1)

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

