const { Cluster } = require('puppeteer-cluster');

export async function scrapeAllTickersWithCluster(page) {

    console.log('wtf...')

    await page.goto(`https://elite.finviz.com/screener.ashx`, { timeout: 5000 })

    let symbols = []

    const numberOfPages = await page.evaluate(() => {
        const pageNumberLinks = document.querySelectorAll('.screener-pages')
        return pageNumberLinks[pageNumberLinks.length - 1].textContent
    })

    const cappedNumberOfPages = process.env.MAX_PAGES_TO_SCRAPE ?
        Math.min(+process.env.MAX_PAGES_TO_SCRAPE, numberOfPages) : numberOfPages;

    console.log('number of pages: ', numberOfPages);
    console.log('MAX_PAGES_TO_SCRAPE: ', process.env.MAX_PAGES_TO_SCRAPE);
    console.log('capped number of pages: ', cappedNumberOfPages);

    const _console = console
    
    return await (async () => {
        const pageNumbers = (new Array(cappedNumberOfPages)).fill(0).map((_, indx) => indx + 1);
        
        console.log('Scraping tickers with cluster max concurrency set to: ', process.env.TICKER_SCRAPER_CLUSTER_MAX_CONCURRENCY)
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: +process.env.TICKER_SCRAPER_CLUSTER_MAX_CONCURRENCY,
        });

        await cluster.task(async ({ page, data: url }) => {
            
            _console.log('running???')
            try {
                _console.log('running task for: ', url)
                await page.goto(url, { waitForSelector: 'a.screener-link-primary', timeout: 4000  })
                // await page.goto(url, { waitUntil: 'load', timeout: 10000 })

                // const stringToLookFor = '?r='
                // const indexOfCharsBeforeNum = url.indexOf(stringToLookFor)

                // const urlNum = url.substr(indexOfCharsBeforeNum + stringToLookFor.length) * 10

                // _console.log('sleeping for: ', urlNum)
                
                // await page.waitForTimeout(urlNum)
                // await page.waitForTimeout(50)
                
                // _console.log('done sleepin...', urlNum)

                // await page.screenshot({ path: `img/${url.slice(url.length - 5)}.png` });

                // await page.goto(url)

                // await page.waitForSelector(, {
                //     waitForSelector: true,
                //     timeout: 1000
                // });

                const symbolsOnPage: string[] = await page.evaluate(() => {
                    const symbols = Array.from(document.querySelectorAll('a.screener-link-primary'))
                        .map(cell => cell.textContent)

                    console.log('found some symbols: ', symbols)
                    return symbols
                })

                symbols = [...symbols, ...symbolsOnPage]
            }
            catch (err) {
                console.log('errr2', err)
                 await page.screenshot({ path: `img/${url.slice(url.length - 5)}.png` });

                console.log('errored so requeuing2: ', url)
            }

        });

        console.log(`scraping ${pageNumbers.length} pages`)

        for (const pageNumber of pageNumbers) {
            const firstRowIndex = 20 * (pageNumber - 1)
            cluster.queue(`https://finviz.com/screener.ashx?r=${firstRowIndex}`);

            console.log('queueing ', pageNumber, ' index: ', firstRowIndex)
        }



        console.log('idling...')

        await cluster.idle();
        await cluster.close();

        console.log('scraped symbols: ', symbols)

        return Promise.resolve(symbols)
    })();
}

/**
 *  Deprecated, son.
 */

// async function getSymbolsForPage(page, pageNumber): Promise<string[]> {

//     return new Promise(async resolve => {

//         const firstRowIndex = 1 + 20 * (pageNumber - 1)
//         console.log('firstRowIndex: ', firstRowIndex)


//         await page.goto(`https://finviz.com/screener.ashx?r=${firstRowIndex}`, { waitUntil: 'networkidle2' })
//         // await page.waitForNavigation()

//         const symbolsOnPage: string[] = await page.evaluate(() => {
//             const symbols = Array.from(document.querySelectorAll('.screener-link-primary'))
//                 .map(cell => cell.textContent)

//             return symbols
//         })

//         resolve(symbolsOnPage)
//     })

// }

// export async function scrapeAllTickers(page): Promise<string[]> {
//     return new Promise(async resolve => {

//         await page.goto(`https://finviz.com/screener.ashx`)

//         const results = []
//         let symbols = []

//         const numberOfPages = await page.evaluate(() => {
//             const pageNumberLinks = document.querySelectorAll('.screener-pages')
//             return pageNumberLinks[pageNumberLinks.length - 1].textContent
//         })

//         console.log('number of pages: ', numberOfPages);

//         const cappedNumberOfPages = process.env.MAX_PAGES_TO_SCRAPE ? Math.min(+process.env.MAX_PAGES_TO_SCRAPE, numberOfPages) : numberOfPages

//         const pageNumbers = (new Array(cappedNumberOfPages)).fill(0).map((_, indx) => indx + 1)

//         console.log('scraping data for: ', pageNumbers.length, ' pages.')

//         for (const pageNumber of pageNumbers) {

//             console.log('pageNumber is: ', pageNumber)

//             const symbolsInPage = await getSymbolsForPage(page, pageNumber);

//             console.log('symbolsInPage: ', symbolsInPage)

//             symbols = [...symbols, ...symbolsInPage]

//         }

//         console.log(`Scraped ${symbols.length} symbols.`)

//         resolve(symbols)
//     })

// }

