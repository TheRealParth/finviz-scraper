const puppeteer = require('puppeteer')
import { Browser, Page } from "puppeteer";
import { handleRequest } from '../handle-request/handle-request'

export async function createPuppeteerStuff(): Promise<Page> {

  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.setViewport({ width: 1200, height: 800 })
  await page.setRequestInterception(true)

  page.on('request', handleRequest)
  
  return page
}
