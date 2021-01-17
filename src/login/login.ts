import { Page } from "puppeteer";

export async function login(page: Page) {

    return new Promise(async resolve => {

        await page.goto(`https://finviz.com/login.ashx`)

        const emailInputSelector = '[name="email"]';
        const pwInputSelector = '[name="password"]';
        const loginBtnSelector = 'input[type="submit"]';

        // await page.type('[name="email"]', process.env.GITHUB_USER)
        // await page.type('[name="password"]', process.env.GITHUB_PWD)
        await page.type(emailInputSelector, '-')
        await page.type(pwInputSelector, '-')
        await page.click(loginBtnSelector)

        await page.waitForSelector('.is-elite', { timeout: 7000 });

        resolve(null)

    })
}