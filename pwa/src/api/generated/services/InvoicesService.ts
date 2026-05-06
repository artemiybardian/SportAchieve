/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceTypeSchema } from '../models/InvoiceTypeSchema';
import type { UserInvoice } from '../models/UserInvoice';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InvoicesService {
    /**
     * List Invoice Types
     * @returns InvoiceTypeSchema OK
     * @throws ApiError
     */
    public static apiViewsListInvoiceTypes(): CancelablePromise<Array<InvoiceTypeSchema>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/invoices/types',
        });
    }
    /**
     * Get User Invoices
     * @returns UserInvoice OK
     * @throws ApiError
     */
    public static apiViewsGetUserInvoices(): CancelablePromise<Array<UserInvoice>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/invoices',
        });
    }
    /**
     * Yookasa Webhook
     * @returns any OK
     * @throws ApiError
     */
    public static apiViewsYookasaWebhook(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/yookasa/log',
        });
    }
}
