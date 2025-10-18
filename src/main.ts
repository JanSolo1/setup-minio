import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import * as os from 'os';
import * as path from 'path';
import { exec } from 'child_process';
import { promises as fs } from 'fs';

function getPlatform(): string {
    const plat = os.platform();
    if (plat === 'win32') return 'windows';
    if (plat === 'darwin') return 'darwin';
    return 'linux';
}

function getArch(): string {
    const arch = os.arch();
    if (arch === 'x64') return 'amd64';
    if (arch === 'arm64') return 'arm64';
    return arch;
}

async function run() {
    try {
        const version = core.getInput('mc-version') || 'latest';
        const alias = core.getInput('alias');
        const endpoint = core.getInput('endpoint');
        const accessKey = core.getInput('access_key');
        const secretKey = core.getInput('secret_key');
        const insecure = core.getInput('insecure') === 'true';

        const platform = getPlatform();
        const arch = getArch();

        core.info(`Downloading MinIO Client ${version} for ${platform}-${arch}...`);
        const url = `https://dl.min.io/client/mc/release/${platform}-${arch}/mc${platform === 'windows' ? '.exe' : ''}`;
        const mcPath = await tc.downloadTool(url);

        const dest = path.join(process.env['RUNNER_TOOL_CACHE'] || '/tmp', 'mc');
        await io.cp(mcPath, dest, { recursive: true });
        if (platform !== 'windows') {
            await fs.chmod(dest, 0o755);
        }

        core.addPath(path.dirname(dest));
        core.info(`✅ MinIO Client installed at ${dest}`);

        if (alias && endpoint && accessKey && secretKey) {
            const insecureFlag = insecure ? '--insecure' : '';
            core.info(`Configuring alias ${alias}...`);
            await execPromise(`mc alias set ${alias} ${endpoint} ${accessKey} ${secretKey} ${insecureFlag}`);
            core.info(`✅ Alias ${alias} configured`);
        }

        await execPromise('mc --version');
    } catch (error: any) {
        core.setFailed(error.message);
    }
}

function execPromise(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                core.info(stdout);
                core.info(stderr);
                resolve();
            }
        });
    });
}

run();
