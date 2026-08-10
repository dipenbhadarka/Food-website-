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
// Selectors — built directly from the provided
// locator list, in the order given
// ─────────────────────────────────────────────
const selectors = {
    infoButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/InfoButton"]/android.view.ViewGroup/android.widget.Button'
        ),
        ios: iOSLocatorBuilder.id('InfoButton'),
    } as TestBotElement,

    enrollDeviceButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollDeviceButton"]'
        ),
        ios: iOSLocatorBuilder.id('EnrollDeviceButton'),
    } as TestBotElement,

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

    // "click enrol device button" — this is the button that
    // appears after region selection to trigger the identity
    // enrolment flow (resource-id is LoginButton per the
    // provided locator).
    clickEnrollDeviceButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        ),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    usernameField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="Username"]'
        ),
        ios: iOSLocatorBuilder.id('Username'),
    } as TestBotElement,

    nextButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="NextButton"]'
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

    identityLoginButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="LoginButton"]'
        ),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    organisationDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/OrganisationPicker"]'
        ),
        ios: iOSLocatorBuilder.id('OrganisationPicker'),
    } as TestBotElement,

    organisationOptionPersonCentredSoftware: {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@resource-id="android:id/text1" and @text="${ORGANISATION}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypePickerWheel[@value="${ORGANISATION}"]`
        ),
    } as TestBotElement,

    locationDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
        ),
        ios: iOSLocatorBuilder.id('LocationPicker'),
    } as TestBotElement,

    optionKerrHouse: {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@resource-id="android:id/text1" and @text="${LOCATION}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypePickerWheel[@value="${LOCATION}"]`
        ),
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

    userDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/UserPicker"]'
        ),
        ios: iOSLocatorBuilder.id('UserPicker'),
    } as TestBotElement,

    optionAkhilaNethi: {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@resource-id="android:id/text1" and @text="${USER}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypePickerWheel[@value="${USER}"]`
        ),
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

    startWorkButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
        ),
        ios: iOSLocatorBuilder.id('StartWorkButton'),
    } as TestBotElement,
}

// ─────────────────────────────────────────────
// Helper — wraps a promise with a hard timeout so
// a stalled Appium command fails fast with a clear
// error instead of hanging indefinitely.
// ─────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms — command likely hung`)), ms)
        ),
    ])
}

// ─────────────────────────────────────────────
// Helper — dump page source safely, without
// throwing if the session itself is dead.
// ─────────────────────────────────────────────
async function dumpPageSourceOnFailure(stepLabel: string) {
    console.error(`Failure at ${stepLabel} — dumping page source`)
    try {
        const pageSource = await withTimeout(driver.getPageSource(), 10000, `getPageSource (${stepLabel})`)
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
// Device state flag — set by Step 0, read by
// every enrolment step after it. If the device is
// already enrolled ("Welcome Back" login screen
// appears instead of the fresh Welcome screen with
// the region dropdown), enrolment Steps 1-11 are
// skipped automatically and the suite jumps
// straight to the login/user-selection flow
// (Step 12 onward), which is what "Welcome Back"
// actually needs.
// ─────────────────────────────────────────────
let deviceAlreadyEnrolled = false

// ─────────────────────────────────────────────
// Suite — XCover5 Enrolment Flow
// ─────────────────────────────────────────────
describe('Care Delivery - XCover5 Enrolment Flow', () => {

    it('Step 0 - Detect whether device shows fresh Welcome screen or already-enrolled Welcome Back screen', async () => {
        await driver.pause(3000)

        const regionDropdownVisible = await testBot.isVisible(selectors.regionDropdown).catch(() => false)
        const loginUserDropdownVisible = await testBot.isVisible(selectors.userDropdown).catch(() => false)

        if (regionDropdownVisible) {
            deviceAlreadyEnrolled = false
            console.log('Detected FRESH Welcome screen (region dropdown present) — will run full enrolment flow')
        } else if (loginUserDropdownVisible) {
            deviceAlreadyEnrolled = true
            console.log('Detected "Welcome Back" screen (device already enrolled) — will SKIP enrolment steps 1-11 and go straight to user selection/login')
        } else {
            console.warn('Could not confidently detect screen state — dumping page source, defaulting to attempt full enrolment flow')
            await dumpPageSourceOnFailure('Step 0 (undetected screen state)')
            deviceAlreadyEnrolled = false
        }
    })

    it('Step 1 - App opens to Welcome screen with region dropdown', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 1 — device already enrolled'); this.skip(); return }
        await driver.pause(3000)
        try {
            await testBot.waitUntilVisible(selectors.regionDropdown, 15000)
            await testBot.waitUntilVisible(selectors.enrollDeviceButton, 5000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 1')
            throw err
        }
    })

    it('Step 2 - Select region dropdown and choose United Kingdom', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 2 — device already enrolled'); this.skip(); return }
        await testBot.click(selectors.regionDropdown)
        await driver.pause(1000)
        try {
            await testBot.waitUntilVisible(selectors.optionUnitedKingdom, 10000)
            await testBot.click(selectors.optionUnitedKingdom)
            await driver.pause(1000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 2')
            throw err
        }

        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollDeviceButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 3 - Click Enrol device button', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 3 — device already enrolled'); this.skip(); return }
        await testBot.click(selectors.enrollDeviceButton)
        await driver.pause(isLocal ? 3000 : 5000)
    })

    it('Step 4 - Click the Login button to proceed to identity flow', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 4 — device already enrolled'); this.skip(); return }
        try {
            await testBot.waitUntilVisible(selectors.clickEnrollDeviceButton, 15000)
            await testBot.click(selectors.clickEnrollDeviceButton)
            await driver.pause(2000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 4')
            throw err
        }
    })

    it('Step 5 - Enter username and click Next', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 5 — device already enrolled'); this.skip(); return }
        try {
            await testBot.waitUntilVisible(selectors.usernameField, 20000)
            await testBot.click(selectors.usernameField)
            await driver.pause(500)
            await testBot.enterText(selectors.usernameField, USERNAME, false)
            await driver.pause(500)

            await testBot.waitUntilVisible(selectors.nextButton, 10000)
            await testBot.click(selectors.nextButton)
            await driver.pause(2000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 5')
            throw err
        }
    })

    it('Step 6 - Click Continue on the PCS Terms page', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 6 — device already enrolled'); this.skip(); return }
        try {
            await testBot.waitUntilVisible(selectors.continueButton, 20000)
            await testBot.click(selectors.continueButton)
            await driver.pause(2000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 6')
            throw err
        }
    })

    it('Step 7 - Enter password and click Login', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 7 — device already enrolled'); this.skip(); return }
        try {
            await testBot.waitUntilVisible(selectors.passwordField, 20000)
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

            // Identity auth may briefly background the app on
            // physical device — give it time and force it back
            // to foreground before checking for the enrol page.
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
            await dumpPageSourceOnFailure('Step 7')
            throw err
        }
    })

    it('Step 8 - Select Organisation: Person Centred Software', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 8 — device already enrolled'); this.skip(); return }
        try {
            await testBot.click(selectors.organisationDropdown)
            await driver.pause(1000)
            await testBot.waitUntilVisible(selectors.organisationOptionPersonCentredSoftware, 10000)
            await testBot.click(selectors.organisationOptionPersonCentredSoftware)
            await driver.pause(1000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 8')
            throw err
        }
    })

    it('Step 9 - Select Location: Kerr House', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 9 — device already enrolled'); this.skip(); return }
        try {
            await testBot.click(selectors.locationDropdown)
            await driver.pause(1000)
            await testBot.waitUntilVisible(selectors.optionKerrHouse, 10000)
            await testBot.click(selectors.optionKerrHouse)
            await driver.pause(1000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 9')
            throw err
        }

        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 10 - Click Enrol', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 10 — device already enrolled'); this.skip(); return }
        try {
            await testBot.click(selectors.enrolButton)
            await testBot.waitUntilVisible(selectors.logoutButton, 30000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 10')
            throw err
        }
    })

    it('Step 11 - Click Logout', async function () {
        if (deviceAlreadyEnrolled) { console.log('Skipping Step 11 — device already enrolled'); this.skip(); return }
        try {
            await testBot.click(selectors.logoutButton)
            await driver.pause(2000)
            await testBot.waitUntilVisible(selectors.userDropdown, 15000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 11')
            throw err
        }
    })

    it('Step 12 - Select user: Akhila Nethi', async () => {
        try {
            await testBot.click(selectors.userDropdown)
            await driver.pause(1000)
            await withTimeout(
                testBot.waitUntilVisible(selectors.optionAkhilaNethi, 10000),
                12000,
                'waitUntilVisible(Akhila Nethi)'
            )
            await testBot.click(selectors.optionAkhilaNethi)
            await driver.pause(1000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 12')
            throw err
        }

        const signInBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        )
        const isEnabled = await signInBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 13 - Click Sign In', async () => {
        try {
            await testBot.click(selectors.signInButton)
            await driver.pause(3000)

            // NB: ContinueButton's resource-id is reused across
            // multiple screens in this app. Confirm the user
            // dropdown/sign-in screen has actually gone away
            // before treating "continueButton visible" as the
            // NEW screen, otherwise a stale element reference
            // from the previous screen can be clicked instead.
            const stillOnSignInScreen = await testBot.isVisible(selectors.userDropdown).catch(() => false)
            if (stillOnSignInScreen) {
                console.warn('Still showing user dropdown after Sign In tap — waiting for screen transition')
                await driver.pause(2000)
            }

            await testBot.waitUntilVisible(selectors.continueButton, 20000)
        } catch (err) {
            await dumpPageSourceOnFailure('Step 13')
            throw err
        }
    })

    it('Step 14 - Click Continue', async () => {
        try {
            // Re-confirm we are NOT still on the user
            // dropdown/sign-in screen before proceeding —
            // guards against a stale ContinueButton reference
            // from an earlier screen being clicked instead of
            // the real one on the PCS Terms page.
            const stillOnSignInScreen = await testBot.isVisible(selectors.userDropdown).catch(() => false)
            if (stillOnSignInScreen) {
                console.error('Step 14 started but still on the user dropdown/sign-in screen — Sign In may not have registered. Dumping page source.')
                await dumpPageSourceOnFailure('Step 14 (unexpected screen)')
                throw new Error('Step 14: still on sign-in screen, expected PCS Terms/Continue screen')
            }

            await testBot.waitUntilVisible(selectors.continueButton, 15000)

            try {
                await driver.hideKeyboard()
                await driver.pause(1000)
            } catch (kbErr) {
                console.warn('hideKeyboard failed or keyboard already hidden:', kbErr)
            }

            // Re-fetch the Continue button element fresh right
            // before clicking, rather than reusing whatever
            // waitUntilVisible found — avoids acting on a
            // stale element reference from a prior screen.
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
            await dumpPageSourceOnFailure('Step 14')
            throw err
        }
    })

    it('Step 15 - Enter password and click Login', async () => {
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
            await dumpPageSourceOnFailure('Step 15')
            throw err
        }
    })

    it('Step 16 - Confirm Kerr House / Service Users community and click Start Work', async () => {
        try {
            await testBot.waitUntilVisible(selectors.kerrHouseServiceUsers, 10000)

            const startBtn = await $(
                '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
            )
            const alreadyEnabled = await startBtn.isEnabled().catch(() => false)

            if (!alreadyEnabled) {
                await testBot.click(selectors.kerrHouseServiceUsers)
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
            await dumpPageSourceOnFailure('Step 16')
            throw err
        }
    })

})
