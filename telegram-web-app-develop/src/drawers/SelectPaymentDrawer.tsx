import IconItem from "@/components/ui/IconItem/IconItem.tsx";
import {BankCardIcon, ChevronRightIcon, SBPLogoIcon} from "@/components/ui/Icons";
import {Divider} from "@/components/ui/Divider.tsx";
import {Section} from "@/components/ui/Section.tsx";
import { InvoiceCreateSchema, InvoiceTypeSchema, SubscriptionService } from "@/api";
import { useState } from "react";
import { Spinner } from "@telegram-apps/telegram-ui";
import { AnalyticsLogger } from "@/services/AnalyticsLogger";


interface SelectPaymentDrawerProps {
    invoiceType: InvoiceTypeSchema;
}

export default function SelectPaymentDrawer({ invoiceType }: SelectPaymentDrawerProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async (method: InvoiceCreateSchema.payment_method) => {
        setIsLoading(true);
        void AnalyticsLogger.logPaymentAttempt(invoiceType.id, method);
        try {
            const response = await SubscriptionService.apiViewsSubscribe({
                subscription_type_id: invoiceType.id,
                payment_method: method,
                return_url: window.location.href
            });
            
            if (response.confirmation_url) {
                window.location.href = response.confirmation_url;
            }
        } catch (error) {
            console.error("Payment initiation failed:", error);
            void AnalyticsLogger.logPaymentFailure(invoiceType.id, error instanceof Error ? error.message : String(error));
        } finally {
            setIsLoading(false);
        }
    };

    const onBankCardClick = () => {
        void handlePayment(InvoiceCreateSchema.payment_method.BANK_CARD);
    };

    const onSBPClick = () => {
        void handlePayment(InvoiceCreateSchema.payment_method.SBP);
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Spinner size="l" />
            </div>
        );
    }

    return <div>
        <Section padding="0 12px" style={{textDecoration: "none"}}>
            <div 
                onClick={onBankCardClick}
                style={{display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "inherit", cursor: "pointer"}}
            >
                {/* type: bank_card */}
                <IconItem
                    title="Банковская карта"
                    iconBgColor="#FF4F00"
                    icon={<BankCardIcon color="white" />}
                />
                <div><ChevronRightIcon /></div>
            </div>
            <Divider margin="0" />
            <div 
                onClick={onSBPClick}
                style={{display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "inherit", cursor: "pointer"}}
            >
                {/* type: sbp */}
                <IconItem
                    title="СБП / QR-код"
                    iconBgColor="#fff"
                    icon={<SBPLogoIcon />}
                />
                <div><ChevronRightIcon /></div>
            </div>
            <Divider margin="0" />
        </Section>
    </div>
}
