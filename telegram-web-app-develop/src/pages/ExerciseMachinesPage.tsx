import Header from "@/components/Header.tsx";
import {Page} from "@/components/Page.tsx";
import ExerciseMachineCard from "@/components/ui/ExerciseMachineCard/ExerciseMachineCard.tsx";
import ExerciseCard from "@/components/ui/ExerciseCard/ExerciseCard.tsx";
import ExercisesTab from "@/components/ui/ExercisesTab/ExercisesTab.tsx";
import ExerciseTabProps from "@/components/ui/ExercisesTab/ExerciseTabProps.ts";
import {DrawerProvider, useDrawer} from "@/components/ui/DrawerNavigation";
import SubscriptionDrawer from "@/drawers/SubscriptionDrawer.tsx";
import { useUser } from "@/hooks/useUser";
import {useEffect, useState} from "react";
import {TrainersService, TrainerSchema, ExerciseInstructionType} from "@/api";
import {useNavigate, useParams} from "react-router-dom";
import { AnalyticsLogger } from "@/services/AnalyticsLogger";

interface ExerciseMachinesProps {
    machineId?: number;
}

export default function ExerciseMachinesPage({ machineId }: ExerciseMachinesProps) {


    function getMachineIdFromParams(): number | null {
        const { machineId } = useParams();
        console.debug("getMachineIdFromParams. machineIdFromParams:", machineId)
        if (machineId) {
            return parseInt(machineId);
        }
        return null;
    }

    function getMachineId(): number {
        const machineIdFromParams = getMachineIdFromParams()
        console.debug("getMachineId. machineIdFromParams:", machineIdFromParams)
        if (machineIdFromParams) {
            return machineIdFromParams;
        } else if (machineId) {
            return machineId;
        } else {
            return 0; // сигнал: нужно загрузить список и взять первый
        }
    }

    return (
        <Page back={false}>
            <DrawerProvider>
                <ExerciseMachinesContent id={getMachineId()}/>
            </DrawerProvider>
        </Page>
    )
}

function ExerciseMachinesContent({ id }: { id: number }) {

    const navigate = useNavigate();
    const { openDrawer, pushView } = useDrawer();
    const { fullName, avatarUrl, subscription } = useUser();
    const [trainer, setTrainer] = useState<TrainerSchema | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTabLoading, setIsTabLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState<string | null>(null);
    const [resolvedId, setResolvedId] = useState<number>(id);

    // Если id=0 (нет startParam и нет параметра в URL) — берём первый тренажёр из списка
    useEffect(() => {
        if (id === 0) {
            TrainersService.apiViewsListTrainers()
                .then(list => {
                    if (list && list.length > 0) {
                        const firstId = list[0].id;
                        setResolvedId(firstId);
                        navigate(`/exercise/machine/${firstId}`, { replace: true });
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch trainers list:", err);
                    setIsLoading(false);
                });
        }
    }, [id]);

    function loadTrainerData(trainerId: number, instructionType?: (ExerciseInstructionType | null)) {
        console.debug("Loading trainer data for trainerId:", trainerId, "with instructionType:", instructionType);
        if (!trainer) {
            setIsLoading(true);
        } else {
            setIsTabLoading(true);
        }
        TrainersService.apiViewsGetTrainer(trainerId, instructionType)
            .then(data => {
                setTrainer(data);
            })
            .catch(err => {
                setTrainer(null);
                console.error("Failed to fetch trainer:", err);
            })
            .finally(() => {
                setIsLoading(false);
                setIsTabLoading(false);
            });
    }

    useEffect(() => {
        if (resolvedId === 0) return; // ждём resolvedId от списка
        void AnalyticsLogger.logGymView(resolvedId);
        loadTrainerData(resolvedId);
    }, [resolvedId]);

    const openSubscriptionDrawer = () => {
        openDrawer({
            title: "Оплата",
            content: <SubscriptionDrawer pushView={pushView} />
        });
    };

    const tabs: ExerciseTabProps[] = [
        { id: null, name: "Все" },
        { id: 'M', name: "Мужчины" },
        { id: 'F', name: "Женщины" }
    ];

    const getExercises = () => {
        if (!trainer) return null;

        if (isTabLoading) {
            return <div>Loading exercises...</div>;
        }

        return (
            <div>
                {trainer.exercises.map((exercise) => (
                    <ExerciseCard
                        key={exercise.id}
                        exerciseId={exercise.id}
                        image={exercise.cover}
                        title={exercise.name}
                        subtitle={exercise.description}
                        access_type={exercise.access_type}
                        onClick={() => {
                            if (exercise.access_type === "PAID" && !subscription?.is_valid) {
                                openSubscriptionDrawer();
                            } else {
                                navigate(`/exercise/${exercise.id}/${currentTab}`);
                            }
                        }}
                    />
                ))}
            </div>
        );
    };

    const loadExercises = (tab: ExerciseTabProps) => {
        if (tab.id === "M") {
            loadTrainerData(id, ExerciseInstructionType.M)
        } else if (tab.id === "F") {
            loadTrainerData(id, ExerciseInstructionType.F)
        } else {
            loadTrainerData(id, null)
        }
        setCurrentTab(tab.id)
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!trainer) {
        return <div style={{width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{ color: 'var(--tg-theme-destructive-text-color)' }}>Тренажер на найден</div>
        </div>;
    }

    return <>
        <Header 
            name={fullName} 
            avatarUrl={avatarUrl} 
            daysLeft={subscription?.type?.access_duration_in_days || 0}
            hasSubscription={subscription?.is_valid}
        />
        <ExerciseMachineCard
            title={trainer.name}
            description={trainer.description}
            image={trainer.photo}
            muscles={trainer.muscles.map(m => m.name)}
        />
        <ExercisesTab
            tabs={tabs}
            getExercises={getExercises}
            defaultTabId={currentTab}
            isExercisesEmpty={trainer.exercises.length === 0}
            defaultShowPaywall={subscription === null || !subscription.is_valid}
            onPaidClick={() => openSubscriptionDrawer()}
            onTabSelectClick={loadExercises}
        />
    </>
}
