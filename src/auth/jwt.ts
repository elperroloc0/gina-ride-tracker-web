export type Role = 'PARENT' | 'OPERATOR';

export type DecodedAccessToken = {
  role: Role;
  is_superuser: boolean;
  first_name?: string;
  user_id: number;
  exp: number;
};

/**
 * Decodes the JWT payload without verifying the signature - this is safe only
 * because the result is used solely to pick which UI shell to render (Parent
 * vs Operator). Real authorization stays server-side, in the backend's
 * IsOperatorOrReadOnly permission and each view's get_queryset() scoping.
 * Never use this to gate access to data.
 */
export function decodeAccessToken(token: string): DecodedAccessToken | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as DecodedAccessToken;
  } catch {
    return null;
  }
}

export function isOperator(decoded: DecodedAccessToken | null): boolean {
  return decoded != null && (decoded.role === 'OPERATOR' || decoded.is_superuser);
}
