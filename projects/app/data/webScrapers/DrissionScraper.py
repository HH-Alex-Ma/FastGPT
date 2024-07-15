import sys, io
from DrissionPage import ChromiumOptions, WebPage

def scraper_website(url):
    co = ChromiumOptions()
    # co.headless(True)
    page = WebPage(mode='d', chromium_options=co)
    page.get(url)
    page.wait(3)
    # 滚动到页面底部，加载所有内容
    # page.scroll.to_bottom()
    # page.change_mode()
    body = page.ele('@tag()=body')
    text_content = body.text
    page.quit()
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