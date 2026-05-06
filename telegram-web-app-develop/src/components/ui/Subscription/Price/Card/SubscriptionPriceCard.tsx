import React from "react";
import {Heading, Text} from "@/components/ui/Typography.tsx";
import SubscriptionPriceCardProps from "@/components/ui/Subscription/Price/Card/SubscriptionPriceCardProps.ts";


function SubscriptionPriceCard({title, subtitle, price, isActive, onClick}: SubscriptionPriceCardProps) {
    const cardStyle: React.CSSProperties = {
        borderRadius: "18px",
        padding: "16px 24px",
        marginTop: "4px",
        border: "1px solid #E6E9ED",
        color: "inherit"
    }
    if (isActive) {
        cardStyle.color = "white"
        cardStyle.backgroundColor = "#68C6E0"
    }
    return <div style={cardStyle} onClick={onClick}>
        <Heading level={2} style={{color: "inherit", marginTop: "0px"}}>{title}</Heading>
        <Text style={{color: isActive ? "inherit" : "#9191A5", marginTop: "4px"}}>{subtitle}</Text>
        <Text style={{fontSize: "20px", fontWeight: "600", color: "inherit", marginTop: "16px"}}>{price}</Text>
    </div>
}

export default SubscriptionPriceCard;
