/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceCreateSchema } from '../models/InvoiceCreateSchema';
import type { InvoiceSchema } from '../models/InvoiceSchema';
import type { MessageResponse } from '../models/MessageResponse';
import type { SubscriptionSchema } from '../models/SubscriptionSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubscriptionService {
    /**
     * Subscribe
     * @param requestBody
     * @returns InvoiceSchema OK
     * @throws ApiError
     */
    public static apiViewsSubscribe(
        requestBody: InvoiceCreateSchema,
    ): CancelablePromise<InvoiceSchema> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/subscriptions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
            },
        });
    }
    /**
     * Get User Subscription
     * @returns any OK
     * @throws ApiError
     */
    public static apiViewsGetUserSubscription(): CancelablePromise<(SubscriptionSchema | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/subscriptions',
        });
    }
    /**
     * Delete Subscription
     * @param subscriptionId
     * @returns MessageResponse OK
     * @throws ApiError
     */
    public static apiViewsDeleteSubscription(
        subscriptionId: number,
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/subscriptions/{subscription_id}',
            path: {
                'subscription_id': subscriptionId,
            },
            errors: {
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
