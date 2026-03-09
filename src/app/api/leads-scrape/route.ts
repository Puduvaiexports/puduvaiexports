export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const B2C_KEYWORDS = /hospital|clinic|pharmacy|surgery|care|dental|doctor/i;

async function getBrowser() {
    const puppeteer = (await import('puppeteer-extra')).default;
    const StealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;
    const chromium = (await import('@sparticuz/chromium')).default;

    puppeteer.use(StealthPlugin());

    if (process.env.NODE_ENV === 'production') {
        return puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true,
        });
    } else {
        return puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
}

async function scrapeGoogleMaps(page: any, query: string, country: string, maxResults: number) {
    const searchTerm = `${query} near ${country}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    try {
        const consentButton = await page.$('button[aria-label="Accept all"], button:has-text("I agree")');
        if (consentButton) await consentButton.click();
    } catch (e) { }

    let results: any[] = [];
    const feedSelector = 'div[role="feed"]';

    try {
        await page.waitForSelector(feedSelector, { timeout: 15000 });
        let lastHeight = 0;
        let attempts = 0;
        while (results.length < maxResults && attempts < 10) {
            results = await page.$$('a[href*="/maps/place/"]');
            if (results.length >= maxResults) break;

            await page.evaluate((selector: string) => {
                const feed = document.querySelector(selector);
                if (feed) feed.scrollTop = feed.scrollHeight;
            }, feedSelector);

            await new Promise(r => setTimeout(r, 2000));
            const newHeight = await page.evaluate((selector: string) => document.querySelector(selector)?.scrollHeight || 0, feedSelector);
            if (newHeight === lastHeight) break;
            lastHeight = newHeight;
            attempts++;
        }
    } catch (e) {
        console.error("Scroll error:", e);
    }

    const itemLinks = await page.$$('a[href*="/maps/place/"]');
    const leads: any[] = [];

    for (const link of itemLinks.slice(0, maxResults)) {
        try {
            const lead: any = { company_name: '', phone: '', website: '', email: '', category: query.replace(' Importers', ''), country, source: 'Google Maps' };

            await link.click();
            await new Promise(r => setTimeout(r, 1000));

            const nameHandler = await page.waitForSelector('h1', { timeout: 5000 });
            lead.company_name = await page.evaluate((el: any) => el.innerText, nameHandler);

            lead.website = await page.evaluate(() => {
                const el = document.querySelector('a[data-item-id="authority"]');
                return el ? (el as HTMLAnchorElement).href : '';
            });

            lead.phone = await page.evaluate(() => {
                const el = document.querySelector('button[data-tooltip="Copy phone number"]');
                return el ? el.getAttribute('aria-label')?.replace('Phone number: ', '').trim() : '';
            });

            if (lead.company_name) leads.push(lead);
        } catch (e) {
            console.error("Detail extraction error:", e);
        }
    }
    return leads;
}

async function scrapeDork(page: any, query: string, country: string, maxResults: number, source: string) {
    const dorkMap: Record<string, string> = {
        "LinkedIn": "site:linkedin.com/company",
        "Yelp": "site:yelp.com/biz",
        "Yellow Pages": "site:yellowpages.com",
        "Bing Places": "site:bing.com/maps",
        "Alibaba": "site:alibaba.com/showroom"
    };

    const siteQuery = dorkMap[source] || "";
    const searchTerm = `${siteQuery} ${query} ${country}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&num=${maxResults + 5}`;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    try {
        const consentButton = await page.$('#L2AGLb');
        if (consentButton) await consentButton.click();
    } catch (e) { }

    const results = await page.$$('div.g');
    const leads: any[] = [];

    for (const result of results.slice(0, maxResults)) {
        try {
            const lead: any = { company_name: '', phone: '', website: '', email: '', category: query.replace(' Importers', ''), country, source };

            const titleEl = await result.$('h3');
            const linkEl = await result.$('a');
            const snippetEl = await result.$('div.VwiC3b');

            if (titleEl && linkEl) {
                const title = await page.evaluate((el: any) => el.innerText, titleEl);
                lead.company_name = title.split(' - ')[0].split(' | ')[0].replace(/LinkedIn|Yelp|Alibaba/g, '').trim();
                lead.website = await page.evaluate((el: any) => el.href, linkEl);

                if (snippetEl) {
                    const snippet = await page.evaluate((el: any) => el.innerText, snippetEl);
                    const phoneMatch = snippet.match(/(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/);
                    if (phoneMatch) lead.phone = phoneMatch[0];

                    const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                    if (emailMatch) lead.email = emailMatch[0];
                }

                if (lead.company_name) leads.push(lead);
            }
        } catch (e) { }
    }
    return leads;
}

export async function POST(request: Request) {
    let browser;
    try {
        const body = await request.json();
        const { country, categories, sources = ["Google Maps"], strictFilter, maxResults = 5 } = body;

        if (!country || !categories || categories.length === 0) {
            return NextResponse.json({ error: 'Country and at least one category are required.' }, { status: 400 });
        }

        browser = await getBrowser();
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");

        let allLeads: any[] = [];

        for (const source of sources) {
            for (const category of categories) {
                let batch: any[] = [];
                if (source === "Google Maps") {
                    batch = await scrapeGoogleMaps(page, `${category} Importers`, country, Math.min(maxResults, 10));
                } else {
                    batch = await scrapeDork(page, `${category} Importers`, country, Math.min(maxResults, 10), source);
                }
                allLeads.push(...batch);
            }
        }

        const seen = new Set();
        let finalLeads = allLeads.filter(lead => {
            const normalized = (lead.company_name || "").toLowerCase().trim();
            if (seen.has(normalized)) return false;
            seen.add(normalized);
            return true;
        });

        if (strictFilter) {
            finalLeads = finalLeads.filter(lead => !B2C_KEYWORDS.test(lead.company_name || ""));
        }

        return NextResponse.json({ success: true, count: finalLeads.length, data: finalLeads }, { status: 200 });

    } catch (error: any) {
        console.error("Scraper API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
}
