const puppeteer = require('puppeteer');

const selfReport = async function (time, username, password) {

  const browser = await puppeteer.launch({
    headless: true,   //有浏览器界面启动
    slowMo: 10,    //放慢速度
    headless: false,
    defaultViewport: { width: 1440, height: 780 },
    ignoreHTTPSErrors: false, //忽略 https 报错
    // args: ['--start-fullscreen'] //全屏打开页面
  });
  const page = await browser.newPage();
  try {
    await page.goto('https://newsso.shu.edu.cn/login');
    //输入账号密码
    const uniqueIdElement = await page.$('#username');
    await uniqueIdElement.type(username, { delay: 0 });
    const passwordElement = await page.$('#password', { delay: 0 });
    await passwordElement.type(password);
    //点击确定按钮进行登录
    let okButtonElement = await page.$('#login-submit');
    //等待页面跳转完成，一般点击某个按钮需要跳转时，都需要等待 page.waitForNavigation() 执行完毕才表示跳转成功
    await Promise.all([
      okButtonElement.click(),
      page.waitForNavigation()
    ]);

    await page.goto('https://selfreport.shu.edu.cn/Default.aspx');
    let reportButtonElement = await page.$('#lnkReport');
    await Promise.all([
      reportButtonElement.click(),
      page.waitForNavigation()
    ]);
    let dayReport = await page.$('#p1_Button1');
    let nightReport = await page.$('#p1_Button2');
    if (time == 1) {
      await Promise.all([
        dayReport.click(),
        page.waitForNavigation()
      ]);
    }
    else {
      await Promise.all([
        nightReport.click(),
        page.waitForNavigation()
      ]);
    }
    //勾选承诺
    await page.evaluate(() => {
      document.querySelector('#p1_ChengNuo-inputEl').click()
    });
    await page.evaluate(() => document.getElementById("p1_TiWen-inputEl").value = "")//防止已经存在默认体温
    const temp = await page.$('#p1_TiWen-inputEl', { delay: 0 });
    await temp.type('37');
    //勾选绿码
    await page.evaluate(() => {
      document.querySelector('#fineui_7-inputEl-icon').click()
    });

    let submit = await page.$('#p1_ctl00_btnSubmit');

    await Promise.all([
      submit.click(),
    ]);


    let submit2 = await page.$('#fineui_14')
    await Promise.all([
      submit2.click(),
    ]);

    // let submit3 = await page.$('#fineui_19')
    // await Promise.all([
    //   submit3.click(),
    //   page.waitForNavigation()
    // ]);

    await page.close();
    await browser.close()
  } catch (err) {
    console.log(err)
    await page.close();
    await browser.close()
    return err
  }
}

module.exports = selfReport;