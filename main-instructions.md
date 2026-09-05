I want you to convert my existing website into a multilingual website with German, English, and Spanish.

IMPORTANT CONTEXT
- Current site: prämienhilfe.ch
- Current primary language: German
- The site is used to generate leads for Swiss health insurance / Prämienverbilligung-related services.
- The current website is already live and working.
- Google Ads tracking is already installed with Google tag:
  AW-18005574565
- Do NOT remove, duplicate, or break the existing Google Ads tracking.
- Existing form tracking and thank-you page behavior must continue working.
- Existing successful form submissions currently go to /danke and this page is used for conversion tracking.
- Do not change existing form logic unless required for multilingual support.
- Keep the current design, layout, styles, responsiveness, animations, components and overall visual identity unchanged unless a change is necessary for language support.

GOAL
Turn the current German-only site into a clean multilingual setup with:

1. German
2. English
3. Spanish

ARCHITECTURE
Use language-prefixed URLs:

German:
https://prämienhilfe.ch/de/

English:
https://prämienhilfe.ch/en/

Spanish:
https://prämienhilfe.ch/es/

All important pages should have equivalent localized URLs.

Examples:

/de/
/en/
/es/

/de/danke
/en/thank-you
/es/gracias

If the existing architecture makes localized thank-you URLs risky for Google Ads conversion tracking, keep /danke as the final technical thank-you URL for all languages, but display the thank-you content in the language selected by the user.

DO NOT break the current Google Ads conversion tracking.

LANGUAGE DETECTION
Implement browser-language detection for first-time visitors.

Logic:

- If browser language starts with "de" → German
- If browser language starts with "es" → Spanish
- If browser language starts with "en" → English
- For all other languages → default to German

Important:
- Only auto-detect when the visitor enters through the root domain /
- Do NOT automatically redirect someone who explicitly visits /de/, /en/ or /es/
- Once the user manually selects a language, save the preference in localStorage or a cookie.
- Manual language preference must override browser detection on future visits.
- Avoid redirect loops.
- The redirect should be fast and not cause noticeable flashing.

LANGUAGE SWITCHER
Add a visible language switcher to the main navigation/header.

Desktop:
DE | EN | ES

Mobile:
Include the same selector in the mobile menu.

Requirements:
- Keep it subtle and consistent with the current design.
- Clearly indicate the currently active language.
- When switching language, try to keep the user on the equivalent page.

Example:
If user is on:
/de/some-page

and chooses English, send them to:
/en/some-page

Do not always send users back to the homepage if an equivalent translated page exists.

TRANSLATIONS
Translate all user-facing content into natural English and Spanish.

This includes:
- navigation
- headings
- paragraphs
- buttons
- forms
- placeholders
- labels
- validation messages
- success/error messages
- footer
- FAQs
- trust text
- CTA text
- legal navigation labels
- mobile menu
- metadata
- page titles
- meta descriptions

Do NOT perform literal word-for-word translations.

The language should sound natural and professional for people living in Switzerland.

German source terminology:
- Prämienverbilligung
- Krankenkasse
- Krankenversicherung
- Prämien
- Antrag
- Anspruch prüfen
- individuelle Prämienverbilligung / IPV

English terminology should use natural Swiss-context wording, such as:
- health insurance premium reduction
- premium subsidy
- Swiss health insurance
- check eligibility
- subsidy application

Spanish terminology should use natural wording understandable to Spanish-speaking residents in Switzerland, such as:
- reducción de primas del seguro médico
- subsidio para el seguro médico
- seguro médico en Suiza
- comprobar si tiene derecho
- solicitud de reducción de primas

Do not make legal or financial claims that are stronger than the German source content.

FORMS
The existing lead form must work identically in all three languages.

Requirements:
- Same backend submission
- Same CRM/API destination
- Same tracking
- Same field names internally where possible
- Translate only user-facing labels and validation text
- Do not create separate incompatible form logic per language

Important:
The Google Ads conversion should still fire only after a successful completed form submission.

Do not trigger conversion events:
- when a user starts the form
- when they complete individual steps
- when they click buttons
- when they merely visit a page

Only the final successful lead should count as the main conversion.

GOOGLE ADS / ANALYTICS
Preserve all existing analytics and ad tracking.

Google Ads tag:
AW-18005574565

Requirements:
- Do not install a second copy of this tag
- Do not remove it
- Do not duplicate pageview events
- Do not duplicate conversion events
- Do not break Tag Assistant detection
- Make sure the tag remains available on every language version

If the site currently uses custom events such as:
- antrag_form_submit
- antrag_conversion
- antrag_step_email_complete
- antrag_step_household_complete
- antrag_step_income_complete

preserve them unless there is a technical reason not to.

SEO
Implement multilingual SEO correctly.

For each translated page:
- unique <title>
- unique meta description
- correct canonical URL
- hreflang tags

Use:

hreflang="de"
hreflang="en"
hreflang="es"

Also add:
hreflang="x-default"

The x-default should point to the root URL or German default page, depending on the architecture you implement.

Example hreflang mapping:

/de/page
/en/page
/es/page

Do not canonicalize all translated pages back to German.

Each language page should be independently indexable.

Update sitemap generation so Google can discover all DE/EN/ES URLs.

Do not add noindex to translated pages.

ROOT DOMAIN
For https://prämienhilfe.ch/

Implement a lightweight language routing strategy.

Preferred behavior:
- detect saved language preference first
- otherwise detect browser language
- redirect to /de/, /en/, or /es/

If browser language is unsupported, redirect to /de/.

Make sure search engine crawlers can still discover all language versions and that the implementation is SEO-safe.

LEGAL / TRUST
Do not modify legal company information, regulatory disclosures, privacy information, contact details, company name, or compliance text unless only translating the visible wording.

Never invent:
- FINMA registrations
- licenses
- guarantees
- government affiliations
- official canton partnerships

If a legal phrase is ambiguous, keep the original German version and mark it for manual review rather than inventing a translation.

DESIGN
Do not redesign the site.

Keep:
- same fonts
- same colors
- same spacing
- same cards
- same buttons
- same mobile behavior
- same visual hierarchy

Only add what is necessary for multilingual support.

IMPLEMENTATION QUALITY
Do not hardcode translated strings throughout many components if avoidable.

Create a clean translation architecture, for example:

locales/
  de.json
  en.json
  es.json

or the most appropriate equivalent for the existing framework.

Use reusable translation keys.

Example:
nav.home
nav.faq
hero.title
hero.subtitle
form.firstName
form.email
form.submit
thankYou.title

If the project already uses an i18n library, extend the existing implementation instead of introducing an unnecessary second system.

If no i18n system exists, choose a lightweight approach appropriate for the current stack.

PERFORMANCE
Do not materially worsen page speed.

Avoid:
- heavy translation libraries if unnecessary
- unnecessary client-side rendering
- duplicate assets
- loading all translations if only one is required

QUALITY CHECKS
Before finishing, verify:

1. /de/ works
2. /en/ works
3. /es/ works
4. Browser language detection works
5. Saved user preference works
6. Manual language switch works
7. Mobile language switch works
8. Switching language retains equivalent page where possible
9. Forms submit successfully in every language
10. Final successful lead still reaches the conversion success state
11. Google Ads tag AW-18005574565 still fires
12. Google Ads tag is not duplicated
13. Existing analytics events still work
14. SEO titles and descriptions exist per language
15. hreflang is correct
16. canonical tags are correct
17. sitemap includes translated pages
18. no redirect loop exists
19. unsupported browser languages fall back to German
20. existing German site functionality has not regressed

VERY IMPORTANT
Do not blindly make changes before inspecting the project.

First:
1. inspect the project structure
2. identify the framework
3. identify routing
4. identify where the header/navigation is rendered
5. identify how forms work
6. identify how the thank-you page works
7. identify existing Google Ads/Analytics tracking
8. identify current SEO implementation

Then give me a short implementation plan.

After the plan, implement the changes.

At the end, give me:
- files changed
- routing structure
- translation architecture
- how browser-language detection works
- how manual language preference is stored
- confirmation that AW-18005574565 was preserved
- confirmation that form conversion tracking was preserved
- any text/legal translations that need manual review
- exact commands I should run to test/build/deploy