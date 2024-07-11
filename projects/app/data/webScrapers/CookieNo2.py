import requests, re, sys, io, DrissionPage
from bs4 import BeautifulSoup

def scraper_website(url):
    website = requests.get(url)
    soup = BeautifulSoup(website.text, 'html.parser')
    text = soup.get_text()
    text_content = re.sub(r'\n{2,}', '\n\n', soup.get_text())
    return text_content

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python scraper.py <url>")
        sys.exit(1)

    url = sys.argv[1]
    print("get URL: ", url)
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    result = scraper_website(url)
    print(result)