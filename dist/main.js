"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const io = __importStar(require("@actions/io"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const fs_1 = require("fs");
function getPlatform() {
    const plat = os.platform();
    if (plat === 'win32')
        return 'windows';
    if (plat === 'darwin')
        return 'darwin';
    return 'linux';
}
function getArch() {
    const arch = os.arch();
    if (arch === 'x64')
        return 'amd64';
    if (arch === 'arm64')
        return 'arm64';
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
            await fs_1.promises.chmod(dest, 0o755);
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
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
function execPromise(command) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                core.info(stdout);
                core.info(stderr);
                resolve();
            }
        });
    });
}
run();
