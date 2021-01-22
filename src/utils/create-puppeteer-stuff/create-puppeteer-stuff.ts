
// const puppeteer = require('puppeteer')
const puppeteer = require('puppeteer');

import { Page, devices } from "puppeteer";
import { handleRequest } from '../handle-request/handle-request'

const iPhone = devices['iPhone 6'];

export async function createPuppeteerStuff(): Promise<Page> {
  
  // (async () => {
    console.log('creating puppeteer stuff')
    const browser = await puppeteer.launch({headless: false});
    // const page = await browser.newPage();
  // const browser = await puppeteer.launch({
  //   headless: true
  //   // args: ['--no-sandbox']
  // })

  console.log('hmm...')
  const page = await browser.newPage()
  
  console.log('setting...')

  // page.setUserAgent(
  //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4182.0 Safari/537.36"
  // );
  // page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36")

  // await page.emulate(iPhone);

  await page.setViewport({ width: 1200, height: 1500 })
  await page.setRequestInterception(true)

  page.on('request', handleRequest)
  
  return page
}
