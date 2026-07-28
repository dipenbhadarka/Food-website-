import { testBot } from '../../../testbot'
import { AndroidLocatorBuilder } from '../../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../../TestBot/TestBotElement'

const PASSWORD = 'PCSpassword@1'
const USER = 'Akhila Nethi'

// ─────────────────────────────────────────────
// Finish and Sign Out Flow — selectors
// Starts from the My Communities page (assumes
// the person is already logged in via the
// common enrolment suite) through to Logout.
// This is the ONLY file you edit for this
// scenario. To add a NEW scenario, copy this
// file's structure into a new file instead.
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

    // "Just Finishing Up" screen — close (X icon) button
    closeXButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/CloseButton"]/android.view.ViewGroup/android.widget.Button'
        ),
        ios: iOSLocatorBuilder.id('CloseButton'),
    } as TestBotElement,

    // NB: The locator sent for "Sign Out" button was
    // identical to the close (X) button above. Using a
    // text-based fallback for now — please confirm the
    // real Sign Out button's resource-id/xpath.
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
    try {
        await testBot.waitUntilVisible(pickerOption(value), 10000)
        await testBot.click(pickerOption(value))
        return
    } catch {
        const anyText = await $(`//*[@text="${value}"]`)
        if (await anyText.isExisting()) {
            await anyText.click()
            return
        }
    }
    throw new Error(`Could not select picker option "${value}"`)
}

async function waitForPostSignInState(timeoutMs: number): Promise<'continue' | 'password' | 'communities'> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
        if (await testBot.isVisible(finishSignOutSelectors.globalNavMenuButton) ||
            await testBot.isVisible(finishSignOutSelectors.myCommunitiesTab) ||
            await testBot.isVisible(finishSignOutSelectors.kerrHouseServiceUsers)) {
            return 'communities'
        }
        if (await testBot.isVisible(finishSignOutSelectors.continueButton)) {
            return 'continue'
        }
        if (await testBot.isVisible(finishSignOutSelectors.passwordField)) {
            return 'password'
        }
        await driver.pause(1000)
    }
    throw new Error('Timed out waiting for post-sign-in state (continue/password/communities)')
}

async function ensureReadyForSignOut(): Promise<void> {
    if (await testBot.isVisible(finishSignOutSelectors.globalNavMenuButton)) {
        console.log('Already on My Communities page')
        return
    }

    if (!(await testBot.isVisible(finishSignOutSelectors.userDropdownAfterSignOut))) {
        throw new Error('Precondition failed: not on My Communities or Log In screen')
    }

    console.log('Detected Log In screen; performing sign-in precondition for signout flow')
    await testBot.click(finishSignOutSelectors.userDropdownAfterSignOut)
    await driver.pause(1000)
    await selectPickerOptionRobust(USER)
    await driver.pause(1000)
    await testBot.click(finishSignOutSelectors.signInButton)

    let state = await waitForPostSignInState(20000)

    if (state === 'continue') {
        await testBot.click(finishSignOutSelectors.continueButton)
        state = await waitForPostSignInState(20000)
    }

    if (state === 'password') {
        await testBot.enterText(finishSignOutSelectors.passwordField, PASSWORD, false)
        await driver.pause(500)
        try {
            await driver.hideKeyboard()
            await driver.pause(500)
        } catch {
            // Keyboard may already be hidden
        }
        await testBot.click(finishSignOutSelectors.identityLoginButton)
        state = await waitForPostSignInState(30000)
    }

    if (state === 'communities' && await testBot.isVisible(finishSignOutSelectors.kerrHouseServiceUsers)) {
        const startWorkBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
        )
        if (!(await startWorkBtn.isEnabled())) {
            await testBot.click(finishSignOutSelectors.kerrHouseServiceUsersRow)
            await driver.pause(1000)
        }
        await testBot.click(finishSignOutSelectors.startWorkButton)
        await driver.pause(2000)
    }

    await testBot.waitUntilVisible(finishSignOutSelectors.myCommunitiesTab, 30000)
    await testBot.waitUntilVisible(finishSignOutSelectors.globalNavMenuButton, 15000)
}

// ─────────────────────────────────────────────
// Scenario Suite — Finish and Sign Out Flow
// (Community page → Logout only)
// Call runFinishSignOutSuite() — auto-discovered
// from the scenarios/ folder by main.e2e.ts.
// ─────────────────────────────────────────────
export function runFinishSignOutSuite() {
    describe('Care Delivery - Finish and Sign Out Flow', () => {

        before(async () => {
            await ensureReadyForSignOut()
        })

        // ── Step 1: Open global nav menu without completing any care notes ──
        it('Step 1 - Without completing any care notes, open the global nav menu', async () => {
            try {
                await testBot.waitUntilVisible(finishSignOutSelectors.globalNavMenuButton, 15000)
                await testBot.click(finishSignOutSelectors.globalNavMenuButton)
                await driver.pause(1500)

                // Verify the Finish and Sign Out button is
                // visible in the menu that appears
                await testBot.waitUntilVisible(finishSignOutSelectors.finishAndSignOutButton, 10000)
                console.log('Global nav menu opened — Finish and Sign Out button is visible')
            } catch (err) {
                console.error('Global nav menu or Finish and Sign Out button not found — dumping page source')
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 1 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
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

                // No care notes were completed, so Sign Out
                // should be enabled immediately (nothing to upload)
                await testBot.waitUntilVisible(finishSignOutSelectors.signOutButton, 10000)
                const signOutBtn = await $(
                    await (testBot as any).getLocatorTextForElement(finishSignOutSelectors.signOutButton)
                )
                const isEnabled = await signOutBtn.isEnabled()
                expect(isEnabled).toBe(true)
                console.log('Sign Out button is enabled as expected (no pending uploads)')

            } catch (err) {
                console.error('Just Finishing Up screen or Sign Out button check failed — dumping page source')
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 2 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
                throw err
            }
        })

        // ── Step 3: Close via X icon ──
        it('Step 3 - Close the Just Finishing Up screen using the X icon', async () => {
            try {
                await testBot.waitUntilVisible(finishSignOutSelectors.closeXButton, 10000)
                await testBot.click(finishSignOutSelectors.closeXButton)
                await driver.pause(1500)

                // Verify we're back on the app, not still on
                // the Just Finishing Up screen
                const stillOnFinishingUp = await testBot.isVisible(finishSignOutSelectors.justFinishingUpTitle)
                expect(stillOnFinishingUp).toBe(false)
                console.log('Closed Just Finishing Up screen via X icon — returned to app')

            } catch (err) {
                console.error('Close (X) button click failed — dumping page source')
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 3 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
                throw err
            }
        })

        // ── Step 4: Re-open Finishing Up screen and Sign Out ──
        it('Step 4 - From Just Finishing Up screen, click Sign Out; land on Log In screen', async () => {
            try {
                // Navigate back into Finish and Sign Out flow
                await testBot.click(finishSignOutSelectors.globalNavMenuButton)
                await driver.pause(1000)
                await testBot.click(finishSignOutSelectors.finishAndSignOutButton)
                await driver.pause(1500)

                await testBot.waitUntilVisible(finishSignOutSelectors.justFinishingUpTitle, 15000)
                await testBot.waitUntilVisible(finishSignOutSelectors.signOutButton, 10000)
                await testBot.click(finishSignOutSelectors.signOutButton)
                await driver.pause(2000)

                // Verify landed on Log In screen
                await testBot.waitUntilVisible(finishSignOutSelectors.userDropdownAfterSignOut, 15000)
                console.log('Signed out successfully — landed on Log In screen')

            } catch (err) {
                console.error('Sign Out flow failed — dumping page source')
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 4 ───────────')
                console.log(pageSource)
                console.log('─────────────────────────────────────────')
                throw err
            }
        })

    })
}

// Register the suite so WebdriverIO discovers it whether this file is
// loaded via the `specs` config array or via --spec on the CLI.
runFinishSignOutSuite()
