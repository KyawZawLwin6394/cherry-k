const jwt = require('jsonwebtoken');
const secret = 'McQTEUrP=ut*Cr1e4trEDO$q796tEDHz+Sf9@0#YpKFMDZmHR@th5y=7VJtcXk3WU';
const key = 'm*qf63GOeu9*9oDetCb63Y'
console.log(key.length)
const token = jwt.sign({ foo: `bar.${key}.lar` }, secret ,{expiresIn:'10mins'});
console.log(token);
const decodedToken = jwt.decode(token)
console.log(decodedToken)