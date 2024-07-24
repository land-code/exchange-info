import { chromium } from "playwright";
import fs from "fs/promises";

const URL = "https://www.binance.com/es/earn";
const VIEW_MORE = "Ver más";

const browser = await chromium.launch();

const page = await browser.newPage();
await page.goto(URL);
let viewMoreButton = await page.$(`text=${VIEW_MORE}`);

console.log("[1/4] Clicking view more button");
// click view more button
while (viewMoreButton) {
  await viewMoreButton.click();
  await page.waitForTimeout(1000);
  viewMoreButton = await page.$(`text=${VIEW_MORE}`);
}

console.log("[2/4] Expanding all items");
const items = await page.$$eval(".rc-collapse-item", (elements) => {
  return elements.map((element) => {
    const expand = element.querySelector(".rc-collapse-expand-icon");
    expand.click();

    console.log("[3/4] Scraping data");
    const title = element.querySelector("a");
    const items = [];

    const types = element.querySelectorAll(".rc-collapse-content-box>div>div");
    types.forEach((type) => {
      const info = [];
      let isProtectedCapital = false;
      const columns = type.querySelectorAll(".row-column-7-7ta");
      columns.forEach((column) => {
        info.push(column.textContent.trim());
      });
      isProtectedCapital = info[0].includes("Capital protegido");
      info[0] = info[0].replace("Capital protegido", "").trim();
      items.push({
        name: info[0],
        APR: info[1],
        duration: info[2],
        isProtectedCapital,
      });
    });
    return { name: title.textContent, items };
  });
});

console.log("[4/4] Writing data to file");
fs.writeFile("data.json", JSON.stringify(items, null, 2));

await browser.close();
