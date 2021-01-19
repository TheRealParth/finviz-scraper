
const { Cluster } = require('puppeteer-cluster');


export function getFinvizIncomeDataForTickersWithCluster(page, tickers) {

    return new Promise(async resolve => {

        const baseUrl = 'https://finviz.com/quote.ashx?t='

        const finvizTickersWithData = [];

            (async () => {
                // Create a cluster with 2 workers
                const cluster = await Cluster.launch({
                    concurrency: Cluster.CONCURRENCY_CONTEXT,
                    maxConcurrency: 5,
                });

                // Define a task (in this case: screenshot of page)
                await cluster.task(async ({ page, data: url }) => {

                    try {

                        const selector = '.statements-table'

                        console.log('waiting for statements table...')

                        // await page.waitForSelector(selector, { timeout: 2000 });

                        await page.waitForSelector('a.tab-link', {
                            waitUntil: 'networkidle0',
                            timeout: 60
                        });

                        console.log('evaluating a tags...')
                        const aTagElements = await page.evaluate(() => {
                            return Array.from(document.querySelectorAll<HTMLElement>('a.tab-link'))
                                .map(async (cell) => {
                                    console.log('checking cell: ', cell)
                                    if (cell.textContent === 'quarterly') {
                                        cell.click()
                                        console.log('clicking!!!');
                                        return Promise.resolve(true)
                                    }
                                })
                        })

                        try {

                            await page.waitForNavigation({
                                waitUntil: 'networkidle0',
                                timeout: 70
                            });
                        }

                        finally {

                            const statementsData = await page.evaluate(() => {

                                return Array.from(document.querySelectorAll('.statements-table td'))
                                    .map(cell => cell.textContent)

                            })

                            // console.log('got statements data: ', JSON.stringify(statementsData, null, 2))
                            console.log('statements data length: ', statementsData.length)

                            // resolve(statementsData)

                            console.log('statements data... ', statementsData)

                            const incomeDataObj = {}

                            const numberOfColumns = statementsData.indexOf('Period Length')

                            for (let i = 0; i < statementsData.length; i++) {

                                if (i % numberOfColumns === 0) {

                                    incomeDataObj[statementsData[i]] = statementsData.filter((el, index) => {

                                        if (index > i && index < (i + numberOfColumns))
                                            return el

                                    })
                                }
                            }

                            const niceKeysIncomeDataObj = Object.entries(incomeDataObj).reduce((acc, [key, val]) => {

                                const validKey = key.toLowerCase().replace(/[.]/g, '').replace(/[ ]/g, '_')

                                return { ...acc, [validKey]: val }

                            }, {})

                            finvizTickersWithData.push({
                                symbol: url.slice(baseUrl.length),
                                income_statements: {
                                    quarterly: niceKeysIncomeDataObj
                                }
                            })
                        }

                    }
                    catch (err) {
                        console.log('err: ', err)
                    }

                    // const finvizTickersWithData = []

                    // while (currentTickerIndex < tickers.length) {

                    //     const incomeStatementCellsText: string[] = await scrapeDataForSingleTicker(page, tickers[currentTickerIndex])

                    //     const incomeDataObj = {}

                    //     const numberOfColumns = incomeStatementCellsText.indexOf('Period Length')

                    //     for (let i = 0; i < incomeStatementCellsText.length; i++) {

                    //         if (i % numberOfColumns === 0) {

                    //             incomeDataObj[incomeStatementCellsText[i]] = incomeStatementCellsText.filter((el, index) => {

                    //                 if (index > i && index < (i + numberOfColumns))
                    //                     return el

                    //             })
                    //         }
                    //     }

                    //     const niceKeysIncomeDataObj = Object.entries(incomeDataObj).reduce((acc, [key, val]) => {

                    //         const validKey = key.toLowerCase().replace(/[.]/g, '').replace(/[ ]/g, '_')

                    //         return { ...acc, [validKey]: val }

                    //     }, {})

                    //     finvizTickersWithData.push({
                    //         symbol: tickers[currentTickerIndex],
                    //         income_statements: {
                    //             quarterly: niceKeysIncomeDataObj
                    //         }
                    //     })

                    //     currentTickerIndex += 1;

                    //     console.log('index now: ', currentTickerIndex)

                    //     if (currentTickerIndex === tickers.length) {

                    //         console.log('returning finviz income data: ', finvizTickersWithData)

                    //         resolve(finvizTickersWithData)
                    //     }
                    // }

                    // await page.goto(url);

                    // await page.goto(url, { waitUntil: 'networkidle2' })
                    // // await page.waitForNavigation()

                    // const symbolsOnPage: string[] = await page.evaluate(() => {
                    //     const symbols = Array.from(document.querySelectorAll('.screener-link-primary'))
                    //         .map(cell => cell.textContent)

                    //     return symbols
                    // })

                    // const path = url.replace(/[^a-zA-Z]/g, '_') + '.png';
                    // await page.screenshot({ path });
                    // console.log(`Screenshot of ${url} saved: ${path}`);

                    // console.log('pageNumber is: ', pageNumber)

                    //     const symbolsInPage = await getSymbolsForPage(page, pageNumber);


                    // console.log('symbolsInPage: ', symbolsInPage)

                    // symbols = [...symbols, ...symbolsOnPage]

                    // resolve(symbolsOnPage)

                    console.log('queueing...')

                    for (const ticker of tickers) {
                        // const firstRowIndex = 1 + 20 * (pageNumber - 1)
                        cluster.queue(`https://finviz.com/quote.ashx?t=${ticker}`);
                    }

                    console.log('queueing finished...')
                    // Add some pages to queue
                    // cluster.queue('https://www.google.com');
                    // cluster.queue('https://www.wikipedia.org');
                    // cluster.queue('https://github.com/');

                    // Shutdown after everything is done
                    await cluster.idle();
                    console.log('idle2...')
                    await cluster.close();
                    console.log('closing2...')
                    console.log('resolving symbols2: ', finvizTickersWithData)
                    resolve(finvizTickersWithData)
                })

            })

    })
}

export function getFinvizIncomeDataForTickers(page, tickers) {

        return new Promise(async resolve => {

            let currentTickerIndex = 1  // start at 1 to skip the headers row

            const finvizTickersWithData = []

            while (currentTickerIndex < tickers.length) {

                const incomeStatementCellsText: string[] = await scrapeDataForSingleTicker(page, tickers[currentTickerIndex])

                const incomeDataObj = {}

                const numberOfColumns = incomeStatementCellsText.indexOf('Period Length')

                for (let i = 0; i < incomeStatementCellsText.length; i++) {

                    if (i % numberOfColumns === 0) {

                        incomeDataObj[incomeStatementCellsText[i]] = incomeStatementCellsText.filter((el, index) => {

                            if (index > i && index < (i + numberOfColumns))
                                return el

                        })
                    }
                }

                const niceKeysIncomeDataObj = Object.entries(incomeDataObj).reduce((acc, [key, val]) => {

                    const validKey = key.toLowerCase().replace(/[.]/g, '').replace(/[ ]/g, '_')

                    return { ...acc, [validKey]: val }

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

            await page.goto(`https://finviz.com/quote.ashx?t=${ticker}`)


            try {

                const selector = '.statements-table'

                console.log('waiting for statements table...')

                // await page.waitForSelector(selector, { timeout: 2000 });

                await page.waitForSelector('a.tab-link', {
                    waitUntil: 'networkidle0',
                    timeout: 60
                });

                console.log('evaluating a tags...')
                const aTagElements = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll<HTMLElement>('a.tab-link'))
                        .map(async (cell) => {
                            console.log('checking cell: ', cell)
                            if (cell.textContent === 'quarterly') {
                                cell.click()
                                console.log('clicking!!!');
                                return Promise.resolve(true)
                            }
                        })
                })

                try {

                    await page.waitForNavigation({
                        waitUntil: 'networkidle0',
                        timeout: 70
                    });
                }

                finally {

                    const statementsData = await page.evaluate(() => {

                        return Array.from(document.querySelectorAll('.statements-table td'))
                            .map(cell => cell.textContent)

                    })

                    // console.log('got statements data: ', JSON.stringify(statementsData, null, 2))
                    console.log('statements data length: ', statementsData.length)

                    resolve(statementsData)
                }

            }
            catch (err) {
                resolve([])
            }
        })
    }
