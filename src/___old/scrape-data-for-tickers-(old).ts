const puppeteer = require('puppeteer')

export const getDataForTickers = async tickerList => {
  return new Promise(async resolve => {
    const browser = await puppeteer.launch({ headless: false })

    const results = []

    tickerList.tickers.forEach(async ticker => {
      const page = await browser.newPage()

      await page.goto(`https://finviz.com/quote.ashx?t=${ticker}`)

      // TODO - somehow loop through these rather than copy pasting so much 😅

      const peRatio = await page.evaluate(() => {
        return document.querySelectorAll('.snapshot-td2')[1].textContent
      })

      const peg = await page.evaluate(() => {
        return document.querySelectorAll('.snapshot-td2')[13].textContent
      })

      const institutionalOwnership = await page.evaluate(() => {
        return document.querySelectorAll('.snapshot-td2')[3].textContent
      })

      const debtToEq = await page.evaluate(async () => {
        return document.querySelectorAll('.snapshot-td2')[55].textContent
      })

      const ltDebtToEq = await page.evaluate(async () => {
        return document.querySelectorAll('.snapshot-td2')[61].textContent
      })

      const avgVolume = await page.evaluate(async () => {
        return document.querySelectorAll('.snapshot-td2')[64].textContent
      })

      const volume = await page.evaluate(async () => {
        return document.querySelectorAll('.snapshot-td2')[70].textContent
      })

      const prevClose = await page.evaluate(async () => {
        return document.querySelectorAll('.snapshot-td2')[65].textContent
      })

      const profitMargin = await page.evaluate(async () => {
        return document.querySelectorAll('.snapshot-td2')[63].textContent
      })

      const shortInterest = await page.evaluate(async () => {
        return document.querySelectorAll('.snapshot-td2')[16].textContent
      })

      const industriesString = await page.evaluate(async () => {
        return document.querySelectorAll('.fullview-links')[1].textContent
      })
      
      const industries = industriesString.split(' | ')
      
      const companyName = await page.evaluate(async () => {
        return document.querySelectorAll('a[target="_blank"]')[1].textContent
      })


      results.push({
        symbol: ticker,
        companyName,
        industries,
        pe_ratio: peRatio,
        peg,
        short_interest: shortInterest,
        institutional_ownership: institutionalOwnership,
        profit_margin: profitMargin,
        debt_to_equity: debtToEq,
        lt_debt_to_equity: ltDebtToEq,
        volume_prev_day: volume,
        volume_3m_avg: avgVolume,
        prev_close: prevClose
      })

      if (results.length === tickerList.tickers.length) resolve(results)
    })
  })
}
