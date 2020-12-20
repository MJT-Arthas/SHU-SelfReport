const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const selfReport = require('./core')
app.use(bodyParser.urlencoded({ extended: true }))//使用中间件 
//解析表单数据
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('每日一报自动填报接口'))

app.post('/', (req, res) => {
  console.log(req.body)
  let { time, us, ps } = req.body
  console.log(time)
  selfReport(time, us, ps).then((err) => {
    if (err) {
      res.send({ err: `${err}`, msg: '填报失败' })
    } else {
      res.send({ err: 0, msg: '填报成功' })
    }

  })
    .catch((err) => {
      res.send({ err: err, msg: '填报失败' })
      console.log(err)
    })


  // if (us === 'mjt' && ps == 123) {
  //   res.send({ err: 0, msg: '登录成功' })
  // } else {
  //   res.send({ err: -1, msg: 'user password false ' })
  // }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))