import {ReactNode} from "react";
import ExerciseTabProps from "@/components/ui/ExercisesTab/ExerciseTabProps.ts";

interface ExercisesTabProps {
    tabs: ExerciseTabProps[]
    getExercises: () => ReactNode;
    onTabSelectClick: (tab: ExerciseTabProps) => void;
    isExercisesEmpty?: boolean;
    defaultShowPaywall: boolean;
    defaultTabId?: string | null;
    onPaidClick?: () => void;
}

export default ExercisesTabProps;
