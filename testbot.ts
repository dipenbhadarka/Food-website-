/// <reference path="../test/specs/test.e2e.ts" />

//Imports the .env file for local run variables
import * as dotenv from 'dotenv';
dotenv.config();

// Fix for Node 26 + undici v6.25: @wdio/browserstack-service installs a custom
// global undici dispatcher ('Dispatcher1Wrapper') that is incompatible with Node 26.
// The webdriver package detects it as a non-standard dispatcher and uses it for
// POST /session, which throws UND_ERR_INVALID_ARG. Resetting to a plain Agent in
// beforeSession (after the SDK's hook has set the hub URL and capabilities) lets
// the session creation go through the standard undici path instead.
// NOTE: This must be done as a module-level side-effect hook, not inside the config object,
// because beforeSession hooks in the config run after service hooks.

import { getTestBotCapabilities } from '../testbot';
import { getTestBotServices } from '../testbot';

//NB:This tells Node.js to not reject self-signed certs. Only do this in development or testing!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// ============================================================
// SWITCH BETWEEN BROWSERSTACK AND REAL DEVICE HERE
// Set to true  = Run on BrowserStack
// Set to false = Run on Real Physical Device
// ============================================================
const USE_BROWSERSTACK = false; // 👈 change this to switch
// ============================================================

export const config: WebdriverIO.Config = {

    //Base WDIO Configuration
    //NB:Mocha timeout should be kept high so async tests do not time out
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 3600000,
    },
    logLevel: 'debug',

    //NB: When bail is 1, if one test block fails it will not continue to try and execute any other test blocks in the suite afterwards.
    bail: 1,
    baseUrl: '',
    waitforTimeout: 300000,
    connectionRetryTimeout: 300000,
    connectionRetryCount: 3,
    maxInstances: USE_BROWSERSTACK ? 10 : 1,

    //Tests Directory Configuration
    specs: ['../test/specs/enrolment.e2e.ts'],

    // ============================
    // ✅ BROWSERSTACK CONFIGURATION
    // ============================
    ...(USE_BROWSERSTACK ? {
        user: 'akhilanethi_Cce08X',
        key: 'LGiqd8KfW4ipQpqhzcxq',
        hostname: 'hub.browserstack.com',
        port: 443,
        protocol: 'https',
        path: '/wd/hub',
    } : {
    // =====================================
    // ✅ REAL PHYSICAL DEVICE CONFIGURATION
    // =====================================
        hostname: '127.0.0.1',
        port: 4723,
        path: '/',
    }),

    reporters: [
        [
            'spec',
            {
                addConsoleLogs: true,
            },
        ],
    ],

    //NB: Passes app type dynamically via services: [] block - cannot be passed at caps level - .ipa/.apk
    services: USE_BROWSERSTACK ? getTestBotServices() : [['appium', {}]],

    //NB: Passes platform caps dynamically - iOS/Android
    capabilities: getTestBotCapabilities(),

    //NB: Node 26 fix — @wdio/browserstack-service's beforeSession sets 'Dispatcher1Wrapper'
    //as the undici global dispatcher. The webdriver package then uses it for POST /session,
    //which throws UND_ERR_INVALID_ARG on Node 26. This hook runs AFTER the service's
    //beforeSession (which has already set the hub URL and capabilities), then resets the
    //dispatcher to a plain Agent so the session creation fetch goes through the standard path.
    beforeSession: USE_BROWSERSTACK ? async function () {
        const { Agent, setGlobalDispatcher } = await import('undici');
        setGlobalDispatcher(new Agent());
    } : undefined,

    //NB: There is a known issue that if the Browserstack session connects to the same device again on the next run, the app caches and shows a login page as opposed to the enrolment screen, which breaks the tests. This hook reinstalls the .apk/.ipa after each run from the relevant env variable to ensure each session is a truly fresh installation.
    //In the pipeline this will be the value of the pipeline variable "BROWSERSTACK_APP" from the build.
    //In local runs this will either be the value of "BROWSERSTACK_APP_LOCAL_APK" or "BROWSERSTACK_APP_LOCAL_IPA" in your .env file
    //For reference - example hardcoded local path = './localApps/Care.Delivery.2.0.14.82171.apk'

    afterSuite: async function (suite) {
        try {
            const platform = (driver.capabilities.platformName || '').toLowerCase();
            const isBrowserStackSession = Boolean((driver.capabilities as any)['bstack:options']);

            // ✅ BROWSERSTACK CLEANUP
            if (USE_BROWSERSTACK) {
                const appId = process.env.BROWSERSTACK_APP;

                if (!appId || appId === 'bs://your-app-upload-id') {
                    console.warn('No valid BROWSERSTACK_APP environment variable found. Skipping reinstall.');
                    return;
                }

                console.log(`Platform detected: ${platform}`);
                console.log(`App ID: ${appId}`);

                if (isBrowserStackSession) {
                    if (platform === 'android') {
                        // BrowserStack doesn't support removeApp/installApp in execute/sync for Android.
                        await driver.execute('mobile: clearApp', { appId: 'com.personcentredsoftware.care.delivery' });
                        console.log('Cleared Android app data on BrowserStack session.');
                    } else {
                        console.log('Skipping app reinstall on BrowserStack for this platform.');
                    }
                    return;
                }

                if (platform === 'android') {
                    await driver.execute('mobile: removeApp', { appId: 'com.personcentredsoftware.care.delivery' });
                    await driver.execute('mobile: installApp', { app: appId });
                    console.log('Reinstalled Android app from env variable.');
                } else if (platform === 'ios') {
                    //NB: If this does not work the expected value for iOS is com.your.app.bundleid
                    await driver.execute('mobile: removeApp', { bundleId: 'com.personcentredsoftware.care.delivery' });
                    await driver.execute('mobile: installApp', { app: appId });
                    console.log('Reinstalled iOS app from env variable.');
                } else {
                    console.log('Not a mobile platform. Skipping cleanup.');
                }
            }

            // ✅ REAL PHYSICAL DEVICE CLEANUP
            if (!USE_BROWSERSTACK) {
                if (platform === 'android') {
                    const appPath = process.env.LOCAL_APP_PATH;
                    if (appPath) {
                        await driver.execute('mobile: removeApp', { appId: 'com.personcentredsoftware.care.delivery' });
                        await driver.execute('mobile: installApp', { app: appPath });
                        console.log('Reinstalled Android app from local path.');
                    } else {
                        console.warn('No LOCAL_APP_PATH found in .env. Skipping reinstall.');
                    }
                } else {
                    console.log('Not Android platform. Skipping cleanup.');
                }
            }

        } catch (err) {
            console.error('Failed to reinstall app:', err);
        }
    },

}
