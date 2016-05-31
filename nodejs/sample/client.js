var opjs = require( "../opjs" );
var extream = require( "../extream" );
var argv = require( "argv" );

var count = 1;
opjs.array.each( argv.run().targets, function( arg, i ){
  count = opjs.to_i( arg );
});
opjs.log.dbg( opjs.string.format( "count={0}", count ) );

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

opjs.times( count, function( i ){
  callbacks.open = function(){
    this.write( "WebClient "+ ( i + 1 ) );
  };
  extream.client_socket( "ws",  "127.0.0.1", 60000, callbacks );
});

opjs.times( count, function( i ){
  callbacks.open = function(){
    this.write( "TcpClient "+ ( i + 1 ) );
  };
  extream.client_socket( "tcp", "127.0.0.1", 60001, callbacks );
});
