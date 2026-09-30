/** Optional external-source integration. Private GymCore files never enter this repo. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=process.env.GCS_CANONICAL_PLUGIN_PATH;
if(!source) throw new Error('Set GCS_CANONICAL_PLUGIN_PATH to your authorized external GymCore plugin checkout.');
await fs.access(path.join(source,'gym-core.php'));
const sourceSha=execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const sourceRoot=execFileSync('git',['-C',source,'rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const sourcePrefix=execFileSync('git',['-C',source,'rev-parse','--show-prefix'],{encoding:'utf8'}).trim().replace(/\/$/,'');
const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'gymcore-canonical-'));
os.homedir=()=>scratch;
const { runCLI }=await import('@wp-playground/cli');
const report={sourceSha,date:new Date().toISOString(),isolation:'fresh disposable SQLite/PHP-WASM; external plugin copied outside repository; outbound WordPress HTTP blocked; no license keys or entitlement overrides',runs:[]};
let server;
try {
 const pluginCopy=path.join(scratch,'gym-core');
 await fs.mkdir(pluginCopy);
 const committed=execFileSync('git',['-C',sourceRoot,'archive','--format=tar',sourceSha+':'+sourcePrefix],{maxBuffer:128*1024*1024,timeout:30000});
 execFileSync('tar',['-xf','-','-C',pluginCopy],{input:committed,timeout:30000});
 execFileSync(process.env.GCS_COMPOSER_BINARY || 'composer',['install','--no-dev','--no-plugins','--no-scripts','--no-interaction'],{cwd:pluginCopy,timeout:60000,env:{...process.env,COMPOSER_HOME:path.join(scratch,'composer-home'),COMPOSER_CACHE_DIR:path.join(scratch,'composer-cache')}});
 const mu=path.join(scratch,'mu-plugins'); await fs.mkdir(mu);
 await fs.writeFile(path.join(mu,'isolated-test.php'),`<?php
/** Local integration sandbox: fail closed for all WordPress HTTP and email. */
add_filter('pre_http_request',static function($pre,$args,$url){ $hosts=get_option('gcs_test_blocked_hosts',array()); $hosts[]=wp_parse_url($url,PHP_URL_HOST); update_option('gcs_test_blocked_hosts',array_values(array_unique($hosts))); return new WP_Error('gcs_test_network_disabled','Outbound HTTP disabled in disposable integration tests.'); },PHP_INT_MIN,3);
add_filter('pre_wp_mail',static function(){ return false; });
`);
 server=await runCLI({command:'server',wp:process.env.GCS_WP_VERSION||'7.1.2',php:process.env.GCS_PHP_VERSION||'8.3',port:Number(process.env.GCS_TEST_PORT||9486),workers:1,verbosity:'quiet','define-bool':{DISABLE_WP_CRON:true,WP_HTTP_BLOCK_EXTERNAL:true},blueprint:{steps:[{step:'installPlugin',pluginData:{resource:'url',url:'https://downloads.wordpress.org/plugin/woocommerce.11.1.2.zip'},options:{activate:true}}]},mount:[{hostPath:pluginCopy,vfsPath:'/wordpress/wp-content/plugins/gym-core'},{hostPath:path.join(root,'plugin/gymcore-starter-kit'),vfsPath:'/wordpress/wp-content/plugins/gymcore-starter-kit'},{hostPath:mu,vfsPath:'/wordpress/wp-content/mu-plugins'}]});
 for(const stage of ['activate','verify']) {
  const code=(await fs.readFile(path.join(root,'tests/canonical-integration.php'),'utf8')).replace('GCS_STAGE_VALUE',stage);
  const result=await server.playground.run({code});
  const output=new TextDecoder().decode(result.bytes);
  await fs.mkdir(path.join(root,'test-results'),{recursive:true});
  await fs.writeFile(path.join(root,`test-results/canonical-${stage}.txt`),output+'\n'+result.errors);
  const marker=output.indexOf('GCS_CANONICAL=');
  if(marker<0) throw new Error('Canonical runtime did not return results; inspect ignored test-results/canonical-'+stage+'.txt');
  const parsed=JSON.parse(output.slice(marker+14));
  report.runs.push({...parsed,phpStderrPresent:!!result.errors});
 }
} catch(error) { report.blocker=error.message; process.exitCode=1; }
finally {
 if(server) await server[Symbol.asyncDispose]();
 await fs.mkdir(path.join(root,'test-results'),{recursive:true});
 await fs.writeFile(path.join(root,'test-results/canonical-integration.json'),JSON.stringify(report,null,2)+'\n');
 await fs.rm(scratch,{recursive:true,force:true});
}
console.log(JSON.stringify(report,null,2));
if(report.runs.some(r=>r.fixture_blocker || r.checks?.some(c=>!c.pass))) process.exitCode=1;
