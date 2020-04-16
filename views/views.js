Component({
    mixins: [],
    data: {
        histroy: [],
        current() {
            return this.histroy[0] || { state: {}, path: "" };
        },
        state() {
            return this.current.state;
        },
        path() {
            return this.current.path;
        },
    },
    props: {
        default: null,
        onChange: () => {},
        onRef: () => {},
    },
    didMount() {
        if (this.props.default) {
            this.push(this.props.default);
        }
        if (this.props.onRef) {
            this.props.onRef.call(this, this);
        }
    },
    didUpdate() {},
    didUnmount() {},
    methods: {
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
                    this.props.onChange &&
                        this.props.onChange.call(this, this.data.current);
                });
            }
        },
        back() {
            if (this.data.histroy.length > 1) {
                this.data.histroy.shift();
                this.update({}, () => {
                    this.props.onChange &&
                        this.props.onChange.call(this, this.data.current);
                });
            } else {
                console.warn("不能back, 已是最后一个历史记录");
            }
        },
    },
});
