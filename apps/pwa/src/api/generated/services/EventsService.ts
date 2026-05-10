/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventLogCreateSchema } from '../models/EventLogCreateSchema';
import type { EventLogSchema } from '../models/EventLogSchema';
import type { EventTypeSchema } from '../models/EventTypeSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EventsService {
    /**
     * List Event Types
     * @returns EventTypeSchema OK
     * @throws ApiError
     */
    public static apiViewsListEventTypes(): CancelablePromise<Array<EventTypeSchema>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/events/types',
        });
    }
    /**
     * Create Event Log
     * @param requestBody
     * @returns EventLogSchema OK
     * @throws ApiError
     */
    public static apiViewsCreateEventLog(
        requestBody: EventLogCreateSchema,
    ): CancelablePromise<EventLogSchema> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/events/logs',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
