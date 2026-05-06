/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExerciseInstructionType } from '../models/ExerciseInstructionType';
import type { TrainerSchema } from '../models/TrainerSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TrainersService {
    /**
     * List Trainers
     * @param instructionType
     * @returns TrainerSchema OK
     * @throws ApiError
     */
    public static apiViewsListTrainers(
        instructionType?: (ExerciseInstructionType | null),
    ): CancelablePromise<Array<TrainerSchema>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/trainers',
            query: {
                'instruction_type': instructionType,
            },
        });
    }
    /**
     * Get Trainer
     * @param trainerId
     * @param instructionType
     * @returns TrainerSchema OK
     * @throws ApiError
     */
    public static apiViewsGetTrainer(
        trainerId: string,
        instructionType?: (ExerciseInstructionType | null),
    ): CancelablePromise<TrainerSchema> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/trainers/{trainer_uuid}',
            path: {
                'trainer_uuid': trainerId,
            },
            query: {
                'instruction_type': instructionType,
            },
        });
    }
}
