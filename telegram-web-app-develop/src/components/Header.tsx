import {useNavigate} from "react-router-dom";
import { on } from '@tma.js/sdk';
import {retrieveLaunchParams, viewport} from "@tma.js/sdk-react";
import {FC, useEffect, useMemo, useState} from "react";
import {SubscriptionBadge} from "@/components/ui/Subscription/Badge/SubscriptionBadge.tsx";

interface HeaderProps {
    name: string;
    avatarUrl: string;
    daysLeft: number;
    hasSubscription?: boolean;
}

const Header: FC<HeaderProps> = ({ name, avatarUrl, daysLeft, hasSubscription }) => {

    const navigate = useNavigate()
    const [headerHeight, setHeaderHeight] = useState(185)
    const lp = retrieveLaunchParams();

    const isMobile = useMemo(() => {
        return lp.tgWebAppPlatform === "android" || lp.tgWebAppPlatform === "ios";
    }, [lp.tgWebAppPlatform]);

    useEffect(() => {
        let off: (() => void) | undefined;

        const init = async () => {
            try {
                await viewport.mount();

                const applyHeight = (isFullscreen: boolean) => {
                    if (isMobile) {
                        setHeaderHeight(100);
                    } else {
                        if (isFullscreen) {
                            setHeaderHeight(140)
                        } else {
                            setHeaderHeight(100);
                        }
                    }
                };

                // apply current state immediately
                applyHeight(viewport.isFullscreen());

                off = on("fullscreen_changed", ({ is_fullscreen }) => {
                    console.log("fullscreen changed", is_fullscreen);
                    applyHeight(is_fullscreen);
                });
            } catch (e) {
                console.error("viewport mount failed", e);
            }
        };

        void init();

        return () => {
            off?.();
        };
    }, [isMobile]);

    useEffect(() => {
        console.log("headerHeight", headerHeight);
    }, [headerHeight]);

    return (
        <header style={{height: `${headerHeight}px`, backgroundColor: '#23244C', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px'}}>
            <div style={{display: "flex", flexDirection: "column", alignItems: "start", justifyContent: "end", height: "100%", marginTop: "-15px"}} onClick={() => navigate('/user')}>
                <div style={{position: "relative", margin: "0 29px 22px 29px", display: "flex", alignItems: "center" }}>
                    <div style={{marginRight: "8px", border: "1px solid #68C6E0", borderRadius: "50%", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#68C6E03D"}}>
                        <img style={{borderRadius: "50%"}} height="32px" width="32px" src={avatarUrl} alt=""/>
                    </div>
                    <div style={{marginRight: "8px", fontFamily: "SF Pro Display", color: "#E6E9ED", fontWeight: "400", fontSize: "16px"}}>{name}</div>
                    {hasSubscription && (
                        <SubscriptionBadge daysLeft={daysLeft} hasSubscription={hasSubscription} />
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header;
