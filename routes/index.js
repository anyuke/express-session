var express = require('express');
var router = express.Router();
var Log = require('../lib/log.js');
var log = Log.Create("router");
var login_check = require('../lib/login_check');

/* GET home page. */
router.get('/', login_check, function(req, res, next) {
    res.render('home', {
        title: '首页'
    });
});

router.get('/login', function(req, res, next) {
    res.render('index', {
        title: '登录1'
    });
});

router.post('/login', function(req, res, next) {
    var actor = {};
    actor.account = req.body.account;
    actor.password = req.body.password
    log.info('actor:', actor);

    res.render('home', {
        userId: 'req.session.userId'
    });
    log.info('为啥不跳转!!!');
    return;
    oraclepool.getConnection(function(err, connection) {
        if (err) {
            log.error(err);
            res.json({
                status: 200,
                msg: err
            })
            return;
        }
        actor.sql =
            " select * " +
            "   from test_user tu " +
            "   where tu.name = '" + actor.account + "'" +
            "       and tu.password = '" + actor.password + "'";
        log.info('sql: %s', actor.sql);
        connection.execute(actor.sql, [], {
                // resultSet: true
                // prefetchRows: 2
            },
            function(err, result) {
                // doRelease(connection)
                if (err) {
                    log.error(err);
                    res.json({
                        status: 200,
                        msg: err
                    })
                    return;
                }
                log.info('result:', result);
                if (0 == result.rows.length) {
                    log.error('用户不存在');
                    res.json({
                        status: 200,
                        msg: '用户不存在'
                    })
                    return;
                }
                // req.session.userId = result.rows[0][0];
                res.render('home', {
                    userId: 'req.session.userId'
                });
                return;
            });
    });
});
module.exports = router;