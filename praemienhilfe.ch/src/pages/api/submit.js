// src/pages/api/submit.js
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

  const portalId = import.meta.env.HUBSPOT_PORTAL_ID;
  const formId = import.meta.env.HUBSPOT_FORM_ID;

  const hubspotPayload = {
    fields: [
      { name: 'firstname', value: data.firstName },
      { name: 'lastname', value: data.lastName },
      { name: 'phone', value: data.phone },
      { name: 'email', value: data.email },
      { name: 'canton', value: data.canton },
      { name: 'income_range', value: data.income || '' },
      { name: 'household_type', value: data.household || '' },
      { name: 'lead_source', value: 'praemienhilfe.ch' },
      { name: 'utm_source', value: data.utm_source || '' },
      { name: 'utm_medium', value: data.utm_medium || '' },
      { name: 'utm_campaign', value: data.utm_campaign || '' },
      { name: 'utm_content', value: data.utm_content || '' },
    ],
    context: {
      pageUri: 'praemienhilfe.ch',
      pageName: 'Prämienverbilligung Landing',
    },
  };

  try {
    const hsResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hubspotPayload),
      }
    );

    if (!hsResponse.ok) {
      const detail = await hsResponse.text();
      console.error('[api/submit] HubSpot rejected submission:', hsResponse.status, detail);
      return new Response(JSON.stringify({ error: 'Failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('[api/submit] HubSpot request failed:', err);
    return new Response(JSON.stringify({ error: 'Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
