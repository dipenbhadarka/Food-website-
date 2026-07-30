import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

const RESIDENT_NAME_2 = 'Freya Farrow'

// ─────────────────────────────────────────────
// Freya Farrow — Adhoc Activity Flow selectors
// ─────────────────────────────────────────────
const adhocActivitySelectors = {
    residentFreyaFarrow: {
        android: AndroidLocatorBuilder.xpath(
            `//android.widget.TextView[@text="${RESIDENT_NAME_2}"]`
        ),
        ios: iOSLocatorBuilder.xpath(
            `//XCUIElementTypeStaticText[@name="${RESIDENT_NAME_2}"]`
        ),
    } as TestBotElement,

    adhocButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Adhoc"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Adhoc"]'
        ),
    } as TestBotElement,

    activitiesListItem: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[2]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeCollectionView/XCUIElementTypeCell[2]'
        ),
    } as TestBotElement,

    expandArrow: {
        android: AndroidLocatorBuilder.xpath(
            '(//android.widget.TextView[@text=""])[1]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '(//XCUIElementTypeStaticText[@name=""])[1]'
        ),
    } as TestBotElement,

    selectArtImage: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.view.ViewGroup[3]/android.view.ViewGroup/android.view.ViewGroup[2]/android.view.ViewGroup/android.widget.ImageView'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeCollectionView/XCUIElementTypeCell[3]/XCUIElementTypeImage'
        ),
    } as TestBotElement,

    nextButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Next"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Next"]'
        ),
    } as TestBotElement,

    durationScreenTitle: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="How long did this care take?"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="How long did this care take?"]'
        ),
    } as TestBotElement,

    // NB: Confirmed via screenshot — this is a plain grid
    // of duration buttons. No slider overlaps it.
    tenMinsOption: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="10 mins"] | //android.widget.Button[@text="10 mins"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="10 mins"] | //XCUIElementTypeButton[@name="10 mins"]'
        ),
    } as TestBotElement,

    // NB: Confirmed via screenshot — button literally
    // reads "Continue" at the bottom of the duration screen.
    confirmButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Continue"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Continue"]'
        ),
    } as TestBotElement,

    createRecordsButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Create Records"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Create Records"]'
        ),
    } as TestBotElement,

    // NB: Locator sent for "close" was identical to
    // Create Records — update once the actual close
    // button's locator is confirmed.
    closeAfterCreateButton: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.Button[@text="Create Records"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeButton[@name="Create Records"]'
        ),
    } as TestBotElement,

    earlierTab: {
        android: AndroidLocatorBuilder.xpath(
            '//android.widget.TextView[@text="Earlier"]'
        ),
        ios: iOSLocatorBuilder.xpath(
            '//XCUIElementTypeStaticText[@name="Earlier"]'
        ),
    } as TestBotElement,
}

// ─────────────────────────────────────────────
// Suite — Freya Farrow Adhoc Activity Flow
// ─────────────────────────────────────────────
describe('Care Delivery - Freya Farrow Adhoc Activity Flow', () => {

    it('Step 1 - Select resident "Freya Farrow" from the community list', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.residentFreyaFarrow, 20000)
            await testBot.click(adhocActivitySelectors.residentFreyaFarrow)
            await driver.pause(2000)
        } catch (err) {
            console.error('Resident Freya Farrow not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 1 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

    it('Step 2 - Click Adhoc', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.adhocButton, 15000)
            await testBot.click(adhocActivitySelectors.adhocButton)
            await driver.pause(1500)
        } catch (err) {
            console.error('Adhoc button not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 2 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

    it('Step 3 - Select an activity from the list', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.activitiesListItem, 15000)
            await testBot.click(adhocActivitySelectors.activitiesListItem)
            await driver.pause(1500)
        } catch (err) {
            console.error('Activities list item not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 3 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

    it('Step 4 - Tap arrow to expand (toggle — tap once only)', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.expandArrow, 15000)
            await testBot.click(adhocActivitySelectors.expandArrow)
            await driver.pause(1500)
        } catch (err) {
            console.error('Expand arrow not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 4 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

    it('Step 5 - Select the art', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.selectArtImage, 15000)
            await testBot.click(adhocActivitySelectors.selectArtImage)
            await driver.pause(1500)
        } catch (err) {
            console.error('Select art image not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 5 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

    it('Step 6 - Click Next and verify duration screen "How long did this care take?" loads', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.nextButton, 15000)
            await testBot.click(adhocActivitySelectors.nextButton)
            await driver.pause(1500)

            await testBot.waitUntilVisible(adhocActivitySelectors.durationScreenTitle, 15000)
            console.log('Duration screen loaded: "How long did this care take?"')
        } catch (err) {
            console.error('Next button or duration screen title not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 6 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

    it('Step 7 - Scroll down and select "10 mins" duration', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.durationScreenTitle, 15000)

            const tenMinsXpath =
                '//android.widget.TextView[@text="10 mins"] | //android.widget.Button[@text="10 mins"]'

            let found = false
            for (let i = 0; i < 5; i++) {
                const el = await $(tenMinsXpath)
                if (await el.isExisting() && await el.isDisplayed()) {
                    found = true
                    break
                }

                const { width, height } = await driver.getWindowSize()
                await driver.execute('mobile: swipeGesture', {
                    left: Math.floor(width * 0.2),
                    top: Math.floor(height * 0.6),
                    width: Math.floor(width * 0.6),
                    height: Math.floor(height * 0.3),
                    direction: 'up',
                    percent: 0.5,
                })
                await driver.pause(800)
            }

            if (!found) {
                throw new Error('"10 mins" button never became visible after scrolling')
            }

            const tenMinsEl = await $(tenMinsXpath)
            await tenMinsEl.click()
            console.log('Clicked "10 mins" duration button')
            await driver.pause(1000)

        } catch (err) {
            console.error('10 mins option not found or click failed — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 7 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

    it('Step 8 - Click Continue button at the bottom', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.confirmButton, 15000)
            await testBot.click(adhocActivitySelectors.confirmButton)
            await driver.pause(1500)
        } catch (err) {
            console.error('Continue button not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 8 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

    it('Step 9 - Click Create Records', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.createRecordsButton, 15000)
            await testBot.click(adhocActivitySelectors.createRecordsButton)
            await driver.pause(2000)
        } catch (err) {
            console.error('Create Records button not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 9 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

    it('Step 10 - Click Close', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.closeAfterCreateButton, 15000)
            await testBot.click(adhocActivitySelectors.closeAfterCreateButton)
            await driver.pause(1500)
        } catch (err) {
            console.error('Close button not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 10 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

    it('Step 11 - Click on "Earlier" tab', async () => {
        try {
            await testBot.waitUntilVisible(adhocActivitySelectors.earlierTab, 15000)
            await testBot.click(adhocActivitySelectors.earlierTab)
            await driver.pause(1500)
        } catch (err) {
            console.error('Earlier tab not found — dumping page source')
            const pageSource = await driver.getPageSource()
            console.log('─────────── PAGE SOURCE AT STEP 11 ───────────')
            console.log(pageSource)
            console.log('─────────────────────────────────────────')
            throw err
        }
    })

})
