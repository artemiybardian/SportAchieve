import {ReactNode} from "react";


interface IconItemProps {
    icon: ReactNode;
    title: string;
    onClick?: () => void;
    iconBgColor?: string;
}

export default IconItemProps;
