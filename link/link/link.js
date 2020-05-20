

Component({
  mixins: [],
  data: {},
  props: {
    className:"",
    style:"",
    href:"",
    redirect: false,
    onClick:null
  },
  didMount() {},
  didUpdate() {},
  didUnmount() {},
  methods: {
    // 页面跳转 url自动外跳
    jump(url, redirect=false) {
        return new Promise(function (resolve, reject) {
            let config = {
                url,
                success: (res) => {
                    resolve(res);
                },
                fail: (e) => {
                    reject(e);
                },
            };
            if (/^\w+\:\/\//.test(url)) {
                my.call("navigateToOutside", config);
            } else {
                if(redirect){
                  my.redirectTo(config)
                }else{
                  my.navigateTo(config);
                }
            }
        });
    },
    click(e){
      let url = this.props.href;
      
      if(this.props.onClick){
        let res = this.props.onClick(e, this.props);

        //返回false时，不做跳转行为
        if(({}).toString.call(res) === '[object Boolean]' && res===false){
          return res;
        }
      }
      let m;
      if(url){
        if(/^\:back$/.test(url)){
          my.navigateBack()
        }else if(/^#:back$/.test(url)){
          if(this.$page.back){
            this.$page.back();
          }else{
            console.warn('请在页面定义好back方法')
          }
        }else if(m = /^#([\-\w]+)$/.exec(url)){
          if(this.$page.push){
            this.$page.push(m[1]);
          }else{
            console.warn('请在页面定义好push方法')
          }
        }else{
          this.jump(url, this.props.redirect);
        }
      }else{
        // console.warn('link组件未设置href属性')
      }

    }
  },
});
