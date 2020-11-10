function Event(all) {
	all = all || Object.create(null);

	const e = {
		/**
		 * 注册
		 *
		 * @param  {String} type	事件名 `"*"` 代表全部
		 * @param  {Function} handler 方法
		 */
		on: function on(type, handler) {
			(all[type] || (all[type] = [])).push(handler);
		},

		/**
		 * 移出
		 *
		 * @param  {String} type	事件名 `"*"` 代表全部
		 * @param  {Function} handler 移出的方法
		 */
		off: function off(type, handler) {
			if (all[type]) {
				if(arguments.length == 1){
					all[type] = []
				}else{
					all[type].splice(all[type].indexOf(handler) >>> 0, 1);
				}
			}
		},

		/**
		 * 触发
		 *
		 * @param {String} type  触发事件名
		 * @param {Any} [args]  额外进入方法的参数
		 * @param {object} [context]  this指向的上下文
		 */
		emit: function emit(type, args=[], context) {
			let tps = (all[type] || []).slice().map(function (handler) { return handler.apply(context, args); });
			let aps = (all['*'] || []).slice().map(function (handler) { return handler.apply(context, [...args, type]); });
			return [...tps, ...aps];
		},

		/**
		 * 同步触发
		 *
		 * @param {String} type  触发事件名
		 * @param {Any} [args]  额外进入方法的参数
		 * @param {object} [context]  this指向的上下文
		 */
		asyncEmit: function asyncEmit(type, args=[], context) {
			return Promise.all(e.emit(type, args, context));
		},
	};

	return e;
}

export default Event;