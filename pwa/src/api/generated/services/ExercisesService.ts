/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExerciseSchema } from '../models/ExerciseSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExercisesService {
    /**
     * Get Exercise
     * @param exerciseId
     * @param instructionType
     * @returns ExerciseSchema OK
     * @throws ApiError
     */
    public static apiViewsGetExercise(
        exerciseId: number,
        instructionType: 'M' | 'F' | 'A',
    ): CancelablePromise<ExerciseSchema> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exercises/{exercise_id}',
            path: {
                'exercise_id': exerciseId,
            },
            query: {
                'instruction_type': instructionType,
            },
            errors: {
                400: `Bad Request`,
                402: `Payment Required`,
                404: `Not Found`,
            },
        });
    }
}
