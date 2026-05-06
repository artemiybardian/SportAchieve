import {Heading, Text} from "@/components/ui/Typography.tsx";
import {FC} from "react";
import SubscriptionCardProps from "@/components/ui/SubscriptionCard/SubscriptionCardProps.ts";


const SubscriptionCard: FC<SubscriptionCardProps> = ({ name, isActive, daysLeft, onClick }) => (
    <div onClick={onClick} style={{border: "1px solid #E6E9ED", borderRadius: "18px", padding: "16px 24px", display: "flex", justifyContent: "space-between"}}>
        <div>
            <Heading level={3}>{name}</Heading>
            <div style={{backgroundColor: isActive ? "#0FA94814" : "#E0686814", borderRadius: "25px", display: "flex", flexWrap: "nowrap", alignItems: "center", height: "25px", width: "fit-content", marginTop: "4px"}}>
                <div style={{backgroundColor: isActive ? "#0FA948" : "#E06868", height: "7px", width: "7px", borderRadius: "7px", margin: "4px 0px 4px 10px"}}></div>
                <Text style={{padding: "4px 10px 4px 6px", fontWeight: "400", fontSize: "14px"}}>{isActive ? "Активна" : "Неактивна"}</Text>
            </div>
        </div>
        <div>
            <Text style={{color: "#9191A5"}}>{daysLeft} дней</Text>
        </div>
    </div>
);

export default SubscriptionCard;