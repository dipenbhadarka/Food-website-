import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// This file is SELF-CONTAINED — it logs in first
// (assuming the device is already enrolled from a
// prior run of enrolment.e2e.ts), then runs the
// Finish and Sign Out flow. This lets it run
// standalone with:
//   npx wdio run ./config/wdio.conf.ts --spec ./test/specs/signout.ts
// without depending on the app already being in
// any particular state beforehand.
// ─────────────────────────────────────────────

const isLocal = process.env.RUN_MODE === 'local'
console.log(`▶ Running in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

// ─────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────
const PASSWORD = 'PCSpassword@1'
const LOCATION = 'Kerr House'
const USER = 'Akhila Nethi'
const TARGET_COMMUNITY = 'Kerr House / Service Users'

// ─────────────────────────────────────────────
// Login selectors (device already enrolled)
// ─────────────────────────────────────────────
const loginSelectors = {
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

    kerrHouseServiceUsers: {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@text="${TARGET_COMMUNITY}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypeStaticText[@name="${TARGET_COMMUNITY}"]`
        ),
    } as TestBotElement,

    kerrHouseServiceUsersRow: {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@text="${TARGET_COMMUNITY}"]/ancestor::android.view.ViewGroup[@clickable="true"][1]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypeStaticText[@name="${TARGET_COMMUNITY}"]`
        ),
    } as TestBotElement,

    startWorkButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
        ),
        ios: iOSLocatorBuilder.id('StartWorkButton'),
    } as TestBotElement,

    myCommunitiesTab: {
        android: AndroidLocatorBuilder.xpath(
            '//*[@text="My Communities"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="My Communities"]'
        ),
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
    try {
        const pageSource = await driver.getPageSource()
        console.log(`─────────── PAGE SOURCE: PICKER "${value}" ───────────`)
        console.log(pageSource)
        console.log('─────────────────────────────────────────────')
    } catch (srcErr) {
        console.warn('getPageSource failed:', srcErr)
    }
    throw new Error(`Could not select picker option "${value}"`)
}

// ─────────────────────────────────────────────
// Finish and Sign Out selectors
// CONFIRMED locators (from a real run's log):
//   - Sign Out button: //android.widget.Button[@text="Sign Out"]
// ─────────────────────────────────────────────
const finishSignOutSelectors = {
    globalNavMenuButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/GlobalCommunitiesPage"]/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.ViewGroup/android.widget.Button'
        ),
        ios: iOSLocatorBuilder.id('GlobalNavMenuButton'),
    } as TestBotElement,

    finishAndSignOutButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/FinishWorkButton"]'
        ),
        ios: iOSLocatorBuilder.id('FinishWorkButton'),
    } as TestBotElement,

    signOutButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Sign Out"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Sign Out"]'
        ),
    } as TestBotElement,

    justFinishingUpTitle: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Just Finishing Up"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Just Finishing Up"]'
        ),
    } as TestBotElement,

    userDropdownAfterSignOut: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/UserPicker"]'
        ),
        ios: iOSLocatorBuilder.id('UserPicker'),
    } as TestBotElement,
}

// Close (X) button — not yet confirmed, try candidates
const closeButtonCandidates: string[] = [
    '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/CloseButton"]',
    '//android.widget.ImageView[@resource-id="com.personcentredsoftware.care.delivery:id/CloseButton"]',
    '//android.widget.Button[@content-desc="Close"]',
    '//android.widget.ImageView[@content-desc="Close"]',
    '//android.widget.Button[@text="Close"]',
    '//android.widget.Button[@text="Cancel"]',
    '//android.widget.ImageButton[@content-desc="Close"]',
]

async function findCloseButton() {
    for (const xpath of closeButtonCandidates) {
        const el = await $(xpath)
        if (await el.isExisting()) {
            console.log(`✓ Found Close button using: ${xpath}`)
            return el
        }
    }
    console.error('✖ Close button not found with any candidate locator — dumping page source')
    try {
        const pageSource = await driver.getPageSource()
        console.log('─────────── PAGE SOURCE: CLOSE BUTTON NOT FOUND ───────────')
        console.log(pageSource)
        console.log('────────────────────────────────────────────────────────')
    } catch (srcErr) {
        console.warn('getPageSource failed:', srcErr)
    }
    throw new Error(
        'Close (X) button not found with any candidate locator. ' +
        'Please inspect the "Just Finishing Up" screen with Appium Inspector.'
    )
}

// ─────────────────────────────────────────────
// Suite — Log In then Finish and Sign Out Flow
// (Self-contained: works standalone)
// ─────────────────────────────────────────────
describe('Care Delivery - Log In then Finish and Sign Out Flow', () => {

    // ── Step 0: Log in (device assumed already enrolled) ──
    it('Step 0 - Log in to reach the Communities page', async () => {
        try {
            await driver.pause(3000)

            await testBot.waitUntilVisible(loginSelectors.locationPickerLogin, 15000)
            const locationEl = await $(
                '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
            )
            let locationValue = await locationEl.getText()

            if (!locationValue.includes(LOCATION)) {
                await testBot.click(loginSelectors.locationPickerLogin)
                await driver.pause(1000)
                await selectPickerOptionRobust(LOCATION)
                await driver.pause(1000)
            }

            await testBot.click(loginSelectors.userDropdown)
            await driver.pause(1000)
            await selectPickerOptionRobust(USER)
            await driver.pause(1000)

            await testBot.waitUntilVisible(loginSelectors.signInButton, 10000)
            await testBot.click(loginSelectors.signInButton)
            await driver.pause(3000)

            await testBot.waitUntilVisible(loginSelectors.continueButton, 20000)
            await testBot.click(loginSelectors.continueButton)
            await driver.pause(2000)

            await testBot.waitUntilVisible(loginSelectors.passwordField, 20000)
            await testBot.click(loginSelectors.passwordField)
            await driver.pause(500)
            await testBot.enterText(loginSelectors.passwordField, PASSWORD, false)
            await driver.pause(500)

            try {
                await driver.hideKeyboard()
                await driver.pause(1000)
            } catch (err) {
                console.warn('hideKeyboard failed or already hidden:', err)
            }

            await testBot.waitUntilVisible(loginSelectors.identityLoginButton, 10000)
            await testBot.click(loginSelectors.identityLoginButton)
            await driver.pause(3000)

            await testBot.waitUntilVisible(loginSelectors.kerrHouseServiceUsers, 20000)

            const startWorkXpath =
                '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
            const startBtn = await $(startWorkXpath)
            const alreadyEnabled = await startBtn.isEnabled().catch(() => false)

            if (!alreadyEnabled) {
                await testBot.click(loginSelectors.kerrHouseServiceUsersRow)
                await driver.pause(1000)
                await startBtn.waitForEnabled({ timeout: 10000 }).catch(() => {
                    console.warn('Start Work still disabled after community selection')
                })
            }

            await testBot.click(loginSelectors.startWorkButton)

            await testBot.waitUntilVisible(loginSelectors.myCommunitiesTab, 30000)
            console.log('Logged in successfully — landed on My Communities tab')

        } catch (err) {
            console.error('Login flow failed — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 0 (LOGIN) ───────────')
                console.log(pageSource)
                console.log('────────────────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
    })

    // ── Step 1: Open global nav menu without completing any care notes ──
    it('Step 1 - Without completing any care notes, open the global nav menu', async () => {
        try {
            await testBot.waitUntilVisible(finishSignOutSelectors.globalNavMenuButton, 15000)
            await testBot.click(finishSignOutSelectors.globalNavMenuButton)
            await driver.pause(1500)

            await testBot.waitUntilVisible(finishSignOutSelectors.finishAndSignOutButton, 10000)
            console.log('Global nav menu opened — Finish and Sign Out button is visible')
        } catch (err) {
            console.error('Global nav menu or Finish and Sign Out button not found — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 1 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
    })

    // ── Step 2: Click Finish and Sign Out ──
    it('Step 2 - Click Finish and Sign Out; verify Just Finishing Up screen with Sign Out enabled', async () => {
        try {
            await testBot.click(finishSignOutSelectors.finishAndSignOutButton)
            await driver.pause(2000)

            await testBot.waitUntilVisible(finishSignOutSelectors.justFinishingUpTitle, 15000)
            console.log('Landed on "Just Finishing Up" screen')

            await testBot.waitUntilVisible(finishSignOutSelectors.signOutButton, 10000)
            const signOutBtn = await $(
                await (testBot as any).getLocatorTextForElement(finishSignOutSelectors.signOutButton)
            )
            const isEnabled = await signOutBtn.isEnabled()
            expect(isEnabled).toBe(true)
            console.log('Sign Out button is enabled as expected (no pending uploads)')

        } catch (err) {
            console.error('Just Finishing Up screen or Sign Out button check failed — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 2 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
    })

    // ── Step 3: Close via X icon ──
    it('Step 3 - Close the Just Finishing Up screen using the X icon; return to app', async () => {
        try {
            const closeBtn = await findCloseButton()
            await closeBtn.click()
            await driver.pause(1500)

            const stillOnFinishingUp = await testBot.isVisible(finishSignOutSelectors.justFinishingUpTitle)
            expect(stillOnFinishingUp).toBe(false)
            console.log('Closed Just Finishing Up screen via X icon — returned to app, still signed in')

        } catch (err) {
            console.error('Close (X) button click failed — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 3 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
    })

    // ── Step 4: Re-open Finishing Up screen and Sign Out ──
    it('Step 4 - From Just Finishing Up screen, click Sign Out; land on Log In screen', async () => {
        try {
            await testBot.waitUntilVisible(finishSignOutSelectors.globalNavMenuButton, 15000)
            await testBot.click(finishSignOutSelectors.globalNavMenuButton)
            await driver.pause(1000)

            await testBot.waitUntilVisible(finishSignOutSelectors.finishAndSignOutButton, 10000)
            await testBot.click(finishSignOutSelectors.finishAndSignOutButton)
            await driver.pause(1500)

            await testBot.waitUntilVisible(finishSignOutSelectors.justFinishingUpTitle, 15000)

            await testBot.waitUntilVisible(finishSignOutSelectors.signOutButton, 10000)
            await testBot.click(finishSignOutSelectors.signOutButton)
            await driver.pause(2000)

            await testBot.waitUntilVisible(finishSignOutSelectors.userDropdownAfterSignOut, 15000)
            console.log('Signed out successfully — landed on Log In screen; device remains enrolled')

        } catch (err) {
            console.error('Sign Out flow failed — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 4 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
    })

})
