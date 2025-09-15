export async function scrapeReport(page) {
  await page.waitForSelector("table tbody tr", { timeout: 5000 });

  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    const regexDate = /^\d{2}\/\d{2}\/\d{4}$/;

    return rows
      .map((row) => {
        const cells = row.querySelectorAll("td");
        return {
          date: cells[0]?.innerText.trim() || "",
          earnings: cells[1]?.innerText.trim() || "",
          expenses: cells[2]?.innerText.trim() || "",
          result: cells[3]?.innerText.trim() || "",
          balance: cells[4]?.innerText.trim() || "",
        };
      })
      .filter((item) => regexDate.test(item.date));
  });
}
