
const { Cluster } = require('puppeteer-cluster');

export async function getFinvizQuoteDataForTickersWithCluster(page, tickers) {
    console.log('getting income data for tickers: ', tickers)

    const baseUrl = 'https://finviz.com/quote.ashx?t='

    const finvizTickersWithData = [];

    return await (async () => {

        console.log('in the async...')

        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: +process.env.CLUSTER_MAX_CONCURRENCY,
        });

        await cluster.task(async ({ page, data: url }) => {

            const ticker = url.slice(baseUrl.length)

            console.log('scraping quote table for: ' + ticker)

            try {

                // console.log('checking stock page at url: ', url)

                await page.goto(url, { waitUntil: 'domcontentloaded' })

                const headerAndIndustriesText = await page.evaluate(() => Array
                    .from(document.querySelectorAll('.fullview-title tr td'))
                    .map(cell => cell.textContent))

                const companyFullName = headerAndIndustriesText[1]

                const companyIndustries = headerAndIndustriesText[2].split(' | ')

                const quoteData = await page.evaluate(() => Array
                    .from(document.querySelectorAll('table.snapshot-table2 td'))
                    .map(cell => cell.textContent))

                // console.log('quote data is: ', quoteData)

                const quoteDataObj = {}

                for (let i = 0; i < quoteData.length; i++)
                    if (i % 2 === 0) {
                        const validKey = quoteData[i].toLowerCase().replace(/[.]/g, '').replace(/[ ]/g, '_')
                        quoteDataObj[validKey] = quoteData[i + 1]
                    }


                // console.log('made a quote data object! ', JSON.stringify(quoteDataObj, null, 2))

                finvizTickersWithData.push({
                    symbol: url.slice(baseUrl.length),
                    full_name: companyFullName,
                    industries: companyIndustries,
                    quote_data: quoteDataObj
                })
            }
            catch (err) {
                console.log('dang son, an error happened getting quote data: ', err)

                await page.screenshot('./err screentshot - ' + new Date())
            }

        })
        //         // for (const ticker of tickers.slice(0, 4)) {
        for (const ticker of tickers) {
            cluster.queue(`https://finviz.com/quote.ashx?t=${ticker}`);
        }

        await cluster.idle();
        await cluster.close();
        // console.log('got lots of quote data!', JSON.stringify(finvizTickersWithData))
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

            finvizTickersWithData.push({
                symbol: tickers[currentTickerIndex],
                income_statements: {
                    quarterly: niceKeysIncomeDataObj
                }
            })

            currentTickerIndex += 1;

            if (currentTickerIndex === tickers.length)
                resolve(finvizTickersWithData)
        }
    })

}

async function scrapeDataForSingleTicker(page, ticker): Promise<string[]> {

    return new Promise(async resolve => {

        console.log('scraping data for ticker: ', ticker)

        await page.goto(`https://finviz.com/quote.ashx?t=${ticker}`, { waitUntil: 'networkidle2' })


        try {

            await page.waitForSelector('a.tab-link', {
                waitForSelector: true,
                timeout: 1000
            });

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
