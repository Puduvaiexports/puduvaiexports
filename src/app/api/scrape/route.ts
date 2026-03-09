import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

// Convert callback exec into promise-based for async/await
const execPromise = util.promisify(exec);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { country, categories, sources = ["Google Maps"], strictFilter, maxResults = 5 } = body;

        if (!country || !categories || categories.length === 0) {
            return NextResponse.json({ error: 'Country and at least one category are required.' }, { status: 400 });
        }

        const scriptPath = path.join(process.cwd(), 'scripts', 'lead_scraper.py');
        let allLeads: any[] = [];
        let lastError: string | null = null;

        // Create a list of all source-category combinations to scrape
        const tasks: { source: string, category: string }[] = [];
        for (const source of sources) {
            for (const category of categories) {
                tasks.push({ source, category });
            }
        }

        // Run scraping tasks with a concurrency limit
        const limit = 2;
        const results: any[] = [];
        for (let i = 0; i < tasks.length; i += limit) {
            const batch = tasks.slice(i, i + limit);
            const batchResults = await Promise.all(batch.map(async ({ source, category }) => {
                const query = `${category} Importers`.replace(/"/g, '\\"');
                const targetCountry = country.replace(/"/g, '\\"');
                const targetSource = source.replace(/"/g, '\\"');

                const command = `python "${scriptPath}" "${query}" "${targetCountry}" ${maxResults} "${targetSource}"`;

                try {
                    const { stdout, stderr } = await execPromise(command, { timeout: 300000 }); // 5 minute timeout

                    if (stderr && stderr.toLowerCase().includes('error')) {
                        console.error(`Python Stderr Warning (${category}):`, stderr);
                    }

                    const cleanedOutput = stdout.trim();
                    const leads = JSON.parse(cleanedOutput);

                    if (Array.isArray(leads)) {
                        return leads;
                    } else if (leads.error) {
                        console.error(`Scraper Error Return (${category}):`, leads.error);
                    }
                } catch (execError: any) {
                    console.error(`Failed to execute scraper for ${category}:`, execError);
                    lastError = execError.message;
                }
                return [];
            }));
            results.push(...batchResults);
        }

        // Flatten the results
        allLeads = results.flat();

        let finalLeads = allLeads;

        // Deduplication Logic
        const seenCompanies = new Set();
        finalLeads = finalLeads.filter(lead => {
            const normalizedName = (lead.company_name || "").toLowerCase().trim();
            if (seenCompanies.has(normalizedName)) return false;
            seenCompanies.add(normalizedName);
            return true;
        });

        // Strict Importer Filter
        if (strictFilter) {
            const b2cKeywords = /hospital|clinic|pharmacy|surgery|care|dental|doctor/i;
            finalLeads = finalLeads.filter(lead => !b2cKeywords.test(lead.company_name || ""));
        }

        if (finalLeads.length === 0 && lastError) {
            return NextResponse.json({ error: `Agent failure: ${lastError}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: finalLeads.length, data: finalLeads }, { status: 200 });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
