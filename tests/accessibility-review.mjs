/** Isolated browser audit. Does not claim screen-reader or native browser zoom testing. */
import './loopback.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=await fs.mkdtemp(path.join(root,'.runtime-accessibility-'));
os.homedir=()=>runtime;
const {runCLI}=await import('@wp-playground/cli');
const output=path.join(root,'test-results/accessibility');
await fs.mkdir(output,{recursive:true});
const report={date:new Date().toISOString(),limitations:['No actual screen reader used.','200% checks use CSS zoom and a half-width layout simulation, not browser UI zoom.','Automated keyboard events are reviewed through focus/DOM evidence; not a human assistive-technology session.'],pages:[],keyboard:[],errors:[]};
let server,browser;
try {
 server=await runCLI({command:'server',wp:process.env.GCS_WP_VERSION||'7.1.2',php:'8.3',port:Number(process.env.GCS_TEST_PORT||9491),workers:1,verbosity:'quiet',mount:[{hostPath:path.join(root,'theme/gymcore-starter'),vfsPath:'/wordpress/wp-content/themes/gymcore-starter'}]});
 const result=await server.playground.run({code:await fs.readFile(path.join(root,'tests/accessibility-fixture.php'),'utf8')});
 const resultText=new TextDecoder().decode(result.bytes);
 if(!resultText.includes('GCS_A11Y_FIXTURE='))throw new Error(resultText+' '+result.errors);
 const fixture=JSON.parse(resultText.split('GCS_A11Y_FIXTURE=')[1]);
 Object.assign(report,{wordpress:fixture.wordpress,php:fixture.php,playwright:'1.58.2',axe:'4.11.1'});
 browser=await chromium.launch({headless:true,...(process.env.GCS_BROWSER_CHANNEL?{channel:process.env.GCS_BROWSER_CHANNEL}:{}),...(process.env.GCS_CHROME_PATH?{executablePath:process.env.GCS_CHROME_PATH}:{})});
 report.browser=await browser.version();
 const context=await browser.newContext();
 const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 const dimensions=[{name:'desktop',width:1280,height:900},{name:'mobile',width:390,height:844},{name:'reflow-200',width:640,height:450},{name:'css-zoom-200',width:1280,height:900,zoom:2}];
 for(const scheme of ['dark','light']){
  const change=await server.playground.run({code:`<?php require '/wordpress/wp-load.php'; wp_set_current_user(1); $id=WP_Theme_JSON_Resolver::get_user_global_styles_post_id(); $data=${scheme==='light'?"json_decode(file_get_contents(get_theme_file_path('/styles/light.json')),true)":"array('version'=>3)"}; $data['isGlobalStylesUserThemeJSON']=true; wp_update_post(array('ID'=>$id,'post_content'=>wp_json_encode($data))); wp_clean_theme_json_cache(); echo 'OK:' . wp_json_encode(array('id'=>$id,'post'=>json_decode(get_post($id)->post_content,true),'palette'=>wp_get_global_settings(array('color','palette'))));`});
  console.log('Palette setup completed:',scheme);
  if(!new TextDecoder().decode(change.bytes).includes('OK'))throw new Error(change.errors);
  report.paletteSetup ??= {}; report.paletteSetup[scheme]=JSON.parse(new TextDecoder().decode(change.bytes).split('OK:')[1]);
  for(const viewport of dimensions){
   await page.setViewportSize({width:viewport.width,height:viewport.height});
   for(const [template,route] of Object.entries(fixture.routes)){
    const response=await page.goto(server.serverUrl+route,{waitUntil:'networkidle'});
    if(viewport.zoom)await page.evaluate(z=>document.documentElement.style.zoom=String(z),viewport.zoom);
    const dom=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,statusWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,main:document.querySelectorAll('main').length,banner:document.querySelectorAll('header').length,footer:document.querySelectorAll('footer').length,h1:[...document.querySelectorAll('h1')].map(n=>n.textContent),headings:[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(n=>({level:Number(n.tagName[1]),text:n.textContent.trim()})),background:getComputedStyle(document.body).backgroundColor,skipLink:document.querySelector('a.skip-link')?.getAttribute('href'),missingAlt:document.querySelectorAll('img:not([alt])').length,overflowElements:[...document.querySelectorAll('main *')].filter(n=>n.getBoundingClientRect().right>innerWidth+1).slice(0,5).map(n=>({tag:n.tagName,class:n.className,text:n.textContent.slice(0,70)}))}));
    if(dom.background!==(scheme==='dark'?'rgb(16, 21, 31)':'rgb(255, 255, 255)'))throw new Error('Expected '+scheme+' palette, got '+dom.background);
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    report.pages.push({scheme,viewport:viewport.name,template,renderedTemplate:response.headers()['x-gcs-a11y-template'],status:response.status(),...dom,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:axe.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))}))});
    await fs.writeFile(path.join(output,'progress.json'),JSON.stringify(report,null,2)+'\n');
    if((['front-page','page','single','404'].includes(template)&&['desktop','mobile'].includes(viewport.name))||(['front-page','page'].includes(template)&&viewport.name==='css-zoom-200'))await page.screenshot({path:path.join(output,`${scheme}-${viewport.name}-${template}.png`),fullPage:true});
   }
  }
  for(const width of [1280,390]){
   await page.setViewportSize({width,height:900}); await page.goto(server.serverUrl,{waitUntil:'networkidle'});
   await page.keyboard.press('Tab');
   const skip=await page.evaluate(()=>({text:document.activeElement.textContent.trim(),href:document.activeElement.getAttribute('href'),outline:getComputedStyle(document.activeElement).outline,rect:document.activeElement.getBoundingClientRect().toJSON()}));
   await page.screenshot({path:path.join(output,`${scheme}-${width}-skip-focus.png`)});
   await page.keyboard.press('Enter');
   const afterSkip=await page.evaluate(()=>({tag:document.activeElement.tagName,id:document.activeElement.id,hash:location.hash}));
   await page.keyboard.press('Tab');
   afterSkip.nextTabInsideMain=await page.evaluate(()=>!!document.activeElement.closest('main'));
   await page.goto(server.serverUrl,{waitUntil:'networkidle'});
   const sequence=[];
   for(let i=0;i<6;i++){await page.keyboard.press('Tab');sequence.push(await page.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent.trim().slice(0,80),label:document.activeElement.getAttribute('aria-label'),outline:getComputedStyle(document.activeElement).outline,visible:document.activeElement.getBoundingClientRect().width>0})));}
   const menu=page.getByRole('button',{name:'Open menu',exact:true});
   let navigation={mode:'desktop'};
   if(await menu.isVisible()){
    await page.goto(server.serverUrl,{waitUntil:'networkidle'});
    let found=false;
    for(let i=0;i<12;i++){await page.keyboard.press('Tab');if(await menu.evaluate(n=>n===document.activeElement)){found=true;break;}}
    await page.keyboard.press('Enter');
    await page.getByRole('button',{name:'Close menu',exact:true}).waitFor();
    await page.waitForFunction(()=>!!document.activeElement.closest('.wp-block-navigation__responsive-container.is-menu-open'),{},{timeout:3000});
    await page.locator('.wp-block-navigation__responsive-container.is-menu-open').evaluate(n=>Promise.all(n.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));
    const menuPalette=await page.locator('.wp-block-navigation__responsive-container.is-menu-open').evaluate(n=>({background:getComputedStyle(n).backgroundColor,focusColor:getComputedStyle(document.activeElement).outlineColor,focusWidth:getComputedStyle(document.activeElement).outlineWidth}));
    const luminance=color=>{const channels=color.match(/[\d.]+/g).slice(0,3).map(Number).map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return channels.reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0)};
    const levels=[luminance(menuPalette.background),luminance(menuPalette.focusColor)].sort((a,b)=>a-b);
    menuPalette.focusContrast=(levels[1]+.05)/(levels[0]+.05);
    if(menuPalette.background!==(scheme==='dark'?'rgb(16, 21, 31)':'rgb(255, 255, 255)')||menuPalette.focusContrast<3||parseFloat(menuPalette.focusWidth)<2)throw new Error('Menu palette/focus contrast failed: '+JSON.stringify(menuPalette));
    await page.screenshot({path:path.join(output,`${scheme}-${width}-menu-focus.png`)});
    const focusedInside=await page.evaluate(()=>!!document.activeElement.closest('.wp-block-navigation__responsive-container.is-menu-open'));
    const trap=[];
    for(let i=0;i<6;i++){await page.keyboard.press('Tab');trap.push(await page.evaluate(()=>({inside:!!document.activeElement.closest('.wp-block-navigation__responsive-container.is-menu-open'),label:document.activeElement.getAttribute('aria-label'),text:document.activeElement.textContent.trim()})));}
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('.wp-block-navigation__responsive-container.is-menu-open'),{},{timeout:3000});
    await menu.evaluate(n=>new Promise(resolve=>requestAnimationFrame(()=>resolve(n===document.activeElement))));
    navigation={mode:'mobile',palette:menuPalette,reachedByTab:found,openedByEnter:true,focusedInside,trap,escapeClosed:await page.locator('.wp-block-navigation__responsive-container.is-menu-open').count()===0,focusRestored:await menu.evaluate(n=>n===document.activeElement)};
   }
   const detail=page.locator('details').first();
   await detail.locator('summary').focus();await page.keyboard.press('Enter');const expanded=await detail.getAttribute('open')!==null;await page.keyboard.press('Space');const collapsed=await detail.getAttribute('open')===null;
   report.keyboard.push({scheme,width,skip,afterSkip,sequence,navigation,details:{enterExpanded:expanded,spaceCollapsed:collapsed}});
  }
 }
 const persistence=await server.playground.run({code:await fs.readFile(path.join(root,'tests/accessibility-persistence.php'),'utf8')});
 const persistenceText=new TextDecoder().decode(persistence.bytes);
 if(!persistenceText.includes('GCS_A11Y_PERSISTENCE='))throw new Error(persistenceText+persistence.errors);
 report.persistence=JSON.parse(persistenceText.split('GCS_A11Y_PERSISTENCE=')[1]);
 if(!report.persistence.alternateTheme||!report.persistence.templateContentPreserved||!report.persistence.globalStylesPreserved||!report.persistence.publishedContentPreserved)throw new Error('Native customization persistence check failed');
} catch(e){report.errors.push(e.stack);process.exitCode=1;} finally{
 await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
 if(browser)await browser.close();if(server)await server[Symbol.asyncDispose]();await fs.rm(runtime,{recursive:true,force:true});
}
const failures=report.pages.filter(p=>p.overflow||p.main!==1||p.h1.length!==1||p.violations.length||!p.renderedTemplate?.endsWith('//'+p.template));
const keyboardFailures=report.keyboard.filter(k=>!k.afterSkip.nextTabInsideMain||!k.details.enterExpanded||!k.details.spaceCollapsed||(k.navigation.mode==='mobile'&&(!k.navigation.reachedByTab||!k.navigation.focusRestored||!k.navigation.escapeClosed||!k.navigation.focusedInside||k.navigation.trap.some(t=>!t.inside))));
report.summary={renderConditions:report.pages.length,failedRenderConditions:failures.length,keyboardConditions:report.keyboard.length,failedKeyboardConditions:keyboardFailures.length,runtimeErrors:report.errors.length};
await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({summary:report.summary,versions:{wordpress:report.wordpress,php:report.php,browser:report.browser},pages:report.pages.length,failures:failures.map(p=>({scheme:p.scheme,viewport:p.viewport,template:p.template,overflow:p.overflow,overflowElements:p.overflowElements,renderedTemplate:p.renderedTemplate,h1:p.h1.length,axe:p.violations.map(v=>v.id)})),keyboard:report.keyboard,errors:report.errors},null,2));
if(failures.length||keyboardFailures.length||report.errors.length||report.pages.length!==64||report.keyboard.length!==4)process.exitCode=1;
