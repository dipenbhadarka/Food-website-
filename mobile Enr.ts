import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// Run mode detection
// ─────────────────────────────────────────────
const isLocal = process.env.RUN_MODE === 'local'
const localAppPackage = process.env.LOCAL_APP_PACKAGE || 'com.personcentredsoftware.care.delivery'
console.log(`Running in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

// ─────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────
const USERNAME = 'a.nethi@personcentredsoftware.com'
const PASSWORD = 'PCSpassword@1'
const ORGANISATION = 'Person Centred Software'
const LOCATION = 'Kerr House'
const USER = 'Akhila Nethi'

// ─────────────────────────────────────────────
// Selectors — built from the confirmed original
// locator set
// ─────────────────────────────────────────────
const selectors = {
    regionDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/EnvironmentPicker"]'
        ),
        ios: iOSLocatorBuilder.id('EnvironmentPicker'),
    } as TestBotElement,

    optionUnitedKingdom: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@resource-id="android:id/text1" and @text="United Kingdom"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypePickerWheel[@value="United Kingdom"]'
        ),
    } as TestBotElement,

    cancelButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="android:id/button2"]'
        ),
        ios: iOSLocatorBuilder.id('Cancel'),
    } as TestBotElement,

    enrollDeviceButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        ),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    // Username field lives inside a WebView on the identity page
    usernameField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.View[@resource-id="AccountLogin"]/android.view.View'
        ),
        ios: iOSLocatorBuilder.id('AccountLogin'),
    } as TestBotElement,

    nextButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.webkit.WebView[@text="Person Centred Software"]'
        ),
        ios: iOSLocatorBuilder.id('Next'),
    } as TestBotElement,

    continueButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="ContinueButton"]'
        ),
        ios: iOSLocatorBuilder.id('ContinueButton'),
    } as TestBotElement,

    passwordField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="Password"]'
        ),
        ios: iOSLocatorBuilder.id('Password'),
    } as TestBotElement,

    forgotPasswordLink: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Forgot Password?"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Forgot Password?"]'
        ),
    } as TestBotElement,

    keepMeLoggedInCheckbox: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.CheckBox[@resource-id="RememberLogin"]'
        ),
        ios: iOSLocatorBuilder.id('RememberLogin'),
    } as TestBotElement,

    identityLoginButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="LoginButton"]'
        ),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    deviceNameField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Enter location of device"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Enter location of device"]'
        ),
    } as TestBotElement,

    organisationDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/OrganisationPicker"]'
        ),
        ios: iOSLocatorBuilder.id('OrganisationPicker'),
    } as TestBotElement,

    locationDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
        ),
        ios: iOSLocatorBuilder.id('LocationPicker'),
    } as TestBotElement,

    enrolButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollButton"]'
        ),
        ios: iOSLocatorBuilder.id('EnrollButton'),
    } as TestBotElement,

    logoutButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LogoutButton"]'
        ),
        ios: iOSLocatorBuilder.id('LogoutButton'),
    } as TestBotElement,

    locationPickerLogin: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
        ),
        ios: iOSLocatorBuilder.id('LocationPicker'),
    } as TestBotElement,

    userDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/UserPicker"]'
        ),
        ios: iOSLocatorBuilder.id('UserPicker'),
    } as TestBotElement,

    signInButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        ),
        ios: iOSLocatorBuilder.id('SignInButton'),
    } as TestBotElement,

    kerrHouseServiceUsers: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / Service Users"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / Service Users"]'
        ),
    } as TestBotElement,

    kerrHouseServiceUsersRow: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / Service Users"]/ancestor::android.view.ViewGroup[@clickable="true"][1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / Service Users"]'
        ),
    } as TestBotElement,

    kerrHouseSouthWing: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / South Wing - First Floor"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / South Wing - First Floor"]'
        ),
    } as TestBotElement,

    kerrHouseTraining: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / Training"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Kerr House / Training"]'
        ),
    } as TestBotElement,

    startWorkButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
        ),
        ios: iOSLocatorBuilder.id('StartWorkButton'),
    } as TestBotElement,
}

function pickerOption(text: string): TestBotElement {
    return {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@resource-id="android:id/text1" and @text="${text}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypePickerWheel[@value="${text}"]`
        ),
    } as TestBotElement
}

// ─────────────────────────────────────────────
// Helper — dump page source safely
// ─────────────────────────────────────────────
async function dumpPageSourceOnFailure(stepLabel: string) {
    console.error(`Failure at ${stepLabel} — dumping page source`)
    try {
        const pageSource = await driver.getPageSource()
        console.log(`─────────── PAGE SOURCE: ${stepLabel} ───────────`)
        console.log(pageSource)
        console.log('─────────────────────────────────────────────')
    } catch (srcErr) {
        console.error(
            `getPageSource ALSO failed (${srcErr instanceof Error ? srcErr.message : srcErr}) — ` +
            'session likely dead. Consider restarting Appium and the app on device.'
        )
    }
}

// ─────────────────────────────────────────────
// Helper — robust picker selection with scroll
// fallback and exact-match verification.
// ─────────────────────────────────────────────
async function selectPickerOptionRobust(value: string): Promise<void> {
    const option = pickerOption(value)

    try {
        await testBot.waitUntilVisible(option, 5000)
        await testBot.click(option)
        console.log(`Selected "${value}" directly`)
        return
    } catch (err) {
        console.warn(`Direct selection of "${value}" failed, trying scroll fallback`)
    }

    try {
        const scrolled = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            `.scrollIntoView(new UiSelector().textMatches("^${value}$"))`
        )
        if (await scrolled.isExisting()) {
            await scrolled.click()
            console.log(`Selected "${value}" via UiScrollable scroll (exact match)`)
            return
        }
    } catch (err) {
        console.warn(`UiScrollable fallback for "${value}" failed:`, err)
    }

    console.error(`Could not select "${value}" — dumping page source`)
    await dumpPageSourceOnFailure(`picker selection "${value}"`)
    throw new Error(`Could not select picker option "${value}"`)
}

// ─────────────────────────────────────────────
// Device state flag — set by Step 0, read by
// every enrolment step after it.
// NB: Every test below uses a plain "function ()"
// (not an arrow function "() => {}") specifically
// so that "this.skip()" works correctly in every
// step — arrow functions do not bind their own
// "this", so calling this.skip() inside one throws
// "Property 'skip' does not exist".
// ─────────────────────────────────────────────
let deviceAlreadyEnrolled = false

// ─────────────────────────────────────────────
// Suite — Enrolment & Login Flow
// ─────────────────────────────────────────────
describe('Care Delivery - Full Enrolment & Login Flow', () => {

    it('Step 0 - Detect whether device shows fresh Welcome screen or already-enrolled Welcome Back screen', async function () {
        await driver.pause(3000)

        const regionDropdownVisible = await testBot.isVisible(selectors.regionDropdown).catch(() => false)
        const loginUserDropdownVisible = await testBot.isVisible(selectors.userDropdown).catch(() => false)

        if (regionDropdownVisible) {
            deviceAlreadyEnrolled = false
            console.log('Detected FRESH Welcome screen (region dropdown present) — will run full enrolment flow')
        } else if (loginUserDropdownVisible) {
            deviceAlreadyEnrolled = true
            console.log('Detected "Welcome Back" screen (device already enrolled) — will SKIP enrolment steps and go straight to login')
        } else {
            console.warn('Could not confidently detect screen state — dumping page source, defaulting to attempt full enrolment flow')
            await dumpPageSourceOnFailure('Step 0 (undetected screen state)')
            deviceAlreadyEnrolled = false
        }
    })

    it('Step 1 - Select region dropdown and choose United Kingdom', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 1 — device already enrolled'); this.skip(); return }
        try {
            await testBot.waitUntilVisible(selectors.regionDropdown, 15000)
            await testBot.click(selectors.regionDropdown)
            await driver.pause(1000)
            await testBot.waitUntilVisible(selectors.optionUnitedKingdom, 10000)
            await testBot.click(selectors.optionUnitedKingdom)
            await driver.pause(1000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 1')
            throw err
        }
    })

    it('Step 2 - Click Enrol Device (Login) button', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 2 — device already enrolled'); this.skip(); return }
        try {
            await testBot.waitUntilVisible(selectors.enrollDeviceButton, 10000)
            await testBot.click(selectors.enrollDeviceButton)
            await driver.pause(isLocal ? 3000 : 5000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 2')
            throw err
        }
    })

    it('Step 3 - Enter username and click Next', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 3 — device already enrolled'); this.skip(); return }
        try {
            await testBot.waitUntilVisible(selectors.usernameField, 20000)
            await testBot.click(selectors.usernameField)
            await testBot.enterText(selectors.usernameField, USERNAME, false)
            await testBot.click(selectors.nextButton)
            await driver.pause(2000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 3')
            throw err
        }
    })

    it('Step 4 - Click Continue on PCS Terms page', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 4 — device already enrolled'); this.skip(); return }
        try {
            await testBot.waitUntilVisible(selectors.continueButton, 15000)
            await testBot.click(selectors.continueButton)
            await driver.pause(2000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 4')
            throw err
        }
    })

    it('Step 5 - Enter password and click Login', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 5 — device already enrolled'); this.skip(); return }
        try {
            await testBot.waitUntilVisible(selectors.passwordField, 20000)
            await testBot.click(selectors.passwordField)
            await testBot.enterText(selectors.passwordField, PASSWORD, false)

            try {
                await driver.hideKeyboard()
                await driver.pause(1000)
            } catch (kbErr) {
                console.warn('hideKeyboard failed or keyboard already hidden:', kbErr)
            }

            await testBot.waitUntilVisible(selectors.identityLoginButton, 10000)
            await testBot.click(selectors.identityLoginButton)

            const postLoginWait = isLocal ? 120000 : 20000
            await driver.pause(isLocal ? 5000 : 3000)

            if (isLocal) {
                try {
                    await driver.activateApp(localAppPackage)
                    await driver.pause(2000)
                } catch (e) {
                    console.warn('activateApp after login failed (app may already be foreground):', e)
                }
            }

            await testBot.waitUntilVisible(selectors.organisationDropdown, postLoginWait)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 5')
            throw err
        }
    })

    it('Step 6 - Select Organisation: Person Centred Software', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 6 — device already enrolled'); this.skip(); return }
        try {
            await testBot.click(selectors.organisationDropdown)
            await driver.pause(1000)
            await selectPickerOptionRobust(ORGANISATION)
            await driver.pause(1000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 6')
            throw err
        }
    })

    it('Step 7 - Select Location: Kerr House', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 7 — device already enrolled'); this.skip(); return }
        try {
            await testBot.click(selectors.locationDropdown)
            await driver.pause(1000)
            await selectPickerOptionRobust(LOCATION)
            await driver.pause(1000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 7')
            throw err
        }

        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 8 - Click Enrol', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 8 — device already enrolled'); this.skip(); return }
        try {
            await testBot.click(selectors.enrolButton)
            await testBot.waitUntilVisible(selectors.logoutButton, 30000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 8')
            throw err
        }
    })

    it('Step 9 - Click Logout', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 9 — device already enrolled'); this.skip(); return }
        try {
            await testBot.click(selectors.logoutButton)
            await driver.pause(2000)
            await testBot.waitUntilVisible(selectors.userDropdown, 15000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 9')
            throw err
        }
    })

    it('Step 10 - Select Location and User (login screen)', async function () {
        try {
            const locationEl = await $(
                '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
            )
            const locationValue = await locationEl.getText().catch(() => '')

            if (!locationValue.includes(LOCATION)) {
                await testBot.click(selectors.locationPickerLogin)
                await driver.pause(1000)
                await selectPickerOptionRobust(LOCATION)
                await driver.pause(1000)
            }

            await testBot.click(selectors.userDropdown)
            await driver.pause(1000)
            await selectPickerOptionRobust(USER)
            await driver.pause(1000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 10')
            throw err
        }

        const signInBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        )
        const isEnabled = await signInBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 11 - Click Sign In', async function () {
        try {
            await testBot.click(selectors.signInButton)
            await driver.pause(3000)

            const stillOnSignInScreen = await testBot.isVisible(selectors.userDropdown).catch(() => false)
            if (stillOnSignInScreen) {
                console.warn('Still showing user dropdown after Sign In tap — waiting for screen transition')
                await driver.pause(2000)
            }

            await testBot.waitUntilVisible(selectors.continueButton, 20000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 11')
            throw err
        }
    })

    it('Step 12 - Click Continue', async function () {
        try {
            const stillOnSignInScreen = await testBot.isVisible(selectors.userDropdown).catch(() => false)
            if (stillOnSignInScreen) {
                console.error('Step 12 started but still on the user dropdown/sign-in screen — dumping page source')
                await dumpPageSourceOnFailure('Step 12 (unexpected screen)')
                throw new Error('Step 12: still on sign-in screen, expected PCS Terms/Continue screen')
            }

            await testBot.waitUntilVisible(selectors.continueButton, 15000)

            try {
                await driver.hideKeyboard()
                await driver.pause(1000)
            } catch (kbErr) {
                console.warn('hideKeyboard failed or keyboard already hidden:', kbErr)
            }

            const freshContinueBtn = await $(
                '//android.widget.Button[@resource-id="ContinueButton"]'
            )
            await freshContinueBtn.waitForDisplayed({ timeout: 10000 })
            await freshContinueBtn.click()
            await driver.pause(2000)

            let landedOnPassword = await testBot.isVisible(selectors.passwordField).catch(() => false)

            if (!landedOnPassword) {
                console.warn('Password page not visible after first Continue tap — retrying tap once')
                const retryBtn = await $(
                    '//android.widget.Button[@resource-id="ContinueButton"]'
                )
                if (await retryBtn.isExisting()) {
                    await retryBtn.click()
                    await driver.pause(2000)
                    landedOnPassword = await testBot.isVisible(selectors.passwordField).catch(() => false)
                }
            }

            if (!landedOnPassword) {
                console.warn('Still not on Password page — trying coordinate-based tap on Continue button')
                const continueBtn = await $(
                    '//android.widget.Button[@resource-id="ContinueButton"]'
                )
                if (await continueBtn.isExisting()) {
                    const location = await continueBtn.getLocation()
                    const size = await continueBtn.getSize()
                    const centerX = Math.floor(location.x + size.width / 2)
                    const centerY = Math.floor(location.y + size.height / 2)
                    console.log(`Tapping Continue at coordinates: ${centerX}, ${centerY}`)

                    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
                        .move({ duration: 0, x: centerX, y: centerY })
                        .down({ button: 0 })
                        .pause(100)
                        .up({ button: 0 })
                        .perform()

                    await driver.pause(2000)
                } else {
                    console.error('Continue button no longer exists on screen — screen state has changed unexpectedly')
                }
            }

            await testBot.waitUntilVisible(selectors.passwordField, 20000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 12')
            throw err
        }
    })

    it('Step 13 - Enter password and click Login', async function () {
        try {
            await testBot.click(selectors.passwordField)
            await driver.pause(500)
            await testBot.enterText(selectors.passwordField, PASSWORD, false)
            await driver.pause(500)

            try {
                await driver.hideKeyboard()
                await driver.pause(1000)
            } catch (kbErr) {
                console.warn('hideKeyboard failed or keyboard already hidden:', kbErr)
            }

            await testBot.waitUntilVisible(selectors.identityLoginButton, 10000)
            await testBot.click(selectors.identityLoginButton)

            const postLoginWait = isLocal ? 120000 : 20000
            await driver.pause(isLocal ? 5000 : 3000)

            if (isLocal) {
                try {
                    await driver.activateApp(localAppPackage)
                    await driver.pause(2000)
                } catch (e) {
                    console.warn('activateApp after login failed (app may already be foreground):', e)
                }
            }

            await testBot.waitUntilVisible(selectors.kerrHouseServiceUsers, postLoginWait)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 13')
            throw err
        }
    })

    it('Step 14 - Confirm Kerr House / Service Users community and click Start Work', async function () {
        try {
            await testBot.waitUntilVisible(selectors.kerrHouseServiceUsers, 10000)

            const startBtn = await $(
                '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
            )
            const alreadyEnabled = await startBtn.isEnabled().catch(() => false)

            if (!alreadyEnabled) {
                // NB: "Kerr House / Service Users" is the target
                // community — do NOT tap "South Wing" or
                // "Training", which are separate, similarly
                // named options on this same screen.
                await testBot.click(selectors.kerrHouseServiceUsersRow)
                await driver.pause(1000)
                await startBtn.waitForEnabled({ timeout: 10000 }).catch(() => {
                    console.warn('Start Work still disabled after community selection')
                })
            } else {
                console.log('Start Work already enabled — community appears pre-selected, skipping tap')
            }

            await testBot.waitUntilVisible(selectors.startWorkButton, 10000)
            await testBot.click(selectors.startWorkButton)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 14')
            throw err
        }
    })

})
