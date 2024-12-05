module.exports = function (err, req, res, next) {
    console.log(err)
    res.json({
        'status': '0',
        'message': err.message,
        'data': {},
        'error': "Error",
    });
}