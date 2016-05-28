var extream = this;

var opjs = require( "./opjs" );

extream.server_socket = function( type, host, port, callbacks ){
  var socket = null;
  switch ( type ){
  case "tcp":{
    // TODO
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
    // TODO
  }break;
  
  case "ws":
  case "wss":{
    var address = opjs.string.format( "{0}://{1}:{2}", type, host, port );
    socket = new extream.WebClient( new extream.WebSocket( address ), callbacks );
  }break;
  }
  return socket;
};

extream.extream_socket = function( config ){
  extream.server_socket( config.server.type, config.server.host, config.server.port, {
    "connection" : function( src_socket ){
      // TODO
      
    },
    "error" : function( event ){
      opjs.log.err( opjs.string.format( "{0}\n{1}", opjs.json.encode( event ), opjs.stack.get( 1 ) ) );
    },
  });
};

extream.WebSocket = require( "ws" );

extream.WebServer = function( host, port, callbacks ){
  if ( opjs.is_undef( callbacks ) ) callbacks = {};
  
  this.m_socket = new extream.WebSocket.Server({
    host: host,
    port: port,
  });
  
  var self = this;
  opjs.kvary.each( callbacks, function( type, callback ){
    self.on( type, callback );
  });
};
extream.WebServer.prototype.socket = function(){
  return this.m_socket;
};
extream.WebServer.prototype.on = function( type, callback ){
  var self = this;
  switch ( type ){
  case "connection":{
    this.m_socket.on( type, function( socket ){
      callback.apply( self, [ new extream.WebClient( socket ) ] );
    });
  }break;
  
  default:{
    this.m_socket.on( type, function(){
      var args = Array.prototype.slice.call( arguments );
      callback.apply( self, args );
    });
  }break;
  }
};

extream.WebClient = function( socket, callbacks ){
  if ( opjs.is_undef( callbacks ) ) callbacks = {};
  
  this.m_socket = socket;
  
  var self = this;
  opjs.kvary.each( callbacks, function( type, callback ){
    self.on( type, callback );
  });
};
extream.WebClient.prototype.on = function( type, callback ){
  var self = this;
  this.m_socket.on( type, function(){
    var args = Array.prototype.slice.call( arguments );
    callback.apply( self, args );
  });
};
extream.WebClient.prototype.send = function( data ){
  this.m_socket.send( data );
};
extream.WebClient.prototype.close = function(){
  this.m_socket.close();
};

if ( require.main === module ){
  var config = {
    server : {
      type : "ws",
      host : "127.0.0.1",
      port : 60000,
    },
    client : {
      type : "tcp",
      host : "127.0.0.1",
      port : 10000,
    }
  };
  
  extream.extream_socket( config );
}
