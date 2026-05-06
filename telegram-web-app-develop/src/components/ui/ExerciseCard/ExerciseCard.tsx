import {useNavigate} from "react-router-dom";
import {Divider} from "@/components/ui/Divider.tsx";
import {Text} from "@/components/ui/Typography";
import ExerciseCardProps from "@/components/ui/ExerciseCard/ExerciseCardProps.ts";
import {Chip} from "@/components/ui/Chip.tsx";
import React, {FC} from "react";
import {ChipProps} from "@telegram-apps/telegram-ui";
import { AnalyticsLogger } from "@/services/AnalyticsLogger";

const FreeChip: FC<ChipProps> = ({ children, style }) => {
    return <Chip style={{color: "white", marginLeft: "6px", height: "14px", fontSize: "12px", padding: "2px 8px", backgroundColor: "#0FA948", ...style}}>{children}</Chip>
}

const ProChip: FC<ChipProps> = ({ children, style }) => {
    return <Chip style={{color: "white", marginLeft: "6px", height: "14px", fontSize: "12px", padding: "2px 8px", backgroundColor: "#68C6E0", ...style}}>{children}</Chip>
}

function ExerciseCard({exerciseId, image, title, subtitle, access_type, onClick}: ExerciseCardProps) {

    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent) => {
        if (exerciseId) {
            void AnalyticsLogger.logExerciseClick(exerciseId);
        }
        if (onClick) {
            e.preventDefault();
            onClick();
        } else if (exerciseId) {
            navigate(`/exercise/${exerciseId}`);
        }
    }

    const body = <div onClick={handleClick} style={{cursor: "pointer"}}>
        {image ? <div style={{display: "flex", alignItems: "center", flexDirection: "column", width: "100%"}}>
            <img width="226px" src={image} alt=""/>
        </div> : undefined}
        <div style={{marginTop: "20px", display: "flex", alignItems: "start"}}>
            <Text weight="700" style={{fontSize: "18px"}}>{title}</Text>
            {access_type === "PAID" ? <ProChip>Платно</ProChip> : <FreeChip>Бесплатно</FreeChip>}
        </div>
        <Text style={{marginTop: "4px"}}>{subtitle}</Text>
        <Divider margin="24px 0 0 0" />
    </div>

    return <div style={{marginTop: "32px"}}>
        {body}
    </div>
}

export default ExerciseCard;
