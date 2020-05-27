const moment = require('moment');
const RSSParser = require('rss-parser');
const FeedPost = require('./FeedPost');

/**
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} language
 * @property {string} url
 * @property {string} xmlUrl
 * @property {{title: string, url: string, link: string}} image
 * @property {string} copyright
 * @property {Date} date
 * @property {string[]} categories
 * @property {string} siteName
 * @property {string} siteIcon
 * @property {boolean} hasImages
 * @property {boolean} hasVideos
 * @property {boolean} hasAuthor
 * @property-read {boolean} isParsed
 * @property {FeedPost[]} posts
 */
class Feed {
    
    /**
     * @param {String} url
     */
    constructor(url) {
        this.xmlUrl = url;
    }
    
    async parse() {
        if (this.isParsed) {
            return;
        }
        if (!this.xmlUrl) {
            throw new Error('Empty URL');
        }
    
        const parser = new RSSParser({
            customFields: {
                feed: ['id', 'guid'],
                item: ['id', 'guid', 'description', 'media:content', 'media:credit', 'media:description', "media:group"],
            }
        });
        const feed = await parser.parseURL(this.xmlUrl);
        
        this.id = feed.id || feed.guid || feed.feedUrl || null;
        this.title = feed.title;
        this.description = feed.description;
        this.language = feed.language;
        this.url = feed.link;
        this.image = feed.image;
        this.copyright = feed.copyright;
        this.date = moment(feed.pubDate).toDate();
        this.siteName = feed.image ? feed.image.title : null;
        this.siteIcon = feed.image ? feed.image.url : null;
        this.hasDates = false;
        this.hasImages = false;
        this.hasVideos = false;
        this.hasAuthor = false;
        this.categories = [];
        this.posts = [];
    
        for (const item of feed.items) {
            const post = new FeedPost();
            post.id = item.id || item.guid || item.url || item.link || null;
            post.title = item.title || null;
            post.description = item.description || null;
            post.link = item.link || null;
            post.date = item.pubDate ? moment(item.pubDate).toDate() : null;
            post.author = item.creator || item.author || null;
            post.html = item['content:encoded'] || null;
            if (item['media:group'] && item['media:group']['media:thumbnail'] && item['media:group']['media:content']) {
                post.video = item['media:group']['media:content'][0]['$'];
                post.thumbnail = item['media:group']['media:thumbnail'][0]['$'];
            }
            if (item['media:content'] && item['media:content']['$']) {
                post.image = item['media:content']['$'];
            }
            post.image = item.image || post.image || null;
            post.video = item.video || post.video || null;
            post.thumbnail = item.thumbnail || post.thumbnail || null;
            if (post.date) {
                this.hasDates = true;
            }
            if (post.author) {
                this.hasAuthor = true;
            }
            if (post.image) {
                this.hasImages = true;
            }
            if (post.video) {
                this.hasVideos = true;
            }
            post.categories = [];
            if (Array.isArray(item.categories)) {
                for (let category of item.categories) {
                    post.categories.push(category['_'] || category);
                }
            }
            post.categories = [];
            if (Array.isArray(item.categories)) {
                for (let category of item.categories) {
                    post.categories.push(category['_'] || category);
                }
            }
            
            this.posts.push(post);
        }
    }
    
    /**
     * @returns {boolean}
     */
    get isParsed() {
        return !!this.id;
    }
}

module.exports = Feed;
