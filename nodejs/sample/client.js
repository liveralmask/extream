var opjs = require( "../opjs" );
var extream = require( "../extream" );

var callbacks = {
  "data" : function( data ){
    opjs.log.dbg( opjs.string.format( "data: size={0} {1}", data.length, data ) );
    this.close();
  },
  "close" : function(){
    
  },
  "error" : function( event ){
    opjs.log.err( opjs.string.format( "{0}\n{1}", opjs.json.encode( event ), opjs.stack.get( 1 ) ) );
  },
};

callbacks.open = function(){
  this.write( "WebClient" );
};
extream.client_socket( "ws",  "127.0.0.1", 60000, callbacks );

callbacks.open = function(){
  this.write( "TcpClient" );
};
extream.client_socket( "tcp", "127.0.0.1", 60001, callbacks );
