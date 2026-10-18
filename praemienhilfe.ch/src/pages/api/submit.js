// src/pages/api/submit.js
// Legacy HubSpot-only endpoint. The /antrag funnel now posts to
// netlify/functions/lead-to-twenty, which writes to Twenty and HubSpot.
import { sendLeadToHubSpot, hubspotErrorStep } from '../../lib/hubspot.js';

export const prerender = false;

export async function POST({ request }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const required = ['firstName', 'lastName', 'phone', 'email', 'canton'];
  const missing = required.filter((key) => !data[key]);
  if (missing.length > 0) {
    return new Response(JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = import.meta.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    console.error('[api/submit] HUBSPOT_ACCESS_TOKEN is not set');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const contactId = await sendLeadToHubSpot(token, data);
    console.log(`[api/submit] success — contact ${contactId}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/submit] HubSpot error:', hubspotErrorStep(err));
    return new Response(JSON.stringify({ error: 'Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
