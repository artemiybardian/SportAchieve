import SubscriptionPriceProps from "@/components/ui/Subscription/Price/SubscriptionPriceProps.ts";


function SubscriptionPrice({children}: SubscriptionPriceProps) {
    return <div style={{marginTop: '16px', display: 'flex', flexDirection: "column", justifyContent: 'center', width: '100%'}}>
        {children}
    </div>
}
export default SubscriptionPrice;
