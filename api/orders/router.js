const app = require('express')
const router = app.Router()
const { demoMail, addOrders, orderbyId, allorders } = require('./controller')

router.post('/send-demo-mail', demoMail)
router.post('/create-order', addOrders)
router.get('/all-orders', allorders)
router.get('/order-by-id/:_id', orderbyId)



module.exports = router