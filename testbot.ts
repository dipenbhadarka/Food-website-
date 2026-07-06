import { TestBotFactory } from "./TestBot.Wdio/TestBotFactory"
import type { ITestBot } from "./TestBot/ITestBot"
import type { ITestBotContext } from "./TestBot/ITestBotContext"
import { TestBotPlatform } from "./TestBot/TestBotPlatform"
import { RequestedStandaloneCapabilities } from '@wdio/types/build/Capabilities'
import { ServiceOption } from '@wdio/types/build/Services'

// ─────────────────────────────────────────────
// Context — which platform are we on?
// ─────────────────────────────────────────────
class testBotContext implements ITestBotContext {
    platform!: TestBotPlatform;

    constructor() {
        const platformEnv = process.env.PLATFORM || 'android';
        console.log("Platform:", platformEnv);
        if (platformEnv.toLowerCase() === 'android') {
            this.platform = TestBotPlatform.Android;
        } else if (platformEnv.toLowerCase() === 'ios') {
            this.platform = TestBotPlatform.iOS;
        }
    }
}

// ─────────────────────────────────────────────
// Create testBot instance
// ─────────────────────────────────────────────
const context = new testBotContext();
const factory = new TestBotFactory();
export var testBot: ITestBot = factory.createTestBot(context)

// ─────────────────────────────────────────────
// Run mode helper
// "browserstack" = BrowserStack cloud device
// "local"        = your own physical device
// ─────────────────────────────────────────────
const isLocalDevice = process.env.RUN_MODE === 'local';

// ─────────────────────────────────────────────
// BrowserStack Services
// ─────────────────────────────────────────────
export function getTestBotServices(): ServiceOption[] {
    if (isLocalDevice) {
        return [['browserstack', {
            app: process.env.BROWSERSTACK_APP,
            browserstackLocal: true,
        }]]
    }
    return [['browserstack', {
        app: process.env.BROWSERSTACK_APP,
    }]]
}

// ─────────────────────────────────────────────
// BrowserStack Capabilities
// ─────────────────────────────────────────────
export function getTestBotCapabilities(): RequestedStandaloneCapabilities[] {

    // ── Android ───────────────────────────────
    if (context.platform === TestBotPlatform.Android) {

        const androidCaps: any = {
            platformName: 'Android',
            'appium:deviceName': process.env.BROWSERSTACK_DEVICE_NAME || 'Google Pixel 8 Pro',
            'appium:platformVersion': process.env.BROWSERSTACK_OS_VERSION || '14.0',
            'appium:automationName': 'UiAutomator2',
            'appium:autoGrantPermissions': true,

            // ─────────────────────────────────────────────
            // ↓↓↓ ADD YOUR PHYSICAL DEVICE UDID HERE ↓↓↓
            // Only active when RUN_MODE=local in your .env
            // Get your UDID by running: adb devices
            // Example: 'appium:udid': 'RF8M31XXXXX'
            // ─────────────────────────────────────────────
            ...(isLocalDevice && {
                'appium:udid': process.env.BROWSERSTACK_DEVICE_UDID || 'ADD_YOUR_UDID_HERE',
            }),

            'bstack:options': {
                userName: process.env.BROWSERSTACK_USERNAME,
                accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
                projectName: process.env.BROWSERSTACK_PROJECT_NAME || 'Care Delivery Automation Local',
                buildName: process.env.BROWSERSTACK_BUILD_NAME || 'local-browserstack-',
                buildIdentifier: '#${BUILD_NUMBER}',
                sessionName: 'Android Smoke Test',
                idleTimeout: 300,
                appiumLogs: true,
                debug: true,
                ...(isLocalDevice && {
                    local: true,
                    localIdentifier: 'MyLocalDevice',
                }),
            },
        }

        return [androidCaps]
    }

    // ── iOS ───────────────────────────────────
    else if (context.platform === TestBotPlatform.iOS) {

        const iOSCaps: any = {
            platformName: 'iOS',
            'appium:deviceName': process.env.BROWSERSTACK_DEVICE_NAME || 'iPhone 16 Pro',
            'appium:platformVersion': process.env.BROWSERSTACK_OS_VERSION || '18',
            'appium:automationName': 'XCUITest',
            'appium:autoGrantPermissions': true,

            // ─────────────────────────────────────────────
            // ↓↓↓ ADD YOUR PHYSICAL DEVICE UDID HERE ↓↓↓
            // Only active when RUN_MODE=local in your .env
            // Get your UDID by running: instruments -s devices
            // Example: 'appium:udid': '00008110-XXXXXXXXXXXXXX'
            // ─────────────────────────────────────────────
            ...(isLocalDevice && {
                'appium:udid': process.env.BROWSERSTACK_DEVICE_UDID || 'ADD_YOUR_UDID_HERE',
            }),

            'bstack:options': {
                userName: process.env.BROWSERSTACK_USERNAME,
                accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
                projectName: process.env.BROWSERSTACK_PROJECT_NAME || 'Care Delivery Automation Local',
                buildName: process.env.BROWSERSTACK_BUILD_NAME || 'local-browserstack-',
                buildIdentifier: '#${BUILD_NUMBER}',
                sessionName: 'iOS Smoke Test',
                idleTimeout: 300,
                appiumLogs: true,
                debug: true,
                ...(isLocalDevice && {
                    local: true,
                    localIdentifier: 'MyLocalDevice',
                }),
            },
        }

        return [iOSCaps]
    }

    return []
}
