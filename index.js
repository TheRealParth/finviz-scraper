const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true});
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 })
  await page.setRequestInterception(true)
  
  page.on('request', (req) => {
    if(req.resourceType() == 'script' || req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
      req.abort();
    } else {
      req.continue();
    }
  });

  const finalStockPrices = {};
  let currLink = `https://finviz.com/screener.ashx?v=120&r=101`;
  
  while(currLink) {
    await page.goto(currLink, { waitUntil: 'networkidle2' });
    const {stocksList, nextLink} = await page.evaluate(() => {
      let nextLink = null;
      const rows =  Array.from(document.querySelectorAll('tr.table-dark-row-cp'))
      const pageResult = rows.map(row => {
        const stockSymbol = row.children[1].children[0].innerText;
        const stockPrice =  row.children[15].children[0].innerText;
        return [stockSymbol, stockPrice]
      })
      const numLinks = Array.from(document.querySelectorAll('a.tab-link'));
      const nextButton = numLinks[numLinks.length - 7] || {};
      if(nextButton.innerText === 'next') { 
        nextLink = `https://finviz.com/${numLinks[numLinks.length - 7].getAttribute('href')}`
      } 
      return { stocksList: pageResult, nextLink }
    })
    currLink = nextLink;
    (stocksList || []).forEach(stockPrice => finalStockPrices[stockPrice[0]] = stockPrice[1])
  }
  console.log("Scan Complete, total stocks scanned: ", Object.keys(finalStockPrices).length)
  await browser.close();
})();