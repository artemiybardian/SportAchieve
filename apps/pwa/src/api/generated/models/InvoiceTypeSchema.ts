/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceTypeScopeSchema } from './InvoiceTypeScopeSchema';
export type InvoiceTypeSchema = {
    id: number;
    name: string;
    price: number;
    scop_type: string;
    exercises: Array<InvoiceTypeScopeSchema>;
};

