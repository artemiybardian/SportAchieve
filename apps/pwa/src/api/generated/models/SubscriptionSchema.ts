/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionTypeSchema } from './SubscriptionTypeSchema';
export type SubscriptionSchema = {
    id: number;
    type: SubscriptionTypeSchema;
    is_enabled: boolean;
    is_valid: boolean;
    updated_at: string;
    created_at: string;
    canceled_at: string | null;
};

