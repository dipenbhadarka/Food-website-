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
        // Strip surrounding quotes if present
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
// NB: Use require() instead of import so testbot loads AFTER env vars are set above
// (ES import statements are hoisted and would run before the env loading block)
// ─────────────────────────────────────────────
const { getTestBotCapabilities, getTestBotServices } = require('../testbot');

try {
    const { Agent, setGlobalDispatcher } = require('undici') as typeof import('undici');
    setGlobalDispatcher(new Agent());
} catch (err) {
    console.warn('Unable to reset the undici dispatcher at startup:', err);
}

process.env.WDIO_USE_NATIVE_FETCH = '1';

// NB: This tells Node.js to not reject self-signed certs. Only do this in development or testing!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// ─────────────────────────────────────────────
// RUN MODE SWITCH
// Set RUN_MODE=local in .env to run on your
// own physical device via USB
// Set RUN_MODE=browserstack to run on
// BrowserStack cloud device (default)
// ─────────────────────────────────────────────
const isLocal = process.env.RUN_MODE === 'local';

console.log(`\n▶ RUN MODE: ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'}\n`);

export const config: WebdriverIO.Config = {

    // ─────────────────────────────────────────
    // Base WDIO Configuration
    // NB: Mocha timeout should be kept high so async tests do not time out
    // ─────────────────────────────────────────
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 3600000,
        require: [require.resolve('tsconfig-paths/register')],
    },
    logLevel: 'debug',

    // NB: When bail is 0, all test blocks continue even if one fails (better for debugging)
    bail: 0,
    baseUrl: '',
    waitforTimeout: 300000,
    connectionRetryTimeout: 300000,
    connectionRetryCount: 3,
    maxInstances: 1,

    // ─────────────────────────────────────────
    // Tests Directory Configuration
    // ─────────────────────────────────────────
    specs: ['../test/specs/enrolment.e2e.ts'],

    // ─────────────────────────────────────────
    // Connection Configuration
    // Automatically switches between
    // BrowserStack and local Appium
    // based on RUN_MODE in your .env file
    // ─────────────────────────────────────────
    hostname: isLocal ? '127.0.0.1'                    : 'hub.browserstack.com',
    port:     isLocal ? 4723                            : 443,
    path:     '/wd/hub',
    user:     isLocal ? ''                              : process.env.BROWSERSTACK_USERNAME,
    key:      isLocal ? ''                              : process.env.BROWSERSTACK_ACCESS_KEY,

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
    // NB: BrowserStack service only used on
    // cloud runs — local device needs no service
    // ─────────────────────────────────────────
    services: isLocal ? [] : getTestBotServices(),

    // ─────────────────────────────────────────
    // Capabilities
    // NB: Passes platform caps dynamically iOS/Android
    // ─────────────────────────────────────────
    capabilities: getTestBotCapabilities(),

    // ─────────────────────────────────────────
    // After Suite Hook
    // NB: There is a known issue that if the
    // BrowserStack session connects to the same
    // device again on the next run, the app
    // caches and shows a login page as opposed
    // to the enrolment screen, which breaks the
    // tests. This hook reinstalls the .apk/.ipa
    // after each run to ensure a fresh install.
    // For reference — example hardcoded local
    // path = './localApps/Care.Delivery.apk'
    // ─────────────────────────────────────────
    afterSuite: async function (suite) {
        try {
            const platform = (driver.capabilities.platformName || '').toLowerCase();

            if (platform === 'android') {

                if (isLocal) {
                    // ── Local physical device ──
                    // Reinstall from local APK path
                    const appPath = process.env.LOCAL_APP_PATH;
                    if (appPath) {
                        await driver.execute('mobile: removeApp', {
                            appId: 'com.personcentredsoftware.care.delivery'
                        });
                        await driver.execute('mobile: installApp', { app: appPath });
                        console.log('Reinstalled Android app from local path.');
                    } else {
                        console.warn('No LOCAL_APP_PATH found in .env. Skipping reinstall.');
                    }

                } else {
                    // ── BrowserStack cloud ──
                    // Reinstall from bs:// app id
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
