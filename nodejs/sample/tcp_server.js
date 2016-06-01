var opjs = require( "../opjs" );
var extream = require( "../extream" );

extream.server_socket( "tcp",  "127.0.0.1", 10000, {
  "connection" : function( socket ){
    socket.on( "data", function( data ){
      this.write( data );
    });
    socket.on( "close", function(){
      
    });
    socket.on( "error", function( event ){
      opjs.log.err( opjs.string.format( "{0}\n{1}", opjs.json.encode( event ), opjs.stack.get( 1 ) ) );
    });
  },
  "error" : function( event ){
    opjs.log.err( opjs.string.format( "{0}\n{1}", opjs.json.encode( event ), opjs.stack.get( 1 ) ) );
  },
});
