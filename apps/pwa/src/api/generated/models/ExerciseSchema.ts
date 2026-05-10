/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExerciseInstructionType } from './ExerciseInstructionType';
import type { InstructionItem } from './InstructionItem';
import type { MuscleSchema } from './MuscleSchema';
export type ExerciseSchema = {
    id: number;
    name: string;
    access_type: string;
    description: string;
    muscles: Array<MuscleSchema>;
    instruction_type: ExerciseInstructionType;
    instruction?: (Array<InstructionItem> | null);
    video_url?: (string | null);
};

