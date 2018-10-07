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
