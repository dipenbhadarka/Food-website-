/// <reference path="../test/specs/test.e2e.ts" />

import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────
// Read .env manually to bypass any dotenvx interceptor
// ─────────────────────────────────────────────
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        process.env[key] = value;
    }
}

// ─────────────────────────────────────────────
// Fix for Node 26 + undici v6.25
// NB: Use require() instead of import so testbot
// loads AFTER env vars are set above
// ─────────────────────────────────────────────
const { getTestBotCapabilities, getTestBotServices } = require('../testbot');

try {
    const { Agent, setGlobalDispatcher } = require('undici') as typeof import('undici');
    setGlobalDispatcher(new Agent());
} catch (err) {
    console.warn('Unable to reset the undici dispatcher at startup:', err);
}

process.env.WDIO_USE_NATIVE_FETCH = '1';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// ─────────────────────────────────────────────
// RUN MODE SWITCH
// RUN_MODE=local        → your physical device
// RUN_MODE=browserstack → BrowserStack cloud
// ─────────────────────────────────────────────
const isLocal = process.env.RUN_MODE === 'local';

console.log(`\n▶ RUN MODE: ${isLocal ? 'LOCAL PHYSICAL DEVICE (R5GL10H8QFT)' : 'BROWSERSTACK CLOUD'}\n`);

export const config: WebdriverIO.Config = {

    // ─────────────────────────────────────────
    // Base WDIO Configuration
    // ─────────────────────────────────────────
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 3600000,
        require: [require.resolve('tsconfig-paths/register')],
    },
    logLevel: 'debug',
    bail: 0,
    baseUrl: '',
    waitforTimeout: 300000,
    connectionRetryTimeout: 300000,
    connectionRetryCount: 3,
    maxInstances: 1,

    // ─────────────────────────────────────────
    // Test specs
    // ─────────────────────────────────────────
    specs: ['../test/specs/enrolment.e2e.ts'],

    // ─────────────────────────────────────────
    // Connection
    // local  → points to Appium on your machine
    // cloud  → points to BrowserStack
    // ─────────────────────────────────────────
    hostname: isLocal ? '127.0.0.1'                   : 'hub.browserstack.com',
    port:     isLocal ? 4723                           : 443,
    path:     '/wd/hub',
    user:     isLocal ? ''                             : process.env.BROWSERSTACK_USERNAME,
    key:      isLocal ? ''                             : process.env.BROWSERSTACK_ACCESS_KEY,

    // ─────────────────────────────────────────
    // Reporters
    // ─────────────────────────────────────────
    reporters: [
        [
            'spec',
            {
                addConsoleLogs: true,
            },
        ],
    ],

    // ─────────────────────────────────────────
    // Services
    // local → no service needed
    // cloud → BrowserStack service
    // ─────────────────────────────────────────
    services: isLocal ? [] : getTestBotServices(),

    // ─────────────────────────────────────────
    // Capabilities from testbot.ts
    // ─────────────────────────────────────────
    capabilities: getTestBotCapabilities(),

    // ─────────────────────────────────────────
    // After Suite Hook
    // ─────────────────────────────────────────
    afterSuite: async function (suite) {
        try {
            const platform = (driver.capabilities.platformName || '').toLowerCase();

            if (platform === 'android') {
                if (isLocal) {
                    // Local device — nothing to reinstall
                    // app is already installed on device
                    console.log('Local run complete. Skipping reinstall.')
                } else {
                    // BrowserStack — reinstall from bs:// app id
                    const appId = process.env.BROWSERSTACK_APP;
                    if (appId) {
                        await driver.execute('mobile: removeApp', {
                            appId: 'com.personcentredsoftware.care.delivery'
                        });
                        await driver.execute('mobile: installApp', { app: appId });
                        console.log('Reinstalled Android app from BrowserStack app id.');
                    } else {
                        console.warn('No BROWSERSTACK_APP found in .env. Skipping reinstall.');
                    }
                }
            } else {
                console.log('Not Android platform. Skipping cleanup.');
            }

        } catch (err) {
            console.error('Failed to reinstall app:', err);
        }
    },
}
