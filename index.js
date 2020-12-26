const puppeteer = require('puppeteer');

let args = require('./args.json');

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

  
  // page.on('response', (response) => {
  //   console.log('<<', response.status(), response.url())
  // })

  console.log('args is: ', args.tickers)
  // const tickerCount = args.tickers.length;
  // const tickers = args.tickers;
  // const values = args.values;
  // const html = await page.goto('https://finviz.com/quote.ashx?t=' + tickers.join());

  // const results = [];

  // const funnyFn = async () => {

  //   console.log('fooo')

  //   const tickerData = [];

  //   console.log('tickers 1: ', tickers)
  //   for (let i = 0; i < tickers.length; i++){
  //     console.log('tickers 2: ', tickers[i])
  //     // tickerData["ticker"] = tickers[i];
  
  //     // const table = tables[i];
  //     // if(values.indexOf("pe") > -1) {
  //     //   const pe = await page.evaluate((function() {
  //     //     return () => {
  //     //       console.log('HERE !! ' , i)
  //     //     return document.querySelectorAll('.snapshot-table2 > .snapshot-td2')[i].textContent
  //     //     }
  //     //   }(i)));
  //     //   tickerData["pe"] = pe.toString();
  //     // }   
  
  //     // if(values.indexOf("peg") > -1) {
  //     //   const peg = await page.evaluate(() => {
  //     //     return document.getElementsByClassName('.snapshot-table2 > .snapshot-td2:nth-child('+i+')')[13].textContent
  //     //   });
  //     //   tickerData["peg"] = peg.toString();
  //     // }
  
  //     results.push(tickerData);
  //   }
    
  //   return document.querySelectorAll('.snapshot-table2').textContent;
  // }
  
  // const tables = await page.evaluate(funnyFn());

  // console.log('tables ', tables[1]);


  // console.log('results ', results);

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
  console.log('textContent ', textContent)

  await page.screenshot({path: 'example.png'});

  await browser.close();
})();