module.exports = function(req, res, next) {
    console.log(req.session);
    console.log(req.session.userId);
    if (!req.session.userId) {
        if (req.url == "/login") {
            next(); //如果请求的地址是登录则通过，进行下一个请求
        } else {
            res.redirect('/login');
        }
    } else {
        next();
    }
}