
const { Cluster } = require('puppeteer-cluster');

export async function getFinvizIncomeDataForTickersWithCluster(page, tickers) {

    console.log('getting income data for tickers: ', tickers)

    const baseUrl = 'https://finviz.com/quote.ashx?t='

    const finvizTickersWithData = [];

    // return Promise.resolve('foo')

    return await (async () => {

        console.log('in the async...')

        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 5,
        });

        // Define a task (in this case: screenshot of page)
        await cluster.task(async ({ page, data: url }) => {

            const ticker = url.slice(baseUrl.length)

            console.log('running task for ' + ticker)

            try {

                const selector = '.statements-table'

                console.log('checking stock page at url: ', url)

                await page.goto(url, { waitUntil: 'networkidle0' })

                // await page.screenshot(`./img/${ticker}`)

                console.log('evaluating a tags...')

                // page.on('console', consoleObj => console.log(consoleObj.text()));

                const aTagElements = await page.evaluate(() => {
                    return new Promise(async resolve => {

                        const aTagsText = Array.from(document.querySelectorAll<HTMLElement>('a.tab-link'))
                        .map(async (cell) => {
                        console.log('checking cell: ', cell.textContent)
                        if (cell.textContent === 'quarterly') {

                            console.log('clicking!!!');

                            await cell.click()

                        }
                        return cell.textContent
                        })

                        // for (let i = 0; i < aTagElements.length; i++) {
                        //     if (aTagElements[i].textContent === 'quarterly') {

                        //         console.log('clicking!!!');

                        //         await aTagElements[i].click()
                                
                        //     }
                            
                        // }
                        
                        
                        resolve(aTagsText)
                    })
                })
                
                console.log('looked through a tags: ', aTagElements)
                
                // await page.waitForResponse('statement')
                
                
                // await page.waitForNavigation()
                await page.waitForTimeout(350)
                
                await page.waitForSelector('.statements-table', { timeout: 500 })
                
                const statementsData = await page.evaluate(() => {
                    
                    return Array.from(document.querySelectorAll('.statements-table td'))
                    .map(cell => cell.textContent)
                    
                })
                
                return statementsData
                console.log('statements data is: ', statementsData)
                
                // console.log('statements data... ', statementsData)
                
                const incomeDataObj = {}
                
                const numberOfColumns = statementsData.indexOf('Period Length')
                
                // for (let i = 0; i < statementsData.length; i++) {
                    
                    //     if (i % numberOfColumns === 0) {
                        
                        //         incomeDataObj[statementsData[i]] = statementsData.filter((el, index) => {
                            
                            //             if (index > i && index < (i + numberOfColumns))
                            //                 return el
                            
                            //         })
                            //     }
                            // }
                            
                            // const niceKeysIncomeDataObj = Object.entries(incomeDataObj).reduce((acc, [key, val]) => {
                                //     return { ...acc, [validKey]: val }
                                // }, {})
                                
                                // finvizTickersWithData.push({
                                    //     symbol: url.slice(baseUrl.length),
                                    //     income_statements: {
                                        //         quarterly: niceKeysIncomeDataObj
                                        //     }
                                        // })
                                    }
                                    
                                    catch (err) {
                                        console.log(`welp, no income statements for ${ticker}`)
                                        console.log(`err: ${err}`)
                                    }
                                    
                                })
                                
                                console.log('queueing...')
                                
                                // for (const ticker of tickers.slice(0, 4)) {
                                    for (const ticker of tickers) {
                                        console.log('queuing ticker: ', ticker)
                                        cluster.queue(`https://finviz.com/quote.ashx?t=${ticker}`);
                                    }
                                    
                                    await cluster.idle();
                                    console.log('idle2...')
                                    await cluster.close();
                                    console.log('closing2...')
                                    console.log('resolving symbols2: ', finvizTickersWithData)
                                    console.log('queueing finished...')
                                    
                                    return Promise.resolve(finvizTickersWithData)
                                })();
                                
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
                                        
                                        console.log('pushing object: ', {
                                            symbol: tickers[currentTickerIndex],
                                            income_statements: {
                                                quarterly: niceKeysIncomeDataObj
                                            }
                                        })
                                        
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

        await page.goto(`https://finviz.com/quote.ashx?t=${ticker}`, { waitUntil: 'networkidle2' })


        try {

            const selector = '.statements-table'

            console.log('waiting for statements table...')

            // await page.waitForSelector(selector, { timeout: 2000 });

            await page.waitForSelector('a.tab-link', {
                waitForSelector: true,
                timeout: 1000
            });

            console.log('found an a!')

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

            // try {

            //     await page.waitForNavigation({
            //         waitUntil: 'networkidle0',
            //         timeout: 70
            //     });
            // }

            // finally {

            await page.waitForSelector('.statements-table')

            const statementsData = await page.evaluate(() => {

                return Array.from(document.querySelectorAll('.statements-table td'))
                    .map(cell => cell.textContent)

            })

            console.log('statements data length: ', statementsData.length)

            resolve(statementsData)
        }

        // }
        catch (err) {
            resolve([])
        }
    })
}
