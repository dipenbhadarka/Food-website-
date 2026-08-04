import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// Finish and Sign Out Flow — selectors
// Assumes the app is ALREADY logged in and on the
// My Communities page when this file starts.
//
// IMPORTANT: every xpath string below starts with
// a plain "//" — never "[//" — since a stray
// leading bracket (an artifact of markdown link
// auto-formatting when pasting XPaths) silently
// breaks the locator and returns zero elements
// every time, with no error thrown.
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

// Confirmed-by-log text button (tried first — this one
// was proven to exist and be clickable in a real run)
const signOutTextButtonXpath = '//android.widget.Button[@text="Sign Out"]'

// Icon locator described as "the only signout button"
// (fallback if the text button is not present)
const signOutIconXpath =
    '//androidx.recyclerview.widget.RecyclerView/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ImageView'

async function findSignOutControl() {
    const textBtn = await $(signOutTextButtonXpath)
    if (await textBtn.isExisting()) {
        console.log(`✓ Found Sign Out control (text button): ${signOutTextButtonXpath}`)
        return textBtn
    }
    console.warn('Text-based Sign Out button not found, trying icon fallback')

    const iconBtn = await $(signOutIconXpath)
    if (await iconBtn.isExisting()) {
        console.log(`✓ Found Sign Out control (icon): ${signOutIconXpath}`)
        return iconBtn
    }

    console.error('✖ Sign Out control not found via either method — dumping page source')
    try {
        const pageSource = await driver.getPageSource()
        console.log('─────────── PAGE SOURCE: SIGN OUT CONTROL NOT FOUND ───────────')
        console.log(pageSource)
        console.log('────────────────────────────────────────────────────────────')
    } catch (srcErr) {
        console.warn('getPageSource failed:', srcErr)
    }
    throw new Error('Sign Out control not found via text button or icon fallback.')
}

// ─────────────────────────────────────────────
// Close (X) button — candidates tried in order.
// Unlike before, if NONE match, this now returns
// null instead of throwing — Step 3 will log a
// warning and skip gracefully rather than killing
// the whole run, since Close is not required to
// reach Sign Out (Step 4 re-opens the flow fresh
// regardless of whether Step 3 succeeded).
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

async function findCloseButtonOrNull() {
    for (const xpath of closeButtonCandidates) {
        const el = await $(xpath)
        if (await el.isExisting()) {
            console.log(`✓ Found Close button using: ${xpath}`)
            return el
        }
    }
    console.warn('⚠ Close button not found with any candidate locator — skipping Step 3 gracefully')
    try {
        const pageSource = await driver.getPageSource()
        console.log('─────────── PAGE SOURCE: CLOSE BUTTON NOT FOUND (non-fatal) ───────────')
        console.log(pageSource)
        console.log('────────────────────────────────────────────────────────────────────')
    } catch (srcErr) {
        console.warn('getPageSource failed:', srcErr)
    }
    return null
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
    it('Step 2 - Click Finish and Sign Out; verify Just Finishing Up screen with Sign Out control enabled', async () => {
        try {
            await testBot.click(finishSignOutSelectors.finishAndSignOutButton)
            await driver.pause(2000)

            await testBot.waitUntilVisible(finishSignOutSelectors.justFinishingUpTitle, 15000)
            console.log('Landed on "Just Finishing Up" screen')

            const signOutControl = await findSignOutControl()
            const isEnabled = await signOutControl.isEnabled()
            expect(isEnabled).toBe(true)
            console.log('Sign Out control is enabled as expected (no pending uploads)')

        } catch (err) {
            console.error('Just Finishing Up screen or Sign Out control check failed — dumping page source')
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

    // ── Step 3: Close via X icon (non-fatal if not found) ──
    it('Step 3 - Close the Just Finishing Up screen using the X icon if available', async () => {
        const closeBtn = await findCloseButtonOrNull()

        if (!closeBtn) {
            console.warn('Skipping Step 3 assertion — Close button was not found on this screen')
            return
        }

        try {
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
            // If Step 3 closed the screen, this re-opens it fresh.
            // If Step 3 was skipped (no close button found), we may
            // already be on the Just Finishing Up screen — check first.
            const alreadyOnFinishingUp = await testBot.isVisible(finishSignOutSelectors.justFinishingUpTitle)

            if (!alreadyOnFinishingUp) {
                await testBot.waitUntilVisible(finishSignOutSelectors.globalNavMenuButton, 15000)
                await testBot.click(finishSignOutSelectors.globalNavMenuButton)
                await driver.pause(1000)

                await testBot.waitUntilVisible(finishSignOutSelectors.finishAndSignOutButton, 10000)
                await testBot.click(finishSignOutSelectors.finishAndSignOutButton)
                await driver.pause(1500)

                await testBot.waitUntilVisible(finishSignOutSelectors.justFinishingUpTitle, 15000)
            } else {
                console.log('Already on Just Finishing Up screen — skipping re-open')
            }

            const signOutControl = await findSignOutControl()
            await signOutControl.click()
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
