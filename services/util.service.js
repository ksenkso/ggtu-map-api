const pe = require('parse-error');


module.exports.ReE = function (res, err, code) { // Error Web Response
    if (typeof err === 'object' && typeof err.message !== 'undefined') {
        err = err.message;
    }

    if (typeof code !== 'undefined') res.statusCode = code;

    return res.json({success: false, error: err});
};

module.exports.ReS = function (res, data, code) { // Success Web Response

    if (typeof code !== 'undefined') res.statusCode = code;

    return res.json(data)
};

/*module.exports.TE = TE = function(err_message, log){ // TE stands for Throw Error
    if(log === true){
        console.error(err_message);
    }

    throw new Error(err_message);
};*/
module.exports.handleError = function (error, next) {
    const err = pe(error);
    console.error(error);
    err.status = error.status || 500;
    next(err);
};

