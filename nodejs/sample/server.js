var opjs = require( "../opjs" );
var extream = require( "../extream" );
var argv = require( "argv" );

var argv = argv.run().targets;
var type = argv[ 0 ];
var host = argv[ 1 ];
var port = opjs.to_i( argv[ 2 ] );
opjs.log.inf( opjs.string.format( "type={0} host={1} port={2}", type, host, port ) );

extream.server_socket( type, host, port, {
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
