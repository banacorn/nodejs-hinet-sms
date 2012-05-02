var net     = require('net'),
    recon   = require('recon');

var SMS = function(config) {
    
    // 266 bytes
    this.buffer = new Buffer(266);
    
    // fill with \0
    this.buffer.fill('\0');    
    
    // connection flag
    this._connected      = false;
    
    // queue for unsent buffers
    this._queue          = [];
};


SMS.prototype.createConnection = function(port, host) {

    var that = this;
    
    // create connection
    this.connection = recon(port || 8000, host || '202.39.54.130', function() {
    
        // connection flag
        that._connected = true;
        
        // see if queued
        if(that._queue.length !== 0) {        
            
            // write the queued buffers
            for(var i = 0, len = that._queue.length; i < len; i++) {
                that.write(that._queue[i]);
            }
           
            // clear the queue
            that._queue = [];
        }
    });
    return this;
}

// write to socket
SMS.prototype.write = function(buffer) {

    if(buffer) {
        // copy the passed-in buffer
        buffer.copy(this.buffer);
    } else {
        // write to buffer
        this.buffer[0] = this.type;
        this.buffer[1] = this.coding;
        this.buffer[2] = this.priority;
        this.buffer[3] = this.countryCode;
        this.buffer[4] = this.setLen;
        this.buffer[5] = this.contentLen;
        
        // clear 
        this.buffer.fill('\0', 6);
        
        // write to buffer
        this.set.copy(this.buffer, 6, 0)
        this.content.copy(this.buffer, 106, 0)
    }


    if(this._connected) {
        // WRITE!
        this.connection.write(this.buffer);
        
    } else {
        // write to queue if not connected
        var copy = new Buffer(266);
        this.buffer.copy(copy);
        // push to the queue
        this._queue.push(copy);        
    }
}

// return a object with properties denoted
SMS.prototype.decode = function() {
    var buf = this.buffer;
    return {
        msg_type: buf[0],
        msg_coding: buf[1],
        msg_priority: buf[2],
        msg_country_code: buf[3],
        msg_set_len: buf[4],
        msg_content_len: buf[5],
        msg_set: buf.toString('utf8', 6, 105),
        msg_content: buf.toString('utf8', 106, 265)
    };
}


// authenfication
SMS.prototype.auth = function(account, password) {
        
    this.account        = account || '';
    this.password       = password || '';
    
    this.type           = 0;
    this.coding         = 0;
    this.priority       = 0;
    this.countryCode    = 0;
    
    this.set = new Buffer(this.account.toString() + '\0' + this.password.toString() + '\0');
    this.setLen = this.set.length;
    
    this.content = new Buffer('');
    this.contentLen = 0;
    
    this.write();
}

// send message, msg_type 1
SMS.prototype.send = function(phone, message) {
        
    this.phone = phone || '',
    this.message = message || '';
    
    this.type           = 1;
    this.coding         = 4;
    this.priority       = 0;
    this.countryCode    = 0;
    
    this.set = new Buffer(this.phone.toString() + '\0' + '01' + '\0');
    this.setLen = this.set.length;
    
    this.content = new Buffer(this.message);
    this.contentLen = this.content.length;
    this.write();
}

// exports wrapper
exports.createConnection = function(port, host) {
    var sms = new SMS;
    sms.createConnection(port, host);
    return sms;
}
