const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true});
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 })
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    // console.log('>>', request.method(), request.url())
    // console.log(req.resourceType())

    if(req.resourceType() == 'script' || req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
      
      req.abort();
    } else {
      console.log(req.resourceType())
      req.continue();
    
    }
  })
  // page.on('response', (response) => {
  //   console.log('<<', response.status(), response.url())
  // })

  await page.goto('https://finviz.com/quote.ashx?t=tsla');

  const textContent = await page.evaluate(() => {
    return document.querySelectorAll('.snapshot-td2')[1].textContent
  })
    console.log(textContent)
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();