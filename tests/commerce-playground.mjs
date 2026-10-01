import './loopback.mjs';
/** Alternative commerce smoke in SQLite/PHP-WASM; explicitly not native DB coverage. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
import {exerciseCommerceBrowser} from './commerce-browser.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scratch=await fs.mkdtemp(path.join(root,'.runtime-commerce-'));
os.homedir=()=>scratch;
const {runCLI}=await import('@wp-playground/cli');
const report={date:new Date().toISOString(),engine:'Playground SQLite/PHP-WASM; not native MariaDB',runs:[]};
await fs.mkdir(path.join(root,'test-results'),{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.GCS_BROWSER_CHANNEL?{channel:process.env.GCS_BROWSER_CHANNEL}:{})});
report.browser=browser.version();
try {
 const mu=path.join(scratch,'mu');await fs.mkdir(mu);
 await fs.writeFile(path.join(mu,'commerce-isolation.php'),"<?php add_filter('pre_wp_mail',static function(){return false;});add_filter('pre_http_request',static function(){return new WP_Error('fixture_offline','Outbound HTTP blocked');});");
 for(const mode of ['hpos','posts']) {
  const server=await runCLI({command:'server',wp:'7.1.2',php:'8.3',port:9492,workers:1,verbosity:'quiet','define-bool':{DISABLE_WP_CRON:true},blueprint:{steps:[{step:'installPlugin',pluginData:{resource:'url',url:'https://downloads.wordpress.org/plugin/woocommerce.11.1.2.zip'},options:{activate:true}}]},mount:[{hostPath:path.join(root,'theme/gymcore-starter'),vfsPath:'/wordpress/wp-content/themes/gymcore-starter'},{hostPath:path.join(root,'plugin/gymcore-starter-kit'),vfsPath:'/wordpress/wp-content/plugins/gymcore-starter-kit'},{hostPath:mu,vfsPath:'/wordpress/wp-content/mu-plugins'}]});
  const run={mode};report.runs.push(run);
  try {
   const activate=await server.playground.run({code:"<?php require '/wordpress/wp-load.php';require_once ABSPATH.'wp-admin/includes/plugin.php';wp_set_current_user(1);activate_plugin('gymcore-starter-kit/gymcore-starter-kit.php');switch_theme('gymcore-starter');"});
   if(activate.errors)run.activationErrors=activate.errors;
   const php=async(phase)=>{
    const src=await fs.readFile(path.join(root,'tests/commerce-fixture.php'),'utf8');
    const result=await server.playground.run({code:src.replace('<?php',`<?php require '/wordpress/wp-load.php'; require_once ABSPATH.'wp-admin/includes/plugin.php'; wp_set_current_user(1); $args=array('${phase}','${mode}');`)});
    if(result.errors)run.phpErrors=(run.phpErrors||'')+result.errors;
    return JSON.parse(new TextDecoder().decode(result.bytes));
   };
   const fixture=await php('setup');run.fixture=fixture;run.crud=await php('crud');
   Object.assign(run,await exerciseCommerceBrowser(browser,fixture,path.join(root,`test-results/commerce-playground-${mode}.png`)));
   if(run.browserFailure)throw new Error(run.browserFailure);
   run.browserOrder=await php('verify-browser-order');
  } catch(error){run.blocker=error.message;process.exitCode=1;}
  finally{await server[Symbol.asyncDispose]();await fs.writeFile(path.join(root,'test-results/commerce-playground.json'),JSON.stringify(report,null,2));}
 }
}finally{await browser.close();await fs.rm(scratch,{recursive:true,force:true});}
if(report.runs.length!==2||report.runs.some(r=>!r.browserOrder||r.fixture?.cart_block!==true||r.fixture?.checkout_block!==true||r.fixture?.browser_product_manages_stock!==false||r.browserOrder.checks.length!==4||r.browserChecks?.length!==2||r.crud?.checks.some(c=>!c.pass)||r.browserOrder.checks.some(c=>!c.pass)||r.pages?.some(p=>p.status!==200||!p.textPresent||p.overflow)||r.checkoutContrast?.length||r.pageErrors?.length||r.phpErrors||r.activationErrors))process.exitCode=1;
console.log(JSON.stringify(report,null,2));
