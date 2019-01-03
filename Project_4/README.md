Node.js framework used: Hapi.js

### Endpoints configured:
* GET /block/{blockHeight}: Get the block at the given block height.
* POST /requestValidation : Validates request sent by user.
* POST /message-signature/validate : Validates signature with wallet address.
* POST /block : User sends request with star body.
*

* Steps to run:
1. npm start

* Steps to register a new star:
1. Send validation request:
curl -X POST   http://localhost:8000/requestValidation   -H 'Content-Type: application/json'   -H 'cache-control: no-cache'   -d '{
    "address":"19YScRyao293zasT54ehvfzdSpJjXCpqha"
}'

2. Get the signature from the wallet.

3. Validate with wallet address and signature:
curl -X POST   http://localhost:8000/message-signature/validate   -H 'Content-Type: application/json'   -H 'cache-control: no-cache'   -d '{
"address":"19YScRyao293zasT54ehvfzdSpJjXCpqha",
 "signature":"IHd3jvTeA/PBYhaHhLl0wWjzFYbYxEaxNv25R85SyNgWAy09JUm8oTB8SnEsWv7eVPqAgb0DJfNjnWUTfOqItpQ="
}'

4. Send star body to be stored on the blockchain:
curl -X POST http://localhost:8000/block -H 'Content-Type: application/json' -H 'cache-control: no-cache' -d '{
  "address": "19YScRyao293zasT54ehvfzdSpJjXCpqha",
  "star": {
    "dec": "68° 52 56.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/"
    }
}'

* Steps to GET a block:
1. Query with blockHeight:
curl -G http://localhost:8000/block/33

2. Query with hash of the star:
curl "http://localhost:8000/stars/hash:d179dcf61e6d84e5c7fa7e619a733c2f5d8d93d8a30f786b7ef4c4baa7c71b42"

3. Query with wallet address:
Returns array of all stars associated with that address.
curl "http://localhost:8000/stars/address:19YScRyao293zasT54ehvfzdSpJjXCpqha"
