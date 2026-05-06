import * as Sentry from '@sentry/react';
import { EventsService } from '@/api/generated';

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

  public static readonly logger = {
    trace: (message: string, data?: Record<string, unknown>) => {
      Sentry.addBreadcrumb({ category: 'log', message, level: 'debug', data });
      if (import.meta.env.DEV) console.log(`[TRACE] ${message}`, data ?? '');
    },
    debug: (message: string, data?: Record<string, unknown>) => {
      Sentry.addBreadcrumb({ category: 'log', message, level: 'debug', data });
      if (import.meta.env.DEV) console.debug(`[DEBUG] ${message}`, data ?? '');
    },
    info: (message: string, data?: Record<string, unknown>) => {
      Sentry.addBreadcrumb({ category: 'log', message, level: 'info', data });
      console.info(`[INFO] ${message}`, data ?? '');
    },
    warn: (message: string, data?: Record<string, unknown>) => {
      Sentry.addBreadcrumb({ category: 'log', message, level: 'warning', data });
      console.warn(`[WARN] ${message}`, data ?? '');
    },
    error: (message: string, _error: unknown, _ctx: string, data?: Record<string, unknown>) => {
      Sentry.captureMessage(message, { level: 'error', extra: data });
      console.error(`[ERROR] ${message}`, data ?? '');
    },
  };

  public static async init(): Promise<void> {
    try {
      const types = await EventsService.apiViewsListEventTypes();
      types.forEach((t) => this.eventTypeMap.set(t.name, t.id));
    } catch {
      // non-critical — app works without analytics
    }
  }

  public static async logEvent(eventTypeId: number): Promise<void> {
    try {
      await EventsService.apiViewsCreateEventLog({ event_type_id: eventTypeId });
    } catch {
      // silently ignore analytics failures
    }
  }

  public static async logEventByName(name: string): Promise<void> {
    const id = this.eventTypeMap.get(name);
    if (id !== undefined) await this.logEvent(id);
  }

  public static async logAppOpen(gymId?: string | number) {
    await this.logEventByName('APP_OPEN');
    this.logger.info(`App open${gymId ? ` (gym: ${gymId})` : ''}`);
  }

  public static async logPageView(page: string, gymId?: string | number) {
    await this.logEventByName('PAGE_VIEW');
    this.logger.info(`Page view: ${page}${gymId ? ` (gym: ${gymId})` : ''}`);
  }

  public static async logOnboardingComplete() {
    await this.logEventByName('ONBOARDING_COMPLETE');
    this.logger.info('Onboarding complete');
  }

  public static async logGymView(gymId: string | number) {
    await this.logEventByName('GYM_VIEW');
    this.logger.info(`Gym view: ${gymId}`);
  }

  public static async logExerciseClick(exerciseId: number) {
    await this.logEventByName('EXERCISE_CLICK');
    this.logger.info(`Exercise click: ${exerciseId}`);
  }

  public static async logSubscriptionClick(planId: string | number) {
    await this.logEventByName('SUBSCRIPTION_CLICK');
    this.logger.info(`Subscription click: ${planId}`);
  }

  public static async logPaymentAttempt(planId: string | number, method: string) {
    await this.logEventByName('PAYMENT_ATTEMPT');
    this.logger.info(`Payment attempt: plan ${planId}, method ${method}`);
  }

  public static async logPaymentSuccess(planId: string | number) {
    await this.logEventByName('PAYMENT_SUCCESS');
    this.logger.info(`Payment success: ${planId}`);
  }

  public static async logPaymentFailure(planId: string | number, reason?: string) {
    await this.logEventByName('PAYMENT_FAILURE');
    this.logger.info(`Payment failure: ${planId}${reason ? `, reason: ${reason}` : ''}`);
  }

  public static async logPaymentMethodSelect(method: string) {
    await this.logEventByName('PAYMENT_METHOD_SELECT');
    this.logger.info(`Payment method: ${method}`);
  }

  public static async logSupportClick() {
    await this.logEventByName('SUPPORT_CLICK');
    this.logger.info('Support click');
  }

  public static async logVideoPlay(videoId: string | number) {
    await this.logEventByName('VIDEO_PLAY');
    this.logger.info(`Video play: ${videoId}`);
  }

  public static async logAppError(error: unknown, context?: string) {
    await this.logEventByName('APP_ERROR');
    this.logger.error('App error', error, context ?? '');
  }

  public static async logUserProfileView() {
    await this.logEventByName('USER_PROFILE_VIEW');
    this.logger.info('User profile view');
  }
}
