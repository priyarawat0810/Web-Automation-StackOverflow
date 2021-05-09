const puppeteer = require('puppeteer');
const fs = require("fs");
const similarity = require('similarity')
const email = "kegaja8895@goqoez.com";
const password = "watermelon@1";
// const userName = "James Bond 007";
let data = "";

let question = "";
let dataLen = process.argv.length;
for(let i=2; i<dataLen; i++){
    if(i<dataLen-1){
        question += process.argv[i]+" ";
    }else{
        question += process.argv[i];
    }
}

async function main(){
    let browser = await puppeteer.launch({
        headless: false, 
        defaultViewport: false,
        slowMo: 10
    });

    let tabs = await browser.pages();
    let tab = tabs[0];
    await tab.goto("https://stackoverflow.com/users/login?ssrc=head");
    await tab.type("#email", email);
    await tab.type("#password", password);
    await tab.click("#submit-button");
    await tab.waitForTimeout(2000);
    await tab.waitForSelector(".s-input.s-input__search.js-search-field", {visible: true});
    await tab.type(".s-input.s-input__search.js-search-field", question);
    await tab.keyboard.press("Enter");
    await tab.waitForNavigation({waitUntil: "networkidle0"});
    await tab.click(".grid.ps-relative");
    let navList = await tab.$$(".disabled");
    await navList[1].click();
    await tab.waitForSelector(".result-link a", {visible: true});
    let queList = await tab.$$(".result-link a");
    let arrQueLink = [];
    for(let i=0; i<queList.length; i++){
            let queLink = await tab.evaluate(function(ele){
                return ele.getAttribute("href");
            }, queList[i]);
            arrQueLink.push(queLink);
    }

    for(let i=0; i<arrQueLink.length; i++){
        await matchingQue(tab, "https://stackoverflow.com" + arrQueLink[i]);
    }
    browser.close();
}

async function matchingQue(tab, queLink){
    await tab.goto(queLink);
    let title = await tab.$(".fs-headline1 a");
    let titleText = await tab.evaluate(function(ele){
        return ele.innerText;
    }, title);
    let strSimilarity = similarity(question, titleText);
    if(strSimilarity>=0.5){
         // console.log(strSimilarity);
         data += "TITLE :\n" + titleText + "\n\t\t\t\t---------------------";
    let desc = await tab.$$(".s-prose.js-post-body");
    for(let i=0; i<=1; i++){
        let descText = await tab.evaluate(function(ele){
            return ele.textContent;
        }, desc[i]);


        if(i==0){
            data += "\nQUESTION DESCRIPTION : ";
        } else{
                data += "\nANSWER : ";
            }
            data += descText;
        if(i==0){
            data += "\n\t\t\t\t---------------------"
        } else{
            data += "************************************************************************************************************************************\n\n"
        }
    }
    }
    fs.writeFileSync("Answers.txt", data); 
    // console.log(data);
}

main();