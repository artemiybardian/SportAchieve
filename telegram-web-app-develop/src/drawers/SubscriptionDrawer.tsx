import {Heading, Text} from "@/components/ui/Typography.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {useEffect, useState} from "react";
import SubscriptionPriceCard from "@/components/ui/Subscription/Price/Card/SubscriptionPriceCard.tsx";
import SubscriptionPrice from "@/components/ui/Subscription/Price/SubscriptionPrice.tsx";
import {DrawerView} from "@/components/ui/DrawerNavigation.tsx";
import SelectPaymentDrawer from "@/drawers/SelectPaymentDrawer.tsx";
import { InvoicesService, InvoiceTypeSchema } from "@/api";
import { AnalyticsLogger } from "@/services/AnalyticsLogger";

interface SubscriptionDrawerProps {
    pushView: (view: DrawerView) => void;
}

export default function SubscriptionDrawer({pushView}: SubscriptionDrawerProps) {
    const [invoiceTypes, setInvoiceTypes] = useState<InvoiceTypeSchema[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        void AnalyticsLogger.logPageView("paywall");
        InvoicesService.apiViewsListInvoiceTypes()
            .then(data => {
                setInvoiceTypes(data);
                if (data.length > 0) {
                    setSelectedPlanId(data[0].id);
                }
            })
            .catch(err => {
                console.error("Failed to fetch invoice types:", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    function openSelectPaymentPage() {
        const selectedPlan = invoiceTypes.find(plan => plan.id === selectedPlanId);
        if (!selectedPlan) return;

        pushView({
            title: "Оплата",
            content: <SelectPaymentDrawer invoiceType={selectedPlan} />
        })
    }

    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
    }

    return (
        <div style={{margin: '0 12px'}}>
            <Text>Получите расширенные техники, подробные разборы ошибок и программы прогрессии для стабильного роста результатов.</Text>
            <Heading level={2} style={{marginTop: '12px'}}>Что входит в платный доступ</Heading>
            <ul>
                <li>Все упражнения этого тренажера</li>
                <li>Продвинутые техники выполнения</li>
                <li>Разбор частых ошибок</li>
                <li>Рекомендации по темпу и дыханию</li>
                <li>План прогрессии нагрузки</li>
            </ul>
            <SubscriptionPrice>
                {invoiceTypes.map((plan) => (
                    <SubscriptionPriceCard
                        key={plan.id}
                        title={plan.name}
                        subtitle="Доступ ко всем упражнениям всех тренажеров в зале"
                        price={`${plan.price} ₽ / мес`}
                        isActive={selectedPlanId === plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                    />
                ))}
            </SubscriptionPrice>
            <div style={{marginTop: '16px', display: 'flex', justifyContent: 'center', width: '100%'}}>
                <Button 
                    variant="primary" 
                    style={{ minWidth: "178px", padding: "22px 80px" }} 
                    onClick={openSelectPaymentPage}
                    disabled={selectedPlanId === null}
                >
                    Оформить подписку
                </Button>
            </div>
            <div style={{marginTop: '12px', display: 'flex', justifyContent: 'center', width: '100%', textDecoration: 'none'}}>
                <Text size="small" style={{color: "#9191A5"}}><a href="#" style={{textDecoration: "inherit", color: "#23244C"}}>Условия использования</a> и <a href="#" style={{textDecoration: "inherit", color: "#23244C"}}>Политика возврата</a></Text>
            </div>
        </div>
    )
}
