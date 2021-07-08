import { Page } from "puppeteer";

export async function login(page: Page) {

    return new Promise(async resolve => {

        await page.goto(`https://finviz.com/login.ashx`)

        const emailInputSelector = '[name="email"]';
        const pwInputSelector = '[name="password"]';
        const loginBtnSelector = 'input[type="submit"]';

        await page.type(emailInputSelector, process.env.FINVIZ_EMAIL)
        await page.type(pwInputSelector, process.env.FINVIZ_PW)
        await page.click(loginBtnSelector)
        
        try {
            await page.waitForSelector('.is-elite', { timeout: 4000 });
            resolve(true)
        } 
        catch (err) {
            resolve(null)
        }
    })
}