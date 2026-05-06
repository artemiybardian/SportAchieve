/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExerciseCardSchema } from './ExerciseCardSchema';
import type { MuscleSchema } from './MuscleSchema';
export type TrainerSchema = {
    id: number;
    name: string;
    photo: string;
    description: string;
    muscles: Array<MuscleSchema>;
    exercises: Array<ExerciseCardSchema>;
};

