const puppeteer = require('puppeteer');

import { Page, devices } from "puppeteer";
import { handleRequest } from '../handle-request/handle-request'

export async function createPuppeteerStuff(): Promise<Page> {

  console.log('creating puppeteer stuff...')
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage()

  page.setUserAgent("Chrome")

  await page.setViewport({ width: 1200, height: 1500 })
  await page.setRequestInterception(true)

  page.on('request', handleRequest)

  console.log('created a nice puppeteer page object 👍')

  return page
}
