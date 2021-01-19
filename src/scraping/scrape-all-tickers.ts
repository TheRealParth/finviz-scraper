const puppeteer = require('puppeteer')

import { handleRequest } from '../utils/handle-request/handle-request'
import { scrapeDataForSingleTicker } from './single-ticker-scraping/scrape-data-for-single-ticker'

const { Cluster } = require('puppeteer-cluster');

export async function scrapeAllTickersWithCluster(page) {

    // return new Promise(async resolve => {

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


        const cappedNumberOfPages = process.env.MAX_PAGES_TO_SCRAPE ? Math.min(+process.env.MAX_PAGES_TO_SCRAPE, numberOfPages) : numberOfPages;

        const pageNumbers = (new Array(cappedNumberOfPages)).fill(0).map((_, indx) => indx + 1);

        // console.log('scraping data for: ', pageNumbers.length, ' pages.')

        // for (const pageNumber of pageNumbers) {

        //     console.log('pageNumber is: ', pageNumber)

        //     const symbolsInPage = await getSymbolsForPage(page, pageNumber);

        //     console.log('symbolsInPage: ', symbolsInPage)

        //     symbols = [...symbols, ...symbolsInPage]

        // }

        // console.log('scraped symbols: ', JSON.stringify(results))

        // console.log(`Scraped ${symbols.length} symbols.`)

        await (async () => {
            // Create a cluster with 2 workers
            const cluster = await Cluster.launch({
                concurrency: Cluster.CONCURRENCY_CONTEXT,
                maxConcurrency: 5,
            });

            // Define a task (in this case: screenshot of page)
            await cluster.task(async ({ page, data: url }) => {
                // await page.goto(url);

                await page.goto(url, { waitUntil: 'networkidle2' })
                // await page.waitForNavigation()

                const symbolsOnPage: string[] = await page.evaluate(() => {
                    const symbols = Array.from(document.querySelectorAll('.screener-link-primary'))
                        .map(cell => cell.textContent)

                    return symbols
                })

                // const path = url.replace(/[^a-zA-Z]/g, '_') + '.png';
                // await page.screenshot({ path });
                // console.log(`Screenshot of ${url} saved: ${path}`);

                // console.log('pageNumber is: ', pageNumber)

                //     const symbolsInPage = await getSymbolsForPage(page, pageNumber);


                // console.log('symbolsInPage: ', symbolsInPage)

                symbols = [...symbols, ...symbolsOnPage]

                // resolve(symbolsOnPage)
            });



            // const firstRowIndex = 1 + 20 * (pageNumber - 1)
            // console.log('firstRowIndex: ', firstRowIndex)

            console.log('queueing...')

            for (const pageNumber of pageNumbers) {
                const firstRowIndex = 1 + 20 * (pageNumber - 1)
                cluster.queue(`https://finviz.com/screener.ashx?r=${firstRowIndex}`);
            }

            console.log('queueing finished...')
            // Add some pages to queue
            // cluster.queue('https://www.google.com');
            // cluster.queue('https://www.wikipedia.org');
            // cluster.queue('https://github.com/');

            // Shutdown after everything is done
            await cluster.idle();
            console.log('idle...')
            await cluster.close();
            console.log('closing...')
            console.log('resolving symbols: ', symbols)
            
            console.log('umm...')
            console.log('here?...')
            return Promise.resolve(symbols)
        })();
        
        console.log('here2?...')
        return Promise.resolve(symbols)
    // })
    
    console.log('here3?...')

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

