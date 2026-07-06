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
// Run mode
// "local"        = your own physical device
// "browserstack" = BrowserStack cloud device
// ─────────────────────────────────────────────
const isLocal = process.env.RUN_MODE === 'local';

// ─────────────────────────────────────────────
// BrowserStack Services
// Only used when RUN_MODE=browserstack
// ─────────────────────────────────────────────
export function getTestBotServices(): ServiceOption[] {
    return [['browserstack', {
        app: process.env.BROWSERSTACK_APP,
    }]]
}

// ─────────────────────────────────────────────
// Capabilities
// ─────────────────────────────────────────────
export function getTestBotCapabilities(): RequestedStandaloneCapabilities[] {

    // ── Android ───────────────────────────────
    if (context.platform === TestBotPlatform.Android) {

        // ── LOCAL PHYSICAL DEVICE ─────────────
        // No BrowserStack options at all
        // Appium connects directly to your device
        // Device name and OS version are auto
        // detected from the connected device
        if (isLocal) {
            console.log('▶ Running on LOCAL Android device UDID=R5GL10H8QFT')
            return [{
                platformName: 'Android',
                'appium:automationName': 'UiAutomator2',
                'appium:autoGrantPermissions': true,
                'appium:udid': 'R5GL10H8QFT',
                'appium:appPackage': 'com.personcentredsoftware.care.delivery',
                'appium:appActivity': 'com.personcentredsoftware.care.delivery.MainActivity',
                'appium:noReset': true,
                'appium:fullReset': false,
            } as any]
        }

        // ── BROWSERSTACK CLOUD ────────────────
        console.log('▶ Running on BROWSERSTACK Android cloud')
        return [{
            platformName: 'Android',
            'appium:deviceName': process.env.BROWSERSTACK_DEVICE_NAME || 'Google Pixel 8 Pro',
            'appium:platformVersion': process.env.BROWSERSTACK_OS_VERSION || '14.0',
            'appium:automationName': 'UiAutomator2',
            'appium:autoGrantPermissions': true,
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
            },
        } as any]
    }

    // ── iOS ───────────────────────────────────
    else if (context.platform === TestBotPlatform.iOS) {

        // ── LOCAL PHYSICAL DEVICE ─────────────
        if (isLocal) {
            console.log('▶ Running on LOCAL iOS device UDID=R5GL10H8QFT')
            return [{
                platformName: 'iOS',
                'appium:automationName': 'XCUITest',
                'appium:autoGrantPermissions': true,
                'appium:udid': 'R5GL10H8QFT',
                'appium:bundleId': 'com.personcentredsoftware.care.delivery',
                'appium:noReset': true,
                'appium:fullReset': false,
            } as any]
        }

        // ── BROWSERSTACK CLOUD ────────────────
        console.log('▶ Running on BROWSERSTACK iOS cloud')
        return [{
            platformName: 'iOS',
            'appium:deviceName': process.env.BROWSERSTACK_DEVICE_NAME || 'iPhone 16 Pro',
            'appium:platformVersion': process.env.BROWSERSTACK_OS_VERSION || '18',
            'appium:automationName': 'XCUITest',
            'appium:autoGrantPermissions': true,
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
            },
        } as any]
    }

    return []
}
