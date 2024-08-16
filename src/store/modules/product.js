import Vue from "vue";
import { router} from "@/router";

const state = {
  products: []
}

const getters = {
  getProducts(state) {
    return state.products;
  },
  getProduct(state) {
    return key => state.products.filter(element => {
      return element.key == key;
    })
  }
}

const mutations = {
  updateProductList(state, product) {
    state.products.push(product)
  }
}


const actions = {
  initApp({ commit }){
   Vue.http.get("https://product-operations-bbe6e-default-rtdb.firebaseio.com/product.json")
     .then((response) => {
      let data = response.body;
      for (let key in data) {
        data[key].key = key;
        commit("updateProductList", data[key])
      }
     })


  },
  saveProduct({ dispatch,commit , state} , product) {
   Vue.http.post("https://product-operations-bbe6e-default-rtdb.firebaseio.com/product.json",product)
     .then((response) => {
       // Ürün listesinim güncellenmesi
       product.key = response.body.name;
       commit("updateProductList", product);
     // Alış , satış bakiye, bilgilerinin güncellenmesi
       let tradeResult = {
         purchase: product.price,
         sale : 0  ,
         count : product.count,
       }
       dispatch("setTradeResult",tradeResult)
       router.replace("/")
     })
  },
  sellProduct({ state , commit , dispatch}, payload) {
    let product = state.products.filter(element => {
      return element.key == payload.key})

    if (product){
      let totalCount = product[0].count - payload.count

      Vue.http.patch("https://product-operations-bbe6e-default-rtdb.firebaseio.com/product/"+payload.key+".json", {count : totalCount})
        .then((response) => {
          product[0].count = totalCount;
          let tradeResult = {
            purchase: 0,
            sale : product[0].price  ,
            count : payload.count,
          }
          dispatch("setTradeResult",tradeResult)
          router.replace("/")
        })
    }

  }
}


export default {
  state,
  getters,
  mutations,
  actions
}
