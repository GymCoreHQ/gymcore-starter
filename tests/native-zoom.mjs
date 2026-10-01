/** Native browser page zoom via a disposable extension; no CSS zoom or user profile. */
import './loopback.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scratch=await fs.mkdtemp(path.join(root,'.runtime-native-zoom-'));
const output=path.join(root,'test-results/native-zoom');
await fs.mkdir(output,{recursive:true});
const report={date:new Date().toISOString(),method:'Chromium extension chrome.tabs.setZoom/getZoom in a fresh persistent profile',cases:[],errors:[],cleanupErrors:[]};
let server,context;
const check=(value,message)=>{if(!value)throw new Error(message);};
try {
 const extension=path.join(scratch,'extension');await fs.mkdir(extension);
 await fs.writeFile(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Disposable loopback zoom acceptance',version:'1.0',host_permissions:['http://127.0.0.1/*'],background:{service_worker:'worker.js'}}));
 await fs.writeFile(path.join(extension,'worker.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
 os.homedir=()=>scratch;
 const {runCLI}=await import('@wp-playground/cli');
 server=await runCLI({command:'server',wp:'7.1.2',php:'8.3',port:Number(process.env.GCS_TEST_PORT||9499),workers:1,verbosity:'quiet',mount:[{hostPath:path.join(root,'theme/gymcore-starter'),vfsPath:'/wordpress/wp-content/themes/gymcore-starter'}]});
 const raw=await server.playground.run({code:await fs.readFile(path.join(root,'tests/accessibility-fixture.php'),'utf8')});
 const text=new TextDecoder().decode(raw.bytes);check(text.includes('GCS_A11Y_FIXTURE='),text+raw.errors);
 const fixture=JSON.parse(text.split('GCS_A11Y_FIXTURE=')[1]);Object.assign(report,{wordpress:fixture.wordpress,php:fixture.php});
 context=await chromium.launchPersistentContext(path.join(scratch,'profile'),{channel:'chromium',...(process.env.GCS_CHROMIUM_PATH?{executablePath:process.env.GCS_CHROMIUM_PATH}:{}),headless:true,viewport:null,args:['--window-size=1280,900',`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 report.browser=context.browser().version();
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker',{timeout:15000});
 const page=context.pages()[0]||await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(server.serverUrl,{waitUntil:'networkidle'});
 const capture=await context.newCDPSession(page);
 const screenshot=async name=>{const image=await capture.send('Page.captureScreenshot',{format:'png',fromSurface:false});await fs.writeFile(path.join(output,name),Buffer.from(image.data,'base64'));};
 const tab=await worker.evaluate(async origin=>{const tabs=await chrome.tabs.query({});return tabs.find(t=>t.url?.startsWith(origin+'/')).id;},server.serverUrl);
 const baseline=await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio}));report.baseline=baseline;
 const focus=()=>page.evaluate(()=>{const n=document.activeElement;return {tag:n.tagName,id:n.id,label:n.getAttribute('aria-label'),text:n.textContent.trim().slice(0,80),outline:getComputedStyle(n).outline,insideMain:!!n.closest('main')};});
 for(const scheme of ['dark','light']){
  const changed=await server.playground.run({code:`<?php require '/wordpress/wp-load.php';wp_set_current_user(1);$id=WP_Theme_JSON_Resolver::get_user_global_styles_post_id();$d=${scheme==='light'?"json_decode(file_get_contents(get_theme_file_path('/styles/light.json')),true)":"array('version'=>3)"};$d['isGlobalStylesUserThemeJSON']=true;wp_update_post(array('ID'=>$id,'post_content'=>wp_json_encode($d)));wp_clean_theme_json_cache();echo 'OK';`});check(new TextDecoder().decode(changed.bytes).includes('OK'),'Palette setup');
  for(const zoom of [2,4]){
   await worker.evaluate(async({tab,zoom})=>chrome.tabs.setZoom(tab,zoom),{tab,zoom});
   for(const template of ['front-page','page','archive','single']){
    await page.goto(server.serverUrl+fixture.routes[template],{waitUntil:'networkidle'});
    const actual=await worker.evaluate(tab=>chrome.tabs.getZoom(tab),tab);
    const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,dpr:devicePixelRatio,cssZoom:getComputedStyle(document.documentElement).zoom,background:getComputedStyle(document.body).backgroundColor}));
    check(Math.abs(actual-zoom)<0.0001,`Browser zoom mismatch: requested ${zoom}, actual ${actual}`);check(metrics.cssZoom==='1','Unexpected CSS zoom');check(Math.abs(metrics.width*zoom-baseline.width)<=4,'Native viewport did not resize');check(Math.abs(metrics.dpr/baseline.dpr-zoom)<.01,'Native device pixel ratio did not scale');check(metrics.scrollWidth<=metrics.width+1,`${scheme} ${zoom} ${template}: overflow`);
    check(metrics.background===(scheme==='dark'?'rgb(16, 21, 31)':'rgb(255, 255, 255)'),'Palette mismatch');
    const result={scheme,zoom,actual,template,...metrics};report.cases.push(result);
    await page.keyboard.press('Tab');result.skip=await focus();check(result.skip.text==='Skip to content','Skip first');await page.keyboard.press('Enter');await page.keyboard.press('Tab');result.afterSkip=await focus();check(result.afterSkip.insideMain,'Skip target next focus');
    if(template==='front-page'){
     await page.goto(server.serverUrl,{waitUntil:'networkidle'});const menu=page.getByRole('button',{name:'Open menu',exact:true});
     if(await menu.isVisible()){
      for(let i=0;i<6;i++){await page.keyboard.press('Tab');if(await menu.evaluate(n=>n===document.activeElement))break;}
      check(await menu.evaluate(n=>n===document.activeElement),'Menu keyboard reach');await page.keyboard.press('Enter');await page.getByRole('button',{name:'Close menu',exact:true}).waitFor();
      await page.waitForFunction(()=>!!document.activeElement.closest('.is-menu-open'));result.menuFocus=await focus();
      await screenshot(`${scheme}-${zoom}-menu.png`);
      for(let i=0;i<4;i++){await page.keyboard.press(i===3?'Shift+Tab':'Tab');check(await page.evaluate(()=>!!document.activeElement.closest('.is-menu-open')),'Menu focus escaped');}
      await page.keyboard.press('Escape');check(await menu.evaluate(n=>n===document.activeElement),'Menu focus return');result.menu='Tab/Enter, contained Tab/ShiftTab, Escape return passed';
     }
    }
    if(template==='single'){
     for(let i=0;i<18&&(await focus()).id!=='comment';i++)await page.keyboard.press('Tab');check((await focus()).id==='comment','Comment keyboard reach');await page.keyboard.type('Fictional native zoom draft.');result.commentFocus=await focus();
     await screenshot(`${scheme}-${zoom}-comment-focus.png`);
     for(let i=0;i<5;i++)await page.keyboard.press('Tab');check((await focus()).id==='submit','Comment submit reachable');await page.keyboard.press('Enter');result.invalidFocus=await focus();check(result.invalidFocus.id==='author','Required-name focus');
    }
    await page.keyboard.press('Control+Home');await page.evaluate(()=>scrollTo(0,0));await screenshot(`${scheme}-${zoom}-${template}.png`);console.log('Verified',scheme,zoom,template);
   }
  }
 }
} catch(error){report.errors.push(error.stack);process.exitCode=1;} finally {
 for(const [operation,cleanup] of [['browser',async()=>{if(context)await context.close();}],['server',async()=>{if(server)await server[Symbol.asyncDispose]();}],['scratch',async()=>fs.rm(scratch,{recursive:true,force:true})]]){try{await cleanup();}catch(error){report.cleanupErrors.push({operation,error:String(error)});}}
 report.passed=report.cases.length===16&&!report.errors.length&&!report.cleanupErrors.length;
 if(!report.passed)process.exitCode=1;await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify(report,null,2));
