import AxeBuilder from '@axe-core/playwright';
/** Exercise actual WooCommerce storefront and block checkout with fictional data. */
export async function exerciseCommerceBrowser(browser,fixture,screenshotPath) {
 const run={pages:[],browserChecks:[]}, context=await browser.newContext(),page=await context.newPage();
 const errors=[],external=[],httpFailures=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',response=>{if(response.status()>=400)httpFailures.push({url:response.url(),status:response.status()});});
 await context.route('**/*',route=>{const u=new URL(route.request().url());if(['localhost','127.0.0.1'].includes(u.hostname))return route.continue();external.push(u.origin);return route.abort();});
 try {
  for(const [name,url] of Object.entries({shop:fixture.shop,product:fixture.product_url,account:fixture.account})) {
   const response=await page.goto(url,{waitUntil:'networkidle'});
   const body=await page.locator('body').innerText();
   run.pages.push({name,status:response.status(),textPresent:name==='account'?await page.locator('input[name="username"]').isVisible():body.includes('Fictional Training Pass'),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  }
  await page.goto(fixture.product_url); await page.getByRole('button',{name:'Add to cart',exact:true}).click();
  const cart=await page.goto(fixture.cart,{waitUntil:'networkidle'});
  await page.getByText('Fictional Training Pass',{exact:true}).first().waitFor();
  run.browserChecks.push({name:'Native Cart block contains added product',pass:true});
  run.pages.push({name:'cart',status:cart.status(),textPresent:true,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  const checkout=await page.goto(fixture.checkout,{waitUntil:'networkidle'});
  await page.getByText('Offline test check',{exact:true}).first().waitFor();
  run.formContrast=await page.locator('.wc-block-components-address-form label, .wc-block-components-text-input label').evaluateAll(labels=>labels.map(label=>{const input=label.parentElement.querySelector('input,select');return {label:label.textContent,html:label.outerHTML,selector:label.classList.contains('wc-blocks-components-select__label')?'.wc-blocks-components-select__label':'.wc-block-components-text-input label',labelColor:getComputedStyle(label).color,parentClass:label.parentElement.className,inputColor:input?getComputedStyle(input).color:null,inputBackground:input?getComputedStyle(input).backgroundColor:null};}));
  console.error('CHECKOUT_LABEL_STYLES='+JSON.stringify(run.formContrast));
  const axe=await new AxeBuilder({page}).withRules(['color-contrast']).analyze();
  run.checkoutContrast=axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
  await page.screenshot({path:screenshotPath,fullPage:true});
  run.pages.push({name:'checkout',status:checkout.status(),textPresent:await page.getByRole('button',{name:/place order/i}).isVisible(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  await page.locator('#email').fill('shopper@example.invalid');
  await page.locator('#billing-first_name').fill('Fictional'); await page.locator('#billing-last_name').fill('Shopper');
  await page.locator('#billing-address_1').fill('100 Example Way'); await page.locator('#billing-city').fill('Example City');
  await page.locator('#billing-postcode').fill('90001');
  const state=page.locator('#billing-state'); if(await state.count()) await state.selectOption('CA');
  await page.getByRole('button',{name:/place order/i}).click();
  await page.waitForURL(/order-received/,{timeout:45000});
  run.browserChecks.push({name:'Guest browser block checkout reaches order received',pass:true});
 } catch(error){run.browserFailure=error.message; await page.screenshot({path:screenshotPath,fullPage:true}).catch(()=>{});}
 finally {run.pageErrors=errors;run.httpFailures=httpFailures;run.blockedExternalOrigins=[...new Set(external)];await context.close();}
 return run;
}
