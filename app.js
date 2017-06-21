var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Log = require('./lib/log.js');
var moment = require("moment");
var index = require('./routes/index');
var users = require('./routes/users');
const config = require("./lib/config.js");
var oracledb = require('oracledb');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//Config log4js
Log.log4js.configure({
    appenders: [{
        type: 'console'
    }, {
        type: 'file',
        filename: 'logs/' + moment().format("YYYY_MM_DD") + ".log",
        maxLogSize: 1024 * 1024,
        backups: 3 //,
            // category: "relative-logger"
    }],
    replaceConsole: true
});
var log = Log.Create('[APP_ANYUKE]');
app.use(Log.log4js.connectLogger(log, {
    level: Log.log4js.levels.INFO,
    format: ':method :url'
}));

oracledb.createPool({
    user: 'dev_ydm',
    password: 'dev_ydm',
    connectString: '192.168.0.21:1521/orcl'
},function (err,pool) {
    if (err) {
        log.error(err);
        return;
    }
    oraclepool = pool;//把创建的线程池转为全局变量
    console.log("connectpool establish!!");
})


// session
var session = null;
session = require('./modules/express-session');

var RedisStore = require('connect-redis')(session);

var REDIS_OPT = {};
REDIS_OPT.host = config.redis.ip;
REDIS_OPT.port = config.redis.port;
REDIS_OPT.db = config.redis.db;

if (null != config.redis.pwd) {
    REDIS_OPT.pass = config.redis.pwd;
}

var store = new RedisStore(REDIS_OPT);

app.locals.store = store;

app.use(session({
    name: 'session',
    secret: '123456', // 建议使用 128 个字符的随机字符串
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 1000 * 60
    },
    resave: false,
    saveUninitialized: true,
    store: store,
}));

app.use('/', index);
app.use('/users', users);

app.get("/api/getsession", function(req, res) {

    if (!req.session || !req.session.id) {
        res.json({
            status: 1,
            msg: "session id not found !"
        });
        return;
    }

    app.locals.store.get(req.session.id, function(err, session) {
        if (err) {
            res.json({
                status: 1,
                sessionid: req.session.id,
                msg: err.message
            });
            return;
        }
        res.json({
            status: 100,
            msg: "操作成功",
            sessionid: req.session.id,
            session: session
        });
        return;
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    log.info(err.message);
    next(err);
});

app.use(function(req, res, next) { //解决跨域问题
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method == "OPTIONS") {
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.end();
        return;
    }
    req.ip = utils.get_req_ip(req);
    return next();
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;