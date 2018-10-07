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
		return new Promise((resolve, reject) => {
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
						resolve('Block #');

					}, (blockHeight) => {
						// console.log('getParsedBlock() failed.');
						reject('getParsedBlock() failed.');
					});
			}, (err) => {
				console.log('getBlockHeight() failed');
				reject('getBlockHeight() failed');
			});
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

  // validate block
  validateBlock(blockHeight){
		return new Promise((resolve, reject) => {
			// console.log('validateBlock() with ' + blockHeight);
			// get block object
			this.getParsedBlock(blockHeight).then((parsedRetBlock) => {
				let blockObject = JSON.parse(parsedRetBlock);
				let blockHash = blockObject.hash;
				// remove block hash to test block integrity
				blockObject.hash = '';
				// generate block hash
				let validBlockHash = SHA256(JSON.stringify(blockObject)).toString();
				// Compare
				if (blockHash===validBlockHash) {
					console.log('Block #' + blockHeight+' has valid hash.');
					// Return a dictionary of hashes and the final result.
					let retVal = {
						result : true,
						blockHash : blockHash,
						previousBlockHash : blockObject.previousBlockHash
					}
					resolve(retVal);
				} else {
					reject('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
				}
			}, (err) => {
				console.log('validateBlock() failed.');
				reject(err);
			});
		});


  }

	// Validate blockchain
  validateChain(){
		this.getBlockHeight().then((blockHeight) => {
			let numBlocks = blockHeight + 1;
			let promiseArray = [];

			// Create an array of promises
			for (var i = 0; i < numBlocks; i++) {
				promiseArray.push(this.validateBlock(i));
			}

			// Wait for all promises to resolve
			Promise.all(promiseArray).then((results) => {
				// Check previousBlockHash in block i+1 with hash of block i.
				for (var i = 1; i < numBlocks; i++) {
					if (results[i].previousBlockHash !== results[i-1].blockHash) {
						throw new TypeError();
					}
				}
				console.log('validateChain() Success!');

			},(err) => {
				console.log('Promise.all() failed. ' + err);
			});

		}, (err) => {
			console.log('validateChain() failed.');
		});
  }

}
