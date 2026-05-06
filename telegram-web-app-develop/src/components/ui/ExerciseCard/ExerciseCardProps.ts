
interface ExerciseCardProps {
    exerciseId: number | null | undefined;
    image: string | null | undefined;
    title: string;
    subtitle: string;
    access_type: string;
    onClick?: () => void;
}

export default ExerciseCardProps;