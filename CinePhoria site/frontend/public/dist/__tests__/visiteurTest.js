"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Pas d'import car on n'est pas dans un module.
const { By, Builder, Browser } = require('selenium-webdriver');
const assert = require("assert");
(function firstTest() {
    return __awaiter(this, void 0, void 0, function* () {
        let driver;
        try {
            driver = yield new Builder().forBrowser(Browser.FIREFOX).build();
            yield driver.get('http://127.0.0.1:3500/visiteur.html');
            let title = yield driver.getTitle();
            assert.equal("CinePhoria - dev", title);
            yield driver.manage().setTimeouts({ implicit: 500 });
            let titre = yield driver.findElement(By.className('title__left-h1'));
            let valueTitre = yield titre.getText();
            assert.equal("Nouveautés de la semaine", valueTitre);
            // let submitButton = await driver.findElement(By.css('button'));
            // await titre.sendKeys('Selenium');
            // await submitButton.click();
            // let message = await driver.findElement(By.id('message'));
            // let value = await message.getText();
            // assert.equal("Received!", value);
            console.log("Test réussi");
        }
        catch (e) {
            console.log(e);
        }
        finally {
            yield driver.quit();
        }
    });
}());
