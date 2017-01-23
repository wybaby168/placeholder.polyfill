/**
 * table.placeholder
 * 表单placeholder兼容配置器
 * 1. 兼容v-validation
 * 2. 兼容input text和textarea
 * 3。兼容datetimepicker
 * @author wangyu
 * @date 2016/12/6
 */

;(function(root, factory){
	if (typeof define === "function" && define.amd) {
		define(['tables', 'validation'], factory);
	} else {
		$(function () {
			factory();
		});
	}
}(this, function () {

	var _HTML = '<span></span>',
		_WRAPPER = '<div></div>',
		_CLASS = '[placeholder]',
		inited = false;

	//对jquery的html，append，prepend事件进行拦截
	(function ($) {
		$.each(['html', 'append', 'prepend', 'val'], function (i, ev) {
			var el = $.fn[ev];
			$.fn[ev] = function () {
				var self = el.apply(this, arguments);
				this.trigger(ev, arguments);
				return self;
			};
		});
	})(jQuery);

	/**
	 * 创建placeholder的内容
	 */
	var createHolder = function () {
		var holder = $(this).next();
		if (holder.length !=0 && holder.hasClass('placeholder')) {
			return;
		} else {
			holder = $(this).after(_HTML).next();
		}

		//填充内容
		holder.html($(this).attr('placeholder'));

		//复制样式
		cloneStyle.apply(this, [holder]);

		if (!tables.val($(this))) {
			$(this).hide();
		} else {
			holder.hide();
		}
	};

	/**
	 * 控件获取焦点时隐藏placeholder
	 */
	var hideHolder = function () {
		var prev = $(this).prev();
		//过滤校验内容
		while (prev.hasClass('_auto_valid')) {
			prev = prev.prev();
		}
		//过滤事件控件
		prev.show().focus();
		if (!prev.hasClass('date')) {
			$(this).hide();
		} else {
			prev.hide();
		}
	};

	/**
	 * 控件失去焦点时显示placeholder
	 */
	var showHolder = function () {
		var self = $(this);
		if (!tables.val(self)) {
			var next = self.hide().next(),
				holder = self.nextAll('.placeholder:eq(0)').show();
			if (next.hasClass('_auto_valid')) {
				holder.nextAll('._auto_valid:eq(0)').remove();
				holder.after(next);
			}
		}
	};

	/**
	 * 复制控件的css样式
	 */
	var cloneStyle = function (holder) {
		//处理原本的样式，包含css
		holder.attr({
			'class': $(this).attr('class'),
			'disabled': $(this).attr('disabled'),
			'readonly': $(this).attr('readonly')
		}).addClass('placeholder');
		//特殊处理textarea
		if ($(this).is('textarea')) {
			holder.width($(this).width()).height($(this).height());
		}
		//特殊处理validation
		if ($(this).hasClass('v-validation')) {
			holder.removeClass('v-validation');
		}
	};

	/**
	 * 处理页面中的placeholder
	 */
	var handlePage = function () {
		$(this == window ? _CLASS : this)
			.each(createHolder);
		if (!inited) {
			$(document).on('click', '.placeholder', hideHolder)
				.on('blur', _CLASS, showHolder)
				.on('html append prepend', '[id]', handleFuture)
				.on('val', '.date', handleFuture);
			inited = true;
		}
	};

	var handleFuture = function (e, content) {
		//处理datetimepicker取值
		if (e.type == 'val' && $(e.target).hasClass('date')) {
			if (tables.strTrim(content)) {
				$(e.target).show().nextAll('.placeholder:eq(0)').hide();
			}
			return;
		}
		//dom新增的内容
		if (_.isString(content) && content.indexOf('placeholder') != -1) {
			$(e.target).find(_CLASS).placeholder();
		}
	};

	handlePage();

	var handleValidation = function (validation) {
		var validTipMethod = validation.setErrorTip;
		validation.setErrorTip = function(obj, message){
			if ($(obj).is('[placeholder]')) {
				validTipMethod($(obj).nextAll('.placeholder:eq(0)'), message);
			} else {
				validTipMethod(obj, message);
			}
		};
	};

	if (typeof define === "function" && define.amd) {
		require(['validation'],handleValidation);
	} else {
		handleValidation(validation);
	}

	$.fn.placeholder = handlePage;
}));