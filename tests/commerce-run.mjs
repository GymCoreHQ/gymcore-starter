/** Native disposable Docker fixture: only own uniquely named resources are removed. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
import {exerciseCommerceBrowser} from './commerce-browser.mjs';
const exec=promisify(execFile),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'gcs-commerce-'));
await fs.chmod(scratch,0o755);
const project='gcs-commerce-'+process.pid, compose=path.join(scratch,'compose.json');
const report={date:new Date().toISOString(),sourceHead:(await exec('git',['-C',root,'rev-parse','HEAD'])).stdout.trim(),runs:[]};
const docker=async(...args)=>(await exec('docker',['compose','-p',project,'-f',compose,...args],{maxBuffer:20*1024*1024,timeout:240000})).stdout;
const wp=async(...args)=>{console.error('WP step:',args.slice(0,3).join(' '));return docker('run','--rm','-T','cli',...args);};
let browser;
try {
 for(const [file,url] of [['woo.zip','https://downloads.wordpress.org/plugin/woocommerce.11.1.2.zip'],['wp.zip','https://wordpress.org/wordpress-7.1.2.zip']]) { const response=await fetch(url); if(!response.ok) throw new Error('Official download failed:'+response.status); await fs.writeFile(path.join(scratch,file),Buffer.from(await response.arrayBuffer())); }
 await fs.mkdir(path.join(scratch,'mu'));
 await fs.writeFile(path.join(scratch,'mu','gcs-commerce-isolation.php'),`<?php
add_filter('pre_wp_mail',static function(){return false;});
add_filter('pre_http_request',static function(){return new WP_Error('gcs_test_offline','Outbound HTTP disabled in local commerce fixture.');});
`);
 const environment={WORDPRESS_DB_HOST:'db',WORDPRESS_DB_USER:'fixture',WORDPRESS_DB_PASSWORD:'disposable-only',WORDPRESS_DB_NAME:'fixture',WORDPRESS_CONFIG_EXTRA:"define('DISABLE_WP_CRON',true); define('WP_HTTP_BLOCK_EXTERNAL',true);"};
 const volumes=['site:/var/www/html',`${root}/theme/gymcore-starter:/var/www/html/wp-content/themes/gymcore-starter:ro`,`${root}/plugin/gymcore-starter-kit:/var/www/html/wp-content/plugins/gymcore-starter-kit:ro`,`${root}/tests:/tests:ro`,`${scratch}:/fixtures:ro`,`${scratch}/mu:/var/www/html/wp-content/mu-plugins:ro`];
 await fs.writeFile(compose,JSON.stringify({services:{db:{image:'mariadb:11.8.9',environment:{MARIADB_ROOT_PASSWORD:'disposable-root-only',MARIADB_DATABASE:'fixture',MARIADB_USER:'fixture',MARIADB_PASSWORD:'disposable-only'},volumes:['db:/var/lib/mysql']},web:{image:'wordpress:php8.3-apache',ports:['127.0.0.1:9492:80'],environment,volumes},cli:{image:'wordpress:cli',user:'33:33',environment:{...environment,WP_CLI_CACHE_DIR:'/tmp/wp-cache'},volumes}},volumes:{site:{},db:{}},networks:{default:{}}},null,2));
 report.images=(await exec('docker',['image','inspect','wordpress:php8.3-apache','wordpress:cli','mariadb:11.8.9','--format','{{json .}}'],{maxBuffer:5*1024*1024})).stdout.trim().split('\n').map(line=>{const x=JSON.parse(line);return {id:x.Id,digests:x.RepoDigests,tags:x.RepoTags};});
 browser=await chromium.launch({headless:true,...(process.env.GCS_BROWSER_CHANNEL?{channel:process.env.GCS_BROWSER_CHANNEL}:{})});
 report.browser=browser.version();
 for(const mode of ['hpos','posts']) {
  await docker('up','-d','db','web');
  let installed=false;
  for(let retry=0;retry<3;retry++){try{await wp('core','install','--url=http://localhost:9492','--title=Fictional Commerce Test','--admin_user=fixture-admin','--admin_password=disposable-admin-only','--admin_email=admin@example.invalid','--skip-email');installed=true;break;}catch(error){console.error('Setup retry:',error.stderr || error.message); if(retry===2)throw error; await new Promise(r=>setTimeout(r,1000));}}
  if(!installed)throw new Error('Fresh core installation failed');
  await wp('core','update','/fixtures/wp.zip','--force'); await wp('core','update-db');
  await wp('plugin','install','/fixtures/woo.zip','--activate');
  await wp('plugin','activate','gymcore-starter-kit'); await wp('theme','activate','gymcore-starter');
  const fixture=JSON.parse(await wp('eval-file','/tests/commerce-fixture.php','setup',mode));
  const crud=JSON.parse(await wp('eval-file','/tests/commerce-fixture.php','crud',mode));
  const webPhp=(await docker('exec','-T','web','php','-r','echo PHP_VERSION;')).trim();
  const run={mode,webPhp,fixture,crud,pages:[],browserChecks:[]};report.runs.push(run);
  Object.assign(run,await exerciseCommerceBrowser(browser,fixture,path.join(scratch,`checkout-${mode}.png`)));
  if(run.browserFailure) throw new Error(run.browserFailure);
  run.browserOrder=JSON.parse(await wp('eval-file','/tests/commerce-fixture.php','verify-browser-order',mode));
  await docker('down','--volumes','--remove-orphans');
 }
} catch(error){report.blocker=error.message;process.exitCode=1;}
finally{
 if(browser)await browser.close();
 try{await docker('down','--volumes','--remove-orphans');}catch(error){report.cleanupError=error.message;process.exitCode=1;}
 await fs.mkdir(path.join(root,'test-results'),{recursive:true});
 await fs.writeFile(path.join(root,'test-results/commerce.json'),JSON.stringify(report,null,2)+'\n');
 for(const mode of ['hpos','posts'])try{await fs.copyFile(path.join(scratch,`checkout-${mode}.png`),path.join(root,`test-results/commerce-checkout-${mode}.png`));}catch{}
 await fs.rm(scratch,{recursive:true,force:true});
}
for(const run of report.runs)if(run.crud.checks.some(c=>!c.pass)||run.browserOrder?.checks.some(c=>!c.pass)||run.pages.some(p=>p.status!==200||!p.textPresent||p.overflow)||run.checkoutContrast?.length||run.pageErrors?.length)process.exitCode=1;
console.log(JSON.stringify(report,null,2));

if(report.runs.length!==2 || report.runs.some(r=>!r.browserOrder || r.fixture?.cart_block!==true || r.fixture?.checkout_block!==true || r.fixture?.browser_product_manages_stock!==false || r.browserOrder.checks.length!==4 || r.browserChecks.length!==2)) process.exitCode=1;
