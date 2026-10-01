import './loopback.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scratch=await fs.mkdtemp(path.join(root,'.runtime-sqlite-stock-'));
os.homedir=()=>scratch;
const {runCLI}=await import('@wp-playground/cli');
const report={date:new Date().toISOString(),purpose:'Controlled SQLite managed-stock checkout comparison; no vendor patches or reservation bypass',runs:[]};
const results=path.join(root,'test-results');await fs.mkdir(results,{recursive:true});
let browser;
try {
 browser=await chromium.launch({headless:true,...(process.env.GCS_BROWSER_CHANNEL?{channel:process.env.GCS_BROWSER_CHANNEL}:{})});report.browser=browser.version();
 const mu=path.join(scratch,'mu');await fs.mkdir(mu);
 await fs.writeFile(path.join(mu,'diagnostic.php'),`<?php
add_filter('pre_wp_mail',static function(){return false;});
add_filter('pre_http_request',static function(){return new WP_Error('fixture_offline','Outbound HTTP blocked');});
$GLOBALS['gcs_sql_observations']=array();
add_filter('query',static function($sql){global $wpdb;if($wpdb->last_error){$GLOBALS['gcs_sql_observations'][]=array('error'=>$wpdb->last_error,'previous_sql'=>$wpdb->last_query);}if(stripos($sql,'wc_reserved_stock')!==false){$GLOBALS['gcs_sql_observations'][]=array('reservation_sql'=>$sql);}return $sql;});
register_shutdown_function(static function(){global $wpdb;if($wpdb->last_error){$GLOBALS['gcs_sql_observations'][]=array('error'=>$wpdb->last_error,'previous_sql'=>$wpdb->last_query);}if($GLOBALS['gcs_sql_observations'])file_put_contents('/tmp/gcs-sql-observations.jsonl',json_encode($GLOBALS['gcs_sql_observations'])."\\n",FILE_APPEND);});
`);
 for(const mode of ['hpos','posts'])for(const variant of ['starter','default']) {
  const run={mode,variant};report.runs.push(run);let server,context;
  try {
   server=await runCLI({command:'server',wp:'7.1.2',php:'8.3',port:9498,workers:1,verbosity:'quiet','define-bool':{DISABLE_WP_CRON:true},blueprint:{steps:[{step:'installPlugin',pluginData:{resource:'url',url:'https://downloads.wordpress.org/plugin/woocommerce.11.1.2.zip'},options:{activate:true}}]},mount:[{hostPath:path.join(root,'theme/gymcore-starter'),vfsPath:'/wordpress/wp-content/themes/gymcore-starter'},{hostPath:path.join(root,'plugin/gymcore-starter-kit'),vfsPath:'/wordpress/wp-content/plugins/gymcore-starter-kit'},{hostPath:mu,vfsPath:'/wordpress/wp-content/mu-plugins'}]});
   const php=async(code)=>{const result=await server.playground.run({code:"<?php require '/wordpress/wp-load.php';require_once ABSPATH.'wp-admin/includes/plugin.php';wp_set_current_user(1);"+code.replace(/^<\?php/, '')});if(result.errors)(run.phpErrors??=[]).push(result.errors);return new TextDecoder().decode(result.bytes);};
   if(variant==='starter')await php("activate_plugin('gymcore-starter-kit/gymcore-starter-kit.php');switch_theme('gymcore-starter');");
   else await php("deactivate_plugins('gymcore-starter-kit/gymcore-starter-kit.php');switch_theme('twentytwentyfive');");
   const fixture=JSON.parse(await php("$args=array('setup','"+mode+"','managed');"+(await fs.readFile(path.join(root,'tests/commerce-fixture.php'),'utf8')).replace(/^<\?php/,'')));
   run.before=JSON.parse(await php(await fs.readFile(path.join(root,'tests/sqlite-stock-diagnostic.php'),'utf8')));
   context=await browser.newContext();const page=await context.newPage();run.responses=[];run.pageErrors=[];
   page.on('pageerror',e=>run.pageErrors.push(e.message));
   await context.route('**/*',route=>['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
   const responseTasks=[];
   page.on('response',response=>{if(response.url().includes('/wc/store/')||response.url().includes('wc%2Fstore'))responseTasks.push((async()=>{let body;try{body=await response.json();}catch{}if(response.status()>=400)run.responses.push({status:response.status(),code:body?.code,message:body?.message,dataStatus:body?.data?.status});})());});
   await page.goto(fixture.product_url,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Add to cart',exact:true}).click();
   await page.goto(fixture.checkout,{waitUntil:'networkidle'});await page.getByText('Offline test check',{exact:true}).first().waitFor();
   for(const [id,value] of Object.entries({email:'shopper@example.invalid','billing-first_name':'Fictional','billing-last_name':'Shopper','billing-address_1':'100 Example Way','billing-city':'Example City','billing-postcode':'90001'}))await page.locator('#'+id).fill(value);
   if(await page.locator('#billing-state').count())await page.locator('#billing-state').selectOption('CA');
   await page.getByRole('button',{name:/place order/i}).click();
   try{await page.waitForURL(/order-received/,{timeout:15000});run.checkout='order-received';}catch{run.checkout='not-completed';run.visibleErrors=await page.locator('.wc-block-components-notice-banner.is-error').allTextContents();}
   await Promise.all(responseTasks);
   await page.screenshot({path:path.join(results,`sqlite-stock-${mode}-${variant}.png`),fullPage:true});
   run.after=JSON.parse(await php(await fs.readFile(path.join(root,'tests/sqlite-stock-diagnostic.php'),'utf8')));
   const raw=await server.playground.run({code:"<?php echo file_exists('/tmp/gcs-sql-observations.jsonl')?file_get_contents('/tmp/gcs-sql-observations.jsonl'):'';"});
   run.sqlObservations=new TextDecoder().decode(raw.bytes).trim().split('\n').filter(Boolean).flatMap(line=>JSON.parse(line));
  }catch(error){run.blocker=error.message;process.exitCode=1;}
  finally{try{if(context)await context.close();}catch(error){run.contextCleanupError=error.message;process.exitCode=1;}try{if(server)await server[Symbol.asyncDispose]();run.cleanup=true;}catch(error){run.cleanupError=error.message;process.exitCode=1;}await fs.writeFile(path.join(results,'sqlite-stock-diagnostic.json'),JSON.stringify(report,null,2));}
 }
}finally{try{if(browser)await browser.close();}finally{await fs.rm(scratch,{recursive:true,force:true});}}
report.comparison={configurationVerified:report.runs.length===4&&new Set(report.runs.map(r=>r.mode+':'+r.variant)).size===4&&report.runs.every(r=>r.before?.manages_stock===true&&r.before.stock===20&&r.before.hpos===(r.mode==='hpos')&&r.before.starter_active===(r.variant==='starter')&&r.before.theme===(r.variant==='starter'?'gymcore-starter':'twentytwentyfive')),sameReservationSyntaxFailure:report.runs.length===4&&report.runs.every(r=>r.responses?.some(e=>e.status===403&&e.code==='woocommerce_product_not_enough_stock')&&r.sqlObservations?.some(q=>q.error?.includes('near \"60\": syntax error')&&q.previous_sql?.includes('INSERT INTO wp_wc_reserved_stock')))};
if(!report.comparison.configurationVerified||report.runs.some(r=>!r.after||!['order-received','not-completed'].includes(r.checkout)||r.blocker||r.phpErrors?.length||r.pageErrors?.length||!r.cleanup))process.exitCode=1;
await fs.writeFile(path.join(results,'sqlite-stock-diagnostic.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
