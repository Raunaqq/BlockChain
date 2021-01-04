const bitcoinMessage = require('bitcoinjs-message');

/* ===== Mempool Class ===========================
|  Class with a constructor for new Mempool 	   |
|  =============================================== */
class Mempool {
  constructor() {
    this.TimeoutRequestsWindowTime = 10000, // seconds
    this.pendingValidationRequests = {},
    this.timeoutRequests = {},
    this.mempoolValid = {}
  }

  /*
   * Adds validation request to the array, if request from the address already
   * exists, return the same response as before.
   */
  addToTimeoutRequests(address) {
    return new Promise((resolve, reject) => {
      if (address in this.timeoutRequests) {
        console.log('address already exists in timeout requests');
        this.updateValidationWindow(address).then((success) => {
          resolve(this.pendingValidationRequests[address]);
        }, (failure) => {
          console.log('failure');
        });

      } else {
        var retVal = {};
        var timestamp = new Date().getTime().toString().slice(0,-3);
        var message = address+':'+timestamp+':'+'starRegistry';
        retVal['walletAddress'] = address;
        retVal['requestTimestamp'] = timestamp;
        retVal['message'] = message;
        retVal['validationWindow'] = this.TimeoutRequestsWindowTime;
        this.pendingValidationRequests[address] = retVal;
        var self = this;
        this.timeoutRequests[address] = setTimeout(function() {
          console.log('Address passed: ' + retVal['walletAddress']);
            self.removeValidationRequest(retVal['walletAddress']);
          }, this.TimeoutRequestsWindowTime * 1000);
        resolve(retVal);
      }
    });
  }

  removeValidationRequest(address) {
    console.log('Removing validation request for address ' + address);
    delete this.timeoutRequests[address];
    delete this.pendingValidationRequests[address];
  }

  updateValidationWindow(address) {
    return new Promise((resolve, reject) => {
      this.getTimeLeft(address).then((timeLeft) => {
        this.pendingValidationRequests[address].validationWindow = timeLeft;
        resolve(this.pendingValidationRequests[address]);
      },(error) => {
        reject(error);
      });
    });
  }

  getTimeLeft(address) {
    return new Promise((resolve, reject) => {
      const TimeoutRequestsWindowTimeInMS = 50 * 60 * 1000;
      var currentTime = new Date().getTime().toString().slice(0,-3);
      var requestTimestamp = this.pendingValidationRequests[address].requestTimestamp;
      var timeElapse =  currentTime - requestTimestamp;
      var timeLeft = (TimeoutRequestsWindowTimeInMS/1000) - timeElapse;
      resolve(timeLeft);
    });
  }

  validateRequestByWallet(address, signature) {
    var backupAddress = address;
    return new Promise((resolve, reject) => {
      this.getTimeLeft(address).then((timeLeft) => {
        // console.log(backupAddress + ' ' + timeLeft + ' ' + signature);
        if (timeLeft > 5) {
          var validationRequest = this.pendingValidationRequests[backupAddress];
          var message = validationRequest['message'];

          let isValid = bitcoinMessage.verify(message, backupAddress, signature);
          // let isValid = true;

          if (isValid) {
            console.log(isValid);

            // Create new starData object and populate
            var starData = {};
            starData['registerStar'] = true;
            var status = {};
            status['address'] = backupAddress;
            status['requestTimestamp'] = validationRequest['requestTimestamp'];
            status['message'] = message;
            status['validationWindow'] = timeLeft;
            status['messageSignature'] = true;
            starData['status'] = status;

            // Add to mempoolValid array
            this.mempoolValid[backupAddress] = starData;
            // Cleanup the pendingValidationRequests and mempool arrays.
            this.removeValidationRequest(backupAddress);
            resolve(starData);
          } else {
            console.log(isValid);
            reject('signature verify failed');
          }
        } else {
          reject('validation request expired.');
        }
      },
      (error) => {
        reject('error');
      });

    });
  }

  /*
   * Verify validated request from the mempoolValid array.
   */
  verifyValidatedRequest(address) {
    var backupAddress = address;
    return new Promise((resolve, reject) => {
      var validationRequest = this.mempoolValid[backupAddress];
      if (validationRequest['status']['messageSignature']) {
        console.log('verifyValidatedRequest resolving to true.');
        resolve(true);
      } else {
        resolve(false);
      }

    });
  }

  /*
   * Verify star data.
   */
  isStarDataValid(data) {
    var starData = data;
    return new Promise((resolve, reject) => {
      if (!starData['star']['dec'] || !starData['star']['ra'] || !starData['star']['story']) {
        resolve(false);
      } else {
        console.log('isStarDataValid resolving to true.');
        resolve(true);
      }
    });

  }

  removeFromMempoolValid(address) {
    if (address in this.mempoolValid) {
      console.log('Removing address from mempoolValid');
      delete this.mempoolValid[address];
    } else {
      console.log('Address not found in mempoolValid');
    }
  }
}

module.exports = {
  Mempool : Mempool
}
