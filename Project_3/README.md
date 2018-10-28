Node.js framework used: Hapi.js

### Endpoints configured:
* GET /hello:                Get the HTML page for the form where you enter the
                             data for the block body.
* GET /block/{blockHeight} : Get the block at the given block height.
* POST /block :              The submit button from the /hello link triggers
                             this endpoint with the block body.

* Steps to run:
1. npm start

* Steps to POST new block:
1. Go to link http://localhost:8000/hello
2. In the form, write the data that you want to store in the block. Field cannot
   be blank.
3. Hit submit, new block will be added, and you will get that block in the response.

* Steps to GET a block:
1. Go to link http://localhost:8000/block/[blockHeight], where [blockHeight] is
   replaced by the height of the block that you want.
