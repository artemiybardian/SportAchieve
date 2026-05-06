import {SubscriptionBadgeProps} from "@/components/ui/Subscription/Badge/SubscriptionBadgeProps.ts";


export const SubscriptionBadge = ({daysLeft, hasSubscription}: SubscriptionBadgeProps) => {

    const statusStyles = {backgroundColor: "inherit", height: "7px", width: "7px", borderRadius: "7px", margin: "4px 0px 4px 10px"};
    if (hasSubscription) {
        statusStyles.backgroundColor = "#0FA948"
    } else {
        statusStyles.backgroundColor = "#E06868FF"
    }

    return <div style={{marginRight: "8px", backgroundColor: "#68C6E029", borderRadius: "25px", display: "flex", flexWrap: "nowrap", alignItems: "center", height: "25px", minWidth: "85px"}}>
        <div style={statusStyles}></div>
        <div style={{padding: "4px 10px 4px 6px", color: "white", fontWeight: "400", fontSize: "14px"}}>{daysLeft} дней</div>
    </div>
}
