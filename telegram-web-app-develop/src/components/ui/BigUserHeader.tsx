import {FC} from "react";
import {SoraText, Text} from "@/components/ui/Typography.tsx";
import {BigHeaderBgIcon} from "@/components/ui/Icons";


interface BigUserHeaderProps {
    name: string;
    email: string;
    avatarUrl: string;
}

const UserHeader: FC<BigUserHeaderProps> = ({ name, email, avatarUrl }) => (
    <header style={{height: "360px", color: "white"}}>
        <BigHeaderBgIcon style={{position: "absolute", zIndex: -1}} color="#23244C" />
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "end", height: "100%", marginTop: "-15px"}}>
            <div style={{position: "relative", display: "flex", alignItems: "center", flexDirection: "column", marginBottom: "32px" }}>
                <div>
                    <img style={{borderRadius: "50%"}} height="128px" width="128px" src={avatarUrl} alt=""/>
                </div>
                <SoraText style={{color: "white", fontSize: "18px", marginTop: "24px", textAlign: "center"}}>{name}</SoraText>
                {email ? (
                    <Text style={{color: "#9191A5", fontSize: "14px", marginTop: "4px"}}>{email}</Text>
                ) : null}
            </div>
        </div>
    </header>
);

export default UserHeader;
