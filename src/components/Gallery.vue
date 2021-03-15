<template>
  <div>
    <div>
      <span>Etherscan API Key</span>
      <input type="text" v-model="etherscanApiKey">
    </div>
    <div>
      <span>Wallet Address</span>
      <input type="text" v-model="targetAddress">
    </div>
    <button @click="getAccountAssets">Load</button>

    <div>
      <div v-for="(asset, index) in assets" :key="index" class="image-block">
        <p>{{ asset.name }}</p>
        <img :src="asset.images.thumbnailUrl">
        <div v-if="asset.traits">
          <p>Traits:</p>
          <p>{{ asset.traits }}</p>
        </div>
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
      contractAbis: {}
    }
  },

  mounted () {
    this.getAccountAssets()
  },

  methods: {
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
          console.log('Failed to parse abi for', transactions[i].tokenName, contractAddress, abi)
          continue
        }

        if (!await this.validateTokenOwner(contractAddress, abi, transactions[i].tokenID)) continue
        // console.log(transactions[i].tokenName)

        try {
          const images = await this.getTokenImages(contractAddress, transactions[i].tokenID)
          // console.log(images)
          this.assets.push({
            name: transactions[i].tokenName,
            symbol: transactions[i].tokenSymbol,
            tokenID: transactions[i].tokenID,
            images: images
          })
        } catch (e) {
          console.log('Failed to parse load images for', transactions[i].tokenName, contractAddress, abi)
        }
      }
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
        contract.ownerOf(tokenID).then((resp) => {
          if (resp.toLowerCase() === this.targetAddress) resolve(true)
          resolve(false)
        }).catch(() => {
          reject(false)
        })
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

<style scoped>
.image-block {
  float: left;
}
</style>