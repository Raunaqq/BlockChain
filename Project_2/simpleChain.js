/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.createIfNotExistsGenesisBlock().then(function(msg) {
			// NOP
			console.log('constructor(): createIfNotExists done');
		}, function(err) {
			console.log(err);
		});
  }

	// Check if genesis block exists, create, if not
	createIfNotExistsGenesisBlock() {
		// console.log('Searching for Genesis Block');
		return new Promise(function(resolve, reject) {
			return getLevelDBData(0).then((value) => {
				// NOP
				console.log('Genesis block exists.');
				resolve('Genesis block exists ' + value);
			}, (key) => {
				// Create new Genesis block
				console.log('Genesis block not found, creating a new one.');
				var genesisBlock = new Block("First block in the chain - Genesis block");
				genesisBlock.time = new Date().getTime().toString().slice(0,-3);
				genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
				// Persisting data on levelDB
				return addLevelDBData(0, JSON.stringify(genesisBlock).toString());
			});
		});

	}

  // Add new block
  addBlock(newBlock) {
		console.log('addBlock');
		this.createIfNotExistsGenesisBlock().then(function(msg) {
			// NOP
			console.log('addBlock(): createIfNotExists done');;
		}, function(err) {
			console.log(err);
		});

		this.getBlockHeight().then((blockHeight) => {
			// Block height
			newBlock.height = blockHeight + 1;
			// UTC timestamp
			newBlock.time = new Date().getTime().toString().slice(0,-3);
			// previous block hash
			console.log('Setting previousBlockHash');
			newBlock.previousBlockHash = this.getParsedBlock(blockHeight).then(
				(parsedRetBlock) => {
					newBlock.previousBlockHash = JSON.parse(parsedRetBlock).hash;

					// Block hash with SHA256 using newBlock and converting to a string
					newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
					// Persisting data on levelDB
					addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());

				}, (blockHeight) => {
					console.log('getParsedBlock() failed.');
				});
		}, (err) => {
			console.log("getBlockHeight() failed");
		});

  }

	// Get block height
  getBlockHeight(){
		console.log('getBlockHeight');
		return new Promise(function(resolve, reject) {
			count().then(function(numBlocks) {
				resolve(numBlocks - 1);
			}, function(err) {
				reject(err);
			});
		});

	}

  // get block
  getParsedBlock(blockHeight){
		console.log('getParsedBlock');
		// return object as a single string
		return new Promise(function(resolve, reject) {
			getLevelDBData(blockHeight).then((retBlock) => {
				resolve(JSON.parse(JSON.stringify(retBlock)));
			}, (blockHeight) => {
				reject(blockHeight);
			});
		});
	}
}
/*
    // validate block
    validateBlock(blockHeight){
      // get block object
      let block = this.getParsedBlock(blockHeight);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

   // Validate blockchain
    validateChain(){
      let errorLog = [];
      for (var i = 0; i < this.chain.length-1; i++) {
        // validate block
        if (!this.validateBlock(i))errorLog.push(i);
        // compare blocks hash link
        let blockHash = this.chain[i].hash;
        let previousHash = this.chain[i+1].previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }
*/
