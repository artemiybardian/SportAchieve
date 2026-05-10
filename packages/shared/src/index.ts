// Re-export the most frequently used shared entry-points.
// Individual sub-paths (e.g. @sportachieve/shared/store) are preferred
// inside workspace apps for better tree-shaking.
export { initApiClient, setApiToken } from './api/client';
export { store } from './store';
export type { AppDispatch, RootState } from './store';
