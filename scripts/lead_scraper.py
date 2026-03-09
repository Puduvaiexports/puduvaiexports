import sys
import json
import re
import asyncio
from typing import List, Dict, Optional
from playwright.async_api import async_playwright
import urllib.parse
from bs4 import BeautifulSoup
import aiohttp
from playwright_stealth import Stealth


def extract_emails(text: str) -> List[str]:
    """Find all email addresses in a string using regex."""
    if not text:
        return []
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    return list(set(re.findall(email_pattern, text)))

async def scrape_website_for_email(url: str) -> Optional[str]:
    """Visit a company's website (often the contact page) and look for an email."""
    if not url or 'google.com' in url or 'linkedin.com' in url or 'yelp.com' in url or 'alibaba.com' in url or 'bing.com' in url:
        return None
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    try:
        async with aiohttp.ClientSession(headers=headers) as session:
             async with session.get(url, timeout=10) as response:
                 if response.status == 200:
                     html = await response.text()
                     soup = BeautifulSoup(html, 'html.parser')
                     
                     mailtos = soup.find_all('a', href=re.compile(r'^mailto:'))
                     if mailtos:
                         email = mailtos[0]['href'].replace('mailto:', '').split('?')[0].strip()
                         if '@' in email: return email
                     
                     emails = extract_emails(soup.get_text())
                     if emails:
                         return emails[0] 
                        
                     if url.count('/') <= 3:
                         contact_url = url.rstrip('/') + "/contact"
                         async with session.get(contact_url, timeout=5) as c_response:
                             if c_response.status == 200:
                                 c_html = await c_response.text()
                                 c_soup = BeautifulSoup(c_html, 'html.parser')
                                 c_emails = extract_emails(c_soup.get_text())
                                 if c_emails: return c_emails[0]
                                 
    except Exception:
        pass
    
    return None

async def scrape_google_maps(page, query, country, max_results):
    search_term = f"{query} near {country}"
    encoded_search = urllib.parse.quote_plus(search_term)
    url = f"https://www.google.com/maps/search/{encoded_search}"

    leads = []
    sys.stderr.write(f"Navigating to Maps for: {search_term}\n")
    await page.goto(url, wait_until="domcontentloaded", timeout=45000)
    
    try:
        accept_button = page.locator('button:has-text("Accept all"), button:has-text("I agree")')
        if await accept_button.count() > 0:
            await accept_button.first.click(timeout=3000)
    except:
        pass

    await page.wait_for_selector('div[role="feed"]', timeout=15000)
    feed = page.locator('div[role="feed"]')
    
    pushed_count = 0
    while pushed_count < max_results:
        try:
            await feed.hover()
            await page.mouse.wheel(0, 3000) 
            await asyncio.sleep(2) 
            
            links = await page.locator('a[href*="/maps/place/"]').all()
            if len(links) >= max_results:
                break
                
            end_marker = page.locator('span:has-text("reached the end"), span:has-text("No more results")')
            if await end_marker.count() > 0:
                break
        except:
            break
            
        pushed_count += 5

    item_links = await page.locator('a[href*="/maps/place/"]').all()
    sys.stderr.write(f"Found {len(item_links)} potential links\n")
    item_links = item_links[:max_results]
    
    # First pass: Gather all basic info (Company Name, Phone, Website)
    for _, link in enumerate(item_links):
        try:
            lead = {"company_name": "", "phone": "", "website": "", "email": "", "category": query, "country": country, "source": "Google Maps"}
            
            # Try to get initial name from aria-label
            aria_label = await link.get_attribute('aria-label')
            if aria_label:
                lead["company_name"] = aria_label.split(' \u00b7 ')[0]

            await link.click(force=True)
            try:
                await page.wait_for_selector('h1.DUwDvf, h1.fontHeadlineLarge, div.fontHeadlineLarge', timeout=5000)
                await asyncio.sleep(0.5)
                
                name_element = await page.query_selector('h1.DUwDvf, h1.fontHeadlineLarge, div.fontHeadlineLarge')
                if name_element: 
                    text = await name_element.inner_text()
                    if text: lead["company_name"] = text
            except: 
                pass
                
            try:
                website_element = await page.query_selector('a[data-item-id="authority"]')
                if website_element:
                    href = await website_element.get_attribute('href')
                    if href: lead["website"] = href
            except: pass

            try:
                # Primary selector for phone
                phone_elements = await page.query_selector_all('button[data-tooltip="Copy phone number"], button[data-item-id^="phone:tel:"]')
                if phone_elements:
                    phone_text = await phone_elements[0].get_attribute('aria-label')
                    if phone_text: 
                        lead["phone"] = phone_text.replace("Phone number: ", "").replace("Phone: ", "").strip()
                else:
                    # Fallback for phone in text
                    content = await page.content()
                    phone_match = re.search(r'(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})', content)
                    if phone_match: lead["phone"] = phone_match.group(1)
            except: pass

            if lead["company_name"]:
                leads.append(lead)
                sys.stderr.write(f"Found: {lead['company_name']}\n")
                
        except Exception:
            continue
            
    # Second pass: Scrape emails concurrently with a limit
    semaphore = asyncio.Semaphore(15) # Increased to 15
    
    async def process_email(lead):
        if lead["website"]:
            async with semaphore:
                try:
                    lead["email"] = await scrape_website_for_email(lead["website"]) or ""
                except:
                    lead["email"] = ""
    
    if leads:
        sys.stderr.write(f"Scraping emails for {len(leads)} leads...\n")
        await asyncio.gather(*(process_email(l) for l in leads))

    return leads

async def scrape_google_dork(page, query, country, max_results, source_name):
    dork_map = {
        "LinkedIn": "site:linkedin.com/company",
        "Yelp": "site:yelp.com/biz",
        "Yellow Pages": "site:yellowpages.com OR site:yell.com",
        "Bing Places": "site:bing.com/maps",
        "Alibaba": "site:alibaba.com/showroom OR site:alibaba.com/product-detail"
    }
    
    site_query = dork_map.get(source_name, "")
    search_term = f'{site_query} {query} {country}'
    encoded_search = urllib.parse.quote_plus(search_term)
    
    # Run Google Web Search
    url = f"https://www.google.com/search?q={encoded_search}&num={min(max_results + 10, 50)}"
    leads = []
    
    await page.goto(url, wait_until="domcontentloaded", timeout=30000)
    
    try:
        # Improved consent handling
        consent_selectors = [
            'button:has-text("Accept all")',
            'button:has-text("I agree")',
            'button:has-text("Agree")',
            '#L2AGLb' # Common ID for Google consent button
        ]
        for selector in consent_selectors:
            btn = page.locator(selector)
            if await btn.count() > 0:
                await btn.first.click(timeout=3000)
                await asyncio.sleep(1)
                break
    except: pass

    # Check for CAPTCHA
    if await page.locator('iframe[src*="recaptcha"]').count() > 0 or "Our systems have detected unusual traffic" in await page.content():
        return [{"error": f"CAPTCHA or Bot Detection triggered on search for {source_name}"}]

    # Scrape Organic Results - More generic selectors for Headless Google
    # results = await page.query_selector_all('div.g, div[data-sokoban-container], div.tF2Cxc')
    results = await page.locator('div.g, div[data-sokoban-container], div.tF2Cxc').all()
    
    if not results:
        # Fallback for different Google layouts (especially on mobile/headless)
        results = await page.locator('div.MjjYud').all()

    for result in results:
        if len(leads) >= max_results: break
        
        lead = {"company_name": "", "phone": "", "website": "", "email": "", "category": query, "country": country, "source": source_name}
        
        try:
            title_el = await result.query_selector('h3')
            link_el = await result.query_selector('a')
            
            # Look for snippets across various known google payload structs
            snippet_el = await result.query_selector('div.VwiC3b, div.BNeawe, div.st, div.kb0H9d') 
            
            if title_el and link_el:
                title = await title_el.innerText()
                href = await link_el.getAttribute('href')
                
                if not href or "google.com" in href:
                    continue

                # Clean up title robustly
                clean_name = title.split(' - ')[0].split(' | ')[0].replace('LinkedIn', '').replace('Yelp', '').replace('Alibaba', '').strip()
                lead["company_name"] = clean_name
                lead["website"] = href
                
                if snippet_el:
                    snippet = await snippet_el.innerText()
                    phone_match = re.search(r'(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})', snippet)
                    if phone_match:
                        potential_phone = phone_match.group(1).strip()
                        if len(potential_phone) >= 8:
                            lead["phone"] = potential_phone
                    
                    emails = extract_emails(snippet)
                    if emails:
                        lead["email"] = emails[0]
                
                if lead["company_name"]:
                    leads.append(lead)
        except Exception:
            continue
            
    return leads




async def scrape_bing_dork(page, query, country, max_results, source_name):
    """Fallback search using Bing if Google blocks us."""
    dork_map = {
        "LinkedIn": "site:linkedin.com/company",
        "Yelp": "site:yelp.com/biz",
        "Yellow Pages": "site:yellowpages.com OR site:yell.com",
        "Bing Places": "site:bing.com/maps",
        "Alibaba": "site:alibaba.com/showroom OR site:alibaba.com/product-detail"
    }
    
    site_query = dork_map.get(source_name, "")
    search_term = f'{site_query} {query} {country}'
    encoded_search = urllib.parse.quote_plus(search_term)
    
    url = f"https://www.bing.com/search?q={encoded_search}"
    leads = []
    
    await page.goto(url, wait_until="domcontentloaded", timeout=30000)
    
    # Scrape Bing Organic Results
    results = await page.locator('li.b_algo').all()
    
    for result in results:
        if len(leads) >= max_results: break
        
        lead = {"company_name": "", "phone": "", "website": "", "email": "", "category": query, "country": country, "source": source_name}
        
        try:
            title_el = await result.query_selector('h2 a')
            snippet_el = await result.query_selector('div.b_caption p, div.b_snippet')
            
            if title_el:
                title = await title_el.innerText()
                href = await title_el.getAttribute('href')
                
                if not href or "bing.com" in href: continue

                clean_name = title.split(' - ')[0].split(' | ')[0].replace('LinkedIn', '').replace('Yelp', '').replace('Alibaba', '').strip()
                lead["company_name"] = clean_name
                lead["website"] = href
                
                if snippet_el:
                    snippet = await snippet_el.innerText()
                    phone_match = re.search(r'(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})', snippet)
                    if phone_match:
                        lead["phone"] = phone_match.group(1).strip()
                    
                    emails = extract_emails(snippet)
                    if emails:
                        lead["email"] = emails[0]
                
                if lead["company_name"]:
                    leads.append(lead)
        except Exception:
            continue
            
    return leads

async def run(query: str, country: str, max_results: int, source: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--window-position=0,0', '--ignore-certifcate-errors', '--ignore-certifcate-errors-spki-list', '--disable-dev-shm-usage', '--disable-gpu'])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            viewport={'width': 1920, 'height': 1080}
        )
        
        page = await context.new_page()
        await Stealth().apply_stealth_async(page)


        try:
            leads = []
            if source == "Google Maps":
                leads = await scrape_google_maps(page, query, country, max_results)
            else:
                # Try Google Dorking first
                leads = await scrape_google_dork(page, query, country, max_results, source)
                
                # If Google blocked us with a CAPTCHA, try Bing as fallback
                if any("CAPTCHA" in str(l.get("error", "")) for l in leads):
                    leads = await scrape_bing_dork(page, query, country, max_results, source)
                
            print(json.dumps(leads))
        except Exception as main_e:
            print(json.dumps({"error": str(main_e)}))
        finally:
            await browser.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing required arguments"}))
        sys.exit(1)

    query = sys.argv[1]
    country = sys.argv[2]
    max_results = int(sys.argv[3]) if len(sys.argv) > 3 else 10
    source = sys.argv[4] if len(sys.argv) > 4 else "Google Maps"
    
    asyncio.run(run(query, country, max_results, source))
