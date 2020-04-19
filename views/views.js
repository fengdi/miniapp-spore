let apis = getApp().apis;

Component({
    mixins: [],
    data: {
        histroy: [],
        current() {
            return this.histroy[0] || { state: {}, path: "" };
        },
        state() {
            return (this.histroy[0] || { state: {}, path: "" }).state;
        },
        path() {
            return (this.histroy[0] || { state: {}, path: "" }).path;
        },
    },
    props: {
        default: null,
        onChange: () => {},
        onRef: () => {},
    },
    didMount() {
        if (this.props.onRef) {
            this.props.onRef.call(this, this);
        }
        this._init();
        
    },
    didUpdate(prev) {
        //检测props.default变化 重新初始化默认页
        if(JSON.stringify(this.props.default) != JSON.stringify(prev.default)){
            this._init();
        }
    },
    didUnmount() {},
    methods: {
        _init(){
            if (this.props.default && this.props.default.path) {
                if(!this.data.histroy.length){
                    this.push(this.props.default);
                }else{
                    //最后一个历史是第一个覆盖掉
                    this.data.histroy[this.data.histroy.length-1] = this.props.default;
                    this.update();
                }
            }
        },
        push(data) {
            if (!data) {
                console.warn('需要添加历史信息,{path:"",state:{}}');
                return false;
            } else {
                if (!data.path) {
                    console.warn('需要添加历史信息,{path:"",state:{}}');
                    return false;
                }
                data.state = data.state || {};
                this.data.histroy.unshift(data);
                
                this.update({}, () => {
                    this.props.onChange.call(this, data);
                });
            }
        },
        back() {
            if (this.data.histroy.length > 1) {
                this.data.histroy.shift();
                this.update({}, () => {
                    this.props.onChange.call(this, this.data.histroy[0]);
                });
            } else {
                console.warn("不能back, 已是最后一个历史记录");
            }
        }
    },
});
