import { chromium } from "playwright";
import fs from "fs/promises";

const URL = "https://www.binance.com/es/earn";
const VIEW_MORE = "Ver más";
const ALL_PRODUCTS = "Todos los productos";

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto(URL);
let viewMoreButton = await page.$(`text=${VIEW_MORE}`);

// click view more button
while (viewMoreButton) {
  await viewMoreButton.click();
  await page.waitForTimeout(1000);
  viewMoreButton = await page.$(`text=${VIEW_MORE}`);
}

const items = await page.$$eval(".rc-collapse-item", (elements) => {
  return elements.map((element) => {
    const expand = element.querySelector(".rc-collapse-expand-icon");
    expand.click();

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

fs.writeFile("data.json", JSON.stringify(items, null, 2));
