var opjs = require( "../opjs" );
var extream = require( "../extream" );
var argv = require( "argv" );

var count = 1;
opjs.array.each( argv.run().targets, function( arg, i ){
  count = opjs.to_i( arg );
});
opjs.log.dbg( opjs.string.format( "count={0}", count ) );

var write_sockets = [];
var close_sockets = [];
opjs.times( count, function(){
  extream.client_socket( "ws",  "127.0.0.1", 60000, {
    "open" : function(){
      write_sockets.push( this );
      if ( count <= write_sockets.length ){
        opjs.log.dbg( "start write" );
        opjs.array.each( write_sockets, function( socket, i ){
          socket.write( "WebClient "+ ( i + 1 ) );
        });
        opjs.log.dbg( "end write" );
      }
    },
    "data" : function( data ){
//      opjs.log.dbg( opjs.string.format( "data: size={0} {1}", data.length, data ) );
      
      close_sockets.push( this );
      if ( count <= close_sockets.length ){
        opjs.log.dbg( "start close" );
        opjs.array.each( close_sockets, function( socket, i ){
          socket.close();
        });
        opjs.log.dbg( "end close" );
      }
    },
    "close" : function(){
      
    },
    "error" : function( event ){
      opjs.log.err( opjs.string.format( "{0}\n{1}", opjs.json.encode( event ), opjs.stack.get( 1 ) ) );
    },
  });
});
