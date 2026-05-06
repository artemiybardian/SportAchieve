import {FC} from "react";
import {Text} from "@/components/ui/Typography.tsx";
import IconItemProps from "@/components/ui/IconItem/IconItemProps.ts";


const IconItem: FC<IconItemProps> = ({ icon, title, onClick, iconBgColor = "#23244C" }) => (
    <div onClick={onClick} style={{display: "flex", alignItems: "center", justifyContent: "start", padding: "16px 0", gap: "16px", cursor: onClick ? "pointer" : "default"}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: iconBgColor, height: "36px", width: "36px", borderRadius: "36px"}}>
            {icon}
        </div>
        <Text style={{fontSize: "18px", fontWeight: "500"}}>{title}</Text>
    </div>
);

export default IconItem;
