import './loopback.mjs';
/** Official core locales plus synthetic local package catalogs. No production mounts. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await fs.mkdtemp(path.join(root, '.runtime-locale-'));
os.homedir = () => temporary;
const { runCLI } = await import('@wp-playground/cli');
const results = [];
let failed = false;
const check = (value, message) => { if (!value) throw new Error(message); };
const quoted = value => JSON.stringify(value);
async function makeCatalogs(locale, theme, plugin) {
 const marker = `[TEST-${locale}]`;
 const plural = locale === 'ar' ? 'nplurals=6; plural=(n==0?0:n==1?1:n==2?2:n%100>=3&&n%100<=10?3:n%100>=11?4:5);' : 'nplurals=2; plural=(n != 1);';
 const header = `msgid ""\nmsgstr ""\n"Language: ${locale}\\n"\n"Content-Type: text/plain; charset=UTF-8\\n"\n"Plural-Forms: ${plural}\\n"\n\n`;
 const sentence = locale === 'ar' ? 'نص اختبار اصطناعي طويل لا يمثل ترجمة معتمدة' : 'Künstlicher langer Testtext, keine geprüfte Übersetzung';
 for (const [directory, domain, entries] of [
  [theme, 'gymcore-starter', [['Make room for your next chapter.', `${marker} ${sentence}`]]],
  [plugin, 'gymcore-starter-kit', [['GymCore Starter', `${marker} Plugin`], ['Monday', `${marker} ${locale === 'ar' ? 'الاثنين' : 'Montag'}`]]]
 ]) {
  const langs = path.join(directory, 'languages'); await fs.mkdir(langs, {recursive:true});
  let po = header + entries.map(([a,b]) => `msgid ${quoted(a)}\nmsgstr ${quoted(b)}\n`).join('\n');
  if (domain.endsWith('-kit')) po += `\n#, php-format\nmsgid "%s weekly class"\nmsgid_plural "%s weekly classes"\n` + Array.from({length:locale === 'ar'?6:2}, (_,i)=>`msgstr[${i}] "${marker} %s weekly-${i}"\n`).join('');
  const basename = domain.endsWith('-kit') ? `${domain}-${locale}` : locale;
  const source = path.join(langs, basename+'.po'); await fs.writeFile(source,po);
  execFileSync('msgfmt', ['--check-format',source,'-o',path.join(langs,basename+'.mo')]);
 }
 const digest=createHash('md5').update('blocks/weekly-schedule/index.js').digest('hex');
 await fs.writeFile(path.join(plugin,'languages',`gymcore-starter-kit-${locale}-${digest}.json`),JSON.stringify({domain:'messages',locale_data:{messages:{'':{domain:'gymcore-starter-kit',lang:locale,'plural-forms':plural},'All':[`${marker} All`],'Schedule filters':[`${marker} Filters`]}}}));
}
async function php(server, name, marker) {
 const reply = await server.playground.run({code:await fs.readFile(path.join(root,'tests',name),'utf8')});
 const output = new TextDecoder().decode(reply.bytes); const index = output.indexOf(marker);
 check(index>=0,output+'\n'+reply.errors); return JSON.parse(output.slice(index+marker.length));
}
try {
 for (const locale of (process.env.GCS_LOCALES || 'ar,de_DE').split(',')) {
  console.log(`Locale ${locale}: preparing official core pack and synthetic package catalogs`);
  const fixture=path.join(temporary,locale),theme=path.join(fixture,'theme'),plugin=path.join(fixture,'plugin'),mu=path.join(fixture,'mu');
  await fs.mkdir(mu,{recursive:true});
  await fs.cp(path.join(root,'theme/gymcore-starter'),theme,{recursive:true});
  await fs.cp(path.join(root,'plugin/gymcore-starter-kit'),plugin,{recursive:true});
  await fs.copyFile(path.join(root,'tests/locale-fixture.php'),path.join(mu,'locale-fixture.php'));
  await makeCatalogs(locale,theme,plugin);
  const server=await runCLI({command:'server',wp:'7.1.2',php:'8.5',port:Number(process.env.GCS_LOCALE_PORT||9493),workers:1,verbosity:'quiet',blueprint:{steps:[{step:'setSiteLanguage',language:locale}]},mount:[{hostPath:theme,vfsPath:'/wordpress/wp-content/themes/gymcore-starter'},{hostPath:plugin,vfsPath:'/wordpress/wp-content/plugins/gymcore-starter-kit'},{hostPath:mu,vfsPath:'/wordpress/wp-content/mu-plugins'}]});
  try {
   const setup=await php(server,'locale-setup.php','GCS_LOCALE_SETUP=');
   const report=await php(server,'locale-check.php','GCS_LOCALE_CHECK=');
   for(const key of ['official_core_catalog','theme_php','plugin_php','pattern_php','plural_php']) check(report[key],`${locale}: ${key} failed`);
   check(!report.early_translation_warning,`${locale}: early translation warning`);check(report.rtl===(locale==='ar'),'Direction mismatch');
   report.browser=[];results.push(report);
   console.log(`Locale ${locale}: PHP catalog checks passed`);
   const browser=await chromium.launch({headless:true,...(process.env.GCS_BROWSER_CHANNEL?{channel:process.env.GCS_BROWSER_CHANNEL}:{})});
   try {
    const context=await browser.newContext(); const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
    report.browser_version=browser.version();
    for(const viewport of [{width:1200,height:900},{width:390,height:844}]) {
     await page.setViewportSize(viewport);
     for(const route of ['/',`/?page_id=${setup.page_id}`]) {
      await page.goto(server.serverUrl+route,{waitUntil:'networkidle'});
      const layout=await page.evaluate(()=>({direction:getComputedStyle(document.documentElement).direction,overflow:document.documentElement.scrollWidth>innerWidth}));
      check(layout.direction===(locale==='ar'?'rtl':'ltr'),'HTML direction mismatch');check(!layout.overflow,`${locale} overflow ${route}`);
      const menu=page.locator('.wp-block-navigation__responsive-container-open');
      let navigation='desktop';
      if(await menu.isVisible()) {await menu.click();await page.locator('.wp-block-navigation__responsive-container.is-menu-open').waitFor();await page.keyboard.press('Escape');check(await menu.isVisible(),'Menu Escape failed');navigation='open/Escape pass';}
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      const violations=axe.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length}));
      check(!violations.length,JSON.stringify(violations));
      report.browser.push({viewport,route,...layout,navigation,axe:violations});
     }
    }
    await page.goto(server.serverUrl+'/wp-login.php');await page.locator('#user_login').fill('admin');await page.locator('#user_pass').fill('disposable-locale-test-only');await page.locator('#wp-submit').click();await page.waitForURL('**/wp-admin/**');
    await page.goto(server.serverUrl+`/wp-admin/post.php?post=${setup.page_id}&action=edit`);
    await page.setViewportSize({width:1200,height:900});
    await page.waitForFunction(()=>!!window.wp?.blocks?.getBlockType('gymcore-starter/weekly-schedule'));
    const javascript=await page.evaluate(()=>({all:wp.i18n.__('All','gymcore-starter-kit'),filters:wp.i18n.__('Schedule filters','gymcore-starter-kit'),direction:getComputedStyle(document.documentElement).direction}));
    check(javascript.all===`[TEST-${locale}] All`,'Private JS catalog failed');check(javascript.filters===`[TEST-${locale}] Filters`,'Private JS filter catalog failed');
    await page.evaluate(()=>{const blocks=wp.data.select('core/block-editor').getBlocks();const b=blocks.find(b=>b.name==='gymcore-starter/weekly-schedule');if(b)wp.data.dispatch('core/block-editor').selectBlock(b.clientId);});
    const modal=page.locator('.components-modal__frame');
    if(await modal.isVisible()) await modal.locator('.components-modal__header button').first().click();
    await page.evaluate(()=>wp.data.dispatch('core/edit-post').openGeneralSidebar('edit-post/block'));
    await page.getByText(`[TEST-${locale}] Filters`,{exact:true}).waitFor();
    const inspector=await page.locator('.block-editor-block-inspector').evaluate(element=>({direction:getComputedStyle(element).direction,overflow:element.scrollWidth>element.clientWidth+1}));
    check(inspector.direction===(locale==='ar'?'rtl':'ltr'),'Inspector direction mismatch');check(!inspector.overflow,'Inspector overflows');
    report.editor={...javascript,inspector};
    check(!errors.length,JSON.stringify(errors));report.page_errors=errors;
   } finally {await browser.close();}
   const after=await php(server,'locale-check.php','GCS_LOCALE_CHECK=');check(!after.early_translation_warning,'Late request recorded early translation warning');
   console.log(`Locale ${locale}: frontend and editor checks passed`);
  } finally {await server[Symbol.asyncDispose]();}
 }
} catch(error) {failed=true;results.push({error:error.message});console.error(error);}
finally {await fs.mkdir(path.join(root,'test-results'),{recursive:true});await fs.writeFile(path.join(root,'test-results/locale-rtl.json'),JSON.stringify(results,null,2)+'\n');await fs.rm(temporary,{recursive:true,force:true});}
console.log(JSON.stringify(results,null,2));process.exitCode=failed?1:0;
