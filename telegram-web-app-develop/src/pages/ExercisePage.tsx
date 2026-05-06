import {Page} from "@/components/Page.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {Heading, Text} from "@/components/ui/Typography";
import {Divider} from "@/components/ui/Divider";
import {Section} from "@/components/ui/Section";
import {InstructionStep} from "@/components/ui/InstructionStep";
import {VideoPreview} from "@/components/ui/VideoPreview";
import {Button} from "@/components/ui/Button";
import ExerciseMachineCard from "@/components/ui/ExerciseMachineCard/ExerciseMachineCard.tsx";
import {useEffect, useState} from "react";
import {ExercisesService} from "@/api/generated/services/ExercisesService.ts";
import {ExerciseSchema} from "@/api/generated/models/ExerciseSchema.ts";
import {InstructionItem} from "@/api/generated/models/InstructionItem.ts";
import {ListBDUI, ListItemBDUI} from "@/api/custom/models.ts";

export default function ExercisePage() {
    const { exerciseId, instructionType } = useParams();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState<ExerciseSchema | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!exerciseId) return;
        const type = (instructionType === 'F' || instructionType === 'M' || instructionType === 'A') ? instructionType : 'A';
        ExercisesService.apiViewsGetExercise(Number(exerciseId), type)
            .then(data => {
                setExercise(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch exercise:", err);
                setLoading(false);
            });
    }, [exerciseId, instructionType]);

    const renderInstructionItem = (item: InstructionItem, index: number) => {
        const { type, data } = item;
        
        switch (type) {
            case "Header":
                return (
                    <Heading key={index} level={data.level || 3}>
                        {data.text}
                    </Heading>
                );
            case "paragraph":
                return (
                    <Text key={index} style={{ marginTop: "4px" }}>
                        {data.text}
                    </Text>
                );
            case "Delimiter":
                return <Divider key={index} margin="24px 0 24px 0" />;
            case "List":
                switch (data.style) {
                    case "ordered":
                        return (
                        <div key={index} style={{ marginTop: "4px" }}>
                            {Array.isArray(data.items) && (data as ListBDUI).items.map((item: ListItemBDUI, idx: number) => (
                                <InstructionStep key={idx} number={idx + 1}>
                                    {item.content}
                                </InstructionStep>
                            ))}
                        </div>
                    );
                    case "unordered": return (
                        <ul key={index} style={{ marginTop: "4px" }}>
                            {Array.isArray(data.items) && (data as ListBDUI).items.map((item: ListItemBDUI, idx: number) => (
                                <li key={idx}>
                                    {item.content}
                                </li>
                            ))}
                        </ul>
                    )
                    default:
                        return null;
                }
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Page back={true}>
                <Section padding="32px">
                    <Text>Loading...</Text>
                </Section>
            </Page>
        );
    }

    if (!exercise) {
        return (
            <Page back={true}>
                <Section padding="32px">
                    <Text>Инструкция упражнения не найдено. Обратитесь в поддержку.</Text>
                </Section>
            </Page>
        );
    }

    return (
        <Page back={true}>
            <ExerciseMachineCard
                title={exercise.name}
                description={exercise.description}
                muscles={exercise.muscles.map(m => m.name)}
                image={null}
            />

            {exercise.video_url && (
                <VideoPreview 
                    videoUrl={exercise.video_url}
                    posterUrl="https://i.imgur.com/o3U19PI_d.webp?maxwidth=760&fidelity=grand" 
                />
            )}

            <Section padding="32px 32px 0 32px">
                {exercise.instruction?.map((item, index) => renderInstructionItem(item, index))}
            </Section>

            <Section padding="24px 32px 32px 32px" style={{ display: "flex", justifyContent: "center" }}>
                <Button variant="secondary" onClick={() => navigate(-1)} style={{ minWidth: "178px", padding: "22px 80px" }}>
                    Назад к тренажеру
                </Button>
            </Section>
        </Page>
    );
}
