# Supabase Auth localhost redirect fix

The application is already sending the correct `redirect_to` value:

`https://tg-command-center.maximo-seo.ai/auth/callback?next=%2Fdashboard`

If Magic Link emails still point to `http://localhost:3000/?code=...`, fix these Supabase Dashboard settings:

## 1. URL Configuration

Supabase Dashboard → Project `wtpczvyupmavzrxisvcm` → Authentication → URL Configuration

Set:

- Site URL: `https://tg-command-center.maximo-seo.ai`
- Redirect URLs / Additional Redirect URLs:
  - `https://tg-command-center.maximo-seo.ai/auth/callback`
  - `https://tg-command-center.maximo-seo.ai/**`

## 2. Email Template for Magic Link

Supabase Dashboard → Authentication → Email Templates → Magic Link

The link inside the template must use either:

```html
<a href="{{ .ConfirmationURL }}">Log in</a>
```

or, if it is manually constructing the link, it must use `{{ .RedirectTo }}` instead of `{{ .SiteURL }}`.

Bad pattern:

```html
<a href="{{ .SiteURL }}/?code={{ .TokenHash }}">Log in</a>
```

Good pattern:

```html
<a href="{{ .ConfirmationURL }}">Log in</a>
```

After saving, request a new Magic Link. Old email links cannot change retroactively.
