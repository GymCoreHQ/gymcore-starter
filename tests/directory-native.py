#!/usr/bin/env python3
"""Run official directory checks on packaged artifacts in a disposable native fixture.

Requires an already-authorized Docker daemon/image, native PHP and official cached
WordPress/WP-CLI/checker sources. Never mounts an existing site or Docker volume.
"""
import hashlib
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import tempfile
import time
import zipfile

ROOT = Path(__file__).resolve().parents[1]
IMAGE = 'mysql@sha256:6ea90827b1100f8f2ae306a539f86d2c264a26ed435a2a9f75551dd5c3aeb242'


def run(args, **kwargs):
    return subprocess.run(args, text=True, capture_output=True, timeout=kwargs.pop('timeout', 120), **kwargs)


def plugin_findings(output):
    # PCP JSON output may be prefixed by a FILE heading for each result group.
    findings = []
    decoder = json.JSONDecoder()
    cursor = 0
    while True:
        start = output.find('[', cursor)
        if start < 0:
            return findings
        try:
            group, consumed = decoder.raw_decode(output[start:])
            findings.extend(item for item in group if isinstance(item, dict) and 'type' in item and 'code' in item)
            cursor = start + consumed
        except (ValueError, TypeError):
            cursor = start + 1


def main():
    sqlite = os.environ.get('GCS_NATIVE_DATABASE') == 'sqlite'
    out = ROOT / ('test-results/directory-native-sqlite' if sqlite else 'test-results/directory-native')
    out.mkdir(parents=True, exist_ok=True)
    scratch = Path(tempfile.mkdtemp(prefix='gcs-release-check-'))
    wp = scratch / 'wordpress'
    name = scratch.name
    report = {'database': 'sqlite' if sqlite else 'mysql', 'packages': {}}
    if not sqlite:
        report.update({'image': IMAGE, 'container': name, 'port': 19494})
    started = False
    password = secrets.token_urlsafe(32)
    envfile = scratch / 'mysql.env'
    envfile.touch(mode=0o600)
    envfile.write_text('MYSQL_ROOT_PASSWORD=' + password + '\nMYSQL_DATABASE=gcs_release\nMYSQL_USER=gcs_release\nMYSQL_PASSWORD=' + password + '\n')
    env = dict(os.environ, WP_CLI_CACHE_DIR=str(scratch / 'cache'))
    phar = os.environ.get('GCS_WP_CLI_PHAR', '/tmp/gcs-i18n-wp-cli.phar')
    php = os.environ.get('GCS_NATIVE_PHP', 'php')
    cli = [php, '-d', 'memory_limit=512M', '-d', 'error_reporting=24575', phar]

    def wp_run(args, input_text=None):
        return run(cli + args + ['--skip-packages', '--path=' + str(wp)], input=input_text, env=env)

    def require_ok(result, label):
        print(label + ': exit ' + str(result.returncode), flush=True)
        if result.returncode:
            # Never retain generated credentials even if an upstream tool echoes input.
            (out / 'failure.txt').write_text((result.stdout + result.stderr).replace(password, '[REDACTED]'))
            raise RuntimeError(label + ' failed; inspect sanitized failure.txt')
        return result

    try:
        report['stage'] = 'preparing'
        source = Path(os.environ.get('GCS_WORDPRESS_CACHE', '/tmp/gcs-mysql-pcp/wordpress'))
        wp.mkdir()
        for item in source.iterdir():
            if item.name in ('wp-content', 'wp-config.php', '.htaccess'):
                continue
            if item.is_dir():
                shutil.copytree(item, wp / item.name)
            else:
                shutil.copy2(item, wp / item.name)
        for kind, slug in [('plugin', 'gymcore-starter-kit'), ('theme', 'gymcore-starter')]:
            archive = ROOT / 'dist' / (slug + '-0.1.0.zip')
            report['packages'][slug] = hashlib.sha256(archive.read_bytes()).hexdigest()
            destination = wp / 'wp-content' / ('plugins' if kind == 'plugin' else 'themes')
            destination.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(archive) as z:
                assert z.testzip() is None
                for entry in z.infolist():
                    parts = Path(entry.filename).parts
                    assert parts and parts[0] == slug and '..' not in parts and not Path(entry.filename).is_absolute()
                    assert z.read(entry) == (ROOT / kind / entry.filename).read_bytes(), 'Package differs from current source'
                z.extractall(destination)
        checkers = Path(os.environ.get('GCS_CHECK_TOOLS', '/tmp/gcs-check-tools'))
        for checker in ('plugin-check', 'theme-check'):
            shutil.copytree(checkers / checker, wp / 'wp-content/plugins' / checker)
        mu = wp / 'wp-content/mu-plugins'
        mu.mkdir()
        (mu / 'isolated.php').write_text("<?php\nadd_filter('pre_http_request',static function(){return new WP_Error('isolated','No outbound HTTP in disposable checks.');},PHP_INT_MIN,3);\nadd_filter('pre_wp_mail',static function(){return false;});\n")
        report['stage'] = 'database-startup'
        if sqlite:
            integration = Path(os.environ.get('GCS_SQLITE_SOURCE', '/tmp/gcs-native-pcp/wordpress/wp-content/plugins/sqlite-database-integration'))
            shutil.copytree(integration, wp / 'wp-content/plugins/sqlite-database-integration')
            shutil.copy2(integration / 'db.copy', wp / 'wp-content/db.php')
        else:
            started = True  # Unique task name permits cleanup even if docker run times out.
            require_ok(run(['docker', 'run', '--detach', '--init', '--name', name, '--publish', '127.0.0.1:19494:3306', '--tmpfs', '/var/lib/mysql:rw,size=1g', '--env-file', str(envfile), '--health-cmd', 'mysqladmin ping -h 127.0.0.1 --silent', '--health-interval', '1s', '--health-timeout', '2s', '--health-retries', '60', IMAGE]), 'Docker fixture')
            readiness_deadline = time.monotonic() + 60
            for _ in range(60):
                if time.monotonic() >= readiness_deadline:
                    raise RuntimeError('Disposable database readiness deadline exceeded')
                status = require_ok(run(['docker', 'inspect', '--format', '{{.State.Health.Status}}', name], timeout=10), 'Fixture readiness').stdout.strip()
                if status == 'healthy':
                    break
                time.sleep(1)
            else:
                raise RuntimeError('Disposable database did not become ready')
        report['stage'] = 'wordpress-installation'
        require_ok(wp_run(['config', 'create', '--dbname=gcs_release', '--dbuser=gcs_release', '--dbhost=127.0.0.1:19494', '--dbprefix=gcsr_', '--skip-check', '--skip-salts', '--prompt=dbpass'], password + '\n'), 'Fresh configuration')
        require_ok(wp_run(['config', 'set', 'DISABLE_WP_CRON', 'true', '--raw']), 'Disable cron')
        require_ok(wp_run(['core', 'install', '--url=http://directory.example.test', '--title=Fictional Directory Fixture', '--admin_user=fictional-admin', '--admin_email=admin@example.test', '--skip-email', '--prompt=admin_password'], password + '\n'), 'Fresh WordPress installation')
        require_ok(wp_run(['plugin', 'activate', 'plugin-check', 'theme-check', 'gymcore-starter-kit']), 'Checker activation')
        require_ok(wp_run(['theme', 'activate', 'gymcore-starter']), 'Theme activation')
        observer = scratch / 'observe.php'
        observer.write_text('''<?php
WP_CLI::add_hook('after_wp_load',static function(){
 require_once ABSPATH . 'wp-admin/includes/plugin.php';
 $r=\\WordPress\\Plugin_Check\\Utilities\\Plugin_Request_Utility::get_runner();
 $o=array('runner_class'=>is_object($r)?get_class($r):null,'static_checks'=>array(),'runtime_checks'=>array(),'initialized_early'=>false);
 if($r){
  $p=new ReflectionProperty($r,'initialized_early'); $o['initialized_early']=$p->getValue($r);
  foreach($r->get_checks_to_run() as $slug=>$check){$key=$check instanceof \\WordPress\\Plugin_Check\\Checker\\Runtime_Check?'runtime_checks':'static_checks';$o[$key][]=$slug;}
 }else{$o['observation']='No early runner; default CLI command creates it later and excludes runtime checks. Static count not observed.';}
 global $wpdb; $o['database_server']=$wpdb->db_version();$o['wordpress']=get_bloginfo('version');$o['php']=PHP_VERSION;
 $o['plugin_check']=get_plugin_data(WP_PLUGIN_DIR.'/plugin-check/plugin.php')['Version'];
 $o['theme_check']=get_plugin_data(WP_PLUGIN_DIR.'/theme-check/theme-check.php')['Version'];
 file_put_contents(''' + repr(str(out / 'enabled-checks.json')) + ''',wp_json_encode($o,JSON_PRETTY_PRINT));
});
''')
        pcp_args = ['plugin', 'check', 'gymcore-starter-kit', '--require=' + str(observer), '--format=json']
        if not sqlite:
            pcp_args.append('--require=' + str(wp / 'wp-content/plugins/plugin-check/cli.php'))
        report['stage'] = 'official-checks'
        pcp = wp_run(pcp_args)
        (out / 'plugin-result.txt').write_text(pcp.stdout)
        (out / 'plugin-stderr.txt').write_text(pcp.stderr)
        report['plugin_exit'] = pcp.returncode
        report['plugin_findings'] = plugin_findings(pcp.stdout)
        report['plugin_warning_count'] = sum(item['type'] == 'WARNING' for item in report['plugin_findings'])
        report['plugin_error_count'] = sum(item['type'] == 'ERROR' for item in report['plugin_findings'])
        checks = json.loads((out / 'enabled-checks.json').read_text())
        if sqlite:
            assert not checks['initialized_early'] and not checks['runtime_checks']
        else:
            assert checks['initialized_early'] and len(checks['runtime_checks']) == 5
        theme = wp_run(['theme-check', 'run', 'gymcore-starter', '--format=json'])
        (out / 'theme-result.json').write_text(theme.stdout)
        (out / 'theme-stderr.txt').write_text(theme.stderr)
        report['theme_exit'] = theme.returncode
        report['theme_findings'] = json.loads(theme.stdout)
        cleanup = wp_run(['eval', "global $wpdb; echo wp_json_encode(array('prefix'=>$wpdb->prefix,'temporary_tables'=>array_values(array_filter($wpdb->get_col('SHOW TABLES'),static fn($t)=>str_contains($t,'wp_pc_'))),'cache_dropin'=>file_exists(WP_CONTENT_DIR.'/object-cache.php'))); "])
        (out / 'runtime-cleanup.json').write_text(require_ok(cleanup, 'Runtime cleanup inspection').stdout)
        require_ok(pcp, 'Plugin Check')
        assert not report['plugin_error_count'], 'Plugin Check error findings require attention'
        require_ok(theme, 'Theme Check')
        report['stage'] = 'completed'
    except BaseException as error:
        report['blocker'] = str(error) or type(error).__name__
        raise
    finally:
        if started:
            try:
                removed = run(['docker', 'rm', '--force', '--volumes', name])
                report['container_removed'] = removed.returncode == 0 or 'No such container' in removed.stderr
                if not report['container_removed']:
                    report['cleanup_blocker'] = 'Failed to remove own disposable container: ' + name
            except subprocess.TimeoutExpired:
                report['container_removed'] = False
                report['cleanup_blocker'] = 'Docker cleanup timed out for own fixture: ' + name
        shutil.rmtree(scratch)
        report['scratch_removed'] = not scratch.exists()
        (out / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
        print(json.dumps(report, indent=2))
    if not sqlite and not report.get('container_removed'):
        raise RuntimeError('Task-owned container cleanup requires attention')


if __name__ == '__main__':
    main()
