const {
	fetch,
	urlBase
} = require("./fetch.js");
const pointsTracker = require("./points.js");
// error 
function onNetworkErr(err = {}, showToast = true) {
	
	wx.reportAnalytics("mythic_bugs", {
		err: "query error",
		stack: `${JSON.stringify(err)}`
	});
	if (!showToast) return;
	let title = "请求错误";
	if (err.message) title = err.message;
	if (err.errMsg) {
		const error = err.errMsg.slice(13);
		;
		if (error && error.includes("time")) title = "请求超时";
		else if (error && error.includes("interrupt")) title = "请求中断";
		else if (/.*[\u4e00-\u9fa5]+.*$/.test(error)) {
			title = error.replace("。", "");
		}
	}
	title.length > 7 ?
		wx.showToast({
			title,
			duration: 3000,
			icon: "none"
		}) :
		wx.showToast({
			duration: 3000,
			title,
			image: "/images/raccoon.png"
		});
}

let retryTime = 3;
let appOrigin = null;
function request({
	app,
	...data
}) {
	if (app) appOrigin = app;
	return fetch(data).catch(err => {
		console.log(err)
		// 后台系统报错,如果当前是主页并且重新请求次数少于3则提示用户重新登录
		if (err["errMsg"] && Object.keys(err).length < 2) {
			if (data.url === "/api/login" && retryTime > 0) {
				wx.showModal({
					title: "提示",
					content: "登录失败，请重新登陆",
					showCancel: false,
					success(res) {
						if (res.confirm) {
							retryTime--;
							appOrigin.login(true);
							wx.switchTab({
								url: "/pages/index/index"
							});
						}
					}
				});
				onNetworkErr(err, false);
			} else onNetworkErr(err);
		} 
		else {
			// 401这次的操作需要权限,退出登录并且提示用户重新登录
			if (err.statusCode === 401) {
				;
				appOrigin.hasLogin = false;
				if (data.url !== "/api/login") {
					appOrigin.login(false);
					const duration = 3000;
					wx.showToast({
						title: "登陆已失效，正在重新登陆，请重新进入页面",
						image: "/images/raccoon.png",
						duration
					});
					setTimeout(() => {
						wx.hideToast();
						wx.switchTab({
							url: "/pages/index/index"
						});
					}, duration);
				}
			} else onNetworkErr(err.data);
		}
	});
}
// request,对于fetch错误码的二次处理

const apis = {
	// 登录
	login: (data, app, loading) => {
		// 主要登录请求
		const mainLogin = request({
			httpType: "POST",
			url: "/api/login",
			data,
			app,
			loading,
		});
		return mainLogin;
	},
	// 积分管理后台登录请求
	pointsLogin: (data, app) => {
		return wx.request({
			url: `${pointsTracker.pointsApiBase}/session/login`,
			method: "POST",
			data: {
				code: data.code,
				// userInfo: app.globalData.userInfo || {}
			},
			header: {
				'content-type': 'application/x-www-form-urlencoded'
				// 'content-type': 'application/json'
			},
			success: (res) => {
				console.log('积分管理后台登录成功:', res.data);
				if(res.data.error_code == 0){
					wx.setStorageSync('pointsToken', res.data.data.access_token);
					// pointsTracker.recordDailyLogin();
				}
				// 将积分管理后台的用户信息存储到globalData
				// if (app && app.globalData && res.data.code === 200) {
				// 	app.globalData.pointsUser = res.data.data;
				// 	app.globalData.pointsToken = res.data.data.token;
				// }
			},
			fail: (err) => {
				console.error('积分管理后台登录失败:', err);
			}
		});
	},
	// 获取session_key
	getKey: (data, app) => request({
		httpType: "POST",
		url: "/get_session",
		data,
		app,
		
	}),
	// 刷新在线学习信息
	getUser: (app) => request({
		url: "/exam/learn_status/",
		app
	}),
	// 课程_列表
	courses: (data, app) => request({
		url: `/course/courses/?level=${data.level}${data.category ? "&category="+data.category :""}&page=${data.page}`,
		app
	}),
	// 课程_详情
	course: (id, app) => request({
		url: `/course/detail/?id=${id}`,
		app
	}),
	// 课程_考试
	courseTest: (id, app) => request({
		url: `/exam/test/?content_id=${id}`,
		app
	}),
	// 课程提交考试结果
	courseResult: (id, data, app) => request({
		httpType: "POST",
		url: `/exam/test_complete/?content_id=${id}`,
		data,
		app,
		
	}),
	// 学习记录
	study_history: app => request({
		url: `/study_history`,
		app
	}),
	// 基地页
	bases: (data,app) => request({
		url: `/education/bases/`,
		app,
		data
	}),
	// 基地详情
	base: (id, app) => request({
		url: `/education/detail/?id=${id}`,
		app
	}),
	// 专家库
	experts: app => request({
		url: `/expert/experts/`,
		app
	}),
	// 专家详情
	expert: (id, app) => request({
		url: `/expert/detail/?id=${id}`,
		app
	}),
	// 知识库
	knowledges: (data, app) => request({
		url: `/knowledges/knowledges/`,
		data,
		app
	}),
	// 知识详情
	knowledge: (id, app) => request({
		url: `/knowledges/detail/?id=${id}`,
		app
	}),
	// 学校
	schools: (data,app) => request({
		url: `/school/schools/`,
		app,
		data
	}),
	// 学校详情
	school: (id, app) => request({
		url: `/school/detail/?id=${id}`,
		app
	}),
	// 课件
	ppts: (data, app) => request({
		url: `/courseware/ppts/`,
		data,
		app
	}),
	// 课件
	ppt: (id, app) => request({
		url: `/courseware/ppt/detail/?id=${id}`,
		app
	}),
	// 公共开放
	facilities: (data, app) => request({
		url: `/facility/reserves?page=${data.page}`,
		app
	}),
	// 公共开放-详情
	facility: (id, app) => request({
		url: `/facility/reserve/detail/?id=${id}`,
		app
	}),
	// 公共开放-活动剪影
	facility_medias: (id, app) => request({
		url: `/facility/medias`,
		app
	}),
	// 公共开放-相关文件
	facility_docs: (id, app) => request({
		url: `/facility/docs`,
		app
	}),
	// 公共开放-剪影详情
	facility_media: (id, app) => request({
		url: `/facility/media/${id}`,
		app
	}),
	// 公共开放-文件详情
	facility_doc: (id, app) => request({
		url: `/facility/doc/${id}`,
		app
	}),
	// 绑定pc用户
	bind_pc: (data, app) => request({
		httpType: "POST",
		url: `/bind_pc/`,
		data,
		app,
		
	}),
	// 公共预约-开放点列表
	reserve_list: (data, app) => request({
		url: '/facility/reserves',
		data,
		app
	}),
	// 公共预约-开放点详情
	reserve_detail: (id, app) => request({
		url: `/facility/intro/?id=${id}`,
		app
	}),
	// 公共预约-开放点收藏列表
	reserve_collect_list: (app) => request({
		url: '/facility/reserve/collects/',
		app
	}),
	// 公共预约-开放点收藏
	reserve_collect: (data, app) => request({
		httpType: "POST",
		url: '/facility/reserve/collect/add/',
		data,
		app,
		
	}),
	// 公共预约-取消收藏
	reserve_collect_cancel: (data, app) => request({
		httpType: "POST",
		url: `/facility/reserve/collect/cancel/`,
		data,
		app,
		
	}),
	// 公共预约-预约
	reserve_add: (data, app) => fetch({
		httpType: "POST",
		url: '/reserve/add/',
		data,
		app,
		
	}),
	// 预约订单
	order_list: (app) => request({
		url: '/reserve/reserves',
		app
	}),
	// 预约订单详情
	order_detail: (data, app) => request({
		url: `/reserve/detail`,
		data,
		app
	}),
	// 修改订单
	order_update: (data, app) => fetch({
		httpType: "POST",
		url: '/reserve/update/',
		data,
		app,
		
	}),
	// 预约取消
	order_cancel: (data, app) => request({
		httpType: "POST",
		url: '/reserve/cancel/',
		data,
		app,
		
	}),
	// 自定义
	autoQuery: ({
		url,
		httpType = "get",
		app,
		data = {}
	}) => request({
		url,
		httpType,
		app,
		data
	}),
	// 积分列表
	 footprint_scores:(app) => request({
		url: `/footprint/scores/`,
		app}),
	//足迹增加
	footprint_add: (data, app) => request({
		httpType: "POST",
		url: '/footprint/add/',
		data,
		app,
		
	}),
	//足迹历史
	footprint_history: (data,app) => request({
		url: '/footprint/history/',
		data,
		app
	}),
	//可提取足迹
	footprint_pickable: (app) => request({
		url: '/footprint/pickable/',
		app
	}),
	//提取足迹积分
	footprint_pick: (data, app) => request({
		httpType: "GET",
		url: '/footprint/pick/',
		data,
		app,
	}),
	//查询足迹等级阶梯
	footprint_levels: (app) => request({
		url: '/footprint/levels/',
		app
	}),
	//足迹用户信息
	footprint_userinfo: (app) => request({
		url: '/footprint/userinfo/',
		app
	}),
	//足迹排名
	footprint_rank: (app) => request({
		url: '/footprint/rank/',
		app
	}),
	//活动列表
	activity_list: (app) => request({
		url: '/footprint/enables/',
		app
	}),
	//活动详情
	activity: (id,app) => request({
		url: `/activity/detail/?id=${id}`,
		app
	}),
	//更新用户信息
	update_user: (data, app) => request({
		httpType: "POST",
		url: '/userinfo/update/',
		data,
		app,
		
	}),
// 获取GID
	get_gid:(data,app) =>request({
		httpType: "POST",
		url: '/plugin/wxgetopenGid.do/',
		data,
		app, 
		
	}),
	//群排行榜增加
	group_add:(data,app) =>request({
		httpType: "POST",
		url: '/footprint/wxgroup/add/',
		data,
		app,
		
	}),
	//群排行榜查询
	group_rank:(data,app) =>request({
		httpType: "POST",
		url: '/footprint/wxgroup/rank/',
		data,
		app,
		
	}),
	// 设施足迹扫码更新订单状态
	updateStatus:(r_id, app) => request({
		httpType: "POST",
		url: '/user/reserve/status/update/',
		data: {
			r_id
		},
		app,
		
	}),
	// 美境行动banner图
	meijing_banners: (app) => request({
		url: '/meijing/banners/',
		app
	}),

	// 美境行动banner图
	meijing_banners: (app) => request({
		url: '/meijing/banners/',
		app
	}),

	// 美境行动方案列表
	meijing_planes: (data, app) => request({
		url: '/meijing/planes/',
		app,
		data
	}),

	// 美境行动活动列表
	meijing_activities: (data, app) => request({
		url: '/meijing/activities/',
		app,
		data
	}),

	// 美境行动文件列表
	meijing_files: (data, app) => request({
		url: '/meijing/files/',
		app,
		data
	}),
	//设施宣传列表页查询
	activities_list: (data, app) => request({
		url: '/facility/reserve/activities/',
		data,
		app
	}),
	//设施宣传详情
	getActivityDetail: (id, app) => request({
		url: '/facility/reserve/activity/'+id,
		app
  }),
  //获取图书列表
  getBooksList:(data,app)=>request({
    url:'/book/list/',
    data,
    app
  }),
  //获取图书详情
  getBookDetail:(data,app)=>request({
    url:'/book/detail/',
    data,
    app
  }),
  //获取美境行动奖状下载列表
  getMJCertificateList:(data)=>request({
    url:`/meijing/certificates/`,
    httpType:'GET',
    data
  }),
  //获取每日小知识
  getDailyKnowledge:()=>request({
    url:`/knowledges/knowledge/daily/`,
    httpType:'GET'
  })
};




module.exports = apis;
module.exports.baseUrl = urlBase;