import { Store } from "miniapp-spore";


let store = new Store('$global', {
  count: 1024
}, {
  computed:{
    isOdd(){
      return this.count % 2;
    },
  }
})



App({
  store
});
