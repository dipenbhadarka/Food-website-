import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// Finish and Sign Out Flow — selectors
// Assumes the app is ALREADY logged in and on the
// My Communities page when this file starts.
//
// NOTE ON CONFLICTING INFORMATION:
// A real device run's log confirmed that
// //android.widget.Button[@text="Sign Out"] EXISTS
// and is clickable on the "Just Finishing Up"
// screen (Steps 1-2 passed using it, correctly
// showing "enabled").
// Separately, an ImageView icon has also been
// described as "the only signout button".
// Since these two pieces of information conflict,
// this file tries the CONFIRMED text button first
// (since it has real evidence behind it), and only
// falls back to the ImageView icon if that button
// is not found. Whichever one actually works will
// be logged clearly.
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

// Confirmed-by-log text button (tried first)
const signOutTextButtonXpath = '//android.widget.Button[@text="Sign Out"]'

// Icon locator described as "the only signout button" (fallback)
const signOutIconXpath =
    '//androidx.recyclerview.widget.RecyclerView/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ImageView'

async function findSignOutControl() {
    // Try 1: confirmed text button
    const textBtn = await $(signOutTextButtonXpath)
    if (await textBtn.isExisting()) {
        console.log(`✓ Found Sign Out control (text button): ${signOutTextButtonXpath}`)
        return textBtn
    }
    console.warn(`Text-based Sign Out button not found, trying icon fallback`)

    // Try 2: icon fallback
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
// Close (X) button — trying candidates since not
// yet separately confirmed from the sign-out icon.
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
    throw new Error('Close (X) button not found with any candidate locator.')
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

    // ── Step 2: Click Finish and Sign Out (confirm signout) ──
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

            const signOutControl = await findSignOutControl()
            await signOutControl.click()
            await driver.pause(2000)

            // Verify landed on Log In screen — this also
            // confirms the device is still enrolled
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
