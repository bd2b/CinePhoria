// Pas d'import car on n'est pas dans un module.
const {By, Builder, Browser} = require('selenium-webdriver');
const assert = require("assert");

(async function firstTest() {
  let driver;
  
  try {
    driver = await new Builder().forBrowser(Browser.FIREFOX).build();
    await driver.get('http://127.0.0.1:3500/visiteur.html');
  
    let title = await driver.getTitle();
    assert.equal("CinePhoria - dev", title);
  
    await driver.manage().setTimeouts({implicit: 500});
  
    let titre = await driver.findElement(By.className('title__left-h1'));
    let valueTitre = await titre.getText();
    assert.equal("Nouveautés de la semaine", valueTitre )
    // let submitButton = await driver.findElement(By.css('button'));
  
    // await titre.sendKeys('Selenium');
    // await submitButton.click();
  
    // let message = await driver.findElement(By.id('message'));
    // let value = await message.getText();
    // assert.equal("Received!", value);
    console.log("Test réussi")
  } catch (e) {
    console.log(e)
  } finally {
    await driver!.quit();
  }
}())