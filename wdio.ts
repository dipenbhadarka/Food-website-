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
        const alwaysFromFile = key.startsWith('BROWSERSTACK_');
        if (alwaysFromFile || typeof process.env[key] === 'undefined' || process.env[key]?.trim() === '') {
            process.env[key] = value;
        }
    }
}

// ─────────────────────────────────────────────
// Fix for Node 26 + undici v6.25
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
// ─────────────────────────────────────────────
const runMode = (process.env.RUN_MODE || '').toLowerCase();
const isLocal = runMode !== 'browserstack';

console.log(`\n▶ RUN MODE: ${isLocal ? 'LOCAL PHYSICAL DEVICE (R5GL10H8QFT)' : 'BROWSERSTACK CLOUD'}\n`);

export const config: WebdriverIO.Config = {

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

    specs: ['../test/specs/main.e2e.ts'],

    hostname: isLocal ? '127.0.0.1' : 'hub.browserstack.com',
    port:     isLocal ? 4723        : 443,
    path:     isLocal ? '/'         : '/wd/hub',
    user:     isLocal ? ''          : process.env.BROWSERSTACK_USERNAME,
    key:      isLocal ? ''          : process.env.BROWSERSTACK_ACCESS_KEY,

    reporters: [
        [
            'spec',
            {
                addConsoleLogs: true,
            },
        ],
    ],

    services: isLocal ? [] : getTestBotServices(),
    capabilities: getTestBotCapabilities(),

    // ─────────────────────────────────────────
    // DIAGNOSTIC HOOK — logs how many top-level
    // suites Mocha actually collected before
    // running. Compare this count against how
    // many describe() blocks you expect (1 per
    // suite file: enrolment + each scenario).
    // Remove this once the issue is confirmed
    // fixed.
    // ─────────────────────────────────────────
    before: function (capabilities, specs) {
        const mochaRunner = (global as any).mocha
        console.log('═══════════ DIAGNOSTIC: SPEC FILES LOADED ═══════════')
        console.log('Specs passed to this session:', specs)
        console.log('═══════════════════════════════════════════════════')
    },

    afterSuite: async function (suite) {
        try {
            const platform = (driver.capabilities.platformName || '').toLowerCase();

            if (platform === 'android') {
                if (isLocal) {
                    console.log('Local run complete. Skipping reinstall.')
                } else {
                    await driver.execute('mobile: clearApp', {
                        appId: 'com.personcentredsoftware.care.delivery',
                    });
                    console.log('Cleared Android app data on BrowserStack device.');
                }
            } else {
                console.log('Not Android platform. Skipping cleanup.');
            }
        } catch (err) {
            console.error('Failed to reinstall app:', err);
        }
    },
}
