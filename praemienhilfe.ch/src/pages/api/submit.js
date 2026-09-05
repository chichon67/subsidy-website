// src/pages/api/submit.js
export const prerender = false;

const BASE = 'https://api.hubapi.com';

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// Create or update a contact — returns the contact id
async function upsertContact(token, props) {
  const res = await fetch(`${BASE}/crm/v3/objects/contacts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ properties: props }),
  });

  if (res.status === 409) {
    const contactId = await findContactByEmail(token, props.email);
    const patchRes = await fetch(`${BASE}/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ properties: props }),
    });
    if (!patchRes.ok) {
      const err = await patchRes.json();
      throw new Error(`HubSpot update contact: ${err.message || patchRes.status}`);
    }
    return contactId;
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`HubSpot create contact: ${err.message || res.status}`);
  }

  const data = await res.json();
  return data.id;
}

async function findContactByEmail(token, email) {
  const res = await fetch(`${BASE}/crm/v3/objects/contacts/search`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
      properties: ['email'],
      limit: 1,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.results?.[0]) throw new Error('Contact not found after conflict');
  return data.results[0].id;
}

// Create a note associated with a contact
async function createNote(token, contactId, noteBody) {
  const res = await fetch(`${BASE}/crm/v3/objects/notes`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      properties: {
        hs_note_body: noteBody,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [{
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }],
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`HubSpot create note: ${err.message || res.status}`);
  }
}

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

  // Sanitize phone to E.164-ish: keep leading +, strip everything else non-digit
  const rawPhone = data.phone || '';
  const phone = rawPhone.startsWith('+')
    ? '+' + rawPhone.slice(1).replace(/\D/g, '')
    : rawPhone.replace(/\D/g, '');

  // Only send properties that actually exist on the Contact object in this
  // HubSpot portal — an unknown property name fails the whole request.
  const contactProps = {
    firstname: data.firstName,
    lastname: data.lastName,
    email: data.email,
    phone,
    canton: data.canton,
  };

  try {
    const contactId = await upsertContact(token, contactProps);

    const noteBody = [
      `Antrag über praemien-hilfe.ch`,
      `Kanton       : ${data.canton}`,
      `Einkommen    : ${data.income || '—'}`,
      `Haushalt     : ${data.household || '—'}`,
      `Situation    : ${data.situation || '—'}`,
      `Lead-Quelle  : praemien-hilfe.ch`,
      `UTM          : source=${data.utm_source || '—'} medium=${data.utm_medium || '—'} campaign=${data.utm_campaign || '—'} content=${data.utm_content || '—'}`,
    ].join('\n');

    try {
      await createNote(token, contactId, noteBody);
    } catch (e) {
      // Note failure is non-fatal — contact was already created
      console.error('[api/submit] note error:', e.message);
    }

    console.log(`[api/submit] success — contact ${contactId}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[api/submit] HubSpot error:', err.message);
    return new Response(JSON.stringify({ error: 'Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
