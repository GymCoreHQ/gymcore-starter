/** Run existing core tests against the exact official 7.0 archive, not latest 7.0.x. */
import fs from 'node:fs/promises';
import './loopback.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.env.GCS_WP_VERSION = 'https://wordpress.org/wordpress-7.0.zip';
process.env.GCS_PHP_VERSION = '8.3';
process.env.GCS_TEST_PORT = '9496';
process.env.GCS_BROWSER_TESTS = '0';
process.env.GCS_WOO_TESTS = '0';
// Existing harness embeds version directly in its output path; accommodate URL
// input under ignored test-results and retain a portable final report name.
const raw = path.join(root, 'test-results/wordpress-https:/wordpress.org/wordpress-7.0.zip-php8.3.json');
await fs.mkdir(path.dirname(raw), { recursive: true });
try { await import('./wordpress.mjs'); }
finally {
 try { await fs.copyFile(raw, path.join(root, 'test-results/directory-exact-minimum.json')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const reports = JSON.parse(await fs.readFile(raw, 'utf8'));
if (!reports.length || reports.some(report => report.wordpress !== '7.0')) throw new Error('Expected exact WordPress 7.0 runtime, not a maintenance update.');
