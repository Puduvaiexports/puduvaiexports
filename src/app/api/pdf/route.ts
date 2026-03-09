import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    // Build the absolute URL to target the brochure page internally
    // We add ?pdf=true so the client component can hide the navbar
    const targetUrl = request.url.split('/api/pdf')[0] + '/brochures/first-care?pdf=true';

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Force the viewport to match the LandscapePage exact CSS dimensions
        await page.setViewport({ width: 1123, height: 794, deviceScaleFactor: 1 });

        // Wait until all network requests finish to ensure fonts and images render
        await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 30000 });

        // Force screen emulation so CSS background colors render perfectly
        await page.emulateMediaType('screen');

        const pdfBuffer = await page.pdf({
            width: '1123px',
            height: '794px',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="FirstCare_Professional_Catalogue_2026.pdf"',
            },
        });
    } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json({ error: 'Failed to generate high-quality PDF. Please ensure the server is running locally.' }, { status: 500 });
    }
}
