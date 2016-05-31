var extream = this;

var opjs = require( "./opjs" );
var ws = require( "ws" );
var net = require( "net" );
var argv = require( "argv" );

extream.server_socket = function( type, host, port, callbacks ){
  var socket = null;
  switch ( type ){
  case "tcp":{
    socket = new extream.TCPServer( host, port, callbacks );
  }break;
  
  case "ws":
  case "wss":{
    socket = new extream.WebServer( host, port, callbacks );
  }break;
  }
  return socket;
};

extream.client_socket = function( type, host, port, callbacks ){
  var socket = null;
  switch ( type ){
  case "tcp":{
    socket = new extream.TCPClient( host, port, callbacks );
  }break;
  
  case "ws":
  case "wss":{
    var address = opjs.string.format( "{0}://{1}:{2}", type, host, port );
    socket = new extream.WebClient( address, callbacks );
  }break;
  }
  return socket;
};

extream.extream_socket = function( server, client ){
  extream.server_socket( server.type, server.host, server.port, {
    "connection" : function( src_socket ){
      extream.client_socket( client.type, client.host, client.port, {
        "open" : function(){
          var dst_socket = this;
          
          src_socket.on( "data", function( data ){
            dst_socket.write( data );
          });
          src_socket.on( "close", function(){
            dst_socket.close();
          });
          src_socket.on( "error", function( event ){
            opjs.log.err( opjs.string.format( "{0}\n{1}", opjs.json.encode( event ), opjs.stack.get( 1 ) ) );
            
            this.close();
          });
        },
        "data" : function( data ){
          src_socket.write( data );
        },
        "close" : function(){
          src_socket.close();
        },
        "error" : function( event ){
          opjs.log.err( opjs.string.format( "{0}\n{1}", opjs.json.encode( event ), opjs.stack.get( 1 ) ) );
          
          this.close();
        },
      });
    },
    "error" : function( event ){
      opjs.log.err( opjs.string.format( "{0}\n{1}", opjs.json.encode( event ), opjs.stack.get( 1 ) ) );
    },
  });
};

extream.WebServer = function( host, port, callbacks ){
  var self = this;
  this.m_socket = new ws.Server({
    host: host,
    port: port,
  });
  
  opjs.kvary.each( callbacks, function( type, callback ){
    self.on( type, callback );
  });
};
extream.WebServer.prototype.on = function( type, callback ){
  var self = this;
  switch ( type ){
  case "connection":{
    self.m_socket.on( type, function( socket ){
      callback.apply( self, [ new extream.WebClient( socket ) ] );
    });
  }break;
  
  case "close":
  case "error":{
    self.m_socket.on( type, function(){
      var args = Array.prototype.slice.call( arguments );
      callback.apply( self, args );
    });
  }break;
  }
};

extream.WebClient = function(){
  var self = this;
  var args = Array.prototype.slice.call( arguments );
  if ( opjs.is_string( args[ 0 ] ) ){
    this.m_socket = new ws( args[ 0 ] );
  }else{
    this.m_socket = args[ 0 ];
  }
  var callbacks = opjs.is_undef( args[ 1 ] ) ? {} : args[ 1 ];
  
  opjs.kvary.each( callbacks, function( type, callback ){
    self.on( type, callback );
  });
};
extream.WebClient.prototype.on = function( type, callback ){
  var self = this;
  switch ( type ){
  case "open":{
    self.m_socket.on( type, function( socket ){
      callback.apply( self );
    });
  }break;
  
  case "data":{
    self.m_socket.on( "message", function( data ){
      callback.apply( self, [ data ] );
    });
  }break;
  
  case "close":
  case "error":{
    self.m_socket.on( type, function(){
      var args = Array.prototype.slice.call( arguments );
      callback.apply( self, args );
    });
  }break;
  }
};
extream.WebClient.prototype.write = function( data ){
  this.m_socket.send( data );
};
extream.WebClient.prototype.close = function(){
  if ( opjs.is_def( this.m_socket ) ){
    this.m_socket.close();
    delete this.m_socket;
  }
};

extream.TCPServer = function( host, port, callbacks ){
  var self = this;
  this.m_socket = net.createServer();
  opjs.kvary.each( callbacks, function( type, callback ){
    self.on( type, callback );
  });
  this.m_socket.listen( port, host, 10000 );
};
extream.TCPServer.prototype.on = function( type, callback ){
  var self = this;
  switch ( type ){
  case "connection":{
    self.m_socket.on( type, function( socket ){
      callback.apply( self, [ new extream.TCPClient( socket ) ] );
    });
  }break;
  
  case "data":
  case "close":
  case "error":{
    self.m_socket.on( type, function(){
      var args = Array.prototype.slice.call( arguments );
      callback.apply( self, args );
    });
  }break;
  }
};

extream.TCPClient = function(){
  var self = this;
  var args = Array.prototype.slice.call( arguments );
  var callbacks = args[ args.length - 1 ];
  if ( opjs.is_undef( callbacks ) ) callbacks = {};
  if ( 3 == args.length ){
    this.m_socket = new net.Socket();
    opjs.kvary.each( callbacks, function( type, callback ){
      self.on( type, callback );
    });
    this.m_socket.connect( args[ 1 ], args[ 0 ] );
  }else{
    this.m_socket = args[ 0 ];
    opjs.kvary.each( callbacks, function( type, callback ){
      self.on( type, callback );
    });
  }
};
extream.TCPClient.prototype.on = function( type, callback ){
  var self = this;
  switch ( type ){
  case "open":{
    self.m_socket.on( "connect", function( socket ){
      callback.apply( self );
    });
  }break;
  
  case "data":
  case "close":
  case "error":{
    self.m_socket.on( type, function(){
      var args = Array.prototype.slice.call( arguments );
      callback.apply( self, args );
    });
  }break;
  }
};
extream.TCPClient.prototype.write = function( data ){
  this.m_socket.write( data );
};
extream.TCPClient.prototype.close = function(){
  if ( opjs.is_def( this.m_socket ) ){
    this.m_socket.destroy();
    delete this.m_socket;
  }
};

if ( require.main === module ){
  opjs.array.each( argv.run().targets, function( arg, i ){
    var config = require( arg );
    extream.extream_socket( config.server, config.client );
  });
}
