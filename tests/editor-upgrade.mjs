/** Real Site Editor save/reload and wp-admin ZIP replacement on a disposable site. */
import './loopback.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium,expect} from '@playwright/test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=await fs.mkdtemp(path.join(root,'.runtime-editor-upgrade-'));
const output=path.join(root,'test-results/editor-upgrade');
await fs.mkdir(output,{recursive:true});
const artifacts=path.join(runtime,'artifacts');await fs.mkdir(artifacts);
const packagePath=path.join(artifacts,'gymcore-starter-0.1.0.zip');
const previousPath=path.join(artifacts,'gymcore-starter-0.0.9.zip');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const report={date:new Date().toISOString(),checks:[],errors:[],browserErrors:[],restWrites:[],limitations:['Synthetic prior package changes only the version header to 0.0.9; not an actual earlier published release.','Single-site English WordPress Playground/PHP-WASM/SQLite; no MySQL, multisite or remote auto-update coverage.','UI edits cover one front-page heading and the bundled Light variation; not every Site Editor control.']};
let server,browser,page;
let phase='fixture setup';
const record=(name,pass,detail)=>{report.checks.push({name,pass,...(detail===undefined?{}:{detail})});if(!pass)throw new Error(name);};
try {
 await fs.copyFile(path.join(root,'dist/gymcore-starter-0.1.0.zip'),packagePath);
 const sourceEntries=JSON.parse(execFileSync('python3',['-c',`import sys,zipfile,hashlib,json
with zipfile.ZipFile(sys.argv[1]) as src,zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as dst:
 assert src.testzip() is None
 entries={}
 for i in src.infolist():
  data=src.read(i.filename)
  entries[i.filename]=hashlib.sha256(data).hexdigest()
  if i.filename=='gymcore-starter/style.css':
   assert b'Version: 0.1.0' in data
   data=data.replace(b'Version: 0.1.0',b'Version: 0.0.9')
  dst.writestr(i,data)
 print(json.dumps(entries))
`,packagePath,previousPath],{encoding:'utf8'}));
 report.packageSha256=hash(await fs.readFile(packagePath));report.syntheticPreviousSha256=hash(await fs.readFile(previousPath));report.packageFiles=Object.keys(sourceEntries).length;
 os.homedir=()=>runtime;
 const {runCLI}=await import('@wp-playground/cli');
 server=await runCLI({command:'server',wp:process.env.GCS_WP_VERSION||'7.1.2',php:'8.3',port:Number(process.env.GCS_TEST_PORT||9497),workers:1,verbosity:'quiet',mount:[{hostPath:artifacts,vfsPath:'/tmp/gcs-editor-packages'}]});
 const php=async code=>{const result=await server.playground.run({code});const text=new TextDecoder().decode(result.bytes);const marker=text.indexOf('GCS_EDITOR=');if(marker<0)throw new Error(text.slice(0,2000)+' '+result.errors);return JSON.parse(text.slice(marker+11));};
 const setup=await php(`<?php require '/wordpress/wp-load.php'; require_once ABSPATH.'wp-admin/includes/file.php'; require_once ABSPATH.'wp-admin/includes/theme.php'; require_once ABSPATH.'wp-admin/includes/class-wp-upgrader.php'; wp_set_current_user(1); $u=new Theme_Upgrader(new Automatic_Upgrader_Skin()); $r=$u->install('/tmp/gcs-editor-packages/gymcore-starter-0.0.9.zip'); switch_theme('gymcore-starter'); wp_set_password('disposable-editor-test-only',1); update_option('blogname','Example Editor Academy'); $p=wp_insert_post(array('post_type'=>'page','post_status'=>'publish','post_title'=>'Example original page','post_content'=>'Fictional page content preserved through a theme package upgrade.')); echo 'GCS_EDITOR='.wp_json_encode(array('installed'=>$r===true,'version'=>wp_get_theme()->get('Version'),'page'=>$p,'pageHash'=>hash('sha256',get_post($p)->post_content),'wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION));`);
 Object.assign(report,{wordpress:setup.wordpress,php:setup.php,playwright:'1.58.2',playground:'3.1.52'});
 record('Synthetic previous ZIP installed and active',setup.installed&&setup.version==='0.0.9');
 browser=await chromium.launch({headless:true,...(process.env.GCS_BROWSER_CHANNEL?{channel:process.env.GCS_BROWSER_CHANNEL}:{}),...(process.env.GCS_CHROME_PATH?{executablePath:process.env.GCS_CHROME_PATH}:{})});report.browser=await browser.version();
 page=await browser.newPage({viewport:{width:1440,height:1000}});
 const screenshot=async filename=>{await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))));await page.screenshot({path:path.join(output,filename),fullPage:true});};
 page.on('pageerror',error=>report.browserErrors.push(error.message));
 page.on('response',response=>{const u=new URL(response.url());if(response.request().method()==='POST'&&(u.pathname.includes('/wp-json/')||u.searchParams.has('rest_route')))report.restWrites.push({route:u.pathname.includes('/wp-json/')?u.pathname:u.searchParams.get('rest_route'),status:response.status()});});
 await page.goto(server.serverUrl+'/wp-login.php',{waitUntil:'domcontentloaded'});
 await page.locator('#user_login').fill('admin');await page.locator('#user_pass').fill('disposable-editor-test-only');await page.locator('#wp-submit').click();await page.waitForURL('**/wp-admin/**');
 const editorUrl=server.serverUrl+'/wp-admin/site-editor.php?postId=gymcore-starter%2F%2Ffront-page&postType=wp_template&canvas=edit';
 const editorHeading=()=>page.frameLocator('iframe[name="editor-canvas"]').getByRole('document',{name:'Block: Heading 1',exact:true});
 const topBar=()=>page.getByRole('region',{name:'Editor top bar',exact:true});
 const save=()=>topBar().getByRole('button',{name:'Save',exact:true});
 const enterEditor=async first=>{await page.goto(editorUrl,{waitUntil:'domcontentloaded',timeout:90000});if(first){await page.getByRole('button',{name:'Get started',exact:true}).click({timeout:120000});}await expect(editorHeading()).toBeVisible({timeout:120000});};
 phase='initial editor load';
 await enterEditor(true);
 // Canvas readiness alone does not establish that the toolbar has mounted.
 phase='initial editor toolbar readiness';
 await expect(topBar()).toBeVisible({timeout:120000});
 await expect(save()).toBeVisible({timeout:120000});
 const customHeading='Example editor customization survives upgrades';
 phase='front-page heading edit and save';
 await editorHeading().fill(customHeading);await save().click();await expect(save()).toBeDisabled({timeout:45000});
 record('Front-page heading edited and saved using Site Editor controls',true);
 phase='Light styles edit and save';
 await page.getByRole('button',{name:'Styles',exact:true}).click();
 await page.getByRole('dialog',{name:'Welcome to Styles',exact:true}).getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('button',{name:'Browse styles',exact:true}).click();await page.getByRole('button',{name:'Light',exact:true}).click();await save().click();
 const confirmation=page.getByRole('dialog',{name:'Are you ready to save?',exact:true});
 await expect(confirmation.getByRole('checkbox',{name:'Custom Styles',exact:true})).toBeChecked();await confirmation.getByRole('button',{name:'Save',exact:true}).click();await expect(confirmation).toBeHidden({timeout:45000});await expect(save()).toBeDisabled({timeout:45000});
 record('Light Global Styles saved through UI confirmation',true);
 const readState=async()=>php(`<?php require '/wordpress/wp-load.php'; $t=get_block_template('gymcore-starter//front-page','wp_template'); $posts=get_posts(array('post_type'=>'wp_template','name'=>'front-page','post_status'=>'publish','numberposts'=>1,'tax_query'=>array(array('taxonomy'=>'wp_theme','field'=>'name','terms'=>'gymcore-starter')))); $styles=WP_Theme_JSON_Resolver::get_user_data_from_wp_global_styles(wp_get_theme()); echo 'GCS_EDITOR='.wp_json_encode(array('version'=>wp_get_theme()->get('Version'),'templateSource'=>$t->source,'templateId'=>$posts[0]->ID??null,'templateHash'=>hash('sha256',$t->content),'templateContainsCustomization'=>strpos($t->content,'Example editor customization survives upgrades')!==false,'stylesId'=>$styles['ID']??null,'stylesHash'=>hash('sha256',$styles['post_content']??''),'pageHash'=>hash('sha256',get_post(${setup.page})->post_content)));`);
 phase='saved customization reload';
 await enterEditor(false);await expect(editorHeading()).toHaveText(customHeading);
 await screenshot('editor-before-upgrade.png');
 record('Saved template heading survives a real Site Editor reload',true);
 const verifyFrontend=async name=>{phase=name;await page.goto(server.serverUrl,{waitUntil:'domcontentloaded'});await expect(page.getByRole('heading',{level:1,name:customHeading,exact:true})).toBeVisible();const background=await page.evaluate(()=>getComputedStyle(document.body).backgroundColor);record(name,background==='rgb(255, 255, 255)',{background});await screenshot(name.startsWith('Before')?'front-before-upgrade.png':'front-after-upgrade.png');};
 await verifyFrontend('Before upgrade, saved heading and Light styles render after navigation');
 phase='pre-upgrade native records verification';
 report.before=await readState();record('UI edits created native custom template and Global Styles records',report.before.templateSource==='custom'&&!!report.before.templateId&&!!report.before.stylesId&&report.before.templateContainsCustomization);
 phase='native theme ZIP replacement';
 await page.goto(server.serverUrl+'/wp-admin/theme-install.php',{waitUntil:'domcontentloaded'});
 // Open the same upload panel used by the standard Add Themes screen.
 if(!await page.locator('#themezip').isVisible())await page.getByRole('button',{name:'Upload Theme',exact:true}).click();
 await page.locator('#themezip').setInputFiles(packagePath);await page.getByRole('button',{name:'Install Now',exact:true}).click();
 const replace=page.getByRole('link',{name:'Replace installed with uploaded',exact:true});await expect(replace).toBeVisible({timeout:90000});
 await expect(page.getByRole('row',{name:'Version 0.0.9 0.1.0',exact:true})).toBeVisible();await screenshot('upgrade-confirmation.png');
 await replace.click();await expect(page.getByText('Theme updated successfully.',{exact:true})).toBeVisible({timeout:90000});await screenshot('upgrade-success.png');
 record('Native Upload Theme comparison and replacement completed',true);
 phase='post-upgrade native records and installed files verification';
 report.after=await readState();
 record('Installed theme version advanced to packaged 0.1.0',report.after.version==='0.1.0');
 record('Template ID/content customization preserved',report.after.templateId===report.before.templateId&&report.after.templateHash===report.before.templateHash&&report.after.templateContainsCustomization);
 record('Global Styles ID/content preserved',report.after.stylesId===report.before.stylesId&&report.after.stylesHash===report.before.stylesHash);
 record('Original published page content preserved',report.after.pageHash===setup.pageHash);
 const expected=Buffer.from(JSON.stringify(sourceEntries)).toString('base64');
 const files=await php(`<?php require '/wordpress/wp-load.php'; $expected=json_decode(base64_decode('${expected}'),true); $mismatch=array(); foreach($expected as $name=>$hash){$file=WP_CONTENT_DIR.'/themes/'.$name;if(!is_file($file)||hash_file('sha256',$file)!==$hash)$mismatch[]=$name;} echo 'GCS_EDITOR='.wp_json_encode(array('count'=>count($expected),'mismatch'=>$mismatch));`);
 record('Every installed theme file matches the uploaded current ZIP',files.mismatch.length===0,files);
 phase='post-upgrade editor reload';
 await enterEditor(false);await expect(editorHeading()).toHaveText(customHeading);await screenshot('editor-after-upgrade.png');record('Site Editor reload retains saved heading after package upgrade',true);
 await verifyFrontend('After upgrade, saved heading and Light styles render after navigation');
 phase='final browser error verification';
 record('No browser JavaScript exceptions',report.browserErrors.length===0);
} catch(error){
 report.errors.push(String(error.message).slice(0,3000));process.exitCode=1;
 report.failurePhase=phase;
 if(page){
  await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});
  // Only inspect the fresh fictional Site Editor. Never inspect a personal browser profile.
  if(new URL(page.url()).pathname.endsWith('/wp-admin/site-editor.php')){
   report.failureDiagnostics={};
   try {
    report.failureDiagnostics.ariaSnapshot=(await page.locator('body').ariaSnapshot({timeout:5000})).slice(0,20000);
    report.failureDiagnostics.toolbarState=await page.evaluate(()=>({
     regions:[...document.querySelectorAll('[role="region"]')].map(el=>({label:el.getAttribute('aria-label'),labelledBy:el.getAttribute('aria-labelledby'),visible:el.getClientRects().length>0})),
     buttons:[...document.querySelectorAll('button')].filter(el=>el.getClientRects().length>0).map(el=>({text:el.innerText.slice(0,160),label:el.getAttribute('aria-label'),disabled:el.disabled})).slice(0,80),
     editorFrames:[...document.querySelectorAll('iframe')].map(el=>({name:el.name,title:el.title})),
    }));
   } catch(diagnosticError){report.failureDiagnostics.error=String(diagnosticError.message).slice(0,1000);}
  }
 }
}finally{
 report.cleanupErrors=[];
 for(const [operation,cleanup] of [
  ['browser',async()=>{if(browser)await browser.close();}],
  ['server',async()=>{if(server)await server[Symbol.asyncDispose]();}],
  ['runtime-directory',async()=>fs.rm(runtime,{recursive:true,force:true})],
 ]) {
  try {await cleanup();} catch(error) {report.cleanupErrors.push({operation,error:String(error.message).slice(0,1000)});}
 }
 report.passed=report.errors.length===0&&report.cleanupErrors.length===0&&report.checks.length===15&&report.checks.every(c=>c.pass);
 if(!report.passed)process.exitCode=1;
 await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify(report,null,2));
