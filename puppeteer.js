const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const nodemailer = require("nodemailer");


let transporter = nodemailer.createTransport({
    host: "smtp.qq.com",//发送方邮箱
    port: 465,//端口号
    secure: true, // true for 465, false for other ports
    auth: {
        user: '', // 发送方邮箱地址
        pass: '', // mtp验证码
    },
});
let useArray = [
    { username: '18722***', password: '***', mail: '***' },


    function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

const selfReport = async function (time, reportTime, username, password, mail) {
    const browser = await puppeteer.launch({
        headless: false,   //有浏览器界面启动
        slowMo: 10,    //放慢速度
        // headless: true,
        // defaultViewport: { width: 1440, height: 780 },
        // ignoreHTTPSErrors: false, //忽略 https 报错
        args: [
            // '--disable-setuid-sandbox',
            '--no-sandbox',
            // '--ignore-certificate-errors',
            // '--remote-debugging-port=9222',
            // '--disable-web-security'
        ]
        // args: ['--start-fullscreen'] //全屏打开页面
    });
    try {
        const page = await browser.newPage();
        await page.goto('https://selfreport.shu.edu.cn/Default.aspx');
        //输入账号密码
        const uniqueIdElement = await page.$('#username');
        await uniqueIdElement.type(username, { delay: 0 });
        const passwordElement = await page.$('#password', { delay: 0 });
        await passwordElement.type(password);
        //点击确定按钮进行登录
        let okButtonElement = await page.$('#submit');
        //等待页面跳转完成，一般点击某个按钮需要跳转时，都需要等待 page.waitForNavigation() 执行完毕才表示跳转成功
        await Promise.all([
            okButtonElement.click(),
            page.waitForNavigation()
        ]);

        await page.goto('https://selfreport.shu.edu.cn/Default.aspx');
        if (time == 1) {
            //早报
            await page.goto('https://selfreport.shu.edu.cn/XueSFX/HalfdayReport.aspx?t=1');
        }
        else {
            //晚报
            await page.goto('https://selfreport.shu.edu.cn/XueSFX/HalfdayReport.aspx?t=2');
        }
        //勾选承诺
        await page.evaluate(() => {
            document.querySelector('#p1_ChengNuo-inputEl').click()
        });
        let num = 36 + Math.random()  //随机体温
        num = num.toFixed(1)
        num = num.toString()
        await page.evaluate(() => document.getElementById("p1_TiWen-inputEl").value = "")//防止已经存在默认体温
        const temp = await page.$('#p1_TiWen-inputEl', { delay: 1 });
        await temp.type(num);


        const search_btn = await page.$('#p1_pnlDangSZS_ckda-inputEl');
        await search_btn.click();

        //获取答案
        const text = await page.$eval('.f-messagebox-message', el => el.textContent);
        //关闭提示框
        const closebtn = await page.$('#fineui_40');
        await closebtn.click();
        //完成选项
        if (text.indexOf("A") != -1) {
            await page.evaluate(() => {
                document.querySelector('#fineui_0-inputEl').click()
            });

        } else if (text.indexOf("B") != -1) {
            await page.evaluate(() => {
                document.querySelector('#fineui_1-inputEl').click()
            });
        } else if (text.indexOf("C") != -1) {
            await page.evaluate(() => {
                document.querySelector('#fineui_2-inputEl').click()
            });
        } else { console.log('DDDD') }
        await page.evaluate(() => {
            document.querySelector('#fineui_3-inputEl').click()
        });



        //国内
        await page.evaluate(() => {
            document.querySelector('#fineui_5-inputEl-icon').click()
        });
        //在上海
        await page.evaluate(() => {
            document.querySelector('#fineui_11-inputEl-icon').click()
        });
        //住校
        await page.evaluate(() => {
            document.querySelector('#fineui_13-inputEl-icon').click()
        });
        //家庭住址
        await page.evaluate(() => {
            document.querySelector('#fineui_16-inputEl-icon').click()
        });

        //提交
        let submit = await page.$('#p1_ctl01_btnSubmit');

        await Promise.all([
            submit.click(),
        ]);


        let submit2 = await page.$('#fineui_44')
        await Promise.all([
            submit2.click(),
        ]);
        // // 风险地区勾选
        // await page.evaluate(() => {
        //     document.querySelector('#fineui_12-inputEl-icon').click()
        // });
        // await page.evaluate(() => {
        //     document.querySelector('#fineui_14-inputEl-icon').click()
        // });

        // await page.evaluate(() => {
        //     document.querySelector('#fineui_18-inputEl-icon').click()
        // });

        // await page.evaluate(() => {
        //     document.querySelector('#fineui_20-inputEl-icon').click()
        // });
        // await page.evaluate(() => {
        //     document.querySelector('#fineui_23-inputEl-icon').click()
        // });
        // await page.evaluate(() => {
        //     document.querySelector('#fineui_17-inputEl-icon').click()
        // });
        // await page.evaluate(() => {
        //     document.querySelector('#fineui_19-inputEl-icon').click()
        // });



        //勾选绿码
        // await page.evaluate(() => {
        //     document.querySelector('#fineui_7-inputEl-icon').click()
        // });
        //选择校区（宝山）
        // await page.evaluate(() => {
        //     document.querySelector('#fineui_6-inputEl-icon').click()
        // });


        // // await  sendMail(mail, reportTime)
        // await sleep(1000)
        // await page.close();
        // await browser.close();
        console.log('报完了鸭')
    } catch (e) {
        console.log(e);
    }
}

let nd = new Date()
reportTime = dateFormat("HH:MM:SS", nd)
useArray.forEach((item, index) => {
    setTimeout(() => {
        selfReport(1, reportTime, item.username, item.password, item.mail)
    }, 10000 * index)
})
// 自动运行两次
// new CronJob('00 26 4 * * *', () => {
//   let nd = new Date()
//   reportTime = dateFormat("HH:MM:SS", nd)
//   useArray.forEach((item, index) => {
//     setTimeout(() => {
//       selfReport(1, reportTime, item.username, item.password, item.mail)
//     }, 10000 * index)
//   })
// }, null, true, 'Asia/Shanghai');

// new CronJob('00 36 22 * * *', () => {
//   let nd = new Date()
//   reportTime = dateFormat("HH:MM:SS", nd)
//   useArray.forEach((item, index) => {
//     setTimeout(() => {
//       selfReport(2, reportTime, item.username, item.password, item.mail)
//     }, 10000 * index)
//   })
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
