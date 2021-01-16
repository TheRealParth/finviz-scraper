import { Page } from "puppeteer";

export async function login(page: Page) {

    return new Promise(async resolve => {

        // console.log('scraping data for ticker: ', ticker)

        // const browser = await puppeteer.launch({ headless: true })
        // const page = await browser.newPage()
        // await page.setViewport({ width: 1200, height: 800 })
        // await page.setRequestInterception(true)

        // page.on('request', handleRequest)

        await page.goto(`https://finviz.com/login.ashx`)

        // await page.waitForSelector('.statements-table');

        const emailInputSelector = 'input[name=email]';
        const pwInputSelector = 'input[name=email]';
        const loginBtnSelector = 'input[name=email]';



        // await page.type('[name="email"]', process.env.GITHUB_USER)
        // await page.type('[name="password"]', process.env.GITHUB_PWD)
        await page.type('[name="email"]', '')
        await page.type('[name="password"]', '')
        await page.click('input[type="submit"]')

        await page.waitForSelector('.is-elite', { timeout: 7000 });

        resolve(null)
        
        // await page.evaluate(() => {

        // })

        // TODO - emailInputSelector.type('jim.lynch@blahblah.com');

        // TODO - pwInputSelector.type('jim.lynch@blahblah.com');

        // TODO - loginBtnSelector.type('jim.lynch@blahblah.com');


        // const quarterlyATag = 'a[contains(quarterly)]'
        // await page.waitForSelector(quarterlyATag, { timeout: 2000 });

        // quarterlyATag.cl

        // await page.evaluate(async () => {
        //     await document.querySelector(quarterlyATag)[0].click()
        // .map(cell => cell.textContent)    
        // })
        // (await page.$$eval(quarterlyATag, a => a
        //     .filter(a => a.textContent === 'target text')
        // ))[0].click()


        // await page.waitForSelector(selector, { timeout: 2000 });

        // await page.waitForSelector(selector, { timeout: 2000 });

        // await page.click("a[contains('quarterly')");

    //     const aTagElements = await page.evaluate(() => {

    //         // return new Promise(resolve => {


    //         return Array.from(document.querySelectorAll<HTMLElement>('a.tab-link'))
    //             .map((cell) => {
    //                 console.log('checking cell: ', cell)
    //                 if (cell.textContent === 'quarterly') {
    //                     cell.click()
    //                     console.log('clicking!!!');
    //                     // resolve(true)
    //                     return true
    //                 }

    //                 return false

    //                 // if (i === list.length - 1)
    //                 //     resolve(null)
    //             })



    //     })


    })

}