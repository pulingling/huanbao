const fsm = wx.getFileSystemManager()
const FILE_BASE_NAME = 'tmp_base64src'
const util = {
	base64src(base64data) {
		return new Promise((resolve, reject) => {
			const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
			if (!format) {
				reject(new Error('ERROR_BASE64SRC_PARSE'));
			}
			const filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
			const buffer = wx.base64ToArrayBuffer(bodyData);
			fsm.writeFile({
				filePath,
				data: buffer,
				encoding: 'binary',
				success() {
					resolve(filePath);
				},
				fail() {
					reject(new Error('ERROR_BASE64SRC_WRITE'));
				},
			});
		});
	},

	queryToObj(wxQuery) {
		return JSON.parse(wxQuery.param);
	},
	objToQuery(obj) {
		return "param=" + JSON.stringify(obj);
	},
	currentTime() {
		const time = new Date();
		return `${util.formatDate(time)} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
	},
	formatDate(time, path = "-") {
		const date = time ? new Date(time) : new Date();
		return `${date.getFullYear()}${path}${this.formatTime(date.getMonth() + 1)}${path}${this.formatTime(
			date.getDate()
		)}`;
	},
	formatTime(time) {
		return time < 10 ? `0${time}` : time;
	},
	// 如果年或月或日小于10则首位填0，标准化年月日数据
	formatDay(time) {
		let times = time.split("-");
		times = times.map(ms => util.formatTime(+ms).toString());
		return times.join("-");
	},
	timeLead(sever_time) {
		return new Date() - sever_time;
	},
	isOverDue(server_time) {
		const time = new Date(server_time);
		return Date.now() > time.getTime() + 8.64e7;
	},
	selectorAndDo(selector, cb) {
		wx.createSelectorQuery()
			.select(selector)
			.boundingClientRect(cb)
			.exec();
	},
	getDay() {
		const time = new Date();
		return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
	},
	getObjDay(date) {
		const time =date ? new Date(date):new Date();
		return{
			year:time.getFullYear(),
			month:time.getMonth() + 1,
			day:time.getDate(),
			class:'enable'
		}
	},
	// 获取当前年月日
	getStorage(filed) {
		return wx.getStorageSync(filed);
	},
	setStorage(filed, value = "") {
		wx.setStorageSync(filed, value);
	},
	phoneCall(description, tips) {
		let type = false;
		if ((description && description.includes("预约")) || (tips && tips.includes("预约"))) {
			if (util.getPhone(tips)) type = true;
		}
		return type;
	},
	getPhone(str) {
		let phone = "";
		const phoneRegx = /1[0-9]{10}/g;
		const telephoneRegx = /(\d{2,4}-)?\d{3,8}-\d{2,8}/g;
		if (phoneRegx.test(str)) {
			const phoneNums = str.match(phoneRegx);
			if (phoneNums.length) phone = phoneNums[0];
		} else if (telephoneRegx.test(str)) {
			const telephone = str.match(telephoneRegx);
			if (telephone.length) phone = telephone[0];
		}
		return phone;
	},
	paresMap(str) {
		const maps = {
			hasMap: false,
			longitude: 0,
			latitude: 0
		};
		const attrRegx = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+))/g;
		if (str.includes("</map>")) {
			maps.hasMap = true;
			const match = str.match(attrRegx);
			if (match.length) {
				const attrs = {};
				for (let attr of match) {
					const tmp = attr.split("=");
					attrs[tmp[0]] = tmp[1].replace(/[\"|'](.*?)[\"|']/g, "$1");
				}
				maps.latitude = attrs.latitude;
				maps.longitude = attrs.longitude;
			}
		}
		return maps;
	},
	getTotalPath(paths, idx) {
		let path = "";
		for (let index in paths) {
			if (index >= idx) break;
			path += paths[index];
		}
		return path;
	},
	getNotifyPath(tips) {
		const path = [];
		tips.forEach(item => {
			const itemPath = {};
			const detailPath = item.path.split("");
			itemPath.root = detailPath.shift();
			detailPath.forEach((filed, index) => {
				itemPath[`sub${index + 1}`] = itemPath.root + util.getTotalPath(detailPath, index) + filed;
			});
			path.push(itemPath);
		});
		return path;
	},
	circleFun(id, enums) {
		let filter = null;
		for (let item of enums) {
			if (item.code == id) filter = item;
			if (item.children) filter = filter || util.circleFun(id, item.children);
		}
		return filter;
	},
	timeParse(time) {
		const date = new Date(time);
		return `${date.getFullYear()}.${this.formatTime(date.getMonth() + 1)}.${this.formatTime(date.getDate())}`; // ${this.formatTime(date.getHours())}:${this.formatTime(date.getMinutes())}
	},
 // 将时间戳转化为以.连接的年月日
 timeParse4(time) {
	const date = new Date(time);
	return `${date.getFullYear()}-${this.formatTime(date.getMonth() + 1)}-${this.formatTime(date.getDate())}`; // ${this.formatTime(date.getHours())}:${this.formatTime(date.getMinutes())}
},
// 将时间戳转化为以-连接的年月日
	timeParse2(time){
		return time.split('T')[0]
	},
	// 将以T连接的时间转化为年月日
	fullTimeParse(time) {
		const date = new Date(time);
		const year = date.getFullYear()
		const month = this.formatTime(date.getMonth() + 1)
		const day = this.formatTime(date.getDate())
		const hours = this.formatTime(date.getHours())
		const minutes = this.formatTime(date.getMinutes())
		return {
			year,
			month,
			day,
			hours,
			minutes
		}
	},
	// 将年月日时分秒全部标准化（添0）
	getCurrTime() {
		const time = {};
		const date = new Date();
		time.year = date.getFullYear();
		time.month = date.getMonth() + 1;
		time.date = date.getDate();
		switch (date.getDay()) {
			case 1:
				time.upDay = "一";
				time.day = 1;
				break;
			case 2:
				time.upDay = "二";
				time.day = 2;
				break;
			case 3:
				time.upDay = "三";
				time.day = 3;
				break;
			case 4:
				time.upDay = "四";
				time.day = 4;
				break;
			case 5:
				time.upDay = "五";
				time.day = 5;
				break;
			case 6:
				time.upDay = "六";
				time.day = 6;
				break;
			case 7:
				time.upDay = "日";
				time.day = 7;
				break;
		}
		return time;
	},
	// 将当前时间转化为对象
	setDay(day) {
		let date = new Date();
		date.setTime(date.getTime() + 3600 * 1000 * 24 * day);
		return date.getDate();
	},
	// 传入数字，返回日增加数字后的日
	getSevenDay() {
		const date = new Date();
		const curr = date.getDate();
		return [
			util.setDay(-3),
			util.setDay(-2),
			util.setDay(-1),
			curr,
			util.setDay(1),
			util.setDay(2),
			util.setDay(3)
		];
	},
	// 获取今天为准，前三天到后三天的日数组
	queryOpt(queryObj) {
		let queryStr = "";
		Object.keys(queryObj).forEach(key => {
			queryStr += `${key}=${queryObj[key]}&`;
		});
		return queryStr;
	},
	queryToObjs(str) {
		const obj = {};
		const querys = str.split("&");
		querys.forEach(item => {
			const map = item.split(":");
			obj[map[0]] = map[1];
		});

		return obj;
	},
	getMapKey(obj, value) {
		let key = null;
		for (let k of Object.keys(obj)) {
			if (obj[k] === value) {
				key = k;
				break;
			}
		}
		return key;
	},
	// 获取本地和服务器时间差
	timeDiff(serverDate) {
		const date = new Date();
		const curDate = new Date(serverDate);
		const diffTime = curDate.getTime() - date.getTime();
		this.setStorage("diffTime", diffTime);
	},
	// 页面解决登录状态问题
	loginCB(cb, app) {
		if (app.hasLogin) {
			cb();
		} else {
			// callback解决onload和onlaunch中异步导致登录包返回之前先执行了其他请求的问题
			app.sessionCallback = token => {
				if (token !== "") {
					cb();
				}
			};
		}
	},
	fixStringEnter(str) {
		if (typeof str !== "string") return ;
		return str.replace(/\\n/g, "\n");
	},
	getTime(){
		let time = new Date()
		return time.getTime()
	},
	// 获取当前时间戳
	getDay(){
		let time = new Date()
		return time.getDate()
	},
	imageUrl(url){
		if(!url) return ''
		
		return url.replaceAll("http://cdn.envedu.com.cn", "https://cdn.envedu.com.cn");
	}
};


module.exports = {
	...util
};