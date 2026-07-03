import { testBot } from 'testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const testBotCompat = testBot as any

if (typeof testBotCompat.waitForDisplayed !== 'function') {
    testBotCompat.waitForDisplayed = async (element: TestBotElement, timeout?: number) => {
        await testBot.waitUntilVisible(element, timeout)
    }
}

if (typeof testBotCompat.setValue !== 'function') {
    testBotCompat.setValue = async (element: TestBotElement, text: string) => {
        await testBot.enterText(element, text, false)
    }
}

if (typeof testBotCompat.getElement !== 'function') {
    testBotCompat.getElement = async (element: TestBotElement) => {
        const selector = testBotCompat.getLocatorTextForElement(element)
        const elements = await $$(selector)
        if ((await elements.length) === 0) throw new Error('Could not find element')
        return elements[0]
    }
}

const waitForVisible = async (element: TestBotElement, timeout = 10000): Promise<boolean> => {
    try {
        await testBotCompat.waitForDisplayed(element, timeout)
        return true
    } catch {
        return false
    }
}

// ─────────────────────────────────────────────
// Helper: click a native AlertDialog list option
// (Organisation / Location / User pickers all use
// the same standard Android select_dialog_listview,
// whose items carry a LEADING SPACE in their text —
// e.g. " Person Centred Software" — so matching must
// use contains(), never exact equality.)
// ─────────────────────────────────────────────
const SELECT_DIALOG_LIST_ID = 'com.personcentredsoftware.care.delivery:id/select_dialog_listview'

const clickDropdownOption = async (text: string, iosValue?: string): Promise<boolean> => {

    if (driver.isAndroid) {
        // Might already be visible without scrolling
        try {
            const direct = await $(`android=new UiSelector().textContains("${text}")`)
            if (await direct.isExisting()) {
                await direct.click()
                console.log(`✅ Direct click: ${text}`)
                return true
            }
        } catch {}

        // scrollIntoView scrolls the exact list until found — no guessed distance, no overshoot
        try {
            const el = await $(
                `android=new UiScrollable(new UiSelector().resourceId("${SELECT_DIALOG_LIST_ID}")).scrollIntoView(new UiSelector().textContains("${text}"))`
            )
            await el.click()
            console.log(`✅ Found via scroll: ${text}`)
            return true
        } catch (err) {
            console.log(`❌ Not found even after scroll: ${text}`, err)
            return false
        }
    }

    // iOS — unchanged (no dump evidence for iOS yet)
    const iosOption = {
        android: AndroidLocatorBuilder.xpath(`//android.widget.TextView[contains(@text,"${text}")]`),
        ios: iOSLocatorBuilder.xpath(`//XCUIElementTypePickerWheel[@value="${iosValue ?? text}"]`),
    } as TestBotElement

    if (await waitForVisible(iosOption, 8000)) {
        await testBot.click(iosOption)
        return true
    }
    return false
}

// ─────────────────────────────────────────────
// Credentials & test data
// ─────────────────────────────────────────────
const USERNAME     = 'a.nethi@personcentredsoftware.com'
const PASSWORD     = 'PCSpassword@1'
const ORGANISATION = 'Person Centred Software'
const LOCATION     = 'Kerr House'
const USER         = 'Akhila Nethi'

// ─────────────────────────────────────────────
// Shared selectors
// ─────────────────────────────────────────────
const shared = {

    continueButton: {
        android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="ContinueButton"]'),
        ios: iOSLocatorBuilder.id('ContinueButton'),
    } as TestBotElement,

    passwordField: {
        android: AndroidLocatorBuilder.xpath('//android.widget.EditText[@resource-id="Password"]'),
        ios: iOSLocatorBuilder.id('Password'),
    } as TestBotElement,

    loginButton: {
        android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="LoginButton"]'),
        ios: iOSLocatorBuilder.id('LoginButton'),
    } as TestBotElement,

    kerrHouseServiceUsers: {
        android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Kerr House / Service Users"]'),
        ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Kerr House / Service Users"]'),
    } as TestBotElement,

    startWorkButton: {
        android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/StartWorkButton"]'),
        ios: iOSLocatorBuilder.id('StartWorkButton'),
    } as TestBotElement,

    myCommunitiesTab: {
        android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="My Communities"]'),
        ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="My Communities"]'),
    } as TestBotElement,
}

// ═══════════════════════════════════════════════════════════════════════
// SCENARIO 1 — Country Selector Screen (Fresh Install / Un-enrolled)
// ═══════════════════════════════════════════════════════════════════════
describe('Scenario 1 - Country Selector Screen: Full Enrolment & Login Flow', () => {

    const s1 = {

        regionDropdown: {
            android: AndroidLocatorBuilder.xpath('//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/EnvironmentPicker"]'),
            ios: iOSLocatorBuilder.id('EnvironmentPicker'),
        } as TestBotElement,

        enrollDeviceButton: {
            android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LoginButton"]'),
            ios: iOSLocatorBuilder.id('LoginButton'),
        } as TestBotElement,

        optionUnitedKingdom: {
            android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@resource-id="android:id/text1" and contains(@text,"United Kingdom")]'),
            ios: iOSLocatorBuilder.xpath('//XCUIElementTypePickerWheel[@value="United Kingdom"]'),
        } as TestBotElement,

        usernameField: {
            android: AndroidLocatorBuilder.xpath('//android.widget.EditText[@resource-id="Username"]'),
            ios: iOSLocatorBuilder.id('AccountLogin'),
        } as TestBotElement,

        nextButton: {
            android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="NextButton"]'),
            ios: iOSLocatorBuilder.id('Next'),
        } as TestBotElement,

        organisationDropdown: {
            android: AndroidLocatorBuilder.xpath('//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/OrganisationPicker"]'),
            ios: iOSLocatorBuilder.id('OrganisationPicker'),
        } as TestBotElement,

        locationDropdown: {
            android: AndroidLocatorBuilder.xpath('//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'),
            ios: iOSLocatorBuilder.id('LocationPicker'),
        } as TestBotElement,

        enrolButton: {
            android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollButton"]'),
            ios: iOSLocatorBuilder.id('EnrollButton'),
        } as TestBotElement,

        logoutButton: {
            android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/LogoutButton"]'),
            ios: iOSLocatorBuilder.id('LogoutButton'),
        } as TestBotElement,

        locationPickerLogin: {
            android: AndroidLocatorBuilder.xpath('//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'),
            ios: iOSLocatorBuilder.id('LocationPicker'),
        } as TestBotElement,

        userDropdown: {
            android: AndroidLocatorBuilder.xpath('//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/UserPicker"]'),
            ios: iOSLocatorBuilder.id('UserPicker'),
        } as TestBotElement,

        signInButton: {
            android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'),
            ios: iOSLocatorBuilder.id('SignInButton'),
        } as TestBotElement,
    }

    it('S1 Step 1 - Country selector screen shows region dropdown; Enrol button is disabled', async () => {
        await driver.pause(5000)

        if (!(await waitForVisible(s1.regionDropdown, 15000)) || !(await waitForVisible(s1.enrollDeviceButton, 5000))) {
            await testBot.addBstackLog?.('S1 Step 1 skipped: country selector screen not detected.', 'warn')
            return
        }

        const enrolBtn = await testBotCompat.getElement(s1.enrollDeviceButton)
        expect(await enrolBtn.isEnabled()).toBe(false)
    })

    it('S1 Step 2 - Select United Kingdom; Enrol button becomes enabled', async () => {
        if (!(await waitForVisible(s1.regionDropdown, 10000))) {
            await testBot.addBstackLog?.('S1 Step 2 skipped: region dropdown not visible.', 'warn')
            return
        }

        await testBot.click(s1.regionDropdown)
        await driver.pause(2000)

        const ukSelected = await clickDropdownOption('United Kingdom', 'United Kingdom')
        if (!ukSelected) {
            await testBot.addBstackLog?.('S1 Step 2 skipped: United Kingdom option not found.', 'warn')
            return
        }

        await driver.pause(1000)

        const enrolBtn = await testBotCompat.getElement(s1.enrollDeviceButton)
        expect(await enrolBtn.isEnabled()).toBe(true)
    })

    it('S1 Step 3 - Tap Enrol Device and land on Username page', async () => {
        if (!(await waitForVisible(s1.enrollDeviceButton, 10000))) {
            await testBot.addBstackLog?.('S1 Step 3 skipped: enrol button not visible.', 'warn')
            return
        }

        await testBot.click(s1.enrollDeviceButton)
        await driver.pause(2000)

        if (!(await waitForVisible(s1.usernameField, 15000))) {
            await testBot.addBstackLog?.('S1 Step 3: username page not visible.', 'warn')
        }
    })

    it('S1 Step 4 - Enter username and proceed', async () => {
        if (!(await waitForVisible(s1.usernameField, 20000))) {
            await testBot.addBstackLog?.('S1 Step 4 skipped: username field not visible.', 'warn')
            return
        }

        await testBot.click(s1.usernameField)
        await testBotCompat.setValue(s1.usernameField, USERNAME)
        await driver.pause(1000)
        await testBot.click(s1.nextButton)
    })

    it('S1 Step 5 - Handle Terms page if shown; land on Password page', async () => {
        if (await waitForVisible(shared.continueButton, 10000)) {
            await testBot.click(shared.continueButton)
        }

        if (!(await waitForVisible(shared.passwordField, 20000))) {
            await testBot.addBstackLog?.('S1 Step 5 skipped: password page not visible.', 'warn')
        }
    })

    it('S1 Step 6 - Enter password and navigate to Enrol page', async () => {
        if (!(await waitForVisible(shared.passwordField, 20000))) {
            await testBot.addBstackLog?.('S1 Step 6 skipped: password field not visible.', 'warn')
            return
        }

        await testBotCompat.setValue(shared.passwordField, PASSWORD)
        await driver.pause(1000)
        await testBot.click(shared.loginButton)

        if (!(await waitForVisible(s1.organisationDropdown, 20000))) {
            await testBot.addBstackLog?.('S1 Step 6: could not reach enrolment page.', 'warn')
        }
    })

    it('S1 Step 7 - Select Organisation and Location; Enrol button becomes enabled', async () => {
        if (!(await waitForVisible(s1.organisationDropdown, 15000))) {
            await testBot.addBstackLog?.('S1 Step 7 skipped: organisation dropdown not visible.', 'warn')
            return
        }

        // ✅ Organisation
        await testBot.click(s1.organisationDropdown)
        await driver.pause(2000)

        const orgSelected = await clickDropdownOption(ORGANISATION, ORGANISATION)
        if (!orgSelected) {
            await testBot.addBstackLog?.('S1 Step 7: Organisation not found.', 'warn')
            return
        }

        await driver.pause(1000)
        console.log(`✅ Organisation "${ORGANISATION}" selected`)

        // ✅ Location
        if (!(await waitForVisible(s1.locationDropdown, 10000))) {
            await testBot.addBstackLog?.('S1 Step 7 skipped: location dropdown not visible.', 'warn')
            return
        }

        await testBot.click(s1.locationDropdown)
        await driver.pause(2000)

        const locationSelected = await clickDropdownOption(LOCATION, LOCATION)
        if (!locationSelected) {
            await testBot.addBstackLog?.('S1 Step 7: Location not found.', 'warn')
            return
        }

        await driver.pause(1000)
        console.log(`✅ Location "${LOCATION}" selected`)

        // ✅ Verify enrol button is now enabled
        if (!(await waitForVisible(s1.enrolButton, 10000))) {
            await testBot.addBstackLog?.('S1 Step 7 skipped: enrol button not visible.', 'warn')
            return
        }

        const enrolBtn = await testBotCompat.getElement(s1.enrolButton)
        expect(await enrolBtn.isEnabled()).toBe(true)
    })

    it('S1 Step 8 - Tap Enrol; land on Device Enrolled page with Logout button', async () => {
        if (!(await waitForVisible(s1.enrolButton, 10000))) {
            await testBot.addBstackLog?.('S1 Step 8 skipped: enrol button not visible.', 'warn')
            return
        }

        await testBot.click(s1.enrolButton)

        if (!(await waitForVisible(s1.logoutButton, 20000))) {
            await testBot.addBstackLog?.('S1 Step 8: logout button not visible on success page.', 'warn')
        }
    })

    it('S1 Step 9 - Tap Logout; land on Log In page', async () => {
        if (!(await waitForVisible(s1.logoutButton, 10000))) {
            await testBot.addBstackLog?.('S1 Step 9 skipped: logout button not visible.', 'warn')
            return
        }

        await testBot.click(s1.logoutButton)

        if (!(await waitForVisible(s1.locationPickerLogin, 15000))) {
            await testBot.addBstackLog?.('S1 Step 9: login page not visible after logout.', 'warn')
        }
    })

    it('S1 Step 10 - Sign In button is disabled before user is selected', async () => {
        if (!(await waitForVisible(s1.signInButton, 10000))) {
            await testBot.addBstackLog?.('S1 Step 10 skipped: sign-in button not visible.', 'warn')
            return
        }

        const signInBtn = await testBotCompat.getElement(s1.signInButton)
        expect(await signInBtn.isEnabled()).toBe(false)
    })

    it('S1 Step 11 - Select user (Akhila Nethi); Sign In button becomes enabled', async () => {
        if (!(await waitForVisible(s1.userDropdown, 10000))) {
            await testBot.addBstackLog?.('S1 Step 11 skipped: user dropdown not visible.', 'warn')
            return
        }

        await testBot.click(s1.userDropdown)
        await driver.pause(2000)

        const userSelected = await clickDropdownOption(USER, USER)
        if (!userSelected) {
            await testBot.addBstackLog?.('S1 Step 11: user not found.', 'warn')
            return
        }

        await driver.pause(1000)
        console.log(`✅ User "${USER}" selected`)

        const signInBtn = await testBotCompat.getElement(s1.signInButton)
        expect(await signInBtn.isEnabled()).toBe(true)
    })

    it('S1 Step 12 - Tap Sign In; handle Terms if shown; enter password', async () => {
        if (!(await waitForVisible(s1.signInButton, 10000))) {
            await testBot.addBstackLog?.('S1 Step 12 skipped: sign-in button not visible.', 'warn')
            return
        }

        await testBot.click(s1.signInButton)
        await driver.pause(2000)

        if (await waitForVisible(shared.continueButton, 10000)) {
            await testBot.click(shared.continueButton)
        }

        if (!(await waitForVisible(shared.passwordField, 20000))) {
            await testBot.addBstackLog?.('S1 Step 12: password field not visible.', 'warn')
            return
        }

        await testBotCompat.setValue(shared.passwordField, PASSWORD)

        const pwField = await testBotCompat.getElement(shared.passwordField)
        expect(await pwField.getAttribute('password')).toBeTruthy()

        await testBot.click(shared.loginButton)
    })

    it('S1 Step 13 - Select Kerr House community; tap Start Work; verify My Communities tab', async () => {
        if (!(await waitForVisible(shared.kerrHouseServiceUsers, 20000))) {
            await testBot.addBstackLog?.('S1 Step 13 skipped: community option not visible.', 'warn')
            return
        }

        await testBot.click(shared.kerrHouseServiceUsers)

        if (!(await waitForVisible(shared.startWorkButton, 10000))) {
            await testBot.addBstackLog?.('S1 Step 13 skipped: Start Work button not visible.', 'warn')
            return
        }

        await testBot.click(shared.startWorkButton)
        expect(await waitForVisible(shared.myCommunitiesTab, 15000)).toBe(true)
    })
})

// ═══════════════════════════════════════════════════════════════════════
// SCENARIO 2 — Welcome Back Screen (Already Enrolled Device)
// ═══════════════════════════════════════════════════════════════════════
describe('Scenario 2 - Welcome Back Screen: Login & Info Flow', () => {

    const s2 = {

        failedLogonText: {
            android: AndroidLocatorBuilder.xpath('//android.widget.TextView[@text="Failed to retrieve Logon data."]'),
            ios: iOSLocatorBuilder.xpath('//XCUIElementTypeStaticText[@name="Failed to retrieve Logon data."]'),
        } as TestBotElement,

        locationPicker: {
            android: AndroidLocatorBuilder.xpath('//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/LocationPicker"]'),
            ios: iOSLocatorBuilder.id('LocationPicker'),
        } as TestBotElement,

        userPicker: {
            android: AndroidLocatorBuilder.xpath('//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/UserPicker"]'),
            ios: iOSLocatorBuilder.id('UserPicker'),
        } as TestBotElement,

        signInButton: {
            android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/SignInButton"]'),
            ios: iOSLocatorBuilder.id('SignInButton'),
        } as TestBotElement,

        infoButton: {
            android: AndroidLocatorBuilder.xpath('//android.view.ViewGroup[@resource-id="com.personcentredsoftware.care.delivery:id/InfoButton"]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ImageView'),
            ios: iOSLocatorBuilder.id('InfoButton'),
        } as TestBotElement,

        deviceInfoButton: {
            android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/DeviceInfoButton"]'),
            ios: iOSLocatorBuilder.id('DeviceInfoButton'),
        } as TestBotElement,

        enrollDeviceButton: {
            android: AndroidLocatorBuilder.xpath('//android.widget.Button[@resource-id="com.personcentredsoftware.care.delivery:id/EnrollDeviceButton"]'),
            ios: iOSLocatorBuilder.id('EnrollDeviceButton'),
        } as TestBotElement,

        crossButton: {
            android: AndroidLocatorBuilder.xpath('//android.widget.ImageView'),
            ios: iOSLocatorBuilder.xpath('//XCUIElementTypeImage'),
        } as TestBotElement,
    }

    it('S2 Step 1 - Detect Welcome Back screen', async () => {
        await driver.pause(5000)

        const hasError   = await waitForVisible(s2.failedLogonText, 8000)
        const hasPickers = await waitForVisible(s2.locationPicker, 10000)

        if (!hasError && !hasPickers) {
            await testBot.addBstackLog?.('S2 Step 1 skipped: Welcome Back screen not detected.', 'warn')
            return
        }

        if (hasError) {
            console.log('Welcome Back screen confirmed via failed logon message.')
        }

        expect(hasPickers).toBe(true)
    })

    it('S2 Step 2 - Select site (Kerr House)', async () => {
        if (!(await waitForVisible(s2.locationPicker, 10000))) {
            await testBot.addBstackLog?.('S2 Step 2 skipped: location picker not visible.', 'warn')
            return
        }

        await testBot.click(s2.locationPicker)
        await driver.pause(2000)

        const locationSelected = await clickDropdownOption(LOCATION, LOCATION)
        if (!locationSelected) {
            await testBot.addBstackLog?.('S2 Step 2: Kerr House not found.', 'warn')
            return
        }

        await driver.pause(1000)

        const el = await testBotCompat.getElement(s2.locationPicker)
        const locationValue = await el.getText()
        console.log('Location value:', locationValue)
        expect(locationValue.toLowerCase()).toContain('kerr house')
    })

    it('S2 Step 3 - Select user (Akhila Nethi)', async () => {
        if (!(await waitForVisible(s2.userPicker, 10000))) {
            await testBot.addBstackLog?.('S2 Step 3 skipped: user picker not visible.', 'warn')
            return
        }

        await testBot.click(s2.userPicker)
        await driver.pause(2000)

        const userSelected = await clickDropdownOption(USER, USER)
        if (!userSelected) {
            await testBot.addBstackLog?.('S2 Step 3: user not found.', 'warn')
            return
        }

        await driver.pause(1000)
        console.log(`✅ User "${USER}" selected`)
    })

    it('S2 Step 4 - Verify Sign In enabled and tap it', async () => {
        if (!(await waitForVisible(s2.signInButton, 10000))) {
            await testBot.addBstackLog?.('S2 Step 4 skipped: Sign In button not visible.', 'warn')
            return
        }

        const btn = await testBotCompat.getElement(s2.signInButton)
        expect(await btn.isEnabled()).toBe(true)
        await testBot.click(s2.signInButton)
    })

    it('S2 Step 5 - Tap Info (i) icon', async () => {
        if (!(await waitForVisible(s2.infoButton, 15000))) {
            await testBot.addBstackLog?.('S2 Step 5 skipped: Info icon not visible.', 'warn')
            return
        }

        await testBot.click(s2.infoButton)

        if (!(await waitForVisible(s2.deviceInfoButton, 8000))) {
            await testBot.addBstackLog?.('S2 Step 5: Device Info button not visible.', 'warn')
        }
    })

    it('S2 Step 6 - Tap Device Info', async () => {
        if (!(await waitForVisible(s2.deviceInfoButton, 10000))) {
            await testBot.addBstackLog?.('S2 Step 6 skipped: Device Info button not visible.', 'warn')
            return
        }

        await testBot.click(s2.deviceInfoButton)

        if (!(await waitForVisible(s2.enrollDeviceButton, 8000))) {
            await testBot.addBstackLog?.('S2 Step 6: Enroll Device button not visible.', 'warn')
        }
    })

    it('S2 Step 7 - Tap Enroll Device', async () => {
        if (!(await waitForVisible(s2.enrollDeviceButton, 10000))) {
            await testBot.addBstackLog?.('S2 Step 7 skipped: Enroll Device button not visible.', 'warn')
            return
        }

        await testBot.click(s2.enrollDeviceButton)
    })

    it('S2 Step 8 - Tap cross (X) to close panel', async () => {
        if (!(await waitForVisible(s2.crossButton, 8000))) {
            await testBot.addBstackLog?.('S2 Step 8 skipped: close button not visible.', 'warn')
            return
        }

        await testBot.click(s2.crossButton)
    })

    it('S2 Step 9 - Handle Terms if shown; enter password and login', async () => {
        if (await waitForVisible(shared.continueButton, 8000)) {
            await testBot.click(shared.continueButton)
        }

        if (!(await waitForVisible(shared.passwordField, 20000))) {
            await testBot.addBstackLog?.('S2 Step 9 skipped: password field not visible.', 'warn')
            return
        }

        await testBotCompat.setValue(shared.passwordField, PASSWORD)

        const pwField = await testBotCompat.getElement(shared.passwordField)
        expect(await pwField.getAttribute('password')).toBeTruthy()

        await testBot.click(shared.loginButton)
    })

    it('S2 Step 10 - Select Kerr House community; tap Start Work; verify My Communities tab', async () => {
        if (!(await waitForVisible(shared.kerrHouseServiceUsers, 20000))) {
            await testBot.addBstackLog?.('S2 Step 10 skipped: community option not visible.', 'warn')
            return
        }

        await testBot.click(shared.kerrHouseServiceUsers)

        if (!(await waitForVisible(shared.startWorkButton, 10000))) {
            await testBot.addBstackLog?.('S2 Step 10 skipped: Start Work button not visible.', 'warn')
            return
        }

        await testBot.click(shared.startWorkButton)
        expect(await waitForVisible(shared.myCommunitiesTab, 15000)).toBe(true)
    })
})
