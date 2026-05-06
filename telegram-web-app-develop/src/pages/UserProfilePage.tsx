import {Page} from "@/components/Page.tsx";
import {Divider} from "@/components/ui/Divider.tsx";
import {DrawerProvider, useDrawer} from "@/components/ui/DrawerNavigation.tsx";
import {Section} from "@/components/ui/Section.tsx";
import SubscriptionCard from "@/components/ui/SubscriptionCard/SubscriptionCard.tsx";
import IconItem from "@/components/ui/IconItem/IconItem.tsx";
import {SupportIcon, InfoIcon, OnboardingIcon} from "@/components/ui/Icons";
import BigUserHeader from "@/components/ui/BigUserHeader.tsx";
import UserSubscriptionDrawer from "@/drawers/UserSubscriptionDrawer.tsx";
import { useUser } from "@/hooks/useUser";
import { useAppDispatch } from "@/store";
import { setOnboardingComplete } from "@/store/slices/userSlice.ts";
import { useNavigate } from "react-router-dom";
import { AnalyticsLogger } from "@/services/AnalyticsLogger";

export default function UserProfilePage() {
    return (
        <DrawerProvider>
            <UserProfileContent />
        </DrawerProvider>
    );
}

function UserProfileContent() {
    const { openDrawer } = useDrawer();
    const { user, fullName, avatarUrl, subscription } = useUser();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const openSubscriptionDrawer = () => {
        openDrawer({
            title: "Подписка",
            content: <UserSubscriptionDrawer />
        });
    };

    const handleRepeatOnboarding = () => {
        dispatch(setOnboardingComplete(false));
        navigate("/onboarding");
    };

    return (
    <Page back={true}>
        <BigUserHeader
            name={fullName}
            email={user?.email ?? ''}
            avatarUrl={avatarUrl}
        />

        {subscription && (
            <Section padding="16px 16px 0 16px">
                <SubscriptionCard 
                    isActive={subscription?.is_valid || false} 
                    daysLeft={subscription.type.access_duration_in_days}
                    name="Подписка"
                    onClick={openSubscriptionDrawer} 
                />
            </Section>
        )}

        <Section padding="16px 32px 0 32px">
            {/*<IconItem*/}
            {/*    title="История тренировок"*/}
            {/*    icon={<HistoryIcon color="white" />}*/}
            {/*/>*/}
            {/*<Divider margin="0" />*/}
            <IconItem
                title="Поддержка"
                iconBgColor="#68C6E0"
                icon={<SupportIcon color="white" />}
                onClick={() => {
                    void AnalyticsLogger.logSupportClick();
                    window.open("https://t.me/i_nikmak", "_blank");
                }}
            />
            <Divider margin="0" />
            <IconItem
                title="О приложении"
                iconBgColor="#63788B"
                icon={<InfoIcon color="white" />}
            />
            <Divider margin="0" />
            <IconItem
                title="Повторить онбординг"
                iconBgColor="#63788B"
                icon={<OnboardingIcon color="white" />}
                onClick={handleRepeatOnboarding}
            />
        </Section>
    </Page>
    )

}
