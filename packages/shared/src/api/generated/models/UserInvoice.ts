/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceTypeScopeSchema } from './InvoiceTypeScopeSchema';
export type UserInvoice = {
    id: number;
    user_id: number;
    type: InvoiceTypeScopeSchema;
    status: string;
    description: string;
    confirmation_url: string;
    created_at: string;
};

