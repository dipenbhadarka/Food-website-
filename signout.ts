import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// Finish and Sign Out Flow — selectors
// Starts from the My Communities page (assumes
// the person is already logged in via the
// enrolment suite that runs before this file)
// through to Logout.
//
// CONFIRMED locators (from a real run's log):
//   - Sign Out button: //android.widget.Button[@text="Sign Out"]
// The Close (X) button locator previously provided
// returned an empty result on a real run, so it is
// treated as unconfirmed below and searched via a
// candidate list instead.
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

    // CONFIRMED — found successfully in a real run's log.
    signOutButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Sign Out"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Sign Out"]'
        ),
    } as TestBotElement,

    // "Just Finishing Up" screen title, used to confirm
    // navigation landed correctly
    justFinishingUpTitle: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Just Finishing Up"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Just Finishing Up"]'
        ),
    } as TestBotElement,

    // Log In screen confirmation after sign out
    userDropdownAfterSignOut: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/UserPicker"]'
        ),
        ios: iOSLocatorBuilder.id('UserPicker'),
    } as TestBotElement,
}

// ─────────────────────────────────────────────
// Close (X) button — NOT yet confirmed. The
// previously provided ImageView XPath returned
// an EMPTY result on a real device run, so it is
// wrong. Trying several likely candidates instead
// and reporting which one (if any) matches.
// ─────────────────────────────────────────────
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
        'Please inspect the "Just Finishing Up" screen with Appium Inspector ' +
        'and provide the real resource-id, content-desc, or text for the close control.'
    )
}

// ─────────────────────────────────────────────
// Suite — Finish and Sign Out Flow
// (Community page → Logout only)
// ─────────────────────────────────────────────
describe('Care Delivery - Finish and Sign Out Flow', () => {

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
            // Re-open the flow since Step 3 closed it
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

            // Verify landed on Log In screen — this also
            // confirms the device is still enrolled (if it
            // were un-enrolled, we would land on the
            // Welcome/enrolment screen instead, not Log In)
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
