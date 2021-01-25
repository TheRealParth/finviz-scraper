const { Cluster } = require('puppeteer-cluster');

export async function scrapeAllTickersWithCluster(page) {

    await page.goto(`https://finviz.com/screener.ashx`)

    let symbols = []

    const numberOfPages = await page.evaluate(() => {
        const pageNumberLinks = document.querySelectorAll('.screener-pages')
        return pageNumberLinks[pageNumberLinks.length - 1].textContent
    })

    console.log('number of pages: ', numberOfPages);
    console.log('MAX_PAGES_TO_SCRAPE: ', process.env.MAX_PAGES_TO_SCRAPE);

    const cappedNumberOfPages = process.env.MAX_PAGES_TO_SCRAPE ? Math.min(+process.env.MAX_PAGES_TO_SCRAPE, numberOfPages) : numberOfPages;

    console.log('capped number of pages: ', cappedNumberOfPages);

    return await (async () => {
        const pageNumbers = (new Array(cappedNumberOfPages)).fill(0).map((_, indx) => indx + 1);

        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 5,
        });

        await cluster.task(async ({ page, data: url }) => {

            await page.goto(url, { waitUntil: 'domcontentloaded' })

            const symbolsOnPage: string[] = await page.evaluate(() => {
                const symbols = Array.from(document.querySelectorAll('.screener-link-primary'))
                    .map(cell => cell.textContent)

                return symbols
            })

            symbols = [...symbols, ...symbolsOnPage]

        });

        for (const pageNumber of pageNumbers) {
            const firstRowIndex = 1 + 20 * (pageNumber - 1)
            cluster.queue(`https://finviz.com/screener.ashx?r=${firstRowIndex}`);
        }

        await cluster.idle();
        await cluster.close();

        // console.log('scraped symbols: ', symbols)

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

