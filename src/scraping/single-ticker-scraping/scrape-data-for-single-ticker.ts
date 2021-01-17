
import { scrapeOverviewData } from './page-scrapers/scrape-overview'

export async function scrapeDataForSingleTicker(page, ticker, rowIndex) {

    return new Promise(async resolve => {

        const overviewData = await scrapeOverviewData(page, rowIndex)

        // const valuationData = await scrapeValuationData()
        // const financialData = await scrapeFinancialData()
        // const ownershipData = await scrapeOwnershipData()
        // const performanceData = await scrapePerformanceData()
        // const technicalData = await scrapeTechnicalData()

        // const stockDoc = {
        //     ...overviewData,
        //     ...valuationData,
        //     ...financialData,
        //     ...ownershipData,
        //     ...performanceData,
        //     ...technicalData,
        // }


        // resolve('foo')

        // const firstRowIndex = 1 + 20 * (pageNumber - 1)
        // console.log('firstRowIndex: ', firstRowIndex)
    
        // const page = await browser.newPage()
        // await page.setViewport({ width: 1200, height: 800 })
        // await page.setRequestInterception(true);
    
        // page.on('request', handleRequest)
    
        // await page.goto(`https://finviz.com/screener.ashx?r=${firstRowIndex}`, { waitUntil: 'networkidle2' })
    
        // const symbolsOnPage = await page.evaluate(() => {
        //     // const darkRows = document.querySelectorAll('table-dark-row-cp')
        //     //     .reduce((acc, curr) => acc.push(curr.))
    
        //     // return pageNumberLinks[pageNumberLinks.length - 1].textContent
    
        //     const symbols = Array.from(document.querySelectorAll('.screener-link-primary'))
        //         .map(cell => cell.textContent)
    
        //     return symbols
        // })
    
        // return symbolsOnPage


        setTimeout(() => {

            resolve('ticker')

        }, 200)

    })

}