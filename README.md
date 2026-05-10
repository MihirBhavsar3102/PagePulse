# PagePulse Chrome Extension

PagePulse is a production-ready, SaaS-grade Chrome Extension designed to continuously monitor specific webpages (like BookMyShow, Amazon, or custom portals) and instantly alert you via email when a defined change occurs.

## Features
- **Dynamic Site Support**: Monitors Single Page Applications (SPAs) and sites behind Cloudflare by evaluating the fully rendered DOM using background tabs.
- **Visual Dashboard**: Manage monitoring rules, check intervals, and EmailJS settings via a sleek React + TailwindCSS dashboard.
- **Flexible Rules**: Monitor for element existence, exact text match, or text contains (e.g. "Coming Soon" changing to "Book Tickets").
- **Smart Debouncing**: Prevents duplicate email alerts if the value hasn't changed since the last check.
- **Serverless**: Fully runs in the browser. Uses EmailJS for sending alerts without needing a dedicated backend.

## Local Development Workflow

Since this is a Vite + React + TypeScript project, you will need **Node.js** installed on your machine.

### 1. Install Node.js
Download and install Node.js from [nodejs.org](https://nodejs.org/).

### 2. Install Dependencies
Open a terminal in this project folder (`PagePulse`) and run:
```bash
npm install
```

### 3. Run the Development Server
To start Vite in watch mode (which automatically recompiles when you edit files):
```bash
npm run dev
```

### 4. Load the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right corner).
3. Click **Load unpacked**.
4. Select the `dist` folder that is generated inside the `PagePulse` directory after running `npm run dev` or `npm run build`.

## EmailJS Setup

To receive email alerts, you must configure EmailJS:
1. Go to [EmailJS](https://www.emailjs.com/) and create a free account.
2. Add an Email Service (e.g., Gmail) and note your **Service ID**.
3. Create an Email Template. 
   - Add variables to your template: `{{rule_name}}`, `{{url}}`, `{{detected_value}}`, and `{{timestamp}}`.
   - Note your **Template ID**.
4. Go to the Account Settings to find your **Public Key**.
5. Open the PagePulse extension options page, click **Edit** under EmailJS Settings, and enter these credentials along with the destination email address.

## Production Build

When you're ready to deploy or publish the extension, run:
```bash
npm run build
```
This command compiles the TypeScript code and bundles the React app into a highly optimized, minified `dist` folder suitable for production.

## Chrome Web Store Publishing Guide

1. Run `npm run build` to generate the production `dist` folder.
2. Compress the contents of the `dist` folder into a `.zip` file (do NOT zip the `dist` folder itself, zip its *contents* so `manifest.json` is at the root).
3. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
4. Pay the one-time $5 developer registration fee (if you haven't already).
5. Click **New Item** and upload your `.zip` file.
6. Fill out the store listing details (Description, Icons, Screenshots).
7. Justify your requested permissions (`storage`, `alarms`, `tabs`, `scripting`, `host_permissions`) in the Privacy section.
   - Example justification: "Tabs and Scripting are required to open dynamic web pages in the background to scrape their updated content."
8. Submit for review!
