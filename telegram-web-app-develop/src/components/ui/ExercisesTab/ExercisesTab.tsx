import {useEffect, useState} from "react";
import {Section} from "@/components/ui/Section.tsx";
import {LockIcon, NFCIcon} from "@/components/ui/Icons";
import {Heading, Text} from "@/components/ui/Typography.tsx";
import {Divider} from "@/components/ui/Divider.tsx";
import {Button} from "@/components/ui/Button.tsx";
import ExercisesTabProps from "@/components/ui/ExercisesTab/ExercisesTabProps.ts";
import ExerciseTabProps from "@/components/ui/ExercisesTab/ExerciseTabProps.ts";


function ExercisesTab({tabs, getExercises, defaultTabId, onPaidClick, onTabSelectClick, defaultShowPaywall, isExercisesEmpty}: ExercisesTabProps) {

    const [selectedTab, setSelectedTab] = useState<ExerciseTabProps | undefined>(
        tabs.find(tab => tab.id === defaultTabId) || tabs[0]
    );

    const [showPaywall, setShowPaywall] = useState(defaultShowPaywall);

    useEffect(() => {
        const foundTab = tabs.find(tab => tab.id === defaultTabId) || tabs[0];
        setSelectedTab(foundTab);
    }, [defaultTabId, tabs]);

    useEffect(() => {
        setShowPaywall(defaultShowPaywall);
    }, [defaultShowPaywall]);

    return <Section style={{
        position: "relative",
        background: "linear-gradient(#68C6E029, #68C6E000)",
        borderRadius: "16px",
        margin: "0 4px",
        minHeight: "440px",
    }}>
        {showPaywall && !isExercisesEmpty &&
            <div style={{
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                justifyContent: "end",
                height: "400px",
                paddingRight: "31px",
                paddingLeft: "31px",
                bottom: "1px",
                left: "1px",
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.24) -22.59%, #FFFFFF 69.88%)",
                zIndex: 10
            }}>
                <div>
                    <div style={{display: "flex", alignItems: "center", fontFamily: "Codec Cold Logo", fontWeight: "400", fontSize: "18px"}}>
                        <span style={{marginRight: "6px", fontWeight: "bold"}}>Доступно после оплаты</span>
                        <LockIcon color="#AAB2BD"/>
                    </div>
                    <Text size="small" style={{marginTop: "4px"}}>Откройте полный доступ, чтобы получить все упражнения и продвинутые техники.</Text>
                    <Divider color="#E6E9ED" margin="16px 0 11px 0" />
                    <div style={{fontFamily: "SF Pro Display", fontWeight: "400", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px"}}>
                        <span>Действует для тренажеров с</span>
                        <span style={{backgroundColor: "#E6E9ED", borderRadius: "25px", height: "25px", marginTop: "4px", display: "flex", alignItems: "center", fontSize: "14px"}}>
                                <NFCIcon style={{margin: "4px 0px 4px 6px"}} color="#23244C" />
                                <span style={{padding: "4px 6px 4px 4px"}}>NFC-стикерами</span>
                            </span>
                    </div>
                    <div style={{marginTop: "16px", marginBottom: "11px", display: "flex", justifyContent: "center"}}>
                        <Button style={{ padding: "22px 125px" }} onClick={onPaidClick}>Оплатить</Button>
                    </div>
                </div>
            </div>
        }

        <div style={{display: "flex", alignItems: "center"}}>
            <Heading level={2} style={{ lineHeight: "100%" }}>Упражнения</Heading>
        </div>
        <div style={{marginTop: "8px", display: "flex", marginLeft: "-16px", gap: "8px"}}>
            {tabs.map((tab) => {
                const isActive = selectedTab?.id === tab.id;
                return (
                    <Button
                        key={tab.id}
                        variant={isActive ? "activeTab" : "ghost"}
                        onClick={() => {
                            setSelectedTab(tab)
                            onTabSelectClick(tab)
                        }}
                    >
                        {tab.name}
                    </Button>
                )
            })}
        </div>
        <div>
            {selectedTab && getExercises()}
        </div>
    </Section>
}

export default ExercisesTab;
