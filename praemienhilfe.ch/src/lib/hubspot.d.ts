export function hubspotErrorStep(err: unknown): string;
export function sendLeadToHubSpot(token: string, data: Record<string, unknown>): Promise<string>;
