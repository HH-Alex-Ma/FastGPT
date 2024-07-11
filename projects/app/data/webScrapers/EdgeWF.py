import time
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.action_chains import ActionChains
import csv
import pymysql

#搜索相关设置#
#############

# 搜索关键字
theme='变速箱'
# 爬取文件数
papers_need = 2
# 开始计时
start_time = time.time()

# SETUP #
#########

 
# 建立一个表格
# with open(r'C:\Users\23122\ScrapingResults\WF_result_gearbox.csv', 'w', encoding='gbk', newline='') as f:
#     writer = csv.writer(f)
#     # 写入表头，按自己想爬的内容修改
#     header = ['申请/专利号', '专利名称', '申请人', '申请日', '公开日', '摘要', '专利链接']
#     writer.writerow(header)
#     print('file crreated')


#get直接返回，不再等待界面加载完成
desired_capabilities = DesiredCapabilities.EDGE
desired_capabilities["pageLoadStrategy"] = "none"
 
#设置 Edge 驱动器的环境
options = webdriver.EdgeOptions()
 
#设置 Edge 不加载图片，提高速度
options.add_experimental_option("prefs", {"profile.managed_default_content_settings.images": 2})
# options.add_argument("user-data-dir=C:\\Path\\To\\New\\Profile")
 
# 创建一个 Edge 驱动器
driver = webdriver.Edge(options=options)

#选择网址
driver.get("https://c.wanfangdata.com.cn/patent")


#根据关键字搜索
WebDriverWait(driver, 100).until(
        EC.presence_of_element_located((By.XPATH, "//input[@class='search-input']"))).send_keys(theme)
# 点击搜索
WebDriverWait(driver, 100).until(
        EC.presence_of_element_located((By.XPATH, "//div[@class='btn-box']"))).click()
time.sleep(3)

# 获取总文献数和页数
res_unm = WebDriverWait( driver, 100 ).until( EC.presence_of_element_located( (By.XPATH ,"//span[@class='total-number']/span[2]") ) ).text
# 去除千分位里的逗号
res_unm = int(res_unm.replace(",",''))
page_unm = int(res_unm/50) + 1
print(f"共找到 {res_unm} 条结果。")

#控制显示数量为50
WebDriverWait(driver, 100).until(
        EC.presence_of_element_located((By.XPATH, "//div[@class='wf-select right-items']/div[1]"))).click()
WebDriverWait(driver, 100).until(
        EC.presence_of_element_located((By.XPATH, "//div[@class='select-panel']/div[3]"))).click()
time.sleep(5)


# 筛选存在问题：下拉菜单只有第一个可以勾选，剩下的指令会卡住
'''
# 筛选有效专利
WebDriverWait(driver, 100).until(
        EC.presence_of_element_located((By.XPATH, "//div[@class='facet-wrapper']/div[6]"))).click()
time.sleep(5)
print("按了下拉菜单")
WebDriverWait(driver, 100).until(
        EC.presence_of_element_located((By.XPATH, "//div[@class='facet-wrapper']/div[6]/div[2]/div[1]/label[1]"))).click()
time.sleep(5)
print("按了第一个按钮")
WebDriverWait(driver, 100).until(
        EC.presence_of_element_located((By.XPATH, "//div[@class='facet-wrapper']/div[6]/div[2]/div[1]/lable[2]"))).click()
time.sleep(5)
print("按了第二个按钮")
WebDriverWait(driver, 100).until(
        EC.presence_of_element_located((By.XPATH, "//span[@class='fixed-btn-submit']"))).click()
print("按了筛选键")
'''

'''
# 由于知网的原因,需要滑动一下页面才能让信息加载完全,没搞懂知网加载机制,手动模拟了一下发现滑到第20再滑到40条才能50条显示完全
element_xpath = "//*[@class='result-table-list']/tbody/tr[20]"
# 等待元素出现
wait = WebDriverWait(driver, 300)
element = wait.until(EC.presence_of_element_located((By.XPATH, element_xpath)))

# 滚动到元素位置
actions = ActionChains(driver)
actions.move_to_element(element).perform()
time.sleep(5)
element_xpath = "//*[@class='result-table-list']/tbody/tr[40]"

# 等待元素出现
wait = WebDriverWait(driver, 300)
element = wait.until(EC.presence_of_element_located((By.XPATH, element_xpath)))
# 滚动到元素位置
actions = ActionChains(driver)
actions.move_to_element(element).perform()
time.sleep(3)
'''


## 处理结果 ##
#############

# 赋值序号, 控制爬取的文章数量
count = 1
# 当爬取数量小于需求时，循环网页页码
while count < papers_need:
    # 等待加载完全，休眠3s
    time.sleep(3)

    title_list = WebDriverWait( driver, 10 ).until( EC.presence_of_all_elements_located( (By.XPATH, "//div[@class='detail-list-wrap']/div/div") ) )
    print(f"本页共有 {len(title_list)} 条目")
    # 循环网页一页中的条目   
    for i in range(len(title_list)):
        try:
            term = count % 50 # 本页的第几个条目
            if term == 0:
                term = 50

            list_root_path = "//div[@class='detail-list-wrap']/div/div[]"
            #link_xpath = f"/html/body/div[2]/div[2]/div[2]/div[2]/div/div[2]/div/div[1]/div/div/table/tbody/tr[{term}]/td[2]/a"

            name_xpath = f"//div[@class='detail-list-wrap']/div/div[{term}]/div[1]/div[2]/span[2]"

            apply_No_xpath = f"//div[@class='detail-list-wrap']/div/div[{term}]/div[2]/span[3]"
            
            applicant_xpath = f"//div[@class='detail-list-wrap']/div/div[{term}]/div[2]/span[4]"

            apply_date_xpath = f"//div[@class='detail-list-wrap']/div/div[{term}]/div[2]/span[5]/span[1]"

            pub_date_xpath = f"//div[@class='detail-list-wrap']/div/div[{term}]/div[2]/span[5]/span[2]"

            #brief_xpath = f"//div[@class='detail-list-wrap']/div/div[{term}]/div[3]/span[2]"
            
            # 申请/专利号
            apply_No = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH, apply_No_xpath) ) ).text
            # 专利名称
            name = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH, name_xpath) ) ).text
            # 申请人
            applicant = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH, applicant_xpath) ) ).text
            # 申请日
            apply_date = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH, apply_date_xpath) ) ).text[4:]
            # 公开日
            pub_date = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH, pub_date_xpath) ) ).text[4:]
            # 摘要
            # brief = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH, brief_xpath) ) ).text
            # 专利链接
            #link = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH, link_xpath) ) ).get_attribute("href")

                   
            # 点击条目
            WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH, name_xpath) ) ).click()
            time.sleep(3)
            # 获取driver的句柄
            n = driver.window_handles 
            # driver切换至最新生产的页面
            driver.switch_to.window(n[-1])
            time.sleep(3)  
            current_url = driver.current_url
            brief_xpath = f"//div[@class='summary list']/span[2]/span/span"
            WebDriverWait(driver, 100).until(
                EC.presence_of_element_located((By.XPATH, "//div[@class='summary list']//span[@class='slot-box']"))).click()
            # 专利链接
            link = current_url
            # 摘要
            brief = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH, brief_xpath) ) ).text
            '''
            # 开始获取页面信息
            # title = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH ,"/html/body/div[2]/div[1]/div[3]/div/div/div[3]/div/h1") ) ).text
            # authors = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH ,"/html/body/div[2]/div[1]/div[3]/div/div/div[3]/div/h3[1]") ) ).text
            institute = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.XPATH ,"/html[1]/body[1]/div[2]/div[1]/div[3]/div[1]/div[1]/div[3]/div[1]/h3[2]") ) ).text
            abstract = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.CLASS_NAME  ,"abstract-text") ) ).text
            try:
                keywords = WebDriverWait( driver, 10 ).until( EC.presence_of_element_located((By.CLASS_NAME  ,"keywords") ) ).text[:-1]
            except:
                keywords = '无'
            url = driver.current_url
            # 获取下载链接 
            # link = WebDriverWait( driver, 10 ).until( EC.presence_of_all_elements_located((By.CLASS_NAME  ,"btn-dlcaj") ) )[0].get_attribute('href')
            # link = urljoin(driver.current_url, link)
            '''
            '''
            # 写入文件
            res = f"{count}\t{title}\t{authors}\t{institute}\t{date}\t{source}\t{database}\t{keywords}\t{abstract}\t{url}".replace("\n","")+"\n"
            print(res)
            with open('CNKI_res.tsv', 'a', encoding='gbk') as f:
                f.write(res)
            '''

            # 打印结果
            content = [apply_No, name, applicant, apply_date, pub_date, brief, link]
            # content.encode('gbk')
            print(content)

            # 写入结果
            # with open(r'C:\Users\23122\ScrapingResults\WF_result_gearbox.csv', 'a', encoding='gbk', newline='') as f:
            #     writer = csv.writer(f)
            #     writer.writerow(content)
            #     print("信息写入完成")
                
        except:
            print(f" 第{count} 条爬取失败\n")
            # 跳过本条，接着下一个
            continue
        finally:
            
            # 如果有多个窗口，关闭第二个窗口， 切换回主页
            n2 = driver.window_handles
            if len(n2) > 1:
                driver.close()
                driver.switch_to.window(n2[0])
            
            # 计数,判断需求是否足够
            if count == papers_need:break
            count += 1
            

    
    # 切换到下一页
    WebDriverWait( driver, 10 ).until( EC.presence_of_element_located( (By.XPATH ,"//div[@class='bottom-pagination']/span[@class='next']") ) ).click()

# 关闭浏览器
driver.close()
# 计算用时
end_time = time.time()
elapsed_time = end_time - start_time
print(f"总共用时：{elapsed_time:.2f} 秒")

