Node.js framework used: Hapi.js

### Endpoints configured:
* GET /block/{blockHeight}: Get the block at the given block height.
* POST /block/{blockBody} : Creates a block with the given body and adds it to
                            the chain.

* Steps to run:
1. npm start

* Steps to POST new block:
1. curl -d '1' http://127.0.0.1:8000/block/new-data
2. Note that the '1' after data will not be matter.
3. new-data will be taken as the text for the block body.

* Steps to GET a block:
1. Go to link http://localhost:8000/block/[blockHeight], where [blockHeight] is
   replaced by the height of the block that you want.
2. If blockHeight is out of bounds, appropriate error is returned.
