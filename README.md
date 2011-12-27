# Install

    npm install hinet-sms
    
# Usage

    var sms = require('hinet-sms').createConnection();
    
    sms.auth('account', 'password');
    
    sms.send('phone number', 'hello');
