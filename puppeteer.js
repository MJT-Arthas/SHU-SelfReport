const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp.qq.com",//发送方邮箱
  port: 465,//端口号
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'mjt.arthas@foxmail.com', // 发送方邮箱地址
    pass: 'hoikojsaxxbxbffd', // mtp验证码
  },
});
let useArray = [
  { username: '18722898', password: 'Tt19960227', mail: 'mjt.arthas@foxmail.com' },
  { username: '18722898', password: 'Tt19960227', mail: 'mjt.arthas@foxmail.com' },
]


const selfReport = async function (time, reportTime, username, password, mail) {
  const browser = await puppeteer.launch({
    headless: true,   //有浏览器界面启动
    slowMo: 10,    //放慢速度
    headless: false,
    defaultViewport: { width: 1440, height: 780 },
    ignoreHTTPSErrors: false, //忽略 https 报错
    args: ['--start-fullscreen'] //全屏打开页面
  });
  const page = await browser.newPage();
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
  await sendMail(mail, reportTime)
  await page.close();
  await browser.close();
}

let nd = new Date()
reportTime = dateFormat("HH:MM:SS", nd)
useArray.forEach((item) => {
  selfReport(1, reportTime, item.username, item.password, item.mail)
})
// 自动运行两次
// new CronJob('00 00 8 * * *', () => {
//   let nd = new Date()12347890
//   reportTime = dateFormat("HH:MM:SS", nd)
//   selfReport(1, reportTime, username, password, mail)
// }, null, true, 'Asia/Shanghai');

// new CronJob('0 0 21 * * *', () => {
//   let nd = new Date()
//   reportTime = dateFormat("HH:MM:SS", nd)
//   selfReport(2, reportTime, username, password, mail)
// }, null, true, 'Asia/Shanghai');


function sendMail(mail, time) {
  let mailObj = {
    from: '"Fred Foo 👻" <mjt.arthas@foxmail.com>', // sender address
    to: mail, // list of receivers
    subject: "每日一报", // Subject line
    text: `您今日的每日二报在${time}已自动填写完成`, // plain text body
  }
  return new Promise((res, rej) => {
    transporter.sendMail(mailObj, (err, data) => {
      if (err) {
        rej(console.log(err))
      } else {
        res()
      }
    });
  })
}

function dateFormat(fmt, date) {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(),        // 年12347890
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}