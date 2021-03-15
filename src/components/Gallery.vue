<template>
  <div>
    <div v-if="assets.length">
      <div class="block"><div class="image-frame"><img :src="assets[currentAsset].images.url"></div></div>
      <div class="block">
        <div class="flex-block">
          <div class="label-wrapper">
            <div class="arrow left" @click="prevImage">◄</div>
            <div class="image-label">
              <p>{{ assets[currentAsset].name }}</p>
              <p class="count-label">{{currentAsset+1}}/{{assets.length}}</p>
              <!-- <div v-if="assets[currentAsset].traits">
                <p>Traits:</p>
                <p>{{ assets[currentAsset].traits }}</p>
              </div> -->
            </div>
            <div class="arrow right" @click="nextImage">►</div>
          </div>
        </div>
      </div>
      <div class="block settings" v-show="showSettings">
        <div>
          <span>Etherscan API Key</span>
          <input type="text" v-model="etherscanApiKey">
        </div>
        <div>
          <span>Wallet Address</span>
          <input type="text" v-model="targetAddress">
        </div>
        <button @click="getAccountAssets">Load</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Gallery',

  data: function() {
    return {
      etherscanApiKey: 'SDHZ9FPMUK55TY5KAU2FBS222DKPIITD65',
      targetAddress: '0xc643c9411a6b489e9833b16631140f42bbfcb6d1',
      assets: [],
      contractAbis: {},
      currentAsset: 0,
      showSettings: true
    }
  },

  mounted () {
    // this.getAccountAssets()
    this.loadCachedAssets()
  },

  methods: {
    prevImage () {
      if (!this.currentAsset) return
      this.currentAsset--
    },

    nextImage () {
      if (!this.currentAsset === this.assets.length) return
      this.currentAsset++
    },

    loadCachedAssets () {
      const savedAddress = window.localStorage.getItem('savedAddress')
      const savedAssets = window.localStorage.getItem('savedAssets')
      if (savedAddress === null || savedAssets === null || this.targetAddress !== savedAddress) {
        console.log(savedAddress,this.targetAddress)
        console.log('Cache invalid, reloading')
        this.getAccountAssets()
      } else {
        try {
          console.log('Loaded assets from cache')
          this.assets = JSON.parse(savedAssets)
        } catch (e) {
          console.log('Failed to load cached assets')
          this.getAccountAssets()
        }
      }
    },

    getAccountAssets: async function () {
      this.assets = []

      let transactions = await this.getERC721Transactions()

      for (let i = 0; i < transactions.length; i++) {
        const contractAddress = transactions[i].contractAddress
        let abi = window.localStorage.getItem(contractAddress)
        if (abi === null) {
          try {
            abi = await this.getContractABI(contractAddress)
            window.localStorage.setItem(contractAddress, abi)
            console.log('Set abi', contractAddress)
          } catch (err) {
            console.error('Failed to load ABI for', transactions[i].tokenName, contractAddress)
            continue
          }
        }

        try {
          abi = JSON.parse(abi)
        } catch(e) {
          console.log('Failed to parse abi for', transactions[i].tokenName, contractAddress)
          continue
        }

        try {
          if (!await this.validateTokenOwner(contractAddress, abi, transactions[i].tokenID)) continue
          // console.log(transactions[i].tokenName)
        } catch (err) {
          continue
        }

        try {
          const images = await this.getTokenImages(contractAddress, transactions[i].tokenID)
          // console.log(images)
          this.assets.push({
            name: transactions[i].tokenName,
            symbol: transactions[i].tokenSymbol,
            tokenID: transactions[i].tokenID,
            images: images
          })
        } catch (err) {
          console.log('Failed to parse', transactions[i].tokenName, contractAddress)
        }
      }

      window.localStorage.setItem('savedAssets', JSON.stringify(this.assets))
      window.localStorage.setItem('savedAddress', this.targetAddress)
      console.log('Saved assets and address')
    },

    getERC721Transactions () {
      return new Promise((resolve, reject) => {
        const url = `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${this.targetAddress}&startblock=0&endblock=999999999&sort=asc&apikey=${this.etherscanApiKey}`
        this.$http.get(url).then((resp) => {
          resolve(resp.data.result)
        }).catch((err) => reject(err))
      })
    },

    getTokenImages(contractAddress, tokenID) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.$http.get(`https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenID}`).then((asset) => {
            resolve({
              url: asset.data.image_url,
              previewUrl: asset.data.image_preview_url,
              thumbnailUrl: asset.data.image_thumbnail_url,
              originalUrl: asset.data.image_original_url,
              name: asset.data.name,
              permalink: asset.data.permalink,
              traits: asset.data.traits,
            })
          }).catch((err) => reject(err))
        }, 300)
      })
    },

    validateTokenOwner(contractAddress, abi, tokenID) {
      return new Promise((resolve, reject) => {
        const contract = new window.eth.ethers.Contract(contractAddress, abi, window.eth.provider)
        try {
          contract.ownerOf(tokenID).then((resp) => {
            if (resp.toLowerCase() === this.targetAddress) resolve(true)
            resolve(false)
          }).catch(() => {
            reject(false)
          })
        } catch (e) {
          reject(false)
        }
      })
    },

    getContractABI(contractAddress) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.$http.get(`http://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${this.etherscanApiKey}`).then((resp) => {
            if (resp.data.result === 'Contract source code not verified') {
              reject(resp.data.result)
            } else resolve(resp.data.result)
          }).catch(err => reject(err))
        }, 300)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.image-frame {
  margin-top: 10vmin;
  background-color: #ddc;
  border:solid 5vmin  #eee;
  border-bottom-color: #fff;
  border-left-color: #eee;
  border-radius:2px;
  border-right-color: #eee;
  border-top-color: #ddd;
  box-shadow: 0 0 5px 0 rgba(0,0,0,.25) inset, 0 5px 10px 5px rgba(0, 0, 0, .25);
  box-sizing: border-box;
  display: inline-block;
  padding: 4vmin;
  position: relative;
  text-align: center;

  &:before {
    border-radius: 2px;
    bottom: -2vmin;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,.25) inset;
    content: "";
    left: -2vmin;
    position: absolute;
    right: -2vmin;
    top: -2vmin;
  }

  &:after {
    border-radius: 2px;
    bottom: -2.5vmin;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, .25);
    content: "";
    left: -2.5vmin;
    position: absolute;
    right: -2.5vmin;
    top: -2.5vmin;
  }

  img {
    border:solid 2px;
    border-bottom-color: #ffe;
    border-left-color: #eed;
    border-right-color: #eed;
    border-top-color: #ccb;
    max-height: 100%;
    max-width: 100%;
  }
}

.label-wrapper {
  display: flex;
}

.image-label, .settings {
  background-color: #eee;
  box-shadow: 0 0 5px 0 rgba(0,0,0,.25) inset, 0 5px 10px 5px rgba(0, 0, 0, .25);
  box-sizing: border-box;
  display: inline-block;
  padding: 1vmin 3vmin 1vmin 3vmin;
  min-width: 25vmin;
  position: relative;
  font-size: 2rem;
  font-family: Garamond,Baskerville,Baskerville Old Face,Hoefler Text,Times New Roman,serif;
  text-align: center;
  border-radius: 3px;
}

.arrow {
  display: none;
  font-size: 5rem;
  cursor: pointer;
  margin-top: 15px;
  user-select: none;
}

.label-wrapper:hover .arrow {
  display: inline;
}

.block {
  display: block;
  position: relative;
  margin-bottom: 3vmin;
}

.flex-block {
  display: inline-block;
}

.count-label {
  display: none;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 1rem;
  position: absolute;
  width: 100%;
  text-align: center;
  left: 0;
  bottom: 0;
}

.label-wrapper:hover .count-label {
  display: block;
}

.settings {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 1rem;
  text-align: center;
}
</style>