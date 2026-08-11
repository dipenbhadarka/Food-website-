import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

// ─────────────────────────────────────────────
// Run mode detection — no manual file switching
// RUN_MODE is read from .env (local or browserstack)
// ─────────────────────────────────────────────
const isLocal = process.env.RUN_MODE === 'local'
console.log(`▶ Running in ${isLocal ? 'LOCAL PHYSICAL DEVICE' : 'BROWSERSTACK CLOUD'} mode`)

// ─────────────────────────────────────────────
// Test Data
// ─────────────────────────────────────────────
const USERNAME = 'a.nethi@personcentredsoftware.com'
const PASSWORD = 'PCSpassword@1'
const ORGANISATION = 'Person Centred Software'
const LOCATION = 'Kerr House'
const USER = 'Akhila Nethi'
const RESIDENT_NAME = 'Albie Armstrong'

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

    // Local physical device: the identity page renders natively and the
    // username input is exposed as an android.view.View under AccountLogin.
    usernameFieldLocal: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.View[@resource-id="AccountLogin"]/android.view.View'
        ),
        ios: iOSLocatorBuilder.id('AccountLogin'),
    } as TestBotElement,

    // BrowserStack cloud: the identity page renders as a WebView whose input
    // controls are surfaced to the native tree as EditText[@resource-id="Username"].
    usernameFieldBrowserStack: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.EditText[@resource-id="Username"]'
        ),
        ios: iOSLocatorBuilder.id('AccountLogin'),
    } as TestBotElement,

    // Explicit "Next" button on the WebView identity page (BrowserStack).
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

    // The selectable control on the Communities page is the clickable row
    // (the name TextView and the CheckBox itself do not toggle selection when
    // clicked directly via Appium). Used on BrowserStack where no community is
    // pre-selected.
    kerrHouseServiceUsersRow: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Kerr House / Service Users"]/ancestor::android.view.ViewGroup[@clickable="true"][1]'
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
        // NB: rendered as a TextView on the local device but as a Button on
        // BrowserStack, so match any element type by text.
        android: AndroidLocatorBuilder.xpath(
            '//*[@text="My Communities"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="My Communities"]'
        ),
    } as TestBotElement,
}

// ─────────────────────────────────────────────
// Resident Profile / Clinical Observations selectors
// ─────────────────────────────────────────────
const residentSelectors = {
    residentAlbieArmstrong: {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@text="${RESIDENT_NAME}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypeStaticText[@name="${RESIDENT_NAME}"]`
        ),
    } as TestBotElement,

    moreOptionButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/ProfilePage"]/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[4]/android.view.ViewGroup/android.widget.Button'
        ),
        ios: iOSLocatorBuilder.id('MoreOptionButton'),
    } as TestBotElement,

    clinicalTab: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/ProfilePage"]/android.view.ViewGroup/android.view.ViewGroup[3]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.Button'
        ),
        ios: iOSLocatorBuilder.id('ClinicalTab'),
    } as TestBotElement,

    observationsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Observations"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Observations"]'
        ),
    } as TestBotElement,

    expandArrowButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/ProfileClinicalPage"]/android.view.ViewGroup/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ImageView'
        ),
        ios: iOSLocatorBuilder.id('ExpandArrow'),
    } as TestBotElement,

    clinicalScrollView: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/ProfileClinicalPage"]/android.view.ViewGroup/android.widget.ScrollView'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeScrollView'
        ),
    } as TestBotElement,

    closeCrossButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/ProfilePage"]/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.Button'
        ),
        ios: iOSLocatorBuilder.id('CloseButton'),
    } as TestBotElement,
}

// Resolve the correct username-field locator for the current run mode.
// Local device and BrowserStack expose the identity page differently.
const usernameField: TestBotElement = isLocal
    ? selectors.usernameFieldLocal
    : selectors.usernameFieldBrowserStack

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
// Helpers — WebView switching (used only when
// running on BrowserStack, where the identity
// page may render as a WebView)
// ─────────────────────────────────────────────
async function switchToWebViewIfPresent(): Promise<boolean> {
    const contexts = await driver.getContexts()
    console.log('Available contexts:', contexts)
    const webviewContext = (contexts as string[]).find((c) => c.includes('WEBVIEW'))
    if (webviewContext) {
        await driver.switchContext(webviewContext)
        console.log('Switched to WebView:', webviewContext)
        return true
    }
    console.log('No WebView context found — staying NATIVE')
    return false
}

async function switchToNative(): Promise<void> {
    const contexts = await driver.getContexts()
    if ((contexts as string[]).includes('NATIVE_APP')) {
        await driver.switchContext('NATIVE_APP')
        console.log('Switched to NATIVE_APP')
    }
}

// ─────────────────────────────────────────────
// Helper — submit username field using whatever
// method works: native "Next" tap on physical
// device, or explicit WebView button / editor-action
// fallback on BrowserStack
// ─────────────────────────────────────────────
async function submitUsername(): Promise<void> {
    if (isLocal) {
        const nextButtonLocal = {
            android: AndroidLocatorBuilder.xpath(
                '//android.webkit.WebView[@text="Person Centred Software"]'
            ),
            ios: iOSLocatorBuilder.id('Next'),
        } as TestBotElement

        const el = await $(await (testBot as any).getLocatorTextForElement(nextButtonLocal))
        if (await el.isExisting()) {
            await testBot.click(nextButtonLocal)
            console.log('Submitted username via native Next tap (local device)')
            return
        }
    }

    if (!isLocal) {
        // BrowserStack: click the explicit WebView "Next" button instead of
        // relying on editor actions, which are unreliable inside the WebView.
        try {
            const nextEl = await $(await (testBot as any).getLocatorTextForElement(selectors.nextButton))
            if (await nextEl.isExisting()) {
                await testBot.click(selectors.nextButton)
                console.log('Submitted username via WebView Next button (BrowserStack)')
                return
            }
            console.warn('WebView Next button not found, falling back to editor actions')
        } catch (err) {
            console.warn('WebView Next button click failed, falling back:', err)
        }
    }

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
            await driver.execute('mobile: performEditorAction', { action: 'go' })
            submitted = true
            console.log('Submitted via performEditorAction: go')
        } catch (err) {
            console.warn('performEditorAction "go" failed:', err)
        }
    }

    if (!submitted) {
        try {
            await driver.execute('mobile: performEditorAction', { action: 'done' })
            submitted = true
            console.log('Submitted via performEditorAction: done')
        } catch (err) {
            console.warn('performEditorAction "done" failed:', err)
        }
    }

    if (!submitted) {
        const possibleNextSelectors = [
            '//android.widget.Button[contains(@text,"Next")]',
            '//android.widget.Button[contains(@text,"Continue")]',
            '//*[contains(@text,"Next")]',
        ]
        for (const xpath of possibleNextSelectors) {
            const el = await $(xpath)
            if (await el.isExisting()) {
                await el.click()
                submitted = true
                console.log(`Submitted via tapping element: ${xpath}`)
                break
            }
        }
    }

    if (!submitted) {
        console.error('Could not submit username with any method')
    }
}

// ─────────────────────────────────────────────
// Helper — robust picker selection with scroll
// fallback for BrowserStack cloud devices where
// the option may render off-screen or slower.
// Falls through direct click -> scroll-into-view
// -> generic text match, then dumps page source
// if all methods fail.
// ─────────────────────────────────────────────
async function selectPickerOptionRobust(value: string): Promise<void> {
    const option = pickerOption(value)

    // 1) Try direct visibility/click first — this is
    // what already works reliably on the local device
    try {
        await testBot.waitUntilVisible(option, 5000)
        await testBot.click(option)
        console.log(`Selected "${value}" directly`)
        return
    } catch (err) {
        console.warn(`Direct selection of "${value}" failed, trying scroll fallback`)
    }

    // 2) BrowserStack fallback — scroll the list to
    // bring the option into view using UiScrollable
    try {
        const scrolled = await $(
            'android=new UiScrollable(new UiSelector().scrollable(true).instance(0))' +
            `.scrollIntoView(new UiSelector().text("${value}"))`
        )
        if (await scrolled.isExisting()) {
            await scrolled.click()
            console.log(`Selected "${value}" via UiScrollable scroll`)
            return
        }
    } catch (err) {
        console.warn(`UiScrollable fallback for "${value}" failed:`, err)
    }

    // 3) Last resort — any element with matching text
    try {
        const anyText = await $(`//*[@text="${value}"]`)
        if (await anyText.isExisting()) {
            await anyText.click()
            console.log(`Selected "${value}" via generic text match`)
            return
        }
    } catch (err) {
        console.warn(`Generic text match for "${value}" failed:`, err)
    }

    // If all methods fail, dump page source for diagnosis
    console.error(`Could not select "${value}" with any method — dumping page source`)
    const pageSource = await driver.getPageSource()
    console.log(`─────────── PAGE SOURCE: PICKER "${value}" ───────────`)
    console.log(pageSource)
    console.log('─────────────────────────────────────────────')
    throw new Error(`Could not select picker option "${value}"`)
}

// ─────────────────────────────────────────────
// Suite 1 — Enrolment & Login Flow
// ─────────────────────────────────────────────
describe('Care Delivery - Full Enrolment & Login Flow', () => {

    it('Step 1 - App opens to Welcome screen with region dropdown and disabled Enrol button', async () => {
        await driver.pause(3000)
        await testBot.waitUntilVisible(selectors.regionDropdown, 15000)
        await testBot.waitUntilVisible(selectors.enrollDeviceButton, 5000)
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(false)
    })

    it('Step 2 - Select United Kingdom and verify Enrol button becomes enabled', async () => {
        await testBot.click(selectors.regionDropdown)
        await testBot.waitUntilVisible(selectors.optionUnitedKingdom, 10000)
        await testBot.click(selectors.optionUnitedKingdom)
        const enrolBtn = await $(
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'
        )
        const isEnabled = await enrolBtn.isEnabled()
        expect(isEnabled).toBe(true)
    })

    it('Step 3 - Click Enrol device and land on Username page', async () => {
        await testBot.click(selectors.enrollDeviceButton)
        await driver.pause(isLocal ? 3000 : 5000)

        // NB: Do NOT switch to a WEBVIEW context on BrowserStack. The identity
        // page WebView exposes its inputs to the native tree, so we stay in the
        // NATIVE context and locate them by resource-id. Switching contexts here
        // makes the native xpath locators unfindable and breaks Step 4 onward.

        try {
            await testBot.waitUntilVisible(usernameField, 20000)
        } catch (err) {
            console.error('Username field not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 3 ───────────')
            console.log(pageSource)
            console.log('──────────────────────────────────────────')
            throw err
        }
    })

    it('Step 4 - Enter username and navigate to PCS Terms page', async () => {
        await testBot.click(usernameField)
        await testBot.enterText(usernameField, USERNAME, false)
        await driver.pause(500)

        await submitUsername()

        await driver.pause(isLocal ? 2000 : 3000)

        try {
            await testBot.waitUntilVisible(selectors.continueButton, 20000)
        } catch (err) {
            console.error('Continue button not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 4 ───────────')
            console.log(pageSource)
            console.log('──────────────────────────────────────────')
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

        // NB: Dismiss keyboard first — it may be
        // covering the Login button, causing the
        // click to silently miss on physical device
        try {
            await driver.hideKeyboard()
            await driver.pause(1000)
            console.log('Keyboard dismissed')
        } catch (err) {
            console.warn('hideKeyboard failed or keyboard already hidden:', err)
        }

        try {
            await testBot.waitUntilVisible(selectors.identityLoginButton, 10000)
        } catch (err) {
            console.error('Identity Login button not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 6 (before click) ───────────')
            console.log(pageSource)
            console.log('────────────────────────────────────────────────────────')
            throw err
        }

        await testBot.click(selectors.identityLoginButton)
        await driver.pause(3000)

        try {
            await testBot.waitUntilVisible(selectors.organisationDropdown, 20000)
            await testBot.waitUntilVisible(selectors.locationDropdown, 5000)
            await testBot.waitUntilVisible(selectors.enrolButton, 5000)
        } catch (err) {
            console.error('Enrol page did not load after clicking Login — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 6 (after click) ───────────')
            console.log(pageSource)
            console.log('───────────────────────────────────────────────────────')
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

    it('Step 10.3 - Open user dropdown and verify users for selected location are shown', async () => {
        await testBot.click(selectors.userDropdown)
        await driver.pause(1000)
        await testBot.waitUntilVisible(pickerOption(USER), 10000)
        const isVisible = await testBot.isVisible(pickerOption(USER))
        expect(isVisible).toBe(true)
    })

    it('Step 10.4 - Select user and verify Sign In button becomes enabled', async () => {
        await selectPickerOptionRobust(USER)
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

        try {
            await driver.hideKeyboard()
            await driver.pause(1000)
        } catch (err) {
            console.warn('hideKeyboard failed or keyboard already hidden:', err)
        }

        await testBot.waitUntilVisible(selectors.identityLoginButton, 10000)
        await testBot.click(selectors.identityLoginButton)
        await driver.pause(3000)
    })

    it('Step 10.8 - User is taken to Select Communities page', async () => {
        await testBot.waitUntilVisible(selectors.kerrHouseServiceUsers, 20000)
    })

    it('Step 10.9 - Click Start Work and land on My Communities tab', async () => {
        const startWorkXpath =
            '//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'

        // NB: On the local physical device the "Kerr House / Service Users"
        // community is already ticked by default, so selecting it would UN-tick
        // it. On BrowserStack it is NOT pre-selected — the Start Work button
        // stays disabled until a community is selected. Tapping the clickable
        // row (not the CheckBox, which does not toggle via Appium) selects it.
        if (!isLocal) {
            const startBtn = await $(startWorkXpath)
            if (!(await startBtn.isEnabled())) {
                await testBot.click(selectors.kerrHouseServiceUsersRow)
                await driver.pause(1000)
            }
            await startBtn.waitForEnabled({ timeout: 10000 }).catch(() => {
                console.warn('Start Work still disabled after community selection')
            })
        }

        await testBot.waitUntilVisible(selectors.startWorkButton, 10000)
        await testBot.click(selectors.startWorkButton)

        try {
            await testBot.waitUntilVisible(selectors.myCommunitiesTab, 30000)
        } catch (err) {
            console.error('My Communities tab not found after Start Work — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 10.9 ───────────')
            console.log(pageSource)
            console.log('────────────────────────────────────────────────')
            throw err
        }
    })

})

// ─────────────────────────────────────────────
// Suite 2 — Resident Profile Clinical Observations Flow
// (continues after Suite 1 lands on My Communities tab)
// ─────────────────────────────────────────────
describe('Care Delivery - Resident Profile Clinical Observations Flow', () => {

    it('Step 11 - Select resident "Albie Armstrong" from the community list', async () => {
        await testBot.waitUntilVisible(residentSelectors.residentAlbieArmstrong, 20000)
        await testBot.click(residentSelectors.residentAlbieArmstrong)
        await driver.pause(2000)
    })

    it('Step 12 - Tap the more options button on the resident profile', async () => {
        try {
            await testBot.waitUntilVisible(residentSelectors.moreOptionButton, 15000)
            await testBot.click(residentSelectors.moreOptionButton)
            await driver.pause(1500)
        } catch (err) {
            console.error('More option button click failed — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 12 (more option) ───────────')
            console.log(pageSource)
            console.log('───────────────────────────────────────────────────────')
            throw err
        }
    })

    it('Step 13 - Tap the Clinical tab', async () => {
        try {
            await testBot.waitUntilVisible(residentSelectors.clinicalTab, 15000)
            await testBot.click(residentSelectors.clinicalTab)
            await driver.pause(1500)
        } catch (err) {
            console.error('Clinical tab click failed — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 13 (clinical tab) ───────────')
            console.log(pageSource)
            console.log('────────────────────────────────────────────────────────')
            throw err
        }
    })

    it('Step 14 - Tap Observations', async () => {
        try {
            await testBot.waitUntilVisible(residentSelectors.observationsButton, 15000)
            await testBot.click(residentSelectors.observationsButton)
            await driver.pause(1500)
        } catch (err) {
            console.error('Observations button click failed — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 14 (observations) ───────────')
            console.log(pageSource)
            console.log('────────────────────────────────────────────────────────')
            throw err
        }
    })

    it('Step 15 - Tap the arrow to expand the observation section and scroll to see all content', async () => {
        try {
            await testBot.waitUntilVisible(residentSelectors.expandArrowButton, 15000)

            // NB: This arrow TOGGLES the section — first tap
            // opens it, a second tap would close it again.
            // We only tap once here to open it.
            await testBot.click(residentSelectors.expandArrowButton)
            await driver.pause(1500)

            // Scroll down within the clinical page's scroll
            // view to reveal all the expanded content
            try {
                const scrollViewEl = await $(
                    await (testBot as any).getLocatorTextForElement(residentSelectors.clinicalScrollView)
                )
                await driver.execute('mobile: scrollGesture', {
                    elementId: scrollViewEl.elementId,
                    direction: 'down',
                    percent: 0.75,
                })
                console.log('Scrolled down within clinical scroll view')
                await driver.pause(1000)
            } catch (err) {
                console.warn('scrollGesture on scroll view failed, trying generic swipe:', err)
                const { width, height } = await driver.getWindowSize()
                await driver.execute('mobile: swipeGesture', {
                    left: Math.floor(width * 0.2),
                    top: Math.floor(height * 0.7),
                    width: Math.floor(width * 0.6),
                    height: Math.floor(height * 0.4),
                    direction: 'up',
                    percent: 0.75,
                })
                console.log('Performed fallback swipe to scroll content')
                await driver.pause(1000)
            }

        } catch (err) {
            console.error('Expand arrow click or scroll failed — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 15 (expand arrow) ───────────')
            console.log(pageSource)
            console.log('────────────────────────────────────────────────────────')
            throw err
        }
    })

    it('Step 16 - Close the resident profile via the cross/close button', async () => {
        try {
            await testBot.waitUntilVisible(residentSelectors.closeCrossButton, 15000)
            await testBot.click(residentSelectors.closeCrossButton)
            await driver.pause(1000)
        } catch (err) {
            console.error('Close button click failed — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 16 (close button) ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────────────────────')
            throw err
        }
    })

})
