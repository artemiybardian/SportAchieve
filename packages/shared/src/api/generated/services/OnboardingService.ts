/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserSchema } from '../models/UserSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OnboardingService {
    /**
     * Complete Onboarding
     * @returns any OK
     * @throws ApiError
     */
    public static apiViewsCompleteOnboarding(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/onboarding/complete',
        });
    }
    /**
     * Get User
     * @returns UserSchema OK
     * @throws ApiError
     */
    public static apiViewsGetUser(): CancelablePromise<UserSchema> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/user',
        });
    }
}
