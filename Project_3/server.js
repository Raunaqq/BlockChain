'use strict';

const Hapi=require('hapi');
const Joi=require('joi');
const simpleChain = require('./simpleChain');
const mempool = require('./mempool');

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
     try {
       const parsedBlock = await server.blockchain.getParsedBlock(request.params.blockHeight);
       return h.response(JSON.parse(parsedBlock)).code(200);
     } catch (error) {
       return h.response(error + ' is a block height out of bounds.\n').code(404);
     }
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
     const addedBlock = await server.blockchain.addBlock(newBlock)
                               .catch((error) => {
                                 console.log('Error inserting block');
                               });
     return h.response(JSON.parse(addedBlock)).code(200);
   }
});

/*
 * Route for POSTing a block given the block body.
 */
server.route({
    method:['PUT','POST'],
    path:'/block/{blockBody?}',
    handler:async(request,h) => {
      console.log('POST');
      var blockBody = request.params.blockBody;
      var newBlock = new simpleChain.Block(blockBody);
      const addedBlock = await server.blockchain.addBlock(newBlock)
                                .catch(error => {
                                  console.log('Error inserting block');
                                });
      return h.response(addedBlock).code(200);

    },
    options: {
      validate: {
        params: {
          blockBody: Joi.string().min(1)
        }
      }
    }
});

/*
 * Route for POSTing a request for validation to be stored in mempool.
 */
server.route({
    method:['PUT','POST'],
    path:'/requestValidation',
    handler:async(request,h) => {
      console.log('POST');
      var address = request.payload.address;
      try {
        var response = await server.mempool.addToTimeoutRequests(address);
        console.log('Got response: ' + response.validationWindow);
        return h.response(response).code(200);
      } catch (error) {
        console.log(error + '\n');
        return h.response('Custom Error\n').code(500);
      }
    }
});

/*
 * Route for POSTing a signature and address for validation.
 */
server.route({
    method:['PUT','POST'],
    path:'/message-signature/validate',
    handler:async(request,h) => {
      console.log('POST');
      var address = request.payload.address;
      var signature = request.payload.signature;
      try {
        var response = await server.mempool.validateRequestByWallet(address, signature);
        // console.log('Got response: ' + response.validationWindow);
        return h.response(response).code(200);
      } catch (error) {
        console.log(error + '\n');
        return h.response('Custom Error\n').code(500);
      }
    }
});

// Start the server
async function start() {

    try {
        await server.start();
        server.blockchain = new simpleChain.Blockchain();
        server.mempool = new mempool.Mempool();
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
