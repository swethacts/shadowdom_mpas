const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
let config =  {
	launchOptions: {
	headless:  false,
	slowMo: '0',
	//defaultViewport: { width: 2024, height: 1080 },
	args: ['--start-fullscreen'],
	ignoreHTTPSErrors: true,
	}
}

	async function gmaps(url) {

	const {browser, page} = await startBrowser();
	await page.goto(url, {waitUntil: 'networkidle2'});

	//Calling shadow dom
	await page.addScriptTag({
		path: path.join(__dirname, 'dist/querySelectorShadowDom.js')
	});
	//intializing elements
	const mapsInput = (await page.waitForFunction(() => {
		return querySelectorShadowDom.querySelectorDeep("#searchboxinput");
	})).asElement();

	// intializes input
	//await mapsInput.type("Onella Apartments, Neknampur Rd, Huda, Neknampur, Hyderabad, Telangana");
	await mapsInput.type("Raheja Mindspace Building 12c, Madhapur, Hyderabad, Telangana");
	console.log('search text entered');
	const value = await page.evaluate(mapsInput => mapsInput.value, mapsInput);
	console.log(value);
	await page.waitFor(7000)

	//clicking search button 
	const searchbutton = (await page.waitForFunction(() => {
		const searchbutton = querySelectorShadowDom.querySelectorDeep("#searchbox-searchbutton");
		return searchbutton;
	})).asElement();
	await searchbutton.click();
	console.log('search box clicked');
	await page.waitFor(7000)
	//clicking search button 
	const zoomIn = (await page.waitForFunction(() => {
		const zoomIn = querySelectorShadowDom.querySelectorDeep("#widget-zoom-in");
		return zoomIn;
	})).asElement();
	await zoomIn.click();
	console.log('Zoom clicked in');
	await page.waitFor(7000)
	//clicking mylocation
	const mylocation = (await page.waitForFunction(() => {
		const mylocation = querySelectorShadowDom.querySelectorDeep("#widget-mylocation");
		return mylocation;
	})).asElement();
	await mylocation.click();
	console.log('mylocationCap in');	
    await page.waitFor(7000)
	

	//Getting canvas bouderies
	await page.waitFor(7000)
	const element = (await page.waitForFunction(() => {
		const element = querySelectorShadowDom.querySelectorDeep("#scene");
		return element;
	})).asElement();
	
	/* console.log(`element boundary details =>
	x-axis - ${element.x}
	y-axis - ${element.y}
	element-width - ${element.width}
	element-height - ${element.height}`); */
	const bounding_box = await element.boundingBox();
	console.log(bounding_box);
	await page.mouse.move(bounding_box.x + bounding_box.width / 2, bounding_box.y + bounding_box.height / 2);
	await page.waitFor(2000)
	await page.mouse.down();
	await page.waitFor(2000)
	await page.mouse.move(1100, 600);
	await page.waitFor(2000)
	await page.mouse.up(); 
	console.log('boundaries in');
	//Getting canvas Details
	const outputSpan = await page.evaluateHandle(() => querySelectorShadowDom.querySelectorDeep("#scene"));
	const text = await page.evaluate((output) => output.innerText, outputSpan);
     // prints the text from the output
       console.log('Getting Canvas details'+text);
	// Create a Map object
	await page.evaluate(() => window.map = new Map());
	// Get a handle to the Map object prototype
	const mapPrototype = await page.evaluateHandle(() => Map.prototype);
	 
	// Query all map instances into an array
	const mapInstances = await page.queryObjects(mapPrototype);
	// Count amount of map objects in heap
	const count = await page.evaluate(maps => maps.length, mapInstances);
	const listOfTasks = await page.$$eval('#scene', options => options.map(option => option.textContent));
	  //const listOfTasks = await page.$$eval(".widget-scene-canvas", listOfTasks => listOfTasks.map(task => task.textContent));
	//console.log(maps.length);
	console.log(count);
	console.log(listOfTasks);
	console.log(mapInstances);
	//await mapInstances.dispose();
	//await mapPrototype.dispose();
	console.log("Entered into googlemaps successfully")
	await page.waitFor(7000)
	await page.screenshot({path: 'screenshot.png'});
}
//GET getBoundaryDetails
async function getBoundaryDetails(page, selector) {
	console.log(selector);
	await page.waitForXPath(selector);
	const [element] = await page.$x(selector);
	//const element = await page.$(selector);
	const elementBoundary = await element.boundingBox();
	console.log(`element boundary details =>
	x-axis - ${elementBoundary.x}
	y-axis - ${elementBoundary.y}
	element-width - ${elementBoundary.width}
	element-height - ${elementBoundary.height}`);
return elementBoundary;
}
//Start Browser
async function startBrowser() {
	const browser = await puppeteer.launch(config.launchOptions);
	const page = await browser.newPage();
	return {browser, page};
}
//Close browser
async function closeBrowser(browser) {
	return browser.close();
}
//Url Intialization 
(async () => {
	await gmaps("https://www.google.com/maps/@17.416192,78.462976,12z");
	//process.exit(1);
})();
