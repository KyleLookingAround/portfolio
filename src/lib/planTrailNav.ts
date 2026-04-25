export const PLAN_TRAIL_EDIT_KEY = 'sq-plan-trail-edit-id';

export function navigateToPlanTrailEdit(id: string): void {
  sessionStorage.setItem(PLAN_TRAIL_EDIT_KEY, id);
  window.location.hash = '#/plan-trail';
}

export function navigateToPlanTrailNew(): void {
  sessionStorage.removeItem(PLAN_TRAIL_EDIT_KEY);
  window.location.hash = '#/plan-trail';
}

export function consumePlanTrailEditId(): string | null {
  const id = sessionStorage.getItem(PLAN_TRAIL_EDIT_KEY);
  if (id) sessionStorage.removeItem(PLAN_TRAIL_EDIT_KEY);
  return id;
}
