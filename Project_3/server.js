'use strict';

const Hapi=require('hapi');
const simpleChain = require('./simpleChain');

// Create a server with a host and port
const server=Hapi.server({
    host:'127.0.0.1',
    port:8000
});

// Add the route
server.route({
    method:'GET',
    path:'/hello',
    handler:function(request,h) {

        return h.view('index');
    }
});

/*
 * Route for getting a block given the blockheight.
 */
 server.route({
     method:'GET',
     path:'/block/{blockHeight}',
     handler:async(request,h) => {
       console.log('GET');
       const parsedBlock = await server.blockchain.getParsedBlock(request.params.blockHeight)
                                      .catch(error => {
                                        console.log('caught' + error);
                                        return h.response('Block at blockheight ' + error + ' not found.').code(404);
                                      });
       return h.response(JSON.parse(parsedBlock)).code(200);
     }
 });

  /*
   * Route for POSTing a block given the block body in the form.
   */
   server.route({
       method:['PUT','POST'],
       path:'/block/blockbody-from-form',
       handler:async(request,h) => {
         console.log('POST');
         console.log(request.payload['blockbody']);
         var newBlock = new simpleChain.Block(request.payload['blockbody']);
         const addedBlock = await server.blockchain.addBlock(newBlock);
         return h.response(JSON.parse(addedBlock)).code(200);
       }
   });

   /*
    * Route for POSTing a block given the block body.
    */
    server.route({
        method:['PUT','POST'],
        path:'/block/{blockBody}',
        handler:async(request,h) => {
          console.log('POST');
          console.log(request.payload['blockbody']);
          var newBlock = new simpleChain.Block(request.payload['blockbody']);
          const addedBlock = await server.blockchain.addBlock(newBlock);
          return h.response(addedBlock).code(200);
        }
    });

// Start the server
async function start() {

    try {
        await server.start();
        server.blockchain = new simpleChain.Blockchain();
        await server.register(require('vision'));

        server.views({
            engines: {
                html: require('handlebars')
            },
            relativeTo: __dirname,
            path: 'templates'
        });
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();
