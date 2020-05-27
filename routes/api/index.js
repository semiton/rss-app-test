const router = require('express').Router();

router.use('/feed', require('./feed'));

module.exports = router;
