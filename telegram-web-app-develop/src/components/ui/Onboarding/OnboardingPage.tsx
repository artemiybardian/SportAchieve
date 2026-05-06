import { useState } from "react";
import { Page } from "@/components/Page.tsx";
import { Text } from "@/components/ui/Typography.tsx";
import { Button } from "@/components/ui/Button.tsx";

export interface OnboardingStep {
    icon: React.ReactNode;
    title: string;
    description: string;
    buttonText: string;
    buttonOnClick?: () => void;
}

interface OnboardingPageProps {
    steps: OnboardingStep[];
}

export default function OnboardingPage({ steps }: OnboardingPageProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const step = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else if (step.buttonOnClick) {
            step.buttonOnClick();
        }
    };

    if (!step) return null;

    return (
        <Page back={false}>
            <div
                style={{
                    minHeight: "90vh",
                    color: "#23244C",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 0 40px 0",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        flex: 1,
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "end",
                            justifyContent: "center",
                            backgroundColor: "#F5F7FA",
                            height: "1208px",
                            width: "1208px",
                            borderRadius: "50%",
                            position: "absolute",
                            top: "-850px",
                            zIndex: -1,
                        }}
                    >
                        <div style={{ marginBottom: "100px" }}>{step.icon}</div>
                    </div>

                    <div
                        key={currentStep}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: "400px",
                            width: "270px",
                            textAlign: "center",
                            animation: "fadeIn 0.5s ease-in-out",
                        }}
                    >
                        <Text
                            style={{
                                padding: "8px 16px",
                                fontFamily: "Sora",
                                fontWeight: "700",
                                fontSize: "24px",
                                width: "250px",
                                lineHeight: "30px",
                            }}
                        >
                            {step.title}
                        </Text>
                        <Text
                            style={{
                                fontFamily: "SF Pro Display",
                                fontSize: "16px",
                                fontWeight: "400",
                                marginTop: "8px",
                                color: "#6A708B",
                            }}
                        >
                            {step.description}
                        </Text>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "20px",
                        width: "100%",
                        padding: "0 60px",
                        marginTop: "64px",
                    }}
                >
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: i === currentStep ? 24 : 8,
                                    height: 8,
                                    borderRadius: 999,
                                    backgroundColor:
                                        i === currentStep ? "#23244C" : "rgba(104, 198, 224, 0.45)",
                                    transition: "width 0.25s ease, background-color 0.25s ease",
                                }}
                            />
                        ))}
                    </div>
                    <Button
                        variant="primary"
                        style={{ minWidth: "178px", padding: "22px 80px" }}
                        onClick={handleNext}
                    >
                        {step.buttonText}
                    </Button>
                </div>
            </div>
        </Page>
    );
}
