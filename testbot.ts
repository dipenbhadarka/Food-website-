import { TestBotFactory } from "./TestBot.Wdio/TestBotFactory"
import type { ITestBot } from "./TestBot/ITestBot"
import type { ITestBotContext } from "./TestBot/ITestBotContext"
import { TestBotPlatform } from "./TestBot/TestBotPlatform"
import { RequestedStandaloneCapabilities } from '@wdio/types/build/Capabilities'
import { ServiceOption } from '@wdio/types/build/Services'

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

const context = new testBotContext;
const factory = new TestBotFactory;
testBot = factory.createTestBot(context)

// ============================================================
// SWITCH BETWEEN BROWSERSTACK AND REAL DEVICE HERE
// Set to true  = Run on BrowserStack
// Set to false = Run on Real Physical Device
// ============================================================
const USE_BROWSERSTACK = false; // 👈 change this to switch
// ============================================================

function resolveBrowserStackApp(androidFallback: string, iosFallback?: string): string | undefined {
    const configuredApp = process.env.BROWSERSTACK_APP;
    const configuredLocalApk = process.env.BROWSERSTACK_APP_LOCAL_APK;
    const configuredLocalIpa = process.env.BROWSERSTACK_APP_LOCAL_IPA;

    if (configuredLocalApk && configuredLocalApk !== './localApps/YourApp.apk') {
        return configuredLocalApk;
    }
    if (configuredLocalIpa && configuredLocalIpa !== './localApps/YourApp.ipa') {
        return configuredLocalIpa;
    }
    if (configuredApp && configuredApp !== 'bs://your-app-upload-id') {
        return configuredApp;
    }
    return iosFallback || androidFallback;
}

export function getTestBotServices(): ServiceOption[] {

    // ✅ BROWSERSTACK SERVICES
    if (USE_BROWSERSTACK) {
        if (context.platform == TestBotPlatform.Android) {
            return [
                ['browserstack',
                {
                    app: resolveBrowserStackApp('C:/Users/AkhilaNethi/Downloads/Care.Delivery.2.0.0.115018.apk')
                }],
            ]
        }
        else if (context.platform == TestBotPlatform.iOS) {
            return [
                ['browserstack',
                {
                    app: resolveBrowserStackApp('C:/Users/AkhilaNethi/Downloads/Care.Delivery.2.0.0.115018.apk')
                }],
            ]
        }
    }

    // ✅ REAL PHYSICAL DEVICE SERVICES
    if (!USE_BROWSERSTACK) {
        return [['appium', {}]]
    }

    return []
}

export function getTestBotCapabilities(): RequestedStandaloneCapabilities[] {

    // ============================
    // ✅ BROWSERSTACK CAPABILITIES
    // ============================
    if (USE_BROWSERSTACK) {
        if (context.platform == TestBotPlatform.Android) {
            return [{
                platformName: 'Android',
                'appium:automationName': 'UIAutomator2',
                'appium:autoGrantPermissions': true,
                'appium:optionalIntentArguments': '--ez ALLOW_SCREEN_CAPTURE true',
                'bstack:options': {
                    projectName: process.env.BROWSERSTACK_PROJECT_NAME || 'Care Delivery Automation Local',
                    deviceName: 'Google Pixel 9 Pro',
                    platformVersion: '15.0',
                    platformName: 'android',
                    buildName: process.env.BROWSERSTACK_BUILD_NAME || `local-browserstack-`,
                    buildIdentifier: process.env.BROWSERSTACK_BUILD_IDENTIFIER || '#${BUILD_NUMBER}',
                    idleTimeout: 300,
                    local: false,
                    appiumLogs: true,
                    debug: true,
                    video: true,
                }
            }]
        }
        else if (context.platform == TestBotPlatform.iOS) {
            return [{
                platformName: "iOS",
                'appium:automationName': 'XCUITest',
                'appium:autoGrantPermissions': true,
                'bstack:options': {
                    projectName: process.env.BROWSERSTACK_PROJECT_NAME || 'Care Delivery Automation Local',
                    deviceName: 'iPhone 16 Pro',
                    platformVersion: '18',
                    platformName: 'ios',
                    buildName: process.env.BROWSERSTACK_BUILD_NAME || `local-browserstack-`,
                    buildIdentifier: process.env.BROWSERSTACK_BUILD_IDENTIFIER || '#${BUILD_NUMBER}',
                    idleTimeout: 300,
                    local: false,
                    appiumLogs: true,
                    debug: true,
                    video: true,
                }
            }]
        }
    }

    // =====================================
    // ✅ REAL PHYSICAL DEVICE CAPABILITIES
    // =====================================
    if (!USE_BROWSERSTACK) {
        if (context.platform == TestBotPlatform.Android) {
            return [{
                platformName: 'Android',
                'appium:deviceName': 'R5GL10H8QFT',         // your physical device ID
                'appium:platformVersion': '11',               // your Android version
                'appium:automationName': 'UiAutomator2',
                'appium:appPackage': 'com.personcentredsoftware.care.delivery',
                'appium:appActivity': 'crc6456b9737cc47e2d2b.MainActivity',
                'appium:autoGrantPermissions': true,
                'appium:noReset': true,
            }]
        }
        else if (context.platform == TestBotPlatform.iOS) {
            return [{
                platformName: 'iOS',
                'appium:deviceName': 'YOUR_IOS_DEVICE_NAME', // update when needed
                'appium:platformVersion': '17',               // update when needed
                'appium:automationName': 'XCUITest',
                'appium:bundleId': 'com.personcentredsoftware.care.delivery',
                'appium:autoGrantPermissions': true,
                'appium:noReset': true,
            }]
        }
    }

    return []
}

export var testBot: ITestBot;
