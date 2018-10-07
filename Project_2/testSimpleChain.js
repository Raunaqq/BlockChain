var testChain = new Blockchain();
/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/

/*
(function theLoop (i) {
  setTimeout(function () {
    addDataToLevelDB('Testing data');
    if (--i) theLoop(i);
  }, 100);
})(10);
*/

/*
 * Function to add blocks to the block chain.
 */

function testAddBlocks() {
  (function theLoop (i) {
    setTimeout(function (chain) {
      let blockTest = new Block("Test Block - " + (i + 1));
      testChain.addBlock(blockTest).then((result) => {
        console.log(result + (i+1) + ' added.');
        i++;
        if (i < 5) theLoop(i);
      });
    }, 1000);
  })(0);
}

/*
 * Function to test getBlockHeight() function.
 */
function testGetBlockHeight() {
  var expectedBlockHeight = 10;
  testChain.getBlockHeight().then((blockHeight) => {
    console.log('Obtained blockHeight: ' + blockHeight);
    if (expectedBlockHeight === blockHeight) {
      console.log('getBlockHeight() returned expected value.');
    } else {
      console.log('getBlockHeight() returned unexpected value.');
    }
  }, (blockHeightErr) => {
    console.log('getBlockHeight() failed.');
  });

}

/*
 * Function to test validateChain() by injecting errors.
 * Call this function after creating at least 10 blocks.
 */
function testValidateChain() {
  getLevelDBData(4).then((retBlock) => {
    console.log('getLevelDBData() done.');
    addLevelDBData(2, retBlock).then((msg) => {
      console.log('addLevelDBData() done.');
      testChain.validateChain();
    }, (err) => {
      console.log(err);
    });
  }, (err) => {
    console.log(err);
  });
}

module.exports = {
  testAddBlocks : testAddBlocks,
  testGetBlockHeight : testGetBlockHeight,
  testValidateChain : testValidateChain

}
