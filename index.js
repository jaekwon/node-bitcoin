var deprecate = require('deprecate'),
    commands = require('./commands'),
    rpc = require('./jsonrpc');

//===----------------------------------------------------------------------===//
// Client
//===----------------------------------------------------------------------===//
function Client() {
  var args = [].slice.call(arguments),
      opts = {};
      
  if (args.length > 1) {
    deprecate('calling bitcoin.Client with more than one argument is deprecated');
    opts.host = args[0];
    opts.port = args[1];
    opts.user = args[2];
    opts.pass = args[3];
  } else {
    opts = args[0];
  }
  
  this.rpc = new rpc.Client(opts);
}


//===----------------------------------------------------------------------===//
// cmd
//===----------------------------------------------------------------------===//
Client.prototype.cmd = function() {
  var args = [].slice.call(arguments);
  var cmd = args.shift();

  callRpc(cmd, args, this.rpc);
}


//===----------------------------------------------------------------------===//
// callRpc
//===----------------------------------------------------------------------===//
function callRpc(cmd, args, rpc) {
  var fn = args[args.length-1];

  // If the last function is a callback, pop it from the args list
  if(typeof fn === 'function') {
    args.pop();
  } else {
    fn = function () {};
  }

  rpc.call(cmd, args, function(){
    var args = [].slice.call(arguments);
    args.unshift(null);
    fn.apply(this, args);
  }, function(err){
    fn(err);
  });
}

//===----------------------------------------------------------------------===//
// Initialize wrappers
//===----------------------------------------------------------------------===//
(function() {
  for (var protoFn in commands) {
    (function(protoFn) {
      Client.prototype[protoFn] = function() {
        var args = [].slice.call(arguments);
        callRpc(commands[protoFn], args, this.rpc);
      };
    })(protoFn);
  }
})();

// Export!
module.exports.Client = Client;
