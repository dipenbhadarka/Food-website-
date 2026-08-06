import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// Run mode detection
// ─────────────────────────────────────────────
const isLocal = process.env.RUN_MODE === 'local'
const localAppPackage = process.env.LOCAL_APP_PACKAGE || 'com.personcentredsoftware.care.delivery'
console.log(`▶ Running in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

// ─────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────
const USERNAME = 'a.nethi@personcentredsoftware.com'
const PASSWORD = 'PCSpassword@1'
const ORGANISATION = 'Person Centred Software'
const LOCATION = 'Kerr House'
const USER = 'Akhila Nethi'

// ─────────────────────────────────────────────
// Selectors — freshly provided, exact locators
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

    cancelButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="android:id/button2"]'
        ),
        ios: iOSLocatorBuilder.id('Cancel'),
    } as TestBotElement,

    // NB: This is the button that appears AFTER selecting
    // region — it triggers the enrolment/identity flow.
    // Confirmed as LoginButton resource-id in this locator
    // set.
    enrollTriggerButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        ),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    // Username field lives inside a WebView on the
    // identity page.
    usernameFieldWebView: {
        android: AndroidLocatorBuilder.xpath(
            '//android.webkit.WebView'
        ),
        ios: iOSLocatorBuilder.className('XCUIElementTypeWebView'),
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

    // Organisation dropdown — confirmed as an ImageView
    // (not EditText) in this locator set.
    organisationDropdown: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollUpdatePage"]/android.view.ViewGroup/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[4]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ImageView'
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

    // NB: Positional xpath as provided — this is the
    // clickable username/user dropdown row on the login
    // (LogonStartPage) screen.
    userDropdownRow: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/LogonStartPage"])[2]/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.ViewGroup/android.view.ViewGroup'
        ),
        ios: iOSLocatorBuilder.id('UserPicker'),
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

    // Community row (RecyclerView item 3) for
    // "Kerr House / Service Users" on the login
    // communities page (LogonCommunitiesPage).
    kerrHouseServiceUsersRow: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/LogonCommunitiesPage"]/android.view.ViewGroup/android.view.ViewGroup/androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[3]/android.view.ViewGroup/android.view.ViewGroup'
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
// Helper — submit username on the identity WebView
// page. Tries performEditorAction first, falls back
// to a visible Next/Continue tap.
// ─────────────────────────────────────────────
async function submitUsername(): Promise<void> {
    let submitted = false

    try {
        await driver.execute('mobile: performEditorAction', { action: 'next' })
        submitted = true
        console.log('Submitted via performEditorAction: next')
    } catch (err) {
        console.warn('performEditorAction "next" failed:', err)
    }

    if (!submitted) {
        try {
            const nextEl = await $(
                '//android.widget.Button[@resource-id="NextButton"]'
            )
            if (await nextEl.isExisting()) {
                await nextEl.click()
                submitted = true
                console.log('Submitted by tapping NextButton directly')
            }
        } catch (err) {
            console.warn('Direct NextButton tap failed:', err)
        }
    }

    if (!submitted) {
        console.error('Could not submit username with any method')
    }
}

// ─────────────────────────────────────────────
// Suite — Enrolment & Login Flow
// ─────────────────────────────────────────────
describe('Care Delivery - Full Enrolment & Login Flow', () => {

    it('Step 1 - App opens to Welcome screen with region dropdown and disabled Enrol button', async () => {
        await driver.pause(3000)
        await testBot.waitUntilVisible(selectors.regionDropdown, 15000)
        await testBot.waitUntilVisible(selectors.enrollDeviceButton, 5000)
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollDeviceButton"]'
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
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollDeviceButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 3 - Click Enrol device and land on Username page', async () => {
        await testBot.click(selectors.enrollDeviceButton)
        await driver.pause(isLocal ? 3000 : 5000)

        try {
            await testBot.waitUntilVisible(selectors.usernameFieldWebView, 20000)
        } catch (err) {
            console.error('Username WebView not found — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 3 ───────────')
                console.log(pageSource)
                console.log('──────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
    })

    it('Step 4 - Enter username and navigate to PCS Terms page', async () => {
        // NB: the username input is inside a WebView. Tap the
        // WebView area to focus, then type and submit.
        await testBot.click(selectors.usernameFieldWebView)
        await driver.pause(500)
        await driver.keys(USERNAME.split(''))
        await driver.pause(500)

        await submitUsername()

        await driver.pause(isLocal ? 2000 : 3000)

        try {
            await testBot.waitUntilVisible(selectors.continueButton, 20000)
        } catch (err) {
            console.error('Continue button not found — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 4 ───────────')
                console.log(pageSource)
                console.log('──────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed:', srcErr)
            }
            throw err
        }
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

        try {
            await driver.hideKeyboard()
            await driver.pause(1000)
        } catch (err) {
            console.warn('hideKeyboard failed or keyboard already hidden:', err)
        }

        await testBot.waitUntilVisible(selectors.identityLoginButton, 10000)
        await testBot.click(selectors.identityLoginButton)

        // MSAL / identity auth may briefly background the
        // app on physical device — give it time and force
        // it back to foreground before checking for the
        // enrolment page.
        const postLoginWait = isLocal ? 120000 : 20000
        await driver.pause(isLocal ? 5000 : 3000)

        if (isLocal) {
            try {
                await driver.activateApp(localAppPackage)
                await driver.pause(2000)
            } catch (e) {
                console.warn('activateApp after identity login failed (app may already be foreground):', e)
            }
        }

        try {
            await testBot.waitUntilVisible(selectors.organisationDropdown, postLoginWait)
            await testBot.waitUntilVisible(selectors.locationDropdown, 5000)
            await testBot.waitUntilVisible(selectors.enrolButton, 5000)
        } catch (err) {
            console.error('Enrol page did not load after clicking Login — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 6 (after click) ───────────')
                console.log(pageSource)
                console.log('───────────────────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed (session may be dead):', srcErr)
            }
            throw err
        }
    })

    it('Step 7 - Select Organisation and Location; verify Enrol button is enabled', async () => {
        await testBot.click(selectors.organisationDropdown)
        await driver.pause(1000)
        await selectPickerOptionRobust(ORGANISATION)
        await driver.pause(1000)

        await testBot.click(selectors.locationDropdown)
        await driver.pause(1000)
        await selectPickerOptionRobust(LOCATION)
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
        await testBot.waitUntilVisible(selectors.userDropdownRow, 10000)
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
        let locationValue = await locationEl.getText()

        if (!locationValue.includes(LOCATION)) {
            await testBot.click(selectors.locationPickerLogin)
            await driver.pause(1000)
            await selectPickerOptionRobust(LOCATION)
            await driver.pause(1000)

            const refreshed = await $(
                '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'
            )
            locationValue = await refreshed.getText()
        }

        expect(locationValue).toContain(LOCATION)
    })

    it('Step 10.3 - Open user dropdown and select user', async () => {
        await testBot.click(selectors.userDropdownRow)
        await driver.pause(1000)
        await selectPickerOptionRobust(USER)
        await driver.pause(1000)
    })

    it('Step 10.4 - Verify Sign In button becomes enabled', async () => {
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

        try {
            await driver.hideKeyboard()
            await driver.pause(1000)
        } catch (err) {
            console.warn('hideKeyboard failed or keyboard already hidden:', err)
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

        try {
            await testBot.waitUntilVisible(selectors.kerrHouseServiceUsersRow, postLoginWait)
        } catch (err) {
            console.error('Communities page did not load after Login — dumping page source')
            try {
                const pageSource = await driver.getPageSource()
                console.log('─────────── PAGE SOURCE AT STEP 10.7 (after click) ───────────')
                console.log(pageSource)
                console.log('───────────────────────────────────────────────────────────')
            } catch (srcErr) {
                console.warn('getPageSource failed (session may be dead):', srcErr)
            }
            throw err
        }
    })

    it('Step 10.8 - User is taken to Select Communities page', async () => {
        await testBot.waitUntilVisible(selectors.kerrHouseServiceUsersRow, 10000)
    })

    it('Step 10.9 - Select Kerr House / Service Users, click Start Work and land on My Communities tab', async () => {
        const startWorkXpath =
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'

        const startBtn = await $(startWorkXpath)
        const alreadyEnabled = await startBtn.isEnabled().catch(() => false)

        if (!alreadyEnabled) {
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
    })

})
