var extream = this;

var opjs = require( "./opjs" );
var ws = require( "ws" );
var net = require( "net" );

extream.server_socket = function( type, host, port, callbacks ){
  var socket = null;
  switch ( type ){
  case "tcp":{
    socket = new extream.TcpServer( host, port, callbacks );
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
    socket = new extream.TcpClient( host, port, callbacks );
  }break;
  
  case "ws":
  case "wss":{
    var address = opjs.string.format( "{0}://{1}:{2}", type, host, port );
    socket = new extream.WebClient( address, callbacks );
  }break;
  }
  return socket;
};

extream.extream_socket = function( config ){
  extream.server_socket( config.server.type, config.server.host, config.server.port, {
    "connection" : function( src_socket ){
      extream.client_socket( config.client.type, config.client.host, config.client.port, {
        "open" : function(){
          opjs.log.dbg( "open" );
          
          // TODO StreamManager.add()
          
        },
        "error" : function( event ){
          opjs.log.err( opjs.string.format( "{0}\n{1}", opjs.json.encode( event ), opjs.stack.get( 1 ) ) );
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
    switch ( type ){
    case "connection":{
      self.m_socket.on( type, function( socket ){
        callback.apply( self, [ new extream.WebClient( socket ) ] );
      });
    }break;
    
    default:{
      self.m_socket.on( type, function(){
        var args = Array.prototype.slice.call( arguments );
        callback.apply( self, args );
      });
    }break;
    }
  });
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
    self.m_socket.on( type, function(){
      var args = Array.prototype.slice.call( arguments );
      callback.apply( self, args );
    });
  });
};
extream.WebClient.prototype.write = function( data ){
  this.m_socket.send( data );
};
extream.WebClient.prototype.close = function(){
  this.m_socket.close();
};

extream.TcpServer = function( host, port, callbacks ){
  var self = this;
  this.m_socket = net.createServer( function( socket ){
    opjs.kvary.each( callbacks, function( type, callback ){
      switch ( type ){
      case "connection":{
        callback.apply( self, [ new extream.TcpClient( socket ) ] );
      }break;
      
      default:{
        self.m_socket.on( type, function(){
          var args = Array.prototype.slice.call( arguments );
          callback.apply( self, args );
        });
      }break;
      }
    });
  });
  this.m_socket.listen( port, host, 10000 );
};

extream.TcpClient = function(){
  var self = this;
  var args = Array.prototype.slice.call( arguments );
  if ( 3 == args.length ){
    var callbacks = opjs.is_undef( args[ 2 ] ) ? {} : args[ 2 ];
    this.m_socket = new net.Socket();
    this.m_socket.connect( args[ 1 ], args[ 0 ], function(){
      opjs.kvary.each( callbacks, function( type, callback ){
        switch ( type ){
        case "open":{
          callback.apply( self );
        }break;
        
        default:{
          self.m_socket.on( type, function(){
            var args = Array.prototype.slice.call( arguments );
            callback.apply( self, args );
          });
        }break;
        }
      });
    });
  }else{
    this.m_socket = args[ 0 ];
  }
};
extream.TcpClient.prototype.write = function( data ){
  this.m_socket.write( data );
};
extream.TcpClient.prototype.close = function(){
  this.m_socket.destroy();
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
