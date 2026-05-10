/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionTypeScopeSchema } from './SubscriptionTypeScopeSchema';
export type SubscriptionTypeSchema = {
    id: number;
    name: string;
    price: number;
    access_duration_in_days: number;
    scope_type: string;
    exercises?: Array<SubscriptionTypeScopeSchema>;
};

