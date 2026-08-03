import { testBot } from '../../testbot'
import { AndroidLocatorBuilder } from '../../TestBot/Locators/Android/AndroidLocatorBuilder'
import { iOSLocatorBuilder } from '../../TestBot/Locators/iOS/iOSLocatorBuilder'
import { TestBotElement } from '../../TestBot/TestBotElement'

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

    // NB: This single icon appears to serve as BOTH the
    // close/dismiss action AND the sign-out confirmation,
    // depending on screen state. Confirm with the team
    // whether this is truly one button with two behaviors,
    // or if there are actually two separate elements that
    // need distinct locators.
    closeOrSignOutIcon: {
        android: AndroidLocatorBuilder.xpath(
            '//androidx.recyclerview.widget.RecyclerView/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.ImageView'
        ),
        ios: iOSLocatorBuilder.id('CloseOrSignOutIcon'),
    } as TestBotElement,
}

describe('Care Delivery - Finish and Sign Out Flow', () => {

    it('Step 1 - Open global nav menu and click Finish and Sign Out', async () => {
        await testBot.waitUntilVisible(finishSignOutSelectors.globalNavMenuButton, 15000)
        await testBot.click(finishSignOutSelectors.globalNavMenuButton)
        await driver.pause(1500)

        await testBot.waitUntilVisible(finishSignOutSelectors.finishAndSignOutButton, 10000)
        await testBot.click(finishSignOutSelectors.finishAndSignOutButton)
        await driver.pause(2000)
    })

    it('Step 2 - Tap the icon to sign out and land on Log In screen', async () => {
        await testBot.waitUntilVisible(finishSignOutSelectors.closeOrSignOutIcon, 15000)
        await testBot.click(finishSignOutSelectors.closeOrSignOutIcon)
        await driver.pause(2000)

        // Verify landed on Log In screen
        const userDropdown = {
            android: AndroidLocatorBuilder.xpath(
                '//android.widget.EditText[@resource-id="com.personcentredsoftware.care.delivery:id/UserPicker"]'
            ),
            ios: iOSLocatorBuilder.id('UserPicker'),
        } as TestBotElement
        await testBot.waitUntilVisible(userDropdown, 15000)
    })

})
