var opjs = require( "../opjs" );
var extream = require( "../extream" );
var argv = require( "argv" );

var argv = argv.run().targets;
var type = argv[ 0 ];
var host = argv[ 1 ];
var port = opjs.to_i( argv[ 2 ] );
var count = opjs.is_def( argv[ 3 ] ) ? opjs.to_i( argv[ 3 ] ) : 1;
opjs.log.inf( opjs.string.format( "type={0} host={1} port={2} count={3}", type, host, port, count ) );

var measure_time = new opjs.measure.Time();
var sockets = [];
opjs.times( count, function(){
  extream.client_socket( type, host, port, {
    "open" : function(){
      sockets.push( this );
      if ( count <= sockets.length ){
        opjs.log.dbg( opjs.string.format( "connect {0}(msec)", measure_time.update() ) );
        measure_time.start();
        opjs.array.each( sockets, function( socket, i ){
          socket.write( "WebClient "+ ( i + 1 ) );
        });
        sockets = [];
        opjs.log.dbg( opjs.string.format( "write {0}(msec)", measure_time.update() ) );
        measure_time.start();
      }
    },
    "data" : function( data ){
//      opjs.log.dbg( opjs.string.format( "data: size={0} {1}", data.length, data ) );
      
      sockets.push( this );
      if ( count <= sockets.length ){
        opjs.log.dbg( opjs.string.format( "read {0}(msec)", measure_time.update() ) );
        measure_time.start();
        opjs.array.each( sockets, function( socket, i ){
          socket.close();
        });
        sockets = [];
        opjs.log.dbg( opjs.string.format( "close {0}(msec)", measure_time.update() ) );
      }
    },
    "close" : function(){
      
    },
    "error" : function( event ){
      opjs.log.err( opjs.string.format( "{0}\n{1}", opjs.json.encode( event ), opjs.stack.get( 1 ) ) );
    },
  });
});
