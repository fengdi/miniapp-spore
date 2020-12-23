import spore from "./core";
import onBackPlugin from "./plugins/onBack.plugin";
import storePlugin from "./plugins/store.plugin";
import propsPlugin from "./plugins/props.plugin";

spore.use(onBackPlugin);

spore.use(storePlugin);

if(spore.isMy){
  spore.use(propsPlugin);
}


export default spore;