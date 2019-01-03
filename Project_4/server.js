'use strict';

const Hapi=require('hapi');
const Joi=require('joi');
const simpleChain = require('./simpleChain');
const mempool = require('./mempool');
const hex2ascii = require('hex2ascii');
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
 * Route for getting a star object, given its hash.
 */
 server.route({
    method:'GET',
    path:'/stars/hash:{hash}',
    handler:async(request,h) => {
      console.log('GET');
      try {
        const starData = await server.blockchain.getParsedStarFromHash(request.params.hash);
        return h.response(starData).code(200);
      } catch (error) {
        console.log(error);
        return h.response('No such hash present.\n').code(404);
      }
    },
    options: {
      validate: {
        params: {
          hash: Joi.string().min(1)
        }
      }
    }
 });

 /*
  * Route for getting all stars, associated with given wallet address.
  */
  server.route({
     method:'GET',
     path:'/stars/address:{walletAddress}',
     handler:async(request,h) => {
       console.log('GET');
       try {
         const stars = await server.blockchain.getParsedStarsForAddress(request.params.walletAddress);
         return h.response(stars).code(200);
       } catch (error) {
         console.log(error);
         return h.response('No such stars present.\n').code(404);
       }
     },
     options: {
       validate: {
         params: {
           walletAddress: Joi.string().min(1)
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
        return h.response('Request is not valid\n').code(500);
      }
    },
    options: {
      validate: {
        payload: {
          address: Joi.string().min(1),
          signature: Joi.string().min(1)
        }
      }
    }
});

/*
 * Route for registering a star with custom data.
 */
server.route({
    method:['PUT','POST'],
    path:'/block',
    handler:async(request,h) => {
      console.log('POST');
      var starData = request.payload;
      var address = request.payload.address;
      console.log(request.payload);
      /* Verify if request exists and is valid */
      var isRequestValid = await server.mempool.verifyValidatedRequest(address);
      if (!isRequestValid) {
        return h.response('Previously sent request is not valid!').code(400);
      }
      var isStarDataValid = await server.mempool.isStarDataValid(starData);
      if (!isStarDataValid) {
        return h.response('Star data is not valid!').code(400);
      }

      /* Encode story in star data */
      var encodedStarData = {
        "address" : starData["address"],
        "star" : {
          "ra" : starData["star"]["ra"],
          "dec" : starData["star"]["dec"],
          "story" : Buffer(starData["star"]["story"]).toString('hex')
        }
      }
      /* Create new block and add it to block chain */
      var newBlock = new simpleChain.Block(encodedStarData);
      var addedBlock = await server.blockchain.addBlock(newBlock)
                          .catch(error => {
                            return h.response('error').code(300);
                          });
      var addedBlockJSON = JSON.parse(addedBlock);

      // Decoding the encoded star story
      var encodedStarStory = addedBlockJSON['body']['star']['story'];
      var decodedStarStory = hex2ascii(encodedStarStory);
      addedBlockJSON['body']['star']['storyDecoded'] = decodedStarStory;

      var retVal = JSON.stringify(addedBlockJSON).toString();

      server.mempool.removeFromMempoolValid(address);
      return h.response(retVal).code(200);

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
