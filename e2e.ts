import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────
const USERNAME = 'a.nethi@personcentredsoftware.com'
const PASSWORD = 'PCSpassword@1'
const ORGANISATION = 'Person Centred Software'
const LOCATION = 'Kerr House'
const USER = 'Akhila Nethi'

// ─────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────
const selectors = {

    regionDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/EnvironmentPicker"]'
        ),
        ios: iOSLocatorBuilder.id('EnvironmentPicker'),
    } as TestBotElement,

    enrollDeviceButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        ),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    optionUnitedKingdom: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@resource-id="android:id/text1" and @text="United Kingdom"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypePickerWheel[@value="United Kingdom"]'
        ),
    } as TestBotElement,

    usernameField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.View[@resource-id="AccountLogin"]/android.view.View'
        ),
        ios: iOSLocatorBuilder.id('AccountLogin'),
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

    startWorkButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'
        ),
        ios: iOSLocatorBuilder.id('StartWorkButton'),
    } as TestBotElement,

    myCommunitiesTab: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="My Communities"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="My Communities"]'
        ),
    } as TestBotElement,
}

// ─────────────────────────────────────────────
// Helper — picker option by text
// ─────────────────────────────────────────────
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
// Suite
// ─────────────────────────────────────────────
describe('Care Delivery - Full Enrolment & Login Flow', () => {

    it('Step 1 - App opens to Welcome screen with region dropdown and disabled Enrol button', async () => {
        await driver.pause(4000)
        await testBot.waitUntilVisible(selectors.regionDropdown, 20000)
        await testBot.waitUntilVisible(selectors.enrollDeviceButton, 5000)
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(false)
    })

    it('Step 2 - Select United Kingdom and verify Enrol button becomes enabled', async () => {
        await testBot.click(selectors.regionDropdown)
        await driver.pause(1000)
        await testBot.waitUntilVisible(selectors.optionUnitedKingdom, 10000)
        await testBot.click(selectors.optionUnitedKingdom)
        await driver.pause(1000)
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 3 - Click Enrol device and land on Username page', async () => {
        await testBot.click(selectors.enrollDeviceButton)
        await driver.pause(5000)

        const contexts = await driver.getContexts()
        console.log('Available contexts:', contexts)

        const webviewContext = contexts.find((c: string) => c.includes('WEBVIEW'))
        if (webviewContext) {
            await driver.switchContext(webviewContext)
            console.log('Switched to WebView:', webviewContext)
        } else {
            console.warn('No WebView found — staying in NATIVE')
        }

        await testBot.waitUntilVisible(selectors.usernameField, 20000)
    })

    it('Step 4 - Enter username and navigate to PCS Terms page', async () => {
        await testBot.click(selectors.usernameField)
        await driver.pause(1000)
        await testBot.enterText(selectors.usernameField, USERNAME, false)
        await driver.pause(500)
        await driver.pressKeyCode(66)
        await driver.pause(2000)

        await driver.switchContext('NATIVE_APP')
        console.log('Switched back to NATIVE_APP')
        await driver.pause(3000)

        await testBot.waitUntilVisible(selectors.continueButton, 20000)
    })

    it('Step 5 - Click Continue and land on Password page', async () => {
        await testBot.click(selectors.continueButton)
        await driver.pause(2000)
        await testBot.waitUntilVisible(selectors.passwordField, 20000)
    })

    it('Step 6 - Enter password and navigate to Enrol page', async () => {
        await testBot.click(selectors.passwordField)
        await driver.pause(500)
        await testBot.enterText(selectors.passwordField, PASSWORD, false)
        await driver.pause(500)
        await testBot.click(selectors.identityLoginButton)
        await driver.pause(3000)

        await testBot.waitUntilVisible(selectors.organisationDropdown, 20000)
        await testBot.waitUntilVisible(selectors.locationDropdown, 5000)
        await testBot.waitUntilVisible(selectors.enrolButton, 5000)
    })

    it('Step 7 - Select Organisation and Location; verify Enrol button is enabled', async () => {
        await testBot.click(selectors.organisationDropdown)
        await driver.pause(1000)
        await testBot.waitUntilVisible(pickerOption(ORGANISATION), 10000)
        await testBot.click(pickerOption(ORGANISATION))
        await driver.pause(1000)

        await testBot.click(selectors.locationDropdown)
        await driver.pause(1000)
        await testBot.waitUntilVisible(pickerOption(LOCATION), 10000)
        await testBot.click(pickerOption(LOCATION))
        await driver.pause(1000)

        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 8 - Click Enrol and see Device Enrolled page with Logout button', async () => {
        await testBot.click(selectors.enrolButton)
        await testBot.waitUntilVisible(selectors.logoutButton, 30000)
    })

    it('Step 9 - Click Log Out and land on Log In page', async () => {
        await testBot.click(selectors.logoutButton)
        await driver.pause(2000)
        await testBot.waitUntilVisible(selectors.locationPickerLogin, 15000)
    })

    it('Step 10.1 - App opens on Username selection screen; Sign In button is disabled', async () => {
        await testBot.waitUntilVisible(selectors.userDropdown, 10000)
        await testBot.waitUntilVisible(selectors.signInButton, 5000)
        const signInBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        )
        const isEnabled = await signInBtn.isEnabled()
        expect(isEnabled).toBe(false)
    })

    it('Step 10.2 - Location field is populated with Kerr House', async () => {
        const locationEl = await $(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
        )
        const locationValue = await locationEl.getText()
        expect(locationValue).toContain(LOCATION)
    })

    it('Step 10.3 - Open user dropdown and verify users for selected location are shown', async () => {
        await testBot.click(selectors.userDropdown)
        await driver.pause(1000)
        await testBot.waitUntilVisible(pickerOption(USER), 10000)
        const isVisible = await testBot.isVisible(pickerOption(USER))
        expect(isVisible).toBe(true)
    })

    it('Step 10.4 - Select user and verify Sign In button becomes enabled', async () => {
        await testBot.click(pickerOption(USER))
        await driver.pause(1000)
        const signInBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        )
        const isEnabled = await signInBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 10.5 - Click Sign In and land on PCS Terms page', async () => {
        await testBot.click(selectors.signInButton)
        await driver.pause(3000)
        await testBot.waitUntilVisible(selectors.continueButton, 20000)
    })

    it('Step 10.6 - Click Continue and land on Password page', async () => {
        await testBot.click(selectors.continueButton)
        await driver.pause(2000)
        await testBot.waitUntilVisible(selectors.passwordField, 20000)
    })

    it('Step 10.7 - Enter password and click Log In', async () => {
        await testBot.click(selectors.passwordField)
        await driver.pause(500)
        await testBot.enterText(selectors.passwordField, PASSWORD, false)
        await driver.pause(500)
        await testBot.click(selectors.identityLoginButton)
        await driver.pause(3000)
    })

    it('Step 10.8 - User is taken to Select Communities page', async () => {
        // NB: Dump page source here so we can see
        // exactly what elements exist on this screen
        await driver.pause(2000)
        const pageSource = await driver.getPageSource()
        console.log('─────────── PAGE SOURCE AT STEP 10.8 ───────────')
        console.log(pageSource)
        console.log('──────────────────────────────────────────────')
    })

    it('Step 10.9 - Click Start Work and land on My Communities tab', async () => {
        await driver.pause(2000)

        // NB: Kerr House is selected by default —
        // we do NOT tap it, tapping would deselect it.
        // We just look for the Start Work button
        // and click it directly.

        // Try multiple possible resource-ids for
        // Start Work button in case the exact one
        // differs
        const possibleStartWorkSelectors = [
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]',
            '//android.widget.Button[contains(@text, "Start Work")]',
            '//android.widget.TextView[contains(@text, "Start Work")]',
        ]

        let startWorkEl = null
        for (const xpath of possibleStartWorkSelectors) {
            const el = await $(xpath)
            if (await el.isExisting()) {
                console.log(`Found Start Work button using: ${xpath}`)
                startWorkEl = el
                break
            }
        }

        if (!startWorkEl) {
            console.error('Start Work button not found with any selector')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT FAILURE ───────────')
            console.log(pageSource)
            console.log('───────────────────────────────────────────')
            throw new Error('Start Work button not found — see page source above for actual element structure')
        }

        await startWorkEl.waitForDisplayed({ timeout: 10000 })
        await startWorkEl.click()

        await testBot.waitUntilVisible(selectors.myCommunitiesTab, 15000)
    })

})
