const { store } = getApp();

Component({
  // 新增可定义此stores字段
  stores: [
    store,
	//... 支持多个store实例
  ],

  
  mixins: [],
  data: {},
  props: {},
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {},
});
