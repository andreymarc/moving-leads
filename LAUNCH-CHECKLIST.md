# Quick Moving Leads Netlify Launch Checklist

## Before connecting the domain
- Deploy this folder as a Netlify site with publish directory set to the site root.
- Submit test entries on the homepage lead form, contact form, and CRM setup form.
- In Netlify Forms, add email notifications to `quickmovingleads@gmail.com`.
- Confirm the thank-you page loads after each form submission.
- Confirm `/mini-crm/` is not in the sitemap and returns `X-Robots-Tag: noindex, nofollow` on Netlify.

## Domain and SEO
- Point `quickmovingleads.com` to Netlify.
- Choose one canonical domain, preferably `https://quickmovingleads.com/`, and redirect `www` to non-`www` or the reverse.
- Submit `https://quickmovingleads.com/sitemap.xml` in Google Search Console.
- Request indexing for the homepage, `/exclusive-moving-leads/`, `/moving-leads/`, `/shared-moving-leads/`, and `/contact/`.

## Tracking
- Add analytics before launch if available.
- Track form submissions, phone clicks, text clicks, and CRM setup submissions.

## Security
- Treat the Mini CRM as a local browser tool only until a secure backend is added.
- Do not store private passwords, private API keys, or sensitive credentials in the Mini CRM.
