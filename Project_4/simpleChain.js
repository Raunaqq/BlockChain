/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const levelSandbox = require('./levelSandbox');
const hex2ascii = require('hex2ascii');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data) {
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

class Blockchain {
  constructor() {
    this.createIfNotExistsGenesisBlock().then((msg) => {
			// NOP
			console.log('createIfNotExists() done: ' + msg);
		}, (err) => {
			console.log(err);
		});
  }

	// Check if genesis block exists, create, if not
	createIfNotExistsGenesisBlock() {
		console.log('Searching for Genesis Block');
		return new Promise((resolve, reject) => {
			return levelSandbox.getLevelDBData(0).then((value) => {
				// NOP
				resolve('Genesis block exists ' + value);
			}, (key) => {
				// Create new Genesis block
				console.log('Genesis block not found, creating a new one.');
				var genesisBlock = new Block("First block in the chain - Genesis block");
				genesisBlock.time = new Date().getTime().toString().slice(0,-3);
				genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
				// Persisting data on levelDB
				return levelSandbox.addLevelDBData(0, JSON.stringify(genesisBlock).toString())
					.then((msg) => {
						console.log(msg);
					}, (err) => {
						console.log(err);
					});
			});
		});
	}

  // Add new block
  addBlock(newBlock) {
		return new Promise((resolve, reject) => {
			// console.log('addBlock');
			this.createIfNotExistsGenesisBlock().then((msg) => {
				// NOP
				// console.log('addBlock(): createIfNotExists done');;
			}, (err) => {
				console.log(err);
			});

			this.getBlockHeight().then((blockHeight) => {
				// Block height
				newBlock.height = blockHeight + 1;
				// UTC timestamp
				newBlock.time = new Date().getTime().toString().slice(0,-3);
				// previous block hash
				console.log('Setting previousBlockHash');
				this.getParsedBlock(blockHeight).then((parsedRetBlock) => {
					newBlock.previousBlockHash = JSON.parse(parsedRetBlock).hash;

					// Block hash with SHA256 using newBlock and converting to a string
					newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

					// Persisting data on levelDB
					levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString()).then((msg) => {
							console.log(msg);
						}, (err) => {
							console.log(err);
						});
					resolve(JSON.stringify(newBlock).toString());

				}, (blockHeight) => {
					// console.log('getParsedBlock() failed.');
					reject('getParsedBlock() failed: Previous block not found.');
				});
			}, (err) => {
				console.log('getBlockHeight() failed');
				reject('getBlockHeight() failed');
			});
		});
  }

	// Get block height
  getBlockHeight(){
		// console.log('getBlockHeight');
		return new Promise((resolve, reject) => {
			levelSandbox.count().then((numBlocks) => {
				resolve(numBlocks - 1);
			}, (err) => {
				reject(err);
			});
		});

	}

  // get block using blockheight
  getParsedBlock(blockHeight){
		// console.log('getParsedBlock');
		// return object as a single string
		return new Promise(function(resolve, reject) {
			levelSandbox.getLevelDBData(blockHeight).then((retBlock) => {
				resolve(JSON.parse(JSON.stringify(retBlock)));
			}, (blockHeight) => {
				reject(new Error(blockHeight));
			});
		});
	}

  // get block using hash
	getParsedStarFromHash(hash) {
		// console.log('getParsedStarFromHash');
		// return object as single string
		const backupHash = hash;
		return new Promise(function(resolve, reject) {
			levelSandbox.getLevelDBDataFromHash(backupHash).then((retBlock) => {
				console.log(retBlock);
				// Decode the star's story
				let encodedStarStory = retBlock['body']['star']['story'];
				let decodedStarStory = hex2ascii(encodedStarStory);
				retBlock['body']['star']['storyDecoded'] = decodedStarStory;
				resolve(retBlock);
			}, (hash) => {
				console.log('Error encountered');
				reject(new Error(backupHash));
			});
		});
	}

  getParsedStarsForAddress(walletAddress) {
		console.log('getParsedStarsForAddress');
		// return array of stars
		let backupAddress = walletAddress;
		return new Promise(function(resolve, reject) {
			levelSandbox.getLevelDBDataFromAddress(backupAddress).then((retArr) => {
				console.log(retArr);
				resolve(retArr);
			}, (hash) => {
				console.log('Error encountered');
				reject(new Error(backupHash));
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
					// console.log('Block #' + blockHeight+' has valid hash.');

					// Get the previous block in the chain to validate the hashes.
					if (blockHeight > 0) {
						this.getParsedBlock(blockHeight - 1).then((prevParsedRetBlock) => {
							let prevBlockObject = JSON.parse(prevParsedRetBlock);
							let prevBlockHash = prevBlockObject.hash;
							// previousBlock.hash and block.previousBlockHash
							if (prevBlockHash === blockObject.previousBlockHash) {
								// console.log('Link is valid.');
								resolve(true);
							} else {
								resolve('Link ' + (blockHeight-1) + ' and ' +
								blockHeight  + ' is invalid.');
							}
						},(err) => {
							reject('getParsedBlock() failed to retrieve previous block.');
						});
					}
				} else {
					resolve('Block #'+blockHeight+' invalid hash:\n'+ blockHash +
						'<>' + validBlockHash);
				}
			}, (err) => {
				console.log('validateBlock() failed.');
				reject(err);
			});
		});


  }

	// Validate blockchain
  validateChain() {
		this.getBlockHeight().then((blockHeight) => {
			let numBlocks = blockHeight + 1;

			// Create an array of promises
			for (var i = 0; i < numBlocks; i++) {
				this.validateBlock(i).then((result) => {
					if (result !== true) {
						console.log(result);
					}
				}, (err) => {
					console.log(err);
				});
			}

		}, (err) => {
			console.log('validateChain() failed because: ' + err);
		});
  }

}

module.exports = {
  Blockchain : Blockchain,
  Block : Block
}
