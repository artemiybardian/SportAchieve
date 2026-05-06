import * as Sentry from "@sentry/react";
import { EventsService } from '../api';

/**
 * Event Types based on project analysis.
 */
export enum EventType {
    PAGE_VIEW = 1,
    EXERCISE_CLICK = 2,
    SUBSCRIPTION_CLICK = 3,
    PAYMENT_METHOD_SELECT = 4,
    USER_PROFILE_VIEW = 5,
    VIDEO_PLAY = 6,
    SUPPORT_CLICK = 7,
    APP_OPEN = 8,
    ONBOARDING_COMPLETE = 9,
    GYM_VIEW = 10,
    PAYMENT_ATTEMPT = 11,
    PAYMENT_SUCCESS = 12,
    PAYMENT_FAILURE = 13,
    APP_ERROR = 14,
}

export class AnalyticsLogger {
    private static eventTypeMap: Map<string, number> = new Map();

    /**
     * Sentry Logger implementation for structured logging.
     */
    public static readonly logger = {
        trace: (message: string, data?: Record<string, unknown>) => {
            Sentry.addBreadcrumb({
                category: "log",
                message,
                level: "debug",
                data,
            });
            if (import.meta.env.DEV) console.log(`[TRACE] ${message}`, data || "");
        },
        debug: (message: string, data?: Record<string, unknown>) => {
            Sentry.addBreadcrumb({
                category: "log",
                message,
                level: "debug",
                data,
            });
            if (import.meta.env.DEV) console.debug(`[DEBUG] ${message}`, data || "");
        },
        info: (message: string, data?: Record<string, unknown>) => {
            Sentry.addBreadcrumb({
                category: "log",
                message,
                level: "info",
                data,
            });
            console.info(`[INFO] ${message}`, data || "");
        },
        warn: (message: string, data?: Record<string, unknown>) => {
            Sentry.addBreadcrumb({
                category: "log",
                message,
                level: "warning",
                data,
            });
            console.warn(`[WARN] ${message}`, data || "");
        },
        error: (message: string, _error: unknown, _p0: string, data?: Record<string, unknown>) => {
            Sentry.captureMessage(message, {
                level: "error",
                extra: data,
            });
            console.error(`[ERROR] ${message}`, data || "");
        },
        fatal: (message: string, data?: Record<string, unknown>) => {
            Sentry.captureMessage(message, {
                level: "fatal",
                extra: data,
            });
            console.error(`[FATAL] ${message}`, data || "");
        },
    };

    /**
     * Initializes the logger by fetching current event types from the API.
     * This ensures the IDs match the backend.
     */
    public static async init(): Promise<void> {
        try {
            const types = await EventsService.apiViewsListEventTypes();
            types.forEach(type => {
                this.eventTypeMap.set(type.name, type.id);
            });
            console.log('[AnalyticsLogger] Initialized with', types.length, 'event types');
        } catch (error) {
            console.error('[AnalyticsLogger] Failed to fetch event types:', error);
        }
    }

    /**
     * Logs an event by its type ID.
     * @param eventTypeId The ID of the event type.
     */
    public static async logEvent(eventTypeId: number): Promise<void> {
        try {
            await EventsService.apiViewsCreateEventLog({
                event_type_id: eventTypeId,
            });
        } catch (error) {
            console.error(`[AnalyticsLogger] Failed to log event ${eventTypeId}:`, error);
        }
    }

    /**
     * Logs an event by its name (if initialized).
     * @param eventTypeName The name of the event type.
     */
    public static async logEventByName(eventTypeName: string): Promise<void> {
        const id = this.eventTypeMap.get(eventTypeName);
        if (id !== undefined) {
            await this.logEvent(id);
        } else {
            console.warn(`[AnalyticsLogger] Unknown event type name: ${eventTypeName}`);
        }
    }

    // Convenience methods for common events
    public static async logPageView(pageName: string, gymId?: string | number): Promise<void> {
        // We could log "PAGE_VIEW" and maybe in the future add metadata if the API supports it
        await this.logEventByName('PAGE_VIEW');
        console.log(`[AnalyticsLogger] Page view: ${pageName}${gymId ? ` (gym_id: ${gymId})` : ''}`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Page view: ${pageName}${gymId ? ` (gym_id: ${gymId})` : ''}`);
    }

    public static async logAppOpen(gymId?: string | number): Promise<void> {
        await this.logEventByName('APP_OPEN');
        console.log(`[AnalyticsLogger] App open${gymId ? ` (gym_id: ${gymId})` : ''}`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] App open${gymId ? ` (gym_id: ${gymId})` : ''}`);
    }

    public static async logOnboardingComplete(): Promise<void> {
        await this.logEventByName('ONBOARDING_COMPLETE');
        console.log(`[AnalyticsLogger] Onboarding complete`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Onboarding complete`);
    }

    public static async logGymView(gymId: string | number): Promise<void> {
        await this.logEventByName('GYM_VIEW');
        console.log(`[AnalyticsLogger] Gym view: ${gymId}`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Gym view: ${gymId}`);
    }

    public static async logPaymentAttempt(planId: string | number, method: string): Promise<void> {
        await this.logEventByName('PAYMENT_ATTEMPT');
        console.log(`[AnalyticsLogger] Payment attempt: plan ${planId}, method ${method}`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Payment attempt: plan ${planId}, method ${method}`);
    }

    public static async logPaymentSuccess(planId: string | number): Promise<void> {
        await this.logEventByName('PAYMENT_SUCCESS');
        console.log(`[AnalyticsLogger] Payment success: plan ${planId}`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Payment success: plan ${planId}`);
    }

    public static async logPaymentFailure(planId: string | number, reason?: string): Promise<void> {
        await this.logEventByName('PAYMENT_FAILURE');
        console.log(`[AnalyticsLogger] Payment failure: plan ${planId}${reason ? `, reason: ${reason}` : ''}`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Payment failure: plan ${planId}${reason ? `, reason: ${reason}` : ''}`);
    }

    public static async logAppError(error: unknown, context?: string): Promise<void> {
        await this.logEventByName('APP_ERROR');
        console.error(`[AnalyticsLogger] App error:`, error, context ? `Context: ${context}` : '');
        AnalyticsLogger.logger.error(`[AnalyticsLogger] App error:`, error, context ? `Context: ${context}` : '');
    }

    public static async logExerciseClick(exerciseId: number): Promise<void> {
        await this.logEventByName('EXERCISE_CLICK');
        console.log(`[AnalyticsLogger] Exercise click: ${exerciseId}`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Exercise click: ${exerciseId}`);
    }

    public static async logSubscriptionClick(planId: string | number): Promise<void> {
        await this.logEventByName('SUBSCRIPTION_CLICK');
        console.log(`[AnalyticsLogger] Subscription click: ${planId}`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Subscription click: ${planId}`);
    }

    public static async logPaymentMethodSelect(method: string): Promise<void> {
        await this.logEventByName('PAYMENT_METHOD_SELECT');
        console.log(`[AnalyticsLogger] Payment method selected: ${method}`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Payment method selected: ${method}`);
    }

    public static async logSupportClick(): Promise<void> {
        await this.logEventByName('SUPPORT_CLICK');
        console.log(`[AnalyticsLogger] Support click`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Support click`);
    }

    public static async logVideoPlay(videoId: string | number): Promise<void> {
        await this.logEventByName('VIDEO_PLAY');
        console.log(`[AnalyticsLogger] Video play: ${videoId}`);
        AnalyticsLogger.logger.info(`[AnalyticsLogger] Video play: ${videoId}`);
    }
}
