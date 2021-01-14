
import { handleRequest } from '../../../utils/handle-request/handle-request'

export async function scrapeOverviewData(page, rowIndex) {

    console.log('scraping overview data for: ', rowIndex)

    // const page = await browser.newPage()
    // await page.setViewport({ width: 1200, height: 800 })
    // await page.setRequestInterception(true);

    // page.on('request', handleRequest)

    // await page.goto(`https://finviz.com/screener.ashx?r=${firstRowIndex}`, { waitUntil: 'networkidle2' })

    // const overviewRowData = await page.evaluate(async () => {
    return page.evaluate(async () => {
        
        
        /**
         *  "Get all td's in the table"
         */
        
        const headerLabelTds = Array.from(document.querySelectorAll('div#screener-content table table tr[align="center"] td'))
        const headerLabels = headerLabelTds.map(td => td.textContent)
        
        const rowDataTds = Array.from(document.querySelectorAll('div#screener-content table table tr[valign="top"] td'))
        const rowData = rowDataTds.map(td => td.textContent)
        
        return {headerLabels, rowData}

        
        /**
         *  "Get all rows in the table, loop through td's of each row"
         */


        // const symbols = Array.from(document.querySelectorAll('div#screener-content > tr'))
        //     .map(cell => cell.textContent)

        // const screenerTableContainer_ = document.querySelector('div#screener-content table')

        // const rows = Array.from(screenerTableContainer_.querySelectorAll('tr')).map(f => f.textContent)

        // return rows


        // const screenerTableContainer_ = Array.from(document.querySelectorAll('div#screener-content table tr'))

        // const screenerTableContainer = screenerTableContainer_.map(cell => cell.textContent)

        // const symbols = screenerTableContainer.querySelectorAll('tr')


        // console.log('symbole are: ', screenerTableContainer)
        // console.log('typeof symbols: ', typeof screenerTableContainer)

        // return screenerTableContainer
    })

    // console.log('got overviewRowData ', overviewRowData)

    // return overviewRowData


}