//图片大小最大值，单位kb
var maxSize = 500 * 1024;

/* 保留小数
 
 * @ param x 	值
 * @ param y 	10保留一位，100保留两位， 1000保留三位
 * */
function toDecimal(x, y) {
	var f = parseFloat(x);
	if(isNaN(f)) {
		return;
	}
	f = Math.round(x * y) / y;
	return f;
}

/* 格式化时间戳

 * 2016-08-16 15:12:23
 * @ param: nS 	时间戳
 */
function getNowFormatDate(nS) {
	if(!nS) return;
	var now = new Date(nS);
	var yyyy = now.getFullYear();
	var mm = now.getMonth() + 1;
	var dd = now.getDate();
	var hh = now.getHours() < 10 ? "0" + now.getHours() : now.getHours();
	var mi = now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes();
	var ss = now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds()
	return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + mi + ":" + ss;
}

/* 日期转时间戳

 * @ param： Mydate 	时间
 */
function DateTOtimestamp(Mydate) {
	if(!Mydate) return 0;
	var timestamp = new Date(Mydate).getTime();
	return timestamp;
}

function getLocalTime(nS) {
	return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
}

/* 图片上传

 */
function img_upload(files, imgType, cb) {
	var imgUrlArr = [];
	if(files == undefined) {
		layer.msg('未选中图片！', {
			icon: 2, time:1000
		});
		return false;
	}
	var filesize = files.size;
	var reader = new FileReader();
	reader.onloadend = function() {
		var url = img_server_url + 'ydmUploadImg';
		var pic = reader.result;
		var dataPic = pic.split(",");
		var dataImg = dataPic[1];
		var GetJsonData = {
			dataImg: dataImg,
			imgType: imgType
		};
		if(filesize > maxSize) {
			layer.msg('商品主图大小不能超过500kb!', {
				icon: 2, time:1000
			});
			GetJsonData = {};
			return false;
		}
		jQajax(GetJsonData, url, function(data) {
			imgUrlArr.push(data.pathImg);
			cb(imgUrlArr);
		},false);
	}
	if(files) {
		reader.readAsDataURL(files);
	} else {
		layer.msg('上传失败', { icon: 2, time:1000 });
	}
}

/* 编辑器图片上传

 */
function uploadEditorImage(files, cb) {
	if (files != null) {
	    	
		var reader = new FileReader();
		if(files) {
			reader.readAsDataURL(files);
		} else {
			layer.msg('上传失败', { icon: 2 , time:1000});
		}
		var filesize = files.size;
		reader.onloadend = function(jqXHR, textStatus, errorThrown) {
			var imgUrl = img_server_url + 'ydmUploadImg';
				var pic = reader.result;
				var dataPic = pic.split(",");
				var dataImg = dataPic[1];
				var imgType = pic.split('image/')[1].split(';base64,')[0]
				var imgdata = {};
				if(filesize <= maxSize) {
					imgdata = {	
						dataImg: dataImg,
						imgType: imgType
					};
				} else {
					layer.alert('图片大小不能超过500kb！');
					imgdata = {};
					return false;
				}
				jQajax(imgdata, imgUrl, function(data){
					cb(data)
				},false);
			}
	    }
}

/* 通用只返回status、msg 封装
 
 * @ param: api 	接口名
 * @ param: param 	post参数对象
 * @ param: tips 	操作描述
 * @ param: link 	跳转链接
 * */
function ajaxStatus(api, param, tips, link) {
	var url = apiUrl + api;
	$.ajax({
		data: JSON.stringify(param),
		contentType: "application/json; charset=utf-8",
		type: 'post',
		url: url,
		dataType: "json",
		beforeSend: function() {
			layer.load(0);
		},
		timeout: 0,
		success: function(data) {
			if(100 == data.status) {
				layer.msg(tips, {
					icon: 1,
					time: 1000
				});
				setTimeout(function() {
					window.location.href = link;
				}, 1000);
			} else {
				layer.msg(data.msg, {
					icon: 2, time:1000
				});
			}
		},
		complete: function() {
			layer.load(0, {
				time: 1
			});
		},
		error: function(jqXHR, textStatus, errorThrown) {
			try {
                var sessionStatus = jqXHR.getResponseHeader('_xcrm_session_status');
                if ('_timeout' == sessionStatus) {
                    window.location.href = 'index.html';
                }
                if (jqXHR.status == 401) {
                	layer.msg(jqXHR.status+'无权限执行此操作.', {icon: 2, time:1000});
                } else {
                    var xhr = jqXHR;
                    if (xhr && xhr.responseText) {
                        var _json = JSON.parse(xhr.responseText);
                        if (!_json.res) {
                            layer.msg(jqXHR.status+_json.msg, {icon: 2, time:1000});
                        } else {
                        	layer.msg(jqXHR.status+xhr.responseText, {icon: 2, time:1000});
                        }
                    } else {
                        layer.msg(jqXHR.status+'后端错误.', {icon: 2, time:1000});
                    }
                }
            } catch (ex) {
                layer.msg(jqXHR.status+'后端错误.', {icon: 2, time:1000});
            }
		}
	});
}

/* 有data的Ajax封装
 
 * @ param: data 	post参数对象
 * @ param: url 	接口
 * @ param: success 返回成功回调函数
 * */
function jQajax(data, url, success, async) {
	$.ajax({
		data: JSON.stringify(data),
		contentType: "application/json; charset=utf-8",
		type: 'post',
		url: url,
		async: async,
		beforeSend: function() {
			layer.load(0);
		},
		timeout: 0,
		success: function(res) {
			if(100 == res.status) {
				success(res);
			} else if(3 == res.status) {
				layer.msg('登录超时，请重新登录！', {
					icon: 2,
					time: 1000
				});
				setTimeout(function() {
					window.location.href = 'index.html';
				}, 1000);
			} else {
				layer.msg(res.msg, {
					icon: 2, time:1000
				});
			}
		},
		complete: function() {
			layer.load(0, { time: 1});
		},
		error: function(jqXHR, textStatus, errorThrown) {
			try {
                var sessionStatus = jqXHR.getResponseHeader('_xcrm_session_status');
                if ('_timeout' == sessionStatus) {
                    window.location.href = 'index.html';
                }
                if (jqXHR.status == 401) {
                	layer.msg(jqXHR.status+'无权限执行此操作.', {icon: 2, time:1000});
                } else {
                    var xhr = jqXHR;
                    if (xhr && xhr.responseText) {
                        var _json = JSON.parse(xhr.responseText);
                        if (!_json.res) {
                            layer.msg(jqXHR.status+_json.msg, {icon: 2, time:1000});
                        } else {
                        	layer.msg(jqXHR.status+xhr.responseText, {icon: 2, time:1000});
                        }
                    } else {
                        layer.msg(jqXHR.status+'后端错误.', {icon: 2, time:1000});
                    }
                }
            } catch (ex) {
                layer.msg(jqXHR.status+'后端错误.', {icon: 2, time:1000});
            }
		}
	})
}

/* 没有data的Ajax封装
 
 * @ param: url 	接口
 * @ param: success 返回成功回调函数
 * */
function noDatajQajax(url, success) {
	$.ajax({
		contentType: "application/json; charset=utf-8",
		type: 'post',
		url: url,
		async: true,
		beforeSend: function() {
			layer.load(0);
		},
		timeout: 0,
		success: function(res) {
			if(100 == res.status) {
				success(res);
			} else if(3 == res.status) {
				layer.msg('登录超时，请重新登录！', {
					icon: 2,
					time: 1000
				});
				setTimeout(function() {
					window.location.href = 'index.html';
				}, 1000);
			} else {
				layer.msg(res.msg, {
					icon: 2, time:1000
				});
			}
		},
		complete: function() {
			layer.load(0, { time: 1 });
		},
		error: function(jqXHR, textStatus, errorThrown) {
			try {
                var sessionStatus = jqXHR.getResponseHeader('_xcrm_session_status');
                if ('_timeout' == sessionStatus) {
                    window.location.href = 'index.html';
                }
                if (jqXHR.status == 401) {
                	layer.msg(jqXHR.status+'无权限执行此操作.', {icon: 2, time:1000});
                } else {
                    var xhr = jqXHR;
                    if (xhr && xhr.responseText) {
                        var _json = JSON.parse(xhr.responseText);
                        if (!_json.res) {
                            layer.msg(jqXHR.status+_json.msg, {icon: 2, time:1000});
                        } else {
                        	layer.msg(jqXHR.status+xhr.responseText, {icon: 2, time:1000});
                        }
                    } else {
                        layer.msg(jqXHR.status+'后端错误.', {icon: 2, time:1000});
                    }
                }
            } catch (ex) {
                layer.msg(jqXHR.status+'后端错误.', {icon: 2, time:1000});
            }
		}
	})
}

//编辑器图片上传
function sendFile(file, obj) {
	var reader = new FileReader();
	reader.readAsDataURL(file);
	var filesize = file.size;
	reader.onloadend = function() {
		var imgUrl = img_server_url + 'ydmUploadImg';
		var pic = reader.result;
		var dataPic = pic.split(",");
		var dataImg = dataPic[1];
		var imgType = pic.split('image/')[1].split(';base64,')[0]
		var imgdata = {};
		if(filesize <= maxSize) {
			imgdata = {
				dataImg: dataImg,
				imgType: imgType
			};
		} else {
			layer.alert('图片大小不能超过200kb！');
			imgdata = {};
			return false;
		}
		jQajax(imgdata, img_server_url, function(data){
			obj.summernote('insertImage', data.pathImg);
		});
	}
}
/*上传图片插件
 
 * 依赖服务：uploadPictureService
 * HTML部分：<div id=""></div><img src="../images/upload_img.png" ng-click="ctrl.uploadPicture($event.target)">
 * 弹出上传：uploadPictureService.layer
 * 渲染获取图片：uploadPictureService.getImg(id, src) id是DOM节点，src是图片路径
 * 提交获取图片：uploadPictureService.postImg(id) id是DOM节点
 * */

var uploadPictureService = function() {};
uploadPictureService.prototype = {
	layer: function(target, num, info) {
		var len = parseInt($(target).prev().children('.main-img').length);
		if(len > num - 1) {
			layer.msg(info, {
				icon: 2
			});
			return false;
		}
		layer.open({
			type: 1,
			title: '上传图片',
			area: ['440px', '300px'],
			btn: ['确定上传', '取消'],
			yes: function(index) {
				var flieStr = $('#filePicURL').val();
				var filesData = $('#filePicURL').prop('files')[0];
				var imgType = flieStr.split('.')[1];
				img_upload(filesData, imgType, function(arr) {
					var result = '<div class="main-img">' + '<div class="img"><img src="' + arr[0] + '" class="pic"></div>' + '<span></span>' + '</div>';
					$(target).prev().append(result);
					//删除主图
					$('.main-img span').each(function() {
						$(this).on('click', function() {
							$(this).parent().remove();
						});
					});
				});
				layer.close(index);
			},
			shadeClose: false,
			content: '<div ng-include="\'Templates/example/picture_layer.html\'"></div>'
		});	
	},
	getImg: function(target, src){
		if(!src){
			return false;
		}
		//预览图片
		var result = '<div class="main-img"><div class="img"><img src="' + src + '" class="pic"></div><span></span></div>';
		$(target).append(result);
		//删除主图
		$('.main-img span').each(function() {
			$(this).on('click', function() {
				$(this).parent().remove();
			});
		});
	},
	postImg: function(target){
		var picArr = new Array();
		var picVlaue = '';
		var picObj = $(target).children().children().children();
		for(var i=0; i<picObj.length; i++){
			picVlaue = picObj[i].src;
			picArr.push(picVlaue);
		}
		return picArr;
	},
	cutlayer: function(cb){
		layer.open({
			type: 1,
			title: '裁剪图片',
			area: ['780px', '80%'],
			resize: false,
			success: cb,
			content: '<div ng-include="\'Templates/example/cut_img.html\'"></div>'
		});
	},
	getCutImg: function(target, src){
		if(!src){
			return false;
		}
		var result = '';
		if(src.length < 107){
			result = '<div class="main-img"><div class="img"><img src="' + src + '" class="pic"></div><span></span></div>';
		}else{
			var size = src.split('_')[1].split('.')[0];
			var width = size.split('x')[0];
			var height = size.split('x')[1];
			var imgWidth = 0;
			var imgheight = 0;
			var imgStyle = '';
			if(width >= height){
				imgWidth = 80;
				imgheight = imgWidth-(height*imgWidth/width);
				imgStyle = 'margin-top:' + imgheight/2 + 'px';
			}else{
				imgStyle = 'text-align: center;';
			}
			//预览图片
			result = '<div class="main-img cut-img"><div class="img" style="'+ imgStyle +'" onclick="preview1(' + width + ',' + height + ',\'' + src +'\')"><img src="' + src + '" class="pic" title="点击预览"></div><div class="size-bg"></div><div class="size">'+ size +'px</div>' + '<span></span>' + '</div>';
		}
		$(target).append(result);
		//删除主图
		$('.main-img span').each(function() {
			$(this).on('click', function() {
				$(this).parent().remove();
			});
		});
	},
	
}

//预览图片
function preview1(width, height, src){
	layer.open({
	  type: 1,
	  title: false,
	  closeBtn: 0,
	  area: width+'px',
	  skin: 'layui-layer-nobg', //没有背景色
	  shadeClose: true,
	  content: '<img src='+ src +'>'
	});
}

/* 列表组件封装
 
 * 依赖服务：getList
 * 提交数据获取列表：getList.list(data, url, cb) data是提交数据对象，url是接口， cb是回调函数
 * 无提交数据获取列表：getList.noDatalist(data, url, cb) data是提交数据对象，url是接口， cb是回调函数
 * */
var getList = function(){};
getList.prototype = {
	list: function(data, url, cb){
		return  jQajax(data, url, cb);
	},
	noDatalist: function(url, cb){
		return  noDatajQajax(url, cb);
	}
}

/* 传参容器封装
 
 * 依赖服务：instance
 * */
function instance(){
	return {};
}

/* 弹窗的封装
 
 * layerService.getLayer(title, width, height, html, cb)  	打开弹窗,title是标题，width是宽度，height是高度，html是包含文件，cb是回调函数
 * layerService.close(layero) 		关闭弹窗，layero是弹窗的序号
 * */
var layerService = function(){};
layerService.prototype = {
	getLayer: function(title, width, height, html, cb){
		layer.open({
			type: 1,
			title: title,
			area: [width,height],
			resize: false,
			success: cb,
			content: '<div ng-include="'+ html +'"></div>'
		});
	},
	getLayerContent: function(title, width, height, html, cb){
		layer.open({
			type: 1,
			title: title,
			area: [width,height],
			resize: false,
			success: cb,
			content: html
		});
	},
	close: function(layero){
		$('#layui-layer-shade' + layero).remove();
		$('#layui-layer' + layero).remove();
	}
	
}

/* 分店组件
 
 * 多选: branchStore.multiselect($scope) 获取分店，全选、反选、单选，$scope是angular的内置对象
 * 获取提交数据：branchStore.getStore(obj) obj是数据节点
 * */

var branchStore = function(){};
branchStore.prototype = {
	//多选分店-所有分店
	multiselect: function($scope, arr, id){
		noDatajQajax(apiUrl+'team/ManagerStoreBranch', function(res){
			$scope.list = res.data;
			var branchArr = [];
			$scope.checked = [];
		    angular.forEach($scope.list, function (i) {
		    	branchArr.push(i.branchID);
		        if(arr.indexOf(i.branchID) != -1){
					i.checked = true;
				}
		        if(id == i.branchID){
					i.disabled = true;
					i.checked = true;
				}
		    });
		    if(arr.toString() === branchArr.toString()){
		        $scope.select_all = true;
		    }else{
		    	$scope.select_all = false;
		    }
		    $scope.selectAll = function () {
		        if($scope.select_all) {
		            $scope.checked = [];
		            angular.forEach($scope.list, function (i) {
		                i.checked = true;
		                $scope.checked.push(i.branchID);
		            })
		        }else {
		        	$scope.checked = [];
		            angular.forEach($scope.list, function (i) {
		                if(id == i.branchID){
							i.checked = true;
						}else{
							i.checked = false;
						}
		            })
		        }
		    };
		    $scope.selectOne = function () {
		        angular.forEach($scope.list , function (i) {
		            var index = $scope.checked.indexOf(i.branchID);
		            if(i.checked && index === -1) {
		                $scope.checked.push(i.branchID);
		            } else if (!i.checked && index != -1){
		                $scope.checked.splice(index, 1);
		            };
		        })
		
		        if ($scope.list.length === $scope.checked.length) {
		            $scope.select_all = true;
		        } else {
		            $scope.select_all = false;
		        }
		    }
		});
	},
	//获取店铺id数组
	getStore: function(obj){
		var branchIDArr = [];
		var branchID;
		var branchIDObj = $(obj);
		for(var i=0; i<branchIDObj.length; i++){
			branchID = branchIDObj[i].id;
			branchIDArr.push(branchID);
		}
		return branchIDArr;
	},
	//获取所有分店
	radioStoreAll: function($scope, id){
		noDatajQajax(apiUrl+'team/ManagerStoreBranchAll', function(res){
			$scope.branchID = id;
			$scope.storeList = res.data;
		});
	},
	//获取管理分店
	radioStore: function($scope, id){
		noDatajQajax(apiUrl+'team/ManagerStoreBranch', function(res){
			$scope.branchID = id;
			$scope.storeList = res.data;
		});
	},
	//获取职位
	radioRole: function($scope, id){
		noDatajQajax(apiUrl+'team/ManagerStorePosition', function(res){
			$scope.roleID = id;
			$scope.roleList = res.data;
		});
	},
	//获取省份
	province: function($scope, selfid){
		noDatajQajax(apiUrl+'order_manage/getProvince', function(res){
			$scope.provinceID = selfid;
			$scope.provinceList = res.data;
		});
	},
	//获取城市
	city: function($scope, selfid, pid){
		var postData = {id: pid}
		jQajax(postData, apiUrl+'order_manage/getCity', function(res){
			$scope.cityID = selfid;
			$scope.cityList = res.data;
		});
	},
	//获取县区
	county: function($scope, selfid, pid){
		var postData = {id: pid}
		jQajax(postData, apiUrl+'order_manage/getCounty', function(res){
			$scope.countyID = selfid;
			$scope.countyList = res.data;
		});
	},
	//获取部门
	department: function($scope, id){
		var postData = {state:1};
		jQajax(postData, apiUrl+'team/rightUserDepartment', function(res){
			$scope.department = id;
			$scope.departmentList = res.data;
			var postData = {departmentID: $scope.departmentId}
		});
	},
	//获取职位
	post: function($scope, selfid, pid){
		var postData = {departmentID: pid}
		jQajax(postData, apiUrl+'team/rightUserPost', function(res){
			if(res.data.length ===0){
				layer.msg('该部门没有可选职位', {icon:2});
				$scope.postList = [];
				return false;
			}else{
				$scope.postId = res.data[0].id;
				$scope.post = selfid;
				$scope.postList = res.data;
			}
			
		});
	}
}


/* 时间插件自定义
 
 * 
 * */
var My97DatePicker = function(){};
My97DatePicker.prototype = {
	//精确到日
	wdatePicker: function(){
		return {
			restrict: "A",
			require: "ngModel",
			link: function(scope, element, attr, ngModel) {
				element.val(ngModel.$viewValue);
	
				function onpicking(dp) {
					var date = dp.cal.getNewDateStr();
					scope.$apply(function() {
						ngModel.$setViewValue(date);
					});
				}
				element.bind('click', function() {
					window.WdatePicker({
						onpicking: onpicking,
						dateFmt: 'yyyy-MM-dd',
						maxDate:'%y-%M-%d'
					});
				});
	
			}
		}
	}
}

//权限控制
var jurService = function(){};
jurService.prototype = {
	//功能点屏蔽
	funShow: function($scope, funid, isBoss, id){
		if(isBoss === true){
			$scope.funShow = true;
		}else{
			if(funid.indexOf(id) != -1){
				$scope.funShow = true;
			}else{
				$scope.funShow = false;
			}
		}
	},
	//导航切换
	tab: function($scope, funid, isBoss, list){
		$scope.tabList1 = [];
		angular.forEach(list, function(data, index, array){
			if(isBoss == true){
				$scope.tabList1 = list;
				$scope.tab = array[0].tab;
			} else {
				if(funid.indexOf(data.funid) != -1){
					$scope.tabList1.push(data);
					angular.forEach($scope.tabList1, function(data, index, array){
						$scope.tab = array[0].tab;
					});
				}
			}
		});
		$scope.open = function(tab) {
			$scope.tab = tab;
		};
	},
	//查看
	funShowCheck: function($scope, funid, isBoss, id){
		if(isBoss === true){
			$scope.funShowCheck = true;
		}else{
			if(funid.indexOf(id) != -1){
				$scope.funShowCheck = true;
			}else{
				$scope.funShowCheck = false;
			}
		}
	},
	//添加
	funShowAdd: function($scope, funid, isBoss, id){
		if(isBoss === true){
			$scope.funShowAdd = true;
		}else{
			if(funid.indexOf(id) != -1){
				$scope.funShowAdd = true;
			}else{
				$scope.funShowAdd = false;
			}
		}
	},
	//邀请
	funShowYq: function($scope, funid, isBoss, id){
		if(isBoss === true){
			$scope.funShowYq = true;
		}else{
			if(funid.indexOf(id) != -1){
				$scope.funShowYq = true;
			}else{
				$scope.funShowYq = false;
			}
		}
	},
	//编辑
	funShowEdit: function($scope, funid, isBoss, id){
		if(isBoss === true){
			$scope.funShowEdit = true;
		}else{
			if(funid.indexOf(id) != -1){
				$scope.funShowEdit = true;
			}else{
				$scope.funShowEdit = false;
			}
		}
	},
	//转移
	funShowZy: function($scope, funid, isBoss, id){
		if(isBoss === true){
			$scope.funShowZy = true;
		}else{
			if(funid.indexOf(id) != -1){
				$scope.funShowZy = true;
			}else{
				$scope.funShowZy = false;
			}
		}
	},
	//导出
	funShowDc: function($scope, funid, isBoss, id){
		if(isBoss === true){
			$scope.funShowDc = true;
		}else{
			if(funid.indexOf(id) != -1){
				$scope.funShowDc = true;
			}else{
				$scope.funShowDc = false;
			}
		}
	},
	//打款、退派工
	funShow1: function($scope, funid, isBoss, id){
		if(isBoss === true){
			$scope.funShow1 = true;
		}else{
			if(funid.indexOf(id) != -1){
				$scope.funShow1 = true;
			}else{
				$scope.funShow1 = false;
			}
		}
	}
}







