const express = require('express')
const bluehouse = require('./bluehouse')

const router = express.Router()

router.get('/manager', bluehouse.main)
router.get('/api/list', bluehouse.getList)
router.get('/api/list/:tags', bluehouse.getList)
router.post('/api/add', bluehouse.addFood)
router.put('/api/update/name', bluehouse.updateName)
router.put('/api/update/tags', bluehouse.updateTags)
router.put('/api/update/msg', bluehouse.updateMsg)
router.delete('/api/remove', bluehouse.removeFood)
router.get('/api/test', bluehouse.test)
router.get('/api/test/:tags', bluehouse.test)
router.put('/api/revert', bluehouse.revertWork)
router.put('/api/commit', bluehouse.commitWork)

exports.router = router
