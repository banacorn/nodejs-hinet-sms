[![build status](https://secure.travis-ci.org/elliotlai/nodejs-hinet-sms.png)](http://travis-ci.org/elliotlai/nodejs-hinet-sms)
# Install

    npm install hinet-sms
    
# Usage

    var sms = require('hinet-sms').createConnection();
    
    sms.auth('account', 'password');
    
    sms.send('phone number', 'hello');
