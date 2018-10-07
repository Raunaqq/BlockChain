var myBlockChain = new Blockchain();

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
    setTimeout(function () {
      let blockTest = new Block("Test Block - " + (i + 1));
      myBlockChain.addBlock(blockTest).then((result) => {
        console.log(result + (i+1) + ' added.');
        i++;
        if (i < 10) theLoop(i);
      });
    }, 1000);
  })(0);
}

/*
 * Function to print all the blocks.
 */
function printAllBlocks() {
  return new Promise(function(resolve, reject) {
    db.createReadStream().on('data', function(data){
      console.log(data);
    }).on('error', function(err){
      console.log('printAllBlocks() failed.');
    }).on('close',function() {
      console.log('printAllBlocks() success.')
    });
  }).then(function() {;}, function(err){;});
}

/*
 * Function to test getBlockHeight() function.
 */
