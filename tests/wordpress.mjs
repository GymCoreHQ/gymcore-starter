/** Disposable WordPress/PHP WASM integration harness. No existing site mounts. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await fs.mkdtemp(path.join(root, '.runtime-'));
// CLI v3 hardcodes its cache beneath os.homedir(). Scope this process-only API to
// our disposable workspace; never mutate HOME or a user's shared runtime cache.
os.homedir = () => runtime;
const { runCLI } = await import(process.env.GCS_PLAYGROUND_MODULE ? pathToFileURL(process.env.GCS_PLAYGROUND_MODULE) : '@wp-playground/cli');
const reports = [];
let failure = false;
try {
 for (const trash of (process.env.GCS_TRASH_MODES || '30,0').split(',').map(Number)) {
  const server = await runCLI({ command:'server', wp:process.env.GCS_WP_VERSION || '7.1.2', php:process.env.GCS_PHP_VERSION || '8.3', port: Number(process.env.GCS_TEST_PORT || 9483), workers:1, verbosity:'quiet', 'define-number':{EMPTY_TRASH_DAYS:trash}, ...(process.env.GCS_WOO_TESTS === '1' ? {blueprint:{steps:[{step:'installPlugin',pluginData:{resource:'url',url:'https://downloads.wordpress.org/plugin/woocommerce.11.1.2.zip'},options:{activate:true}}]}} : {}), mount:[...(process.env.GCS_REVIEW_TOOLS_PATH ? ['theme-check'].map(slug=>({hostPath:path.join(process.env.GCS_REVIEW_TOOLS_PATH,slug),vfsPath:'/wordpress/wp-content/plugins/'+slug})) : []),{hostPath:path.join(root,'theme/gymcore-starter'),vfsPath:'/wordpress/wp-content/themes/gymcore-starter'},{hostPath:path.join(root,'plugin/gymcore-starter-kit'),vfsPath:'/wordpress/wp-content/plugins/gymcore-starter-kit'}] });
  try {
   const response = await server.playground.run({code:await fs.readFile(path.join(root,'tests/integration.php'),'utf8')});
   const output = new TextDecoder().decode(response.bytes);
   const marker = output.indexOf('GCS_RESULTS=');
   if (marker < 0) throw new Error(output + '\n' + response.errors);
   const report = JSON.parse(output.slice(marker + 12));
   reports.push(report);
   console.log(JSON.stringify(report, null, 2));
   if (report.checks.some(check => !check.pass)) failure = true;
   if (trash === 30 && process.env.GCS_BROWSER_TESTS === '1') {
    const { chromium } = await import('@playwright/test');
    const { default: AxeBuilder } = await import('@axe-core/playwright');
    const browser = await chromium.launch({headless:true, ...(process.env.GCS_BROWSER_CHANNEL ? {channel:process.env.GCS_BROWSER_CHANNEL} : {}), ...(process.env.GCS_CHROME_PATH ? {executablePath:process.env.GCS_CHROME_PATH} : {})});
    try {
     reports.push({browser:await browser.version(),playwright:'1.58.2',axeCore:'4.11.1'});
     const context = await browser.newContext();
     const page = await context.newPage();
     const errors=[]; page.on('pageerror', error=>errors.push(error.message));
     for (const viewport of [{width:1200,height:900},{width:390,height:844}]) {
      await page.setViewportSize(viewport); await page.goto(server.serverUrl,{waitUntil:'networkidle'});
      if(viewport.width === 1200 && process.env.GCS_SCREENSHOT === '1') await page.screenshot({path:path.join(root,'theme/gymcore-starter/screenshot.png')});
      const navigationLinks=await page.locator('header nav a').count();
      if(navigationLinks < 1) failure=true;
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth);
      if(overflow) failure=true;
      const menu=page.getByRole('button',{name:'Open menu'});
      let menuTest='desktop';
      if(await menu.isVisible()) { await menu.click(); await page.getByRole('button',{name:'Close menu'}).waitFor(); await page.keyboard.press('Escape'); menuTest=await menu.isVisible()?'open-close passed':'failed'; }
      const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      reports.push({viewport,navigationLinks,overflow,menu:menuTest,axeViolations:accessibility.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,target:n.target,summary:n.failureSummary}))})),pageErrors:[...errors]});
      if(accessibility.violations.length || errors.length) failure=true;
     }
    await page.goto(server.serverUrl + '/wp-login.php');
     await page.locator('#user_login').fill('admin');
     await page.locator('#user_pass').fill('disposable-test-only-password');
     await page.locator('#wp-submit').click();
     await page.waitForURL('**/wp-admin/**');
     const csrf=await page.request.post(server.serverUrl + '/wp-admin/admin-post.php',{form:{action:'gcs_import'}});
     reports.push({missingNonceStatus:csrf.status()});
     if(csrf.status() !== 403) failure=true;
     await page.goto(server.serverUrl + '/wp-admin/post-new.php?post_type=page');
     await page.waitForFunction(()=>!!window.wp?.blocks?.getBlockType('gymcore-starter/weekly-schedule'));
     const blockRoundTrip=await page.evaluate(()=>{const b=wp.blocks.createBlock('gymcore-starter/weekly-schedule',{day:'monday',programId:17}); const text=wp.blocks.serialize([b]); const parsed=wp.blocks.parse(text); return {text,valid:parsed[0].isValid,day:parsed[0].attributes.day,programId:parsed[0].attributes.programId};});
     reports.push({editor:blockRoundTrip});
     if(!blockRoundTrip.valid || blockRoundTrip.day !== 'monday' || blockRoundTrip.programId !==17) failure=true;
    } finally { await browser.close(); }
   }
  await fs.mkdir(path.join(root,'test-results'),{recursive:true});
   await fs.writeFile(path.join(root,'test-results/wordpress-progress.json'),JSON.stringify(reports,null,2));
   if(process.env.GCS_REVIEW_TOOLS_PATH && trash ===30) {
    const result=await server.playground.run({code:await fs.readFile(path.join(root,'tests/directory-checks.php'),'utf8')});
    const output=new TextDecoder().decode(result.bytes);
    await fs.mkdir(path.join(root,'test-results'),{recursive:true});
    await fs.writeFile(path.join(root,'test-results/directory-checks.txt'),output + '\n' + result.errors);
    const marker=output.indexOf('GCS_DIRECTORY=');
    if(marker>=0) await fs.writeFile(path.join(root,'test-results/directory-checks.json'),output.slice(marker+14));
   }
  } finally { await server[Symbol.asyncDispose](); }
 }
} finally {
 await fs.mkdir(path.join(root,'test-results'),{recursive:true});
 await fs.writeFile(path.join(root,`test-results/wordpress-${process.env.GCS_WP_VERSION || '7.1.2'}-php${process.env.GCS_PHP_VERSION || '8.3'}${process.env.GCS_WOO_TESTS === '1' ? '-woo' : ''}.json`),JSON.stringify(reports,null,2)+'\n');
 await fs.rm(runtime,{recursive:true,force:true});
}
process.exitCode=failure?1:0;
