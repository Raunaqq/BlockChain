/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  // console.log('addLevelDBData' + key + ' ' + value);
  new Promise(function(resolve, reject) {
    db.put(key, value, function(err) {
      if (err) {
        console.log('Block ' + key + ' submission failed');
        reject(err);
      }
      resolve('Put Success');
    });
  }).then(function(msg) {
    console.log(msg);
  }, function(err) {
    console.log(err)
  });

}

// Get data from levelDB with key
function getLevelDBData(key){
  console.log('getLevelDBData');
  return new Promise(function(resolve, reject) {
    db.get(key, (err, value) => {
      if (err) {
        console.log("Block error: Not found for key: " + key);
        reject(key);
      }
      // console.log(value);
      resolve(value);
    });
  });

}

// Count all objects stored in the DB
function count() {
  let numBlocks = 0;
  return new Promise(function(resolve, reject){
    db.createReadStream().on('data', function(data){
      // console.log('Block retrieved: ' + data);
      numBlocks++;
    }).on('error', function(err) {
      reject(err);
    }).on('close', function(){
      resolve(numBlocks);
    });
  });
}

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
