const app = getApp();
const api = require("../../utils/request.js");
const utils = require("../../utils/util");

Page({
	data: {
		questions: [],
		chose: [], //已选择答案数组
		aid: [], //当前题的id
		resultArray:[], //结果数组
		curId: 0, //当前题index
		activeCheck: {}, // 已选择的答案
		// questionType: 1, //当前题类型 1:选择题 2: 多选题 3: 判断题
		total: null, //总题量
		checkId: null, //当前题选择的答案key
		exam: true, //答题模式,false为答题结果页
		point: 0, //得分
		textComplete: null, //错题集锦
		notFullMark: false //全对提示
	},
	id: null,
	onLoad(option) {
		this.id = option.id;
		utils.loginCB(this.getData, app);
	},
	getData() {
		api.courseTest(this.id, app).then(res => {
			res.data.map(item=>{
				item.answer_option = JSON.parse(item.answer_option)
				return item
			})
			this.setData({ questions: res.data });
		});
	},
	calcPoint(point) {
		// let point = this.data.questions.length;
		// const textComplete = this.data.textComplete;
		// textComplete.forEach(item => {
		// 	if (item) {
		// 		point -= 1;
		// 	}
		// });
		this.setData({ point });
	},
	handleCheck(e) {
		if (!e.currentTarget.dataset.id) return;
		const checkId = e.currentTarget.dataset.id;
		const curId = this.data.curId;
		let chose = this.data.chose;
		let resultArray = this.data.resultArray

		// 多选
		if (this.data.questions[this.data.curId].question_type === 2) {
			chose[curId] = chose[curId] || [];
			const index = chose[curId].indexOf(checkId);
			if (index === -1) {
				chose[curId].push(checkId);
			} else {
				chose[curId].splice(index, 1);
			}
			chose[curId] = Array.from(new Set(chose[curId].sort()));
			
			resultArray[curId] ={
				id:this.data.questions[curId].id,
				option:chose[curId]
			}
		} else {
			// 单选 && 判断
			chose[curId] = [];
			chose[curId].push(checkId);
			resultArray[curId] ={
					id:this.data.questions[curId].id,
					option:chose[curId]
				}
		}
		this.changeActiveCheck(curId);
		this.setData({
			checkId,
			chose,
			resultArray
		});
	},
	toggleQuestion(e) {
		let curId = this.data.curId;
		if (e.currentTarget.dataset.next) {
			// 当前回答为空,禁止下一题
			if (!this.data.chose[curId]) return;
			if (!this.data.chose[curId].length) return;
			if (curId === this.data.questions.length - 1) return;
			curId += 1;
			this.changeActiveCheck(curId);
		} else {
			if (this.data.curId === 0) return;
			curId -= 1;
			this.changeActiveCheck(curId);
		}
		this.setData({
			curId
		});
	},
	changeActiveCheck(id) {
		// 该id下选择的答案
		const actChose = this.data.chose[id] || [];
		let activeCheck = {};

		actChose.forEach(item => {
			activeCheck[item] = true;
		});
		this.setData({ activeCheck });
	},
	handleSubmit() {
		if ([...this.data.chose].length < this.data.questions.length) {
			;
			return;
		} else {
			let data = { answers: [] };
			data.answers = JSON.parse(JSON.stringify(this.data.resultArray));
			data.content_id = this.id,
			api.courseResult(this.id, data, app).then(res => {
				this.fullMark(res.wronganswers);
				this.setData({
					textComplete: res.wronganswers
				});
				this.calcPoint(res.score);
				this.setData({ exam: false });
				app.event.emit("reGetUser");
			});
		}
	},
	fullMark(answers) {
		Object.values(answers).forEach(item => {
			if (item !== null) this.setData({ notFullMark: true });
		});
	},
	toClasses() {
		wx.navigateBack({
			delta: 2
		});
	}
});
