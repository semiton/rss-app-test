const ENV_DEV = ['development', 'dev'].indexOf(String(process.env.NODE_ENV || '')) !== -1;

const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.set('env', ENV_DEV ? 'dev' : 'prod');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', routes);

app.use(function(req, res, next) {
    const error = new Error('Not Found');
    error.status = 404;

    return next(error);
});
app.use(function(error, req, res, next) {
    res.status = error.status || 500;
    
    return res.json({
        error: error.message || error,
    });
});


module.exports = app;
