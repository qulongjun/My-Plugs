/*
 * (c)Copyright 2015 瞿龙俊. All Rights Reserved.
 * flow():实现瀑布流效果，参数如下：
 * 1.containerElement:容器元素Id
 * 2.loadElement:加载图标元素id
 * 3.imgWidth:每张图片的宽度
 * 4.cellSpace：每列之间的间隔
 * 5.imgBottomSpace:每张图片底部的间隔
 * 6.imgUrl:图片的JSON地址，用来向该地址发送JSON请求，并返回data数据,传递的参数格式为page=?(0~N),需要自定义则在插件内修改
 * 7.minCells:最小列数
 * 8.maxCells：最大列数
 * 9.animate:boolean值，指定浏览器放缩时图片位移方式，true则代表动态位移，false则代表静态位移
 */
function flow(containerElement, loadElement, imgWidth, cellSpace, imgBottomSpace, imgUrl, minCells, maxCells, animate) {
	var oContainer = $('#' + containerElement); //获取容器元素 
	var oLoading = $('#' + loadElement); //获取加载loading图标元素
	var iWidth = imgWidth; //定义每一列的宽度
	var iSpace = cellSpace; //定义列之间的间隔
	var iOuterWidth = iWidth + iSpace; //实际每一列占位宽度
	var arrL = []; //记录每一列left值
	var arrT = []; //记录每一列top值
	var iBtn = true; //判断是否需要加载
	//用来计算列数.$(window).innerWidth():可视区的宽度
	var iPage = 0; //当前页码：JSON的data参数
	var sUrl = imgUrl; //JSON的url地址
	getData();
	setCells();
	for (var i = 0; i < iCells; i++) { //初始化
		arrL.push(i * iOuterWidth);
		arrT.push(0);
	}

	function getData() {
			if (iBtn) { //判断是否要进行下一次数据的加载
				iBtn = false;
				oLoading.show(); //显示加载中的logo
				$.getJSON(sUrl, 'page=' + iPage, function(data) { //getJSON(url,data,success(data,status,xhr))，url:规定将请求发送的哪个 URL，data:规定连同请求发送到服务器的数据，function:规定当请求成功时运行的函数。
					$.each(data, function(index, obj) { //遍历data属性，function参数为index：当前索引，obj：当前索引的对象
						var oImg = $('<img>'); //创建img标签
						oImg.attr('src', obj.preview); //设置img的src属性
						oImg.appendTo(oContainer); //将img添加到容器中
						//计算等比缩放之后，高度应该的取值，计算公式为(当前宽度/原始宽度)*原始高度
						var iHeight = iWidth / obj.width * obj.height;
						//设置定位
						var iMin = getMinCells(); //获取最短列的index值
						oImg.css({ //设置Img的CSS样式
							'width': iWidth,
							'height': iHeight,
							'left': arrL[iMin], //left值：当前列的left值
							'top': arrT[iMin] //top值：当前列的top值
						})
						arrT[iMin] += iHeight + 10; //更新当前列的top值，并预留一段高度作为间隔
					});
					oLoading.hide(); //隐藏加载logo
					iBtn = true; //全部加载完成，可以开始下一轮加载
				});
			}
		}
	//计算列数及容器总宽度
	function setCells() {
			iCells = Math.floor($(window).innerWidth() / iOuterWidth); //根据屏幕计算宽度
			if (iCells < minCells) { //列数不能小于最小列数
				iCells = minCells;
			}
			if (iCells > maxCells) { //列数不能大于最大列数
				iCells = maxCells;
			}
			oContainer.css('width', iCells * iOuterWidth - iSpace); //设置容器的总宽度：占位宽度*总列数
		}
		//获取列最小值所在的index

	function getMinCells() {
			var temp = arrT[0];
			var index = 0;
			for (var i = 0; i < arrT.length; i++) {
				if (arrT[i] < temp) {
					temp = arrT[i];
					index = i;
				}
			}
			return index;
		}
		//当浏览器尺寸发生改变时，重新布局
	$(window).on('resize', function() {
			var iLen = iCells; //计算原来列的数量
			setCells(); //重新设置列数
			if (iLen == iCells) { //如果列的数量没发生改变，则不需要重新布局
				return;
			}
			arrT = []; //初始化列的top值
			arrL = []; //初始化列的left值
			for (var i = 0; i < iCells; i++) {
				arrT[i] = 0;
				arrL[i] = iOuterWidth * i;
			}
			//遍历每个容器下的img元素,让它们重新定位元素位置
			oContainer.find('img').each(function() {
				var _index = getMinCells();
				//静态位移
				if (animate) {
					//动画位移
					$(this).animate({
						left: arrL[_index],
						top: arrT[_index]
					}, 1000);
				} else {
					//静态变化
					$(this).css({
						left: arrL[_index],
						top: arrT[_index]
					});
				}
				arrT[_index] += $(this).height() + imgBottomSpace; //更新列的top值
			});
			var iH = $(window).scrollTop() + $(window).innerHeight(); //计算当前的浏览器滚动条的高度和屏幕高度
			var iMin = getMinCells(); //计算最小列的top值
			if (arrT[iMin] + oContainer.offset().top < iH) { //如果最小列已经出现在屏幕上，则加载
				iPage++;
				getData();
			}
		})
		//当滚动条滚动时触发事件
	$(window).scroll(function() {
		var iH = $(window).scrollTop() + $(window).innerHeight(); //计算当前的浏览器滚动条的高度和屏幕高度
		var iMin = getMinCells(); //计算最小列的top值
		if (arrT[iMin] + oContainer.offset().top < iH) { //如果最小列已经出现在屏幕上，则加载
			iPage++;
			getData();
		}
	});
}