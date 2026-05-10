/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TokenResponse } from '../models/TokenResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthorizationService {
    /**
     * Get Token By Telegram
     * @param initData
     * @returns TokenResponse OK
     * @throws ApiError
     */
    public static apiViewsGetTokenByTelegram(
        initData: string,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/token/telegram',
            query: {
                'init_data': initData,
            },
            errors: {
                400: `Bad Request`,
            },
        });
    }
}
