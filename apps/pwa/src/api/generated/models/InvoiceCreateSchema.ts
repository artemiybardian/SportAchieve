/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InvoiceCreateSchema = {
    subscription_type_id: number;
    return_url: string;
    payment_method: InvoiceCreateSchema.payment_method;
};
export namespace InvoiceCreateSchema {
    export enum payment_method {
        BANK_CARD = 'bank_card',
        SBP = 'sbp',
    }
}

