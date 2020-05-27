const router = require('express').Router();
const Feed = require('../../common/Feed');

router.get('/', async function(req, res, next) {
    const url = req.query.url || null;
    if (!url || !url.length) {
        return next(new Error('Invalid param "url"'));
    }

    const feed = new Feed(url);
    
    try {
        await feed.parse();
        
        return res.json(feed);
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
