/* ===== Mempool Class ===========================
|  Class with a constructor for new Mempool 	   |
|  =============================================== */
class Mempool {
  constructor() {
    this.TimeoutRequestsWindowTime = 300, // seconds
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
          console.log('success');
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
      const TimeoutRequestsWindowTimeInMS = 5 * 60 * 1000;
      var currentTime = new Date().getTime().toString().slice(0,-3);
      var requestTimestamp = this.pendingValidationRequests[address].requestTimestamp;
      var timeElapse =  currentTime - requestTimestamp;
      console.log('timeElapse' + timeElapse);
      var timeLeft = (TimeoutRequestsWindowTimeInMS/1000) - timeElapse;
      console.log('timeLeft' + timeLeft);
      this.pendingValidationRequests[address].validationWindow = timeLeft;
      resolve(this.pendingValidationRequests[address]);
    });
  }
}

module.exports = {
  Mempool : Mempool
}
