/** Temporary fictional site for a human screen-reader session; no automatic pass claim. */
import './loopback.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const seconds=Number(process.env.GCS_READER_SECONDS||900);
if(!Number.isInteger(seconds)||seconds<1||seconds>3600)throw new Error('GCS_READER_SECONDS must be 1–3600.');
const scratch=await fs.mkdtemp(path.join(root,'.runtime-screen-reader-'));
let server,timer;
let stop;
const stopped=new Promise(resolve=>{stop=resolve;});
const signal=()=>stop('signal');
process.once('SIGINT',signal);process.once('SIGTERM',signal);
const report={date:new Date().toISOString(),method:'Human screen-reader fixture only',screenReaderPassed:false,cleanupErrors:[]};
try {
 const theme=path.join(scratch,'theme');await fs.cp(path.join(root,'theme/gymcore-starter'),theme,{recursive:true});
 os.homedir=()=>scratch;
 const {runCLI}=await import('@wp-playground/cli');
 server=await runCLI({command:'server',wp:'7.1.2',php:'8.3',port:Number(process.env.GCS_TEST_PORT||9501),workers:1,verbosity:'quiet',mount:[{hostPath:theme,vfsPath:'/wordpress/wp-content/themes/gymcore-starter'}]});
 const result=await server.playground.run({code:await fs.readFile(path.join(root,'tests/accessibility-fixture.php'),'utf8')});
 const text=new TextDecoder().decode(result.bytes);if(!text.includes('GCS_A11Y_FIXTURE='))throw new Error(text+result.errors);
 const fixture=JSON.parse(text.split('GCS_A11Y_FIXTURE=')[1]);
 Object.assign(report,{wordpress:fixture.wordpress,php:fixture.php,url:server.serverUrl,routes:fixture.routes});
 const response=await fetch(server.serverUrl);if(!response.ok)throw new Error('Fixture HTTP '+response.status);
 report.httpStatus=response.status;
 console.log('SCREEN_READER_FIXTURE_READY '+JSON.stringify({...report,seconds}));
 console.log('Use a dedicated temporary browser profile. Perform the human runbook; this runner records no speech or screen-reader result. Ctrl-C closes the fixture.');
 timer=setTimeout(()=>stop('timeout'),seconds*1000);
 report.stoppedBy=await stopped;
} catch(error){report.error=String(error.stack);process.exitCode=1;} finally {
 clearTimeout(timer);
 for(const [operation,cleanup] of [['server',async()=>{if(server)await server[Symbol.asyncDispose]();}],['scratch',async()=>fs.rm(scratch,{recursive:true,force:true})]]){
  try{await cleanup();}catch(error){report.cleanupErrors.push({operation,error:String(error)});process.exitCode=1;}
 }
 process.removeListener('SIGINT',signal);process.removeListener('SIGTERM',signal);
 const output=path.join(root,'test-results/screen-reader');await fs.mkdir(output,{recursive:true});
 await fs.writeFile(path.join(output,'fixture.json'),JSON.stringify(report,null,2)+'\n');
 console.log('SCREEN_READER_FIXTURE_CLOSED '+JSON.stringify(report));
}
