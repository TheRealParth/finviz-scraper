

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

                const v1 = key.toLowerCase()

                console.log('v1 ', v1)

                const v2 = v1.replace(/[.]/g, '')

                console.log('v2 ', v2)

                const v3 = v2.replace(/[ ]/g, '_')

                console.log('v3 ', v3)

                console.log('gggg ', key, val)
                console.log('gggg valid', validKey)

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

            await page.waitForSelector(selector, { timeout: 2000 });

            console.log('evaluating a tags...')
            const aTagElements = await page.evaluate(() => {

                console.log('evaluating a tags yep...')

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
            console.log('ok: ', JSON.stringify(aTagElements, null, 2))

            try {

                await page.waitForNavigation({
                    waitUntil: 'networkidle0',
                    timeout: 1000
                });
            }

            finally {

                const statementsData = await page.evaluate(() => {

                    return Array.from(document.querySelectorAll('.statements-table td'))
                        .map(cell => cell.textContent)

                })

                console.log('got statements data: ', JSON.stringify(statementsData, null, 2))
                console.log('statements data length: ', statementsData.length)
                console.log('statements[0]: ', statementsData[0])

                resolve(statementsData)


            }

        }
        catch(err) {
            resolve([])
        }
    })
}
