import './loopback.mjs';
/** Disposable multisite lifecycle verification. No existing site or database mounts. */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await fs.mkdtemp(path.join(root, '.runtime-multisite-'));
os.homedir = () => runtime;
const { runCLI } = await import('@wp-playground/cli');
let server;
try {
 server = await runCLI({command:'server', wp:'7.1.2', php:'8.3', port:Number(process.env.GCS_MULTISITE_PORT || 9487), workers:1, 'site-url':'http://multisite.example.test', verbosity:'quiet', blueprint:{steps:[{step:'enableMultisite'}]}, mount:[{hostPath:path.join(root,'theme/gymcore-starter'),vfsPath:'/wordpress/wp-content/themes/gymcore-starter'},{hostPath:path.join(root,'plugin/gymcore-starter-kit'),vfsPath:'/wordpress/wp-content/plugins/gymcore-starter-kit'}]});
 const response = await server.playground.run({code:await fs.readFile(path.join(root,'tests/multisite.php'),'utf8')});
 const output = new TextDecoder().decode(response.bytes);
 const marker = output.indexOf('GCS_MULTISITE=');
 if(marker < 0) throw new Error(output+'\n'+response.errors);
 const report = JSON.parse(output.slice(marker+14));
 await fs.mkdir(path.join(root,'test-results'),{recursive:true});
 await fs.writeFile(path.join(root,'test-results/multisite.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
 process.exitCode=report.checks.some(check=>!check.pass)?1:0;
} finally {if(server) await server[Symbol.asyncDispose](); await fs.rm(runtime,{recursive:true,force:true});}
