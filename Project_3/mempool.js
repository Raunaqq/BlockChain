/* ===== Mempool Class ===========================
|  Class with a constructor for new Mempool 	   |
|  =============================================== */
class Mempool {
  constructor() {
    this.validationWindow = 300,
    this.mempool = {},
    this.timeoutRequests = {}
  }

  /*
   * Adds validation request to the array, if request from the address already
   * exists, return the same response as before.
   */
  addToTimeoutRequests(address) {
    return new Promise((resolve, reject) => {
      if (address in this.timeoutRequests) {
        console.log('address already exists in timeout requests');
        resolve(this.timeoutRequests[address]);
      } else {
        var retVal = {};
        var timestamp = Date.now();
        var message = address+':'+timestamp+':'+'starRegistry';
        retVal['walletAddress'] = address;
        retVal['requestTimestamp'] = timestamp;
        retVal['message'] = message;
        retVal['validationWindow'] = this.validationWindow;
        this.timeoutRequests[address] = retVal;
        resolve(retVal);
      }
    });
  }
}

module.exports = {
  Mempool : Mempool
}
