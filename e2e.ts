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

    // ── Welcome / Landing screen ──────────────
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

    // ── Region picker options ─────────────────
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

    // ── Identity / Username page (WebView) ────
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

    // ── PCS Terms page ────────────────────────
    continueButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="ContinueButton"]'
        ),
        ios: iOSLocatorBuilder.id('ContinueButton'),
    } as TestBotElement,

    // ── Password page ─────────────────────────
    passwordField: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="Password"]'
        ),
        ios: iOSLocatorBuilder.id('Password'),
    } as TestBotElement,

    forgotPassword: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Forgot Password?"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Forgot Password?"]'
        ),
    } as TestBotElement,

    keepMeLoggedIn: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.CheckBox[@resource-id="RememberLogin"]'
        ),
        ios: iOSLocatorBuilder.id('RememberLogin'),
    } as TestBotElement,

    loginButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="LoginButton"]'
        ),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    // ── Enrol page ────────────────────────────
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

    // ── Device Enrolled page ──────────────────
    logoutButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LogoutButton"]'
        ),
        ios: iOSLocatorBuilder.id('LogoutButton'),
    } as TestBotElement,

    // ── Log In page (post-enrolment) ──────────
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

    // ── Communities page ──────────────────────
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

    // ── Step 1: Welcome screen ─────────────────
    it('Step 1 - App opens to Welcome screen with region dropdown and disabled Enrol button', async () => {
        // Wait for splash screen to finish
        await driver.pause(3000)

        // Region dropdown should be visible
        await testBot.waitUntilVisible(selectors.regionDropdown, 15000)

        // Enrol button should be visible but disabled
        await testBot.waitUntilVisible(selectors.enrollDeviceButton, 5000)
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(false)
    })

    // ── Step 2: Select United Kingdom ──────────
    it('Step 2 - Select United Kingdom and verify Enrol button becomes enabled', async () => {
        // Open region dropdown
        await testBot.click(selectors.regionDropdown)

        // Wait for picker and select UK
        await testBot.waitUntilVisible(selectors.optionUnitedKingdom, 10000)
        await testBot.click(selectors.optionUnitedKingdom)

        // Enrol button should now be enabled
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    // ── Step 3: Click Enrol device ─────────────
    it('Step 3 - Click Enrol device and land on Username page', async () => {
        await testBot.click(selectors.enrollDeviceButton)

        // Identity username page should load
        await testBot.waitUntilVisible(selectors.usernameField, 15000)
    })

    // ── Step 4: Enter username ──────────────────
    it('Step 4 - Enter username and navigate to PCS Terms page', async () => {
        await testBot.click(selectors.usernameField)
        await testBot.enterText(selectors.usernameField, USERNAME)
        await testBot.click(selectors.nextButton)

        // PCS Terms page — Continue button should appear
        await testBot.waitUntilVisible(selectors.continueButton, 15000)
    })

    // ── Step 5: Click Continue ─────────────────
    it('Step 5 - Click Continue and land on Password page', async () => {
        await testBot.click(selectors.continueButton)

        // Password page should load
        await testBot.waitUntilVisible(selectors.passwordField, 15000)
    })

    // ── Step 6: Enter password ─────────────────
    it('Step 6 - Enter password and navigate to Enrol page', async () => {
        await testBot.enterText(selectors.passwordField, PASSWORD)
        await testBot.click(selectors.loginButton)

        // Enrol page — organisation and location dropdowns should appear
        await testBot.waitUntilVisible(selectors.organisationDropdown, 15000)
        await testBot.waitUntilVisible(selectors.locationDropdown, 5000)
        await testBot.waitUntilVisible(selectors.enrolButton, 5000)
    })

    // ── Step 7: Select Organisation & Location ──
    it('Step 7 - Select Organisation and Location; verify Enrol button is enabled', async () => {
        // Serial number and device name are left blank — no action needed

        // Select Organisation
        await testBot.click(selectors.organisationDropdown)
        await testBot.waitUntilVisible(pickerOption(ORGANISATION), 10000)
        await testBot.click(pickerOption(ORGANISATION))

        // Select Location
        await testBot.click(selectors.locationDropdown)
        await testBot.waitUntilVisible(pickerOption(LOCATION), 10000)
        await testBot.click(pickerOption(LOCATION))

        // Enrol button should now be enabled
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    // ── Step 8: Click Enrol ────────────────────
    it('Step 8 - Click Enrol and see Device Enrolled page with Logout button', async () => {
        await testBot.click(selectors.enrolButton)

        // Device Enrolled page — Logout button should appear
        await testBot.waitUntilVisible(selectors.logoutButton, 20000)
    })

    // ── Step 9: Click Log Out ──────────────────
    it('Step 9 - Click Log Out and land on Log In page', async () => {
        await testBot.click(selectors.logoutButton)

        // Log In page — location dropdown should be visible
        await testBot.waitUntilVisible(selectors.locationPickerLogin, 15000)
    })

    // ── Step 10.1 ─────────────────────────────
    it('Step 10.1 - App opens on Username selection screen; Sign In button is disabled', async () => {
        await testBot.waitUntilVisible(selectors.userDropdown, 10000)
        await testBot.waitUntilVisible(selectors.signInButton, 5000)

        const signInBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        )
        const isEnabled = await signInBtn.isEnabled()
        expect(isEnabled).toBe(false)
    })

    // ── Step 10.2 ─────────────────────────────
    it('Step 10.2 - Location field is populated with Kerr House', async () => {
        const locationEl = await $(
            '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
        )
        const locationValue = await locationEl.getText()
        expect(locationValue).toContain(LOCATION)
    })

    // ── Step 10.3 ─────────────────────────────
    it('Step 10.3 - Open user dropdown and verify users for selected location are shown', async () => {
        await testBot.click(selectors.userDropdown)

        // Akhila Nethi should be visible in the list
        await testBot.waitUntilVisible(pickerOption(USER), 10000)
        const isVisible = await testBot.isVisible(pickerOption(USER))
        expect(isVisible).toBe(true)
    })

    // ── Step 10.4 ─────────────────────────────
    it('Step 10.4 - Select user and verify Sign In button becomes enabled', async () => {
        await testBot.click(pickerOption(USER))

        const signInBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'
        )
        const isEnabled = await signInBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    // ── Step 10.5 ─────────────────────────────
    it('Step 10.5 - Click Sign In and land on PCS Terms page', async () => {
        await testBot.click(selectors.signInButton)
        await testBot.waitUntilVisible(selectors.continueButton, 15000)
    })

    // ── Step 10.6 ─────────────────────────────
    it('Step 10.6 - Click Continue and land on Password page', async () => {
        await testBot.click(selectors.continueButton)
        await testBot.waitUntilVisible(selectors.passwordField, 15000)
    })

    // ── Step 10.7 ─────────────────────────────
    it('Step 10.7 - Enter password and verify it is hidden', async () => {
        await testBot.enterText(selectors.passwordField, PASSWORD)

        // Verify password field is a secure/password type
        const pwField = await $(
            '//android.widget.EditText[@resource-id="Password"]'
        )
        const inputType = await pwField.getAttribute('password')
        expect(inputType).toBeTruthy()

        await testBot.click(selectors.loginButton)
    })

    // ── Step 10.8 ─────────────────────────────
    it('Step 10.8 - User is taken to Select Communities page', async () => {
        await testBot.waitUntilVisible(selectors.kerrHouseServiceUsers, 20000)
    })

    // ── Step 10.9 ─────────────────────────────
    it('Step 10.9 - Select Kerr House community, click Start Work and land on My Communities tab', async () => {
        await testBot.click(selectors.kerrHouseServiceUsers)
        await testBot.waitUntilVisible(selectors.startWorkButton, 5000)
        await testBot.click(selectors.startWorkButton)

        // My Communities tab should now be visible
        await testBot.waitUntilVisible(selectors.myCommunitiesTab, 15000)
    })

})
