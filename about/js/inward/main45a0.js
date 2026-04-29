function preload_btn(i) {
	const btn = $(i);
	const original_onclick = btn.attr('onclick');
	const btn_w = btn.outerWidth();
	const btn_h = btn.outerHeight();

	btn.attr('data-original-onclick', original_onclick);
	
	btn.attr('onclick', null).addClass('load').css({
		width: btn_w,
		height: btn_h
	});

	return i;
}

function restore_btn(i) {
	const btn = $(i);
	const original_onclick = btn.attr('data-original-onclick');

	btn.removeAttr('data-original-onclick').attr('onclick', original_onclick).removeClass('load').css({
		width: '',
		height: ''
	});
}

$.expr[":"].contains = $.expr.createPseudo(function(a) {
	return function(e) {
		return $(e).text().toUpperCase().indexOf(a.toUpperCase()) >= 0;
	};
});

function rand_min_max(min, max) {
	return Math.round(min - 0.5 + Math.random() * (max - min + 1));
}

function parts(and, choose, a, b, c) {
	return c ? a + ', ' + b + ' ' + and + ' ' + c : b ? a + ' ' + and + ' ' + b : a ? a : choose;
}

var scroll_error_start = false;

function scroll_error(key) {
	let a = $('#' + key),
		b = a.parents('.jin_window_scroll');

	if (a.length && b.length && !scroll_error_start) {
		let c = a.offset().top,
			d = b.offset().top,
			h = b.scrollTop();

		scroll_error_start = true;

		b.animate({
			scrollTop: c - d + h - 68
		}, 500, function() {
			scroll_error_start = false;
		});
	}
}

function ajax_request(section, func, data, success_callback, btn, extra_data, is_html = false) {
	const url = '/apps/' + section + '_' + func + '.app.php';

	if (extra_data) {
		$.extend(data, extra_data);
	}

	$.ajax({
		type: 'POST',
		url: url,
		data: data,

		success: function(response) {
			if (is_html) {
				success_callback(response);
			} else {
				const json = JSON.parse(response);

				if (json.process == 1) {
					success_callback(json);
				} else {
					if (json.errs) {
						for (const key in json.errs) {
							if (json.errs[key] != 0) {
								scroll_error(key);

								$('#' + key).addClass('err');
								// $('#' + section + '_err').html('<div class="error">' + json.errs[key] + '</div>');

								show_msg(json.errs[key], true);
							}
						}
					}
				}

				console.log(json);
			}

			restore_btn(btn);
		},

		error: function(error) {
			console.log(error);

			restore_btn(btn);
		}
	});
}

function reload_content(name, selector, callback, extra_data = false) {
	$.ajax({
		type: 'POST',
		url: '/apps/reloads/' + name + '.app.php',
		data: extra_data,

		success: function(html) {
			if (selector) {
				$(selector).empty().append(html);
			}

			if (callback) {
				callback(html);
			}
		},

		error: function(error) {
			console.log(error);
		}
	});
}

function load_content(bar_id, id, level, callback) {
	$.ajax({
		type: 'POST',
		url: '/incs/bar/bar_' + bar_id + '.inc.php',
		data: { id: id },

		success: function(html) {
			$('#bar_level_' + level + ' .bar_scroll').empty().append(html);

			if (callback) {
				callback(html);
			}
		},

		error: function(error) {
			console.log(error);
		}
	});
}

function get_data(fields) {
	let data = {};

	fields.forEach(function(field) {
		data[field] = $('#' + field).val();
	});

	return data;
}

function upload_file(form, url, preloaderSelector, buttonSelector, successCallback, errorSelector) {
	var formData = new FormData(form);

	$(errorSelector).empty();

	$.ajax({
		type: 'POST',
		url: url,
		data: formData,
		cache: false,
		contentType: false,
		processData: false,

		xhr: function() {
			var xhr = $.ajaxSettings.xhr();

			xhr.upload.addEventListener('progress', function(evt) {
				if (evt.lengthComputable) {
					var percentComplete = Math.ceil(evt.loaded / evt.total * 100);
					$(buttonSelector).fadeOut(0);
					$(preloaderSelector).fadeIn(0).find('.modal_upload_preloader_progress_line').css('width', percentComplete + '%').end().find('.modal_upload_preloader_percent').text(percentComplete + '%');
				}
			}, false);

			return xhr;
		},

		success: function(data) {
			var json = JSON.parse(data);

			$(preloaderSelector).fadeOut(0);
			$(buttonSelector).fadeIn(0);

			if (json.process === 1) {
				successCallback(json);
			} else if (json.errs && json.errs.err_image) {
				$(errorSelector).html('<div class="error">' + json.errs.err_image + '</div>');
			}
		},

		error: function(data) {
			console.log(data);
		}
	});
}

// ███████╗ ████████╗  █████╗  
// ██╔════╝ ╚══██╔══╝ ██╔══██╗ 
// █████╗      ██║    ██║  ╚═╝ 
// ██╔══╝      ██║    ██║  ██╗ 
// ███████╗    ██║    ╚█████╔╝ 
// ╚══════╝    ╚═╝     ╚════╝  

function copytext(txt) {
	const a = $('<input>').val(txt).appendTo('body').select();
	document.execCommand('copy');
	a.remove();
}

function copylink(txt, e) {
	const a = $(e),
		b = a.attr('data-lable');

	copytext(txt);
	a.text(b).addClass('active');
}

function copylinker(txt, e, domain = false) {
	let a = $(e),
		b = a.attr('data-lable'),
		c;

	if (domain) {
		c = txt;
	} else {
		c = 'uadd.me/' + txt;
	}

	copytext('https://' + c);

	if (a.hasClass('mini')) {
		a.addClass('active');

		setTimeout(() => {
			a.removeClass('active');
		}, 2000);

		show_msg(b);
	} else {
		a.addClass('active').children('.bar_linker_url').text(b);

		setTimeout(() => {
			a.removeClass('active').children('.bar_linker_url').text(c);
		}, 2000);
	}	
}

$(document).on('click', '.shower_open', function() {
	let a = $(this),
		b = a.next('.shower_hide'),
		c = $('.shower_hide'),
		d = $('.shower_open');


	a.toggleClass('active');
	d.not(a).removeClass('active');
	c.not(b).slideUp();
	b.slideToggle('slow');
});

$(document).on('input keyup', '.input_phone_number', function() {
	const inputVal = $(this).val(),
		phonePattern = /^\+?\d{7,14}$/,
		phoneNumberType = $('#phone_number_type'),
		radioInputs = phoneNumberType.find('input[name="radio"]');

	if (phonePattern.test(inputVal)) {
		if (phoneNumberType.is(':hidden')) {
			radioInputs.prop('checked', false).first().prop('checked', true);

			nets_url_search(77);
		}

		phoneNumberType.slideDown();
	} else {
		phoneNumberType.slideUp();
	}
});

// ██████╗   █████╗  ██████╗  
// ██╔══██╗ ██╔══██╗ ██╔══██╗ 
// ██████╦╝ ███████║ ██████╔╝ 
// ██╔══██╗ ██╔══██║ ██╔══██╗ 
// ██████╦╝ ██║  ██║ ██║  ██║ 
// ╚═════╝  ╚═╝  ╚═╝ ╚═╝  ╚═╝ 

function input_parse_link(url, regExp) {
	return (url.match(regExp) || [])[2] || url;
}

var linkParsers = {
	youtube: /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
	vimeo: /^.*(vimeo\.com\/)([0-9]*).*/,
	calendly: /^.*(calendly\.com\/)([a-zA-Z0-9\-_]+).*/,
	x: /^.*(x\.com\/|twitter\.com\/)([a-zA-Z0-9\-_]+).*/,
	youtubeChannel: /youtube\.com\/@([^/]+)/
};

function input_handle(e, parser) {
	e.val(input_parse_link(e.val(), parser));
}

function bar_change_plan(id) {
	const prices = [
		['$1.99', '$5.99', '$12.99'],
		['$19.99', '$59.99', '$129.99'],
		['$1.66', '$4.99', '$10.83']
	];

	$('#pay_period_price_0').text(prices[0][id]);
	$('#pay_period_price_1').text(prices[2][id]);
	$('#plan_id').val(id);
	$('#pay_total strong span').text(prices[$('#period_id').val()][id]);
}

function bar_change_period(id, e) {
	const prices = [
		['$1.99', '$5.99', '$12.99'],
		['$19.99', '$59.99', '$129.99']
	];

	$('.bar_pro_check').removeClass('active');
	$(e).addClass('active');
	$('#period_id').val(id);
	$('#pay_total strong span').text(prices[id][$('#plan_id').val()]);
}

function bar(e) {
	const burgBar = $(e).children('.burg_bar'),
		bar = $('#bar'),
		profile = $('#profile'),
		padBar = $('.pad_bar'),
		body = $('body');

	burgBar.toggleClass('active');
	bar.toggleClass('active');
	profile.toggleClass('active');
	padBar.toggleClass('active');
	body.toggleClass('bar_overflow');

	if (!burgBar.hasClass('active')) {
		$('#burg').removeClass('arrow');

		setTimeout(function() {
			bar_slide('prev', 0);
			$('.pad_animation, .vision_anima').removeClass('hover');
		}, 330);
	} else {
		$('.burg.notifs .burg_bar').removeClass('active');
		$('#notifications').removeClass('active');
		profile_sort_stop();

		if (!$('.vision_anima').hasClass('hover')) {
			let b = 0;
			const visionAnimaInterval = setInterval(function() {
				$('.vision_anima').eq(b).addClass('hover');
				b++;
				if (b === 14) clearInterval(visionAnimaInterval);
			}, 50);
		}

		if (!$('.pad_animation').hasClass('hover')) {
			let c = 0;
			const padAnimationInterval = setInterval(function() {
				$('.pad_animation').eq(c).addClass('hover');
				c++;
				if (c === 4) clearInterval(padAnimationInterval);
			}, 200);
		}
	}
}

function bar_id(func, level, id) {
	if (!$('#burg').children('.burg_bar').hasClass('active')) {
		bar('#burg');
		setTimeout(function() {
			bar_slide(func, level, id);
		}, 330);
	} else {
		bar_slide(func, level, id);
	}
}

function bar_include(a) {
	const script = document.createElement('script');
	script.src = a;
	document.getElementsByTagName('head')[0].appendChild(script);
}

function bar_slide(func, level, id, get = null) {
	const barLevel = $('#bar_level_' + level + ' .bar_scroll'),
		levelPrev = level - 1,
		burg = $('#burg'),
		pad = $('.pad_bar'),
		bar = $('#bar');

	if (id) {
		barLevel.empty().append('<div class="bar_preloader"></div>');
		$.ajax({
			type: 'POST',
			url: '/apps/bar.app.php',
			data: { id: id, get: get },
			success: function(html) {
				barLevel.empty().append(html).scroll();
			},
			error: function(error) {
				console.log(error);
			}
		});
	}

	$('.bar_level').removeClass('level_1 level_2');
	if (level !== 0) {
		pad.removeClass('active');
		burg.attr('onclick', `bar_slide('prev', ${levelPrev});`).addClass('back');
	} else {
		if (bar.hasClass('active')) pad.addClass('active');
		burg.attr('onclick', 'bar(this);').removeClass('back');
	}

	if (level === 1) $('.bar_level').addClass('level_1');
	if (level === 2) $('.bar_level').addClass('level_1 level_2');

	$('.bar_scroll').removeClass('scroll');
	barLevel.addClass('scroll').scroll();
}

function bar_reload(level, id) {
	const barLevel = $('#bar_level_' + level + ' .bar_scroll');

	barLevel.empty().append('<div class="bar_preloader"></div>');

	$.ajax({
		type: 'POST',
		url: '/apps/bar.app.php',
		data: { id: id },

		success: function(html) {
			barLevel.empty().append(html).scroll();
		},

		error: function(error) {
			console.log(error);
		}
	});
}

$(function() {
	$(document).on('click', '.bar_plans_pro, .bar_plans_max, .bar_plans_ultra', function() {
		$('.bar_plans_pro, .bar_plans_max, .bar_plans_ultra').removeClass('active');
		$(this).addClass('active');
	});

	$(document).on('click', '.bar_toggle_block', function() {
		var e = $(this),
			par = e.parents('.bar_toggle');

		par.children('input').val(e.attr('data-select-id'));
		e.siblings().removeClass('active');
		e.addClass('active');
	});

	$(document).on('click', '.bar_preview_check', function() {
		$('.bar_preview_check').removeClass('active');
		$(this).addClass('active');
	});

	$(document).on('click', '.bar_preview_delete', function() {
		$('.bar_preview_custom').removeClass('active bar_preview_check').attr('onclick', 'open_modal("#modal_upload_cover");').find('img').remove();
		$('.bar_preview_plus').fadeIn(100);
		$('#video_preview').val('');
		$(this).remove();
	});

	$(document).on('input keyup', '.input_url', function() {
		let e = $(this),
			txt = e.val().replace(/https?:\/\//gi, '');

		e.val(txt);
	});

	$(document).on('input keyup', '.ytube', function() {
		input_handle($(this), linkParsers.youtube);
	});

	$(document).on('input keyup', '.vim', function() {
		input_handle($(this), linkParsers.vimeo);
	});

	$(document).on('input keyup', '.clndly', function() {
		input_handle($(this), linkParsers.calendly);
	});

	$(document).on('input keyup', '.twttr', function() {
		input_handle($(this), linkParsers.x);
	});

	$(document).on('input keyup', '.ychannel', function() {
		input_handle($(this), linkParsers.youtubeChannel);
	});

	$(document).on('keyup', function(e) {
		if (e.keyCode === 27) {
			const burg = $('#burg'),
				burgBar = burg.children('.burg_bar'),
				notifs = $('.burg.notifs'),
				notifsBar = notifs.children('.burg_bar');

			if (burgBar.hasClass('active')) {
				if (burg.hasClass('arrow')) {
					burg.attr('onclick', 'bar(this);');
				}
				bar(burg);
			}

			if (notifsBar.hasClass('active')) {
				notifs(notifs);
			}
		}
	});
});

//      ██╗ ██╗ ███╗  ██╗ 
//      ██║ ██║ ████╗ ██║ 
//      ██║ ██║ ██╔██╗██║ 
// ██╗  ██║ ██║ ██║╚████║ 
// ╚█████╔╝ ██║ ██║ ╚███║ 
//  ╚════╝  ╚═╝ ╚═╝  ╚══╝ 

$(function() {
	let lastScroll = 0;

	const $window = $(window),
		  $board = $('.jin_board');

	const handleScroll = () => {
		const scrollTop = $window.scrollTop(),
			delta = scrollTop - lastScroll,
			docHeight = $(document).height(),
			winHeight = $window.height();

		if (scrollTop === 0 || scrollTop + winHeight >= docHeight) {
			$board.removeClass('hide');
		} else if (delta > 0) {
			$board.addClass('hide');
		} else if (delta < -10) {
			$board.removeClass('hide');
		}

		lastScroll = scrollTop;
	};

	$window.scroll(handleScroll);
});

let jin_window_type = 0,
	jin_load_id = 0;

function jin_preview() {
	jin_window_type = 0;

	// Left.
	$('#jin_left').removeClass('active active_again active_end move hide').attr('onclick', 'jin_burger()');
	$('#jin_left .jin_board_box_icons img').eq(1).attr('src', '/images/jin/close.grad.svg');
	$('#jin_left .jin_board_box_icons img').eq(2).attr('src', '/images/jin/arrow.grad.svg');

	// Center.
	$('#jin_center').removeClass('active active_again active_end hide').attr('onclick', 'jin_edit()');

	// Right.
	$('#jin_right').removeClass('active active_again active_end move hide').attr('onclick', 'jin_qr()');
}

function jin_burger() {
	if (jin_window_type == 0) {
		open_jin_window(4);
	}

	// Left.
	$('#jin_left').removeClass('active_again active_end hide').addClass('active move').attr('onclick', 'jin_preview(); close_last_jin_window()');
	$('#jin_left .jin_board_box_icons img').eq(1).attr('src', '/images/jin/close.grad.svg');
	$('#jin_left .jin_board_box_icons img').eq(2).attr('src', '/images/jin/arrow.grad.svg');

	// Center.
	$('#jin_center').removeClass('active active_again active_end').addClass('hide').attr('onclick', 'jin_edit()');

	// Right.
	$('#jin_right').removeClass('active active_again active_end move').addClass('hide').attr('onclick', 'jin_qr()');
}

function jin_edit() {
	jin_window_type = 0;

	// Left.
	$('#jin_left').removeClass('active_again active_end move hide').addClass('active').attr('onclick', 'jin_color()');
	$('#jin_left .jin_board_box_icons img').eq(1).attr('src', '/images/jin/color.gray.svg');
	$('#jin_left .jin_board_box_icons img').eq(2).attr('src', '/images/jin/close.grad.svg');

	// Center.
	$('#jin_center').removeClass('active_again active_end hide').addClass('active').attr('onclick', 'jin_add()');

	// Right.
	$('#jin_right').removeClass('active active_again active_end hide move').addClass('active').attr('onclick', 'jin_preview(); jin_edit_stop()');

	jin_edit_start();
}

function jin_qr() {
	open_jin_window(3);

	// Left.
	$('#jin_left').removeClass('active active_again active_end move').addClass('hide').attr('onclick', 'jin_burger()');
	$('#jin_left .jin_board_box_icons img').eq(1).attr('src', '/images/jin/close.grad.svg');
	$('#jin_left .jin_board_box_icons img').eq(2).attr('src', '/images/jin/arrow.grad.svg');

	// Center.
	$('#jin_center').removeClass('active active_again active_end').addClass('hide').attr('onclick', 'jin_edit()');

	// Right.
	$('#jin_right').removeClass('active_again active_end hide').addClass('active move').attr('onclick', 'jin_preview(); close_last_jin_window()');
}

function jin_add() {
	if (jin_window_type == 0) {
		open_jin_window(1);
	}

	jin_center_close();
}

function jin_color() {
	if (jin_window_type == 0) {
		open_jin_window(2);
	}

	// Left.
	$('#jin_left').removeClass('active_end hide').addClass('active active_again move').attr('onclick', 'jin_edit(); close_last_jin_window()');
	$('#jin_left .jin_board_box_icons img').eq(1).attr('src', '/images/jin/color.gray.svg');
	$('#jin_left .jin_board_box_icons img').eq(2).attr('src', '/images/jin/close.grad.svg');

	// Center.
	$('#jin_center').removeClass('active_again active_end').addClass('active hide').attr('onclick', 'jin_add()');

	// Right.
	$('#jin_right').removeClass('active active_again active_end move').addClass('active hide').attr('onclick', 'jin_preview()');
}

function jin_load(w, id, get = null) {
	const jin_scroll = $(w).find('.jin_window_scroll');

	if (jin_scroll.html().trim().length == 0) {
		jin_scroll.empty().append('<div class="jin_window_preloader"></div>');
	}

	console.log(jin_scroll.html().trim().length);

	$.ajax({
		type: 'POST',
		url: '/apps/jin.app.php',
		data: { id: id, get: get },
		success: function(html) {
			jin_scroll.empty().append(html).scroll();
			$(w).addClass('active');

			jin_load_id = 0;
		},
		error: function(error) {
			console.log(error);

			jin_load_id = 0;
		}
	});
}

function jin_content(w, jin_id, id, callback) {
	const jin_scroll = $(w).find('.jin_window_scroll');

	if (jin_scroll.html().length > 0) {
		jin_scroll.empty().append('<div class="jin_window_preloader"></div>');
	}

	$.ajax({
		type: 'POST',
		url: '/incs/jin/jin_' + jin_id + '.inc.php',
		data: { id: id },

		success: function(html) {
			jin_scroll.empty().append(html).scroll();
			$(w).addClass('active');

			if (callback) {
				callback(html);
			}

			jin_load_id = 0;
		},

		error: function(error) {
			console.log(error);

			jin_load_id = 0;
		}
	});
}

function jin_sam() {
	close_last_jin_window();
}

function jin_sam_close() {
	close_all_jin_windows();
}

function jin_edit_window(jin_id, content = false) {
	jin_window_type = 1;

	jin_add();

	open_jin_window(jin_id, content);
}

function jin_center_back() {
	jin_window_type = 1;

	// Left.
	$('#jin_left').removeClass('active_again active_end move').addClass('active hide').attr('onclick', 'jin_color()');
	$('#jin_left .jin_board_box_icons img').eq(1).attr('src', '/images/jin/color.gray.svg');
	$('#jin_left .jin_board_box_icons img').eq(2).attr('src', '/images/jin/close.grad.svg');

	// Center.
	$('#jin_center').removeClass('hide').addClass('active active_again active_end').attr('onclick', 'close_last_jin_window()');

	// Right.
	$('#jin_right').removeClass('active active_again active_end move').addClass('active hide').attr('onclick', 'jin_preview()');
}

function jin_center_close() {
	jin_window_type = 1;

	// Left.
	$('#jin_left').removeClass('active_again active_end move').addClass('active hide').attr('onclick', 'jin_color()');
	$('#jin_left .jin_board_box_icons img').eq(1).attr('src', '/images/jin/color.gray.svg');
	$('#jin_left .jin_board_box_icons img').eq(2).attr('src', '/images/jin/close.grad.svg');

	// Center.
	$('#jin_center').removeClass('active_end hide').addClass('active active_again').attr('onclick', 'jin_edit(); close_last_jin_window()');

	// Right.
	$('#jin_right').removeClass('active active_again active_end move').addClass('active hide').attr('onclick', 'jin_preview()');
}

function jin_left_back() {
	jin_window_type = 2;

	// Left.
	$('#jin_left').removeClass('hide').addClass('active active_again active_end move').attr('onclick', 'close_last_jin_window()');
	$('#jin_left .jin_board_box_icons img').eq(1).attr('src', '/images/jin/color.gray.svg');
	$('#jin_left .jin_board_box_icons img').eq(2).attr('src', '/images/jin/close.grad.svg');

	// Center.
	$('#jin_center').removeClass('active active_again active_end').addClass('active hide').attr('onclick', 'jin_add()');

	// Right.
	$('#jin_right').removeClass('active active_again active_end move').addClass('active hide').attr('onclick', 'jin_preview()');
}

function jin_burger_back() {
	jin_window_type = 3;

	// Left.
	$('#jin_left').removeClass('active_end hide').addClass('active active_again move').attr('onclick', 'close_last_jin_window()');
	$('#jin_left .jin_board_box_icons img').eq(1).attr('src', '/images/jin/close.grad.svg');
	$('#jin_left .jin_board_box_icons img').eq(2).attr('src', '/images/jin/arrow.grad.svg');

	// Center.
	$('#jin_center').removeClass('active active_again active_end').addClass('hide').attr('onclick', 'jin_edit()');

	// Right.
	$('#jin_right').removeClass('active active_again active_end move').addClass('hide').attr('onclick', 'jin_qr()');
}

function jin_edit_controls() {
	let a = $('#profile_sort'),
		b = $('.jin_edit_block');

	if (a.hasClass('start')) {

		b.removeClass('unsort');
		$('.jin_edit_handle, .jin_edit_right').remove();

		b.each(function() {
			let b_item = $(this),
				b_item_height = b_item.height(),
				b_item_children = b_item.children('.jin_edit_right'),
				b_item_group_id = b_item.attr('data-sort-gid'),
				b_item_add = b_item.attr('data-sort-add'),
				b_item_settings = b_item.attr('data-sort-settings');

			if (b_item_height == 0) {
				b_item.addClass('unsort');
			} else {
				b_item.addClass('sort');

				if (!b_item.hasClass('stop')) {
					b_item.append('<div class="jin_edit_handle"></div>');

					if (b_item_group_id && (b_item_add || b_item_settings)) {
						if (b_item_children.length) {
							if (b_item_add) {
								b_item_children.append('<div class="jin_edit_add" onclick="jin_edit_window(' + b_item_add + ')"></div>');
							}

							if (b_item_settings) {
								b_item_children.append('<div class="jin_edit_settings" onclick="jin_edit_window(' + b_item_settings + ', ' + b_item_group_id + ')"></div>');
							}
						} else {
							b_item.append('<div class="jin_edit_right"></div>');

							b_item_children = b_item.children('.jin_edit_right');

							if (b_item_add) {
								b_item_children.append('<div class="jin_edit_add" onclick="jin_edit_window(' + b_item_add + ')"></div>');
							}

							if (b_item_settings) {
								b_item_children.append('<div class="jin_edit_settings" onclick="jin_edit_window(' + b_item_settings + ', ' + b_item_group_id + ')"></div>');
							}
						}
					}
				}
			}
		});

		$('[data-jin-edit-id]').each(function() {
			let jin_e = $(this),
				jin_edit_id = jin_e.attr('data-jin-edit-id'),
				jin_edit_content = jin_e.attr('data-jin-edit-content');

			if (jin_edit_content == 0) {
				jin_e.attr('onclick', 'jin_edit_window(' + jin_edit_id + ')').addClass('jin_edit_clickable');
			} else {
				jin_e.attr('onclick', 'jin_edit_window(' + jin_edit_id + ', ' + jin_edit_content + ')').addClass('jin_edit_clickable');
			}
		});
	}
}

function jin_edit_start() {
	var dragon_item;

	$('#profile_sort').sortable({
		handle: '.jin_edit_handle',
		connectWith: '.dragon_ui',
		tolerance: 'pointer',
		placeholder: 'jin_edit_placeholder',
		cancel: '.jin_edit_clickable, .peppermint-slides',
		revert: 100,
		axis: 'y',
		classes: {
			'ui-sortable-helper': 'jin_edit_helper'
		},
		create: function( event, ui ) {
			$('#profile_sort').addClass('start');
			$('.jin_board').addClass('edit');

			jin_edit_controls();
		},
		activate: function(event, ui) {
			dragon_item = $(ui.item);

			let dragon_width = dragon_item.width(),
				dragon_height = dragon_item.height();

			$('.jin_edit_placeholder').outerWidth(dragon_width).outerHeight(dragon_height);
		},
		update: function() {
			profile_sort();
		}
	});
}

function jin_edit_stop() {
	let a = $('#profile_sort'),
		b = $('.jin_edit_block');

	if (a.hasClass('start')) {
		a.sortable('destroy').removeClass('start');
		b.removeClass('sort');
		$('.jin_board').removeClass('edit');

		$('.jin_edit_handle, .jin_edit_right').remove();

		$('[data-jin-edit-id]').each(function() {
			let jin_e = $(this);

			jin_e.attr('onclick', '').removeClass('jin_edit_clickable');
		});
	}
}


// ---

let jin_window_count = 0;
let saved_scroll_stop = false;
let saved_scroll_top = 0;

function open_jin_window(jin_id, content = false, callback = false, get = null) {
	if (jin_load_id != jin_id) {
		jin_load_id = jin_id;
		jin_window_count++;

		if (saved_scroll_stop == false) {
			saved_scroll_top = $(window).scrollTop();

			saved_scroll_stop = true;
		}

		// Зменшуємо всі попередні модальні вікна
		$('.jin_window').removeClass('general');

		const jin_window = $(`
			<div class="jin_window jin_window general" id="jin_window_${jin_window_count}" data-jin-id="${jin_id}" data-jin-content="${content}">
				<div class="jin_window_animate">
					<div class="jin_window_scroll"></div>
				</div>
			</div>
		`);

		$('body').append(jin_window).addClass('jin_window_of').css({'top': -saved_scroll_top + 'px'});

		if ($('.jin_window').length == 2 && jin_window_type == 1) {
			jin_center_back();
		}

		setTimeout(function () {
			if (content || content === 0) {
				jin_content(jin_window, jin_id, content, callback);
			} else {
				jin_load(jin_window, jin_id, get);
			}
		}, 10);
	}
}

// Функція для закриття модального вікна за ID
function close_jin_window(jin_window_id) {
	const jin_window = $(`#jin_window_${jin_window_id}`);
	jin_window.removeClass('active');

	setTimeout(function () {
		jin_window.remove();

		// Якщо залишилися модальні вікна, робимо останнє активним
		if ($('.jin_window').length > 0) {
			const last_jin_window = $('.jin_window').last();
			last_jin_window.addClass('general');
			update_content_for_previous_jin_window(last_jin_window); // Оновлюємо контент попереднього
		} else {
			$('body').removeClass('jin_window_of');
			$(window).scrollTop(saved_scroll_top);
			saved_scroll_stop = false;
			on_all_jin_windows_closed(); // Викликаємо функцію при закритті всіх
		}
	}, 231);
}

// Функція для закриття останнього модального вікна
function close_last_jin_window() {
	const jin_window = $('.jin_window'),
		  last_jin_window = jin_window.last();

	if (last_jin_window.length) {
		const jin_window_id = last_jin_window.attr('id').replace('jin_window_', '');
		close_jin_window(jin_window_id);

		if (jin_window.length == 2 && jin_window_type == 1) {
			jin_add();
		}

		if (jin_window.length == 2 && jin_window_type == 2) {
			jin_color();
		}

		if (jin_window.length == 2 && jin_window_type == 3) {
			jin_burger();
		}
	}
}

// Функція для закриття всіх модальних вікон
function close_all_jin_windows() {
	$('.jin_window').removeClass('active');
	setTimeout(function () {
		$('.jin_window').remove();
		$('body').removeClass('jin_window_of');
		$(window).scrollTop(saved_scroll_top);
		saved_scroll_stop = false;
		on_all_jin_windows_closed(); // Викликаємо функцію при закритті всіх
	}, 231);
}

// Функція для оновлення контенту попереднього модального вікна
function update_content_for_previous_jin_window(jin_window) {
	let jin_id = jin_window.data('jin-id'),
		content = jin_window.data('jin-content');

	if (content || content === 0) {
		jin_content(jin_window, jin_id, content);
	} else {
		jin_load(jin_window, jin_id);
	}
}

// Функція, що викликається при закритті всіх модальних вікон
function on_all_jin_windows_closed() {
	if (jin_window_type == 1) {
		jin_edit();
	}
}

// ██████╗   █████╗  ██████╗  
// ██╔══██╗ ██╔══██╗ ██╔══██╗ 
// ██████╔╝ ███████║ ██║  ██║ 
// ██╔═══╝  ██╔══██║ ██║  ██║ 
// ██║      ██║  ██║ ██████╔╝ 
// ╚═╝      ╚═╝  ╚═╝ ╚═════╝  

var pad_level = 1;

$('#bar_level_0 .bar_scroll').scroll(function() {
	if ($(this).hasClass('scroll')) {
		let e = $('#pad_level_' + pad_level),
			pos = e.position();

		if (e.length > 0) {
			let pos_limit = (pad_level === 1 || pad_level === 2) ? 69 : 10;
			$('.bar_pro_banner, .bar_scan, .bar_pro_tranlation').toggleClass('opacity', pos.top < pos_limit);
		}
	}
});

function pad_bar(id, e) {
	let a = $('.pad_bar_block'),
		b = $(e),
		c = $('.pad_level'),
		d = $('#pad_level_' + id);

	a.removeClass('active hover');
	b.addClass('active');

	c.hide();
	d.fadeIn(150);

	pad_level = id;
}

//  ██████╗ ███████╗ ██╗      ███████╗  █████╗  ████████╗ 
// ██╔════╝ ██╔════╝ ██║      ██╔════╝ ██╔══██╗ ╚══██╔══╝ 
// ╚█████╗  █████╗   ██║      █████╗   ██║  ╚═╝    ██║    
//  ╚═══██╗ ██╔══╝   ██║      ██╔══╝   ██║  ██╗    ██║    
// ██████╔╝ ███████╗ ███████╗ ███████╗ ╚█████╔╝    ██║    
// ╚═════╝  ╚══════╝ ╚══════╝ ╚══════╝  ╚════╝     ╚═╝    

$(function() {
	$(document).on({
		mouseenter: function () {
			$(this).addClass('active');
		},
		mouseleave: function () {
			$(this).removeClass('active');
		}
	}, '.select_mini');

	$(document).on('click', '.select_li', function() {
		var e = $(this),
			par = e.parents('.select');

		par.children('input').val(e.attr('data-select-id'));
		par.children('span').text(e.text());
	});

	$(document).on('click', '.select', function() {
		$(this).toggleClass('active');
	});

	$(document).on('click', '.select_nets_image', function() {
		$(this).parents('.select_nets').toggleClass('active');
	});

	$(document).mouseup(function(e) {
		$('.select.active, .select_nets.active, .select_input').each(function() {
			if (!$(this).is(e.target) && $(this).has(e.target).length === 0) {
				$(this).removeClass('active');
			}
		});
	});

	$(document).on('click', '.select_nets_icon', function() {
		var e = $(this),
			par = e.parents('.select_nets'),
			d = e.attr('data-nets-id');

		par.children('input').val(d);

		nets_icon_portal(d);

		par.children('.select_nets_image').children('img').attr('src', '/images/icons/2.0/nets/' + d + '.svg');
		par.removeClass('active');
	});

	$(document).on('focus', '.select_input .input', function() {
		$(this).parents('.select_input').addClass('active');
	});

	$(document).on('click', '.select_input_li', function() {
		$(this).parents('.select_input').removeClass('active');
	});

	$(document).on('click', '.select_mini_li', function() {
		var e = $(this),
			par = e.parents('.select_mini');

		par.removeClass('active').children('span').text(e.children('span').first().text());
	});

});

$(document).on('click', '.select_mini span', function() {
	$(this).parents('.select_mini').toggleClass('active');
});

// ██╗ ███╗  ██╗ ██████╗  ██╗  ██╗ ████████╗ 
// ██║ ████╗ ██║ ██╔══██╗ ██║  ██║ ╚══██╔══╝ 
// ██║ ██╔██╗██║ ██████╔╝ ██║  ██║    ██║    
// ██║ ██║╚████║ ██╔═══╝  ██║  ██║    ██║    
// ██║ ██║ ╚███║ ██║      ╚█████╔╝    ██║    
// ╚═╝ ╚═╝  ╚══╝ ╚═╝       ╚════╝     ╚═╝    

$(function() {
    $(document).on('click', '.input-prefix-lable', function() {
		$(this).siblings('.input-prefix-field').children('.input').focus();
    });

    $(document).on('click', '.input-prefix-field .input', function() {
		$(this).focus();
    });

    $(document).on('focus', '.input-prefix-field .input', function() {
        $(this).parents('.input-prefix-wrap').addClass('focus').children('.input-prefix-lable').addClass('focus');
    });

    $(document).on('blur', '.input-prefix-field .input', function() {
        $(this).parents('.input-prefix-wrap').removeClass('focus').children('.input-prefix-lable').removeClass('focus');
    });

    $(document).on('change keyup input focus', '.input_count', function() {
		var a = $(this);

		input_count(a);

		if (event.type === 'focus') {
			a.siblings('span').fadeIn(150);
		}
	});

	$(document).on('blur', '.input_count', function() {
		$(this).siblings('span').fadeOut(0);
	});
});

function input_count(e) {
    var b = e.val(),
        c = b.length,
        d = e.attr('data-count'),
        f = e.siblings('span');

    f.text(c + '/' + d).removeClass('stop');

    if (c >= d) {
        e.val(b.substr(0, d));
        f.text(d + '/' + d).addClass('stop');
    }
}

//  █████╗  ██╗  ██╗ ████████╗  █████╗   █████╗   █████╗  ███╗   ███╗ ██████╗  ██╗      ███████╗ ████████╗ ███████╗ 
// ██╔══██╗ ██║  ██║ ╚══██╔══╝ ██╔══██╗ ██╔══██╗ ██╔══██╗ ████╗ ████║ ██╔══██╗ ██║      ██╔════╝ ╚══██╔══╝ ██╔════╝ 
// ███████║ ██║  ██║    ██║    ██║  ██║ ██║  ╚═╝ ██║  ██║ ██╔████╔██║ ██████╔╝ ██║      █████╗      ██║    █████╗   
// ██╔══██║ ██║  ██║    ██║    ██║  ██║ ██║  ██╗ ██║  ██║ ██║╚██╔╝██║ ██╔═══╝  ██║      ██╔══╝      ██║    ██╔══╝   
// ██║  ██║ ╚█████╔╝    ██║    ╚█████╔╝ ╚█████╔╝ ╚█████╔╝ ██║ ╚═╝ ██║ ██║      ███████╗ ███████╗    ██║    ███████╗ 
// ╚═╝  ╚═╝  ╚════╝     ╚═╝     ╚════╝   ╚════╝   ╚════╝  ╚═╝     ╚═╝ ╚═╝      ╚══════╝ ╚══════╝    ╚═╝    ╚══════╝ 

$(function() {
	$(document).on('click', '.autocomplete_li', function() {
		var e = $(this),
			par = e.parents('.autocomplete'),
			inp = par.find('.autocomplete_group input'),
			id = e.attr('data-select-id'),
			name = e.text();

		if (!$('.autocomplete_block[data-select-id="' + id + '"]').length) {
			inp.before('<div class="autocomplete_block" data-select-id="' + id + '">' + name + '</div>');
		}

		inp.val('');
		par.find('.autocomplete_li').fadeIn(0);
	});

	$(document).on('click', '.autocomplete', function() {
		$(this).toggleClass('active').find('input').focus();
	});

	$(document).mouseup(function(e) {
		$('.autocomplete.active').each(function() {
			if (!$(this).is(e.target) && $(this).has(e.target).length === 0) {
				$(this).removeClass('active');
			}
		});
	});

	$(document).on('change keyup input', '.autocomplete_group input', function() {
		var a = $(this),
			b = a.val(),
			c = a.parents('.autocomplete'),
			d = c.find('.autocomplete_li');

		d.fadeOut(0);
		if (b === '') {
			d.fadeIn(0);
		} else {
			c.find('.autocomplete_li:contains("' + b + '")').fadeIn(0);
		}
	});

	$(document).on('click', '.autocomplete_block', function() {
		$(this).remove().parents('.autocomplete').removeClass('active');
	});
});

// ██████╗  ██╗  ██╗ ████████╗ ████████╗  █████╗  ███╗  ██╗  ██████╗ 
// ██╔══██╗ ██║  ██║ ╚══██╔══╝ ╚══██╔══╝ ██╔══██╗ ████╗ ██║ ██╔════╝ 
// ██████╦╝ ██║  ██║    ██║       ██║    ██║  ██║ ██╔██╗██║ ╚█████╗  
// ██╔══██╗ ██║  ██║    ██║       ██║    ██║  ██║ ██║╚████║  ╚═══██╗ 
// ██████╦╝ ╚█████╔╝    ██║       ██║    ╚█████╔╝ ██║ ╚███║ ██████╔╝ 
// ╚═════╝   ╚════╝     ╚═╝       ╚═╝     ╚════╝  ╚═╝  ╚══╝ ╚═════╝  

function buttons_reload() {
	$('.profile_group_buttons').each(function() {
		let group_id = $(this).attr('data-sort-gid');

		reload_content('target', '#profile #profile_button_' + group_id, function (html) {
			jin_edit_controls();
			profile_sort();
		}, { gid: group_id });
	});
}

function buttons_sam(i, extra_data) {
	const btn = preload_btn(i);

	const data = get_data(['gid', 'type', 'title', 'descr', 'color_type', 'size', 'width', 'animation', 'date_from', 'time_from_hours', 'time_from_mins', 'date_to', 'time_to_hours', 'time_to_mins']);

	data.color = $('#button_color').val();
	data.write_off = $('#write_off').is(':checked') ? 1 : 0;
	data.url = $('#url_' + data.type).val();
	data.phone_type = $('#phone_number_type input[name="radio"]:checked').val();

	$('#title, #url_prefix_' + data.type + ', #url_' + data.type).removeClass('err');

	ajax_request('buttons', 'sam', data, function(json) {
		if (extra_data && extra_data.jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 44);
		}

		if (json.is_new != false) {
			$('#profile_sort').append('<div class="profile_sort_block jin_edit_block profile_group_buttons" data-sort-id="0" data-sort-gid="' + json.is_new + '" id="profile_button_' + json.is_new + '"></div>');
		}

		profile_sort();

		buttons_reload();
		show_msg(json.success);
	}, btn, extra_data);
}

function buttons_load(id) {
	load_content(46, id, 2);
}

function buttons_delete(i, id, jin) {
	var btn = preload_btn(i);
	ajax_request('buttons', 'delete', { id: id }, function(json) {
		if (jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 44);
		}

		buttons_reload();
		show_msg(json.success);
	}, btn);
}

function buttons_archive_restore(i, id) {
	var btn = preload_btn(i);
	ajax_request('buttons', 'archive_restore', { id: id }, function(json) {
		bar_slide('prev', 1, 44);
		buttons_reload();
		show_msg(json.success);
	}, btn);
}

function buttons_archive_delete(i, id) {
	var btn = preload_btn(i);
	ajax_request('buttons', 'archive_delete', { id: id }, function(json) {
		$('#button_archive_' + id).slideUp();
		show_msg(json.success);
		if (json.last) {
			bar_slide('prev', 1, 44);
		}
	}, btn);
}

function buttons_sort() {
	var sort = [];
	$('.dragon_ui .bar_block').each(function() {
		sort.push($(this).attr('data-buttons-id'));
	});
	ajax_request('buttons', 'sort', { sort: sort }, function(json) {
		buttons_reload();
	}, null);
}

function buttons_portal() {
	let a = $('#title').val(),
		b = $('#descr').val(),
		c = $.trim(a),
		d = $('#button_portal .profile_target'),
		e = ['🤪', '🤓', '😍', '😇', '😶', '🤬'],
		f = rand_min_max(0, 5);

	if (c == '') {
		c = e[f];
	}

	if (b != '') {
		b = '<span>' + b + '</span>';
	}

	d.empty().text(c).append(b);
}

function buttons_size_portal(s) {
	a = $('#button_portal .profile_target');

	a.removeClass('size_l size_xl');

	if (s == 'l') {
		a.addClass('size_l');
	}

	if (s == 'xl') {
		a.addClass('size_xl');
	}
}

function buttons_width_portal(w) {
	a = $('#button_portal .profile_target_row');

	a.removeClass('width');

	if (w == 'width') {
		a.addClass('width');
	}
}

function buttons_animation_portal(an) {
	a = $('#button_portal .profile_target_row a');

	a.removeClass('shake wobble pulse');

	if (an != '') {
		a.addClass(an);
	}
}

function buttons_color_portal(a) {
	var color_rgb = color_hex_to_rgb(a);

	var gray = 0.299 * color_rgb['r'] + 0.587 * color_rgb['g'] + 0.114 * color_rgb['b'];

	if (gray > 160) {
		$('#button_portal .profile_target').css('color', '#000');
	} else {
		$('#button_portal .profile_target').eq(0).css('color', '#FFF');
	}

	$('#button_portal .profile_target').css('border-color', '#' + a);
	$('#button_portal .profile_target').eq(0).css('background-color', '#' + a);
}

function buttons_write_off(e) {
	let a = $('#button_write_off'),
		b = $(e).siblings('input');

	if (b.is(':checked')) {
		a.fadeOut(0);
	} else {
		a.fadeIn(300);
	}
}

function buttons_color_reload() {
	let a = hsl2hex(clr_h, clr_s, clr_l);

	$('#multicolor_input').val('#' + a);

	buttons_color_portal(a);
}

function buttons_pallet(func, e) {
	let a = $('#button_pallet');

	if (func == 'open') {
		a.fadeIn(300);

		if (e) {
			$('.bar_pal').removeClass('active');
			$(e).addClass('active');
		}
	}

	if (func == 'close') {
		a.fadeOut(0);
	}
}

function buttons_color_type(func) {
	let a = $('#button_color_type');

	if (func == 'open') {
		a.fadeIn(300);
	}

	if (func == 'close') {
		a.fadeOut(0);
	}
}

$(document).on('input keyup', '.input_button_portal', function() {
	buttons_portal();
});

function buttons_pretitle_portal() {
	let a = $('#title').val(),
		b = $('#descr').val(),
		c = $.trim(a),
		d = $('#button_pretitle_portal .profile_target_pretitle'),
		e = ['🤪', '🤓', '😍', '😇', '😶', '🤬'],
		f = rand_min_max(0, 5);

	if (c == '') {
		c = e[f];
	}

	if (b != '') {
		b = '<span>' + b + '</span>';
	}

	d.empty().text(c).append(b);
}

$(document).on('input keyup', '.input_button_pretitle_portal', function() {
	buttons_pretitle_portal();
});

function buttons_pretitle_align_portal(s) {
	let a = $('#button_pretitle_portal .profile_target_pretitle');

	a.removeClass('center right');

	if (s == 'c') {
		a.addClass('center');
	}

	if (s == 'r') {
		a.addClass('right');
	}
}

function buttons_pretitle_sam(i, extra_data) {
	const btn = preload_btn(i);

	const data = get_data(['gid', 'title', 'descr', 'width']);

	$('#title').removeClass('err');

	ajax_request('buttons', 'pretitle_sam', data, function(json) {
		if (extra_data && extra_data.jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 44);
		}

		if (json.is_new != false) {
			$('#profile_sort').append('<div class="profile_sort_block jin_edit_block profile_group_buttons" data-sort-id="0" data-sort-gid="' + json.is_new + '" id="profile_button_' + json.is_new + '"></div>');
		}

		profile_sort();

		buttons_reload();
		show_msg(json.success);
	}, btn, extra_data);
}

function buttons_pretitle_load(id) {
	load_content(88, id, 2);
}

function buttons_type(id) {
	$('.buttons_type').fadeOut(0);
	$('#buttons_type_' + id).fadeIn(100);
}

function button_set_color(color) {
	let a = $('.bar_pal[data-color="' + color + '"]');

	$('.bar_pal').removeClass('active');

	if (a.length > 0) {
		a.addClass('active');
	} else {
		$('.bar_pal.multic').addClass('active');
	} 

	$('#button_color').val('#' + color);

	buttons_color_portal(color);
}

$(document).on('input', '#button_color', function () {
	let hex = $(this).val();

	if (/^#[0-9A-F]{6}$/i.test(hex)) {
		hex = hex.replace(/#/g, '');

		button_set_color(hex);
	}
});

// ███╗  ██╗ ███████╗ ████████╗  ██████╗ 
// ████╗ ██║ ██╔════╝ ╚══██╔══╝ ██╔════╝ 
// ██╔██╗██║ █████╗      ██║    ╚█████╗  
// ██║╚████║ ██╔══╝      ██║     ╚═══██╗ 
// ██║ ╚███║ ███████╗    ██║    ██████╔╝ 
// ╚═╝  ╚══╝ ╚══════╝    ╚═╝    ╚═════╝  

function nets_reload() {
	$('.profile_group_nets').each(function() {
		let group_id = $(this).attr('data-sort-gid');

		reload_content('nets', '#profile #profile_nets_' + group_id, function (html) {
			jin_edit_controls();
			profile_sort();
		}, { gid: group_id });
	});
}

function nets_archive_restore(i, id) {
	var btn = preload_btn(i);
	ajax_request('nets', 'archive_restore', { id: id }, function(json) {
		bar_slide('prev', 1, 73);
		nets_reload();
		show_msg(json.success);
	}, btn);
}

function nets_archive_delete(i, id) {
	var btn = preload_btn(i);
	ajax_request('nets', 'archive_delete', { id: id }, function(json) {
		$('#nets_archive_' + id).slideUp();
		show_msg(json.success);
		if (json.last) {
			bar_slide('prev', 1, 73);
		}
	}, btn);
}

function nets_sam(i, extra_data) {
	const btn = preload_btn(i);

	const data = get_data(['gid', 'url', 'icon', 'title', 'color_type']);

	data.color = $('#nets_color').val();
	data.type = $('#phone_number_type input[name="radio"]:checked').val();

	$('#url').removeClass('err');
	$('#title').removeClass('err');

	ajax_request('nets', 'sam', data, function(json) {
		if (extra_data && extra_data.jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 73);
		}

		if (json.is_new != false) {
			$('#profile_sort').append('<div class="profile_sort_block jin_edit_block profile_group_nets" data-sort-id="5" data-sort-gid="' + json.is_new + '" data-sort-add="74" data-sort-settings="73" id="profile_nets_' + json.is_new + '"></div>');
		}

		profile_sort();

		nets_reload();
	}, btn, extra_data);
}

function nets_load(id) {
	load_content(75, id, 2);
}

function nets_delete(i, id, jin) {
	var btn = preload_btn(i);
	ajax_request('nets', 'delete', { id: id }, function(json) {
		if (jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 73);
		}

		nets_reload();
		show_msg(json.success);
	}, btn);
}

function nets_sort() {
	var sort = [];
	$('.dragon_ui .bar_block').each(function() {
		sort.push($(this).attr('data-nets-id'));
	});
	ajax_request('nets', 'sort', { sort: sort }, function(json) {
		nets_reload();
	}, null);
}

function nets_format(format) {
	if (format == 1) {
		$('.nets_group').removeClass('line');
	} else {
		$('.nets_group').addClass('line');
	}

	var data = { format: format };

	ajax_request('nets', 'format', data, function(json) {
		show_msg(json.success);
	});
}

function nets_title_portal() {
	let a = $('#title'),
		b = a.val(),
		c = $('#nets_portal .nets_block span'),
		d = a.attr('placeholder');

	if (b == '') {
		b = d;
	}

	c.text(b);
}

function nets_search(search) {
	var data = { search: search };

	ajax_request('nets', 'search', data, function(html) {
		$('#search_nets_result').empty().append(html);
	}, null, null, true);
}

function nets_url_search(search) {
	var data = { search: search };

	ajax_request('nets', 'url_search', data, function(json) {
		$('#icon').val(json.id);
		$('.select_nets_image').children('img').attr('src', '/images/icons/2.0/nets/' + json.id + '.svg');
		nets_icon_portal(json.id);
	});
}

$(function() {
	$(document).on('input keyup', '#search_nets', function() {
		var a = $(this).val();

		if (a.length >= 1) {
			nets_search(a);
		} else {
			nets_search(0);
		}
	});
});

$(function() {
	$(document).on('input keyup', '.input_nets_url', function() {
		var a = $(this).val();

		if (a.length >= 1) {
			nets_url_search(a);
		}
	});
});

function nets_pallet(func, e) {
	let a = $('#nets_pallet');

	if (func == 'open') {
		a.fadeIn(300);

		if (e) {
			$('.bar_pal').removeClass('active');
			$(e).addClass('active');
		}
	}

	if (func == 'close') {
		a.fadeOut(0);
	}
}

function nets_color_type(func) {
	let a = $('#nets_color_type');

	if (func == 'open') {
		a.fadeIn(300);
	}

	if (func == 'close') {
		a.fadeOut(0);
	}
}

function nets_color_reload() {
	let a = hsl2hex(clr_h, clr_s, clr_l);

	$('#multicolor_input').val('#' + a);

	nets_color_portal(a);
}

function nets_color_portal(a) {
	var color_rgb = color_hex_to_rgb(a);

	var gray = 0.299 * color_rgb['r'] + 0.587 * color_rgb['g'] + 0.114 * color_rgb['b'];

	if (gray > 160) {
		$('#nets_portal .nets_block').css('background-color', '#' + a);
		$('#nets_portal .social_fill').css('fill', '#000');
	} else {
		$('#nets_portal .nets_block').css('background-color', 'rgba(' + color_rgb['r'] + ', ' + color_rgb['g'] + ', ' + color_rgb['b'] + ', .08)');
		$('#nets_portal .social_fill').css('fill', '#' + a);
	}
}

function nets_icon_portal(id) {
	var data = {
		id: id,
		color: $('#nets_color').val()
	};

	ajax_request('nets', 'icon', data, function(html) {
		$('#nets_portal .nets_icon').html(html);
	}, null, null, true);
}

$(function() {
	$(document).on('input keyup', '.input_nets_title_portal', function() {
		nets_title_portal();
	});
});

function nets_set_color(color) {
	let a = $('.bar_pal[data-color="' + color + '"]');

	$('.bar_pal').removeClass('active');

	if (a.length > 0) {
		a.addClass('active');
	} else {
		$('.bar_pal.multic').addClass('active');
	} 

	$('#nets_color').val('#' + color);

	nets_color_portal(color);
}

$(document).on('input', '#nets_color', function () {
	let hex = $(this).val();

	if (/^#[0-9A-F]{6}$/i.test(hex)) {
		hex = hex.replace(/#/g, '');

		nets_set_color(hex);
	}
});

// ███████╗  █████╗   ██████╗   ██████╗ 
// ██╔════╝ ██╔══██╗ ██╔═══██╗ ██╔════╝ 
// █████╗   ███████║ ██║   ██║ ╚█████╗  
// ██╔══╝   ██╔══██║ ╚██████╔╝  ╚═══██╗ 
// ██║      ██║  ██║  ╚══██╔╝  ██████╔╝ 
// ╚═╝      ╚═╝  ╚═╝     ╚═╝   ╚═════╝  

function faqs_reload() {
	$('.profile_group_faqs').each(function() {
		let group_id = $(this).attr('data-sort-gid');

		reload_content('faqs', '#profile #profile_faqs_' + group_id, function (html) {
			jin_edit_controls();
			profile_sort();
		}, { gid: group_id });
	});
}

function faqs_archive_restore(i, id) {
	var btn = preload_btn(i);
	ajax_request('faqs', 'archive_restore', { id: id }, function(json) {
		bar_slide('prev', 1, 52);
		faqs_reload();
		show_msg(json.success);
	}, btn);
}

function faqs_archive_delete(i, id) {
	var btn = preload_btn(i);
	ajax_request('faqs', 'archive_delete', { id: id }, function(json) {
		$('#faq_archive_' + id).slideUp();
		show_msg(json.success);
		if (json.last) {
			bar_slide('prev', 1, 52);
		}
	}, btn);
}

function faqs_sort() {
	var sort = [];
	$('.dragon_ui .bar_block').each(function() {
		sort.push($(this).attr('data-faqs-id'));
	});
	ajax_request('faqs', 'sort', { sort: sort }, function(json) {
		faqs_reload();
	}, null);
}

function faqs_load(id) {
	load_content(53, id, 2);
}

function faqs_sam(i, extra_data) {
	const btn = preload_btn(i);

	const data = get_data(['gid', 'title']);

	data.descr = $('#editor').html();

	$('#title, #descr').removeClass('err');

	ajax_request('faqs', 'sam', data, function(json) {
		if (extra_data && extra_data.jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 52);
		}

		if (json.is_new != false) {
			$('#profile_sort').append('<div class="profile_sort_block jin_edit_block profile_group_faqs" data-sort-id="4" data-sort-gid="' + json.is_new + '" id="profile_faqs_' + json.is_new + '"></div>');
		}

		profile_sort();

		faqs_reload();
	}, btn, extra_data);
}

function faqs_delete(i, id, jin) {
	var btn = preload_btn(i);
	ajax_request('faqs', 'delete', { id: id }, function(json) {
		if (jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 52);
		}

		faqs_reload();
		show_msg(json.success);
	}, btn);
}

$(document).on('click', '.profile_faqs_title', function() {
	var e = $(this),
		par = e.parents('.profile_faqs_block'),
		nxt = e.next('.profile_faqs_descr');

	$('.profile_faqs_block').not(par).removeClass('active');
	$('.profile_faqs_descr').not(nxt).slideUp();

	par.toggleClass('active');
	nxt.slideToggle('slow');
});

// ██████╗  ███████╗  ██████╗  █████╗  ██████╗  
// ██╔══██╗ ██╔════╝ ██╔════╝ ██╔══██╗ ██╔══██╗ 
// ██║  ██║ █████╗   ╚█████╗  ██║  ╚═╝ ██████╔╝ 
// ██║  ██║ ██╔══╝    ╚═══██╗ ██║  ██╗ ██╔══██╗ 
// ██████╔╝ ███████╗ ██████╔╝ ╚█████╔╝ ██║  ██║ 
// ╚═════╝  ╚══════╝ ╚═════╝   ╚════╝  ╚═╝  ╚═╝ 

function descr_reload() {
	reload_content('descr', '#profile #profile_descr', function(html) {
		console.log(html);
	});
}

function descr_sam(i) {
	const btn = preload_btn(i);

	const data = {
		descr: $('#editor').html(),
		descr_align: $('#descr_align').val()
	};

	$('#descr').removeClass('err');

	ajax_request('descr', 'sam', data, function(json) {
		bar_slide('prev', 0);
		descr_reload();
	}, btn);
}

// ████████╗ ███████╗ ██╗  ██╗ ████████╗  ██████╗ 
// ╚══██╔══╝ ██╔════╝ ╚██╗██╔╝ ╚══██╔══╝ ██╔════╝ 
//    ██║    █████╗    ╚███╔╝     ██║    ╚█████╗  
//    ██║    ██╔══╝    ██╔██╗     ██║     ╚═══██╗ 
//    ██║    ███████╗ ██╔╝╚██╗    ██║    ██████╔╝ 
//    ╚═╝    ╚══════╝ ╚═╝  ╚═╝    ╚═╝    ╚═════╝  

function texts_reload() {
	$('.profile_group_texts').each(function() {
		let group_id = $(this).attr('data-sort-gid');

		reload_content('texts', '#profile #profile_descr_' + group_id, function (html) {
			jin_edit_controls();
			profile_sort();
		}, { gid: group_id });
	});
}

function texts_load(id) {
	load_content(124, id, 2);
}

function texts_sam(i, extra_data) {
	const btn = preload_btn(i);

	const data = {
		descr: $('#editor').html(),
		descr_align: $('#descr_align').val()
	};

	$('#descr').removeClass('err');

	ajax_request('texts', 'sam', data, function(json) {
		if (extra_data && extra_data.jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 122);
		}

		if (json.is_new != false) {
			$('#profile_sort').append('<div class="profile_sort_block jin_edit_block profile_group_texts" data-sort-id="2" data-sort-gid="' + json.is_new + '" id="profile_descr_' + json.is_new + '"></div>');
		}

		profile_sort();

		texts_reload();
		show_msg(json.success);
	}, btn, extra_data);
}

function texts_delete(i, id, jin) {
	var btn = preload_btn(i);

	ajax_request('texts', 'delete', { id: id }, function(json) {
		if (jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 122);
		}

		texts_reload();

		$('#profile_descr_' + json.gid).remove();

		profile_sort();

		show_msg(json.success);
	}, btn);
}

// ██████╗   █████╗  ██████╗  ████████╗ ███████╗  █████╗  ██╗      ██╗  █████╗  
// ██╔══██╗ ██╔══██╗ ██╔══██╗ ╚══██╔══╝ ██╔════╝ ██╔══██╗ ██║      ██║ ██╔══██╗ 
// ██████╔╝ ██║  ██║ ██████╔╝    ██║    █████╗   ██║  ██║ ██║      ██║ ██║  ██║ 
// ██╔═══╝  ██║  ██║ ██╔══██╗    ██║    ██╔══╝   ██║  ██║ ██║      ██║ ██║  ██║ 
// ██║      ╚█████╔╝ ██║  ██║    ██║    ██║      ╚█████╔╝ ███████╗ ██║ ╚█████╔╝ 
// ╚═╝       ╚════╝  ╚═╝  ╚═╝    ╚═╝    ╚═╝       ╚════╝  ╚══════╝ ╚═╝  ╚════╝  

function portfolio_reload() {
	reload_content('portfolio', '#profile #profile_portfolio', function (html) {
		jin_edit_controls();
		profile_sort();
	});
}

function portfolio_all(id) {
	let a = $('#profile .profile_portfolio');
	let b = a.innerHeight();

	ajax_request('portfolio', 'all', { id: id }, function(html) {
		$('#profile #profile_portfolio').empty().append(html);
		$('#profile .profile_portfolio').css('min-height', b);
	}, null, null, true);
}

function portfolio_content(id) {
	ajax_request('portfolio', 'content', { id: id }, function(html) {
		$('#portfolio_content').html(html);
		portfolio_view();
	}, null, null, true);
}

function portfolio_content_slide(func) {
	var uid = $('#portfolio_uid').val();
	var id;

	if (func == 'prev') {
		id = $('#portfolio_id_prev').val();
	} else if (func == 'next') {
		id = $('#portfolio_id_next').val();
	}

	ajax_request('portfolio', 'content', { id: id }, function(html) {
		$('#portfolio_content').html(html);
		stats(uid, 9, id);
	}, null, null, true);
}


function portfolio_crop() {
	let image_id = $('#portfolio_hidden_id').val();
	close_modal('#portfolio_modal');
	openPortfolioModal(image_id);
}

function portfolio_view() {
	open_modal('#portfolio_view_modal');
}

function portfolio_open(id) {
	$.ajax({
		type: 'POST',
		url: '/incs/bar/bar_47.inc.php',
		data: { id: id },
		success: function(html) {
			$('#bar_level_2 .bar_scroll').empty().append(html);
			console.log(html);
		},
		error: function(error) {
			console.log(error);
		}
	});
}

function portfolio_format(format) {
	var data = { format: format };

	ajax_request('portfolio', 'format', data, function(json) {
		portfolio_reload();
		show_msg(json.success);
	});
}

function portfolio_presave(image_id, jin) {
	var data = { image_id: image_id };

	$('#portfolio_err').html('');

	ajax_request('portfolio', 'presave', data, function(json) {
		$('#bar_subheader_count').text(json.count);

		if (jin) {
			open_jin_window(47, json.id);
		} else {
			bar_slide('next', 2);
			bar_reload(1, 37);
			portfolio_open(json.id);
		}

		portfolio_reload();
	});
}

function portfolio_edit(i, id, jin) {
	const btn = preload_btn(i);

	const data = {
		id: id,
		title: $('#portfolio_title').val(),
		descr: $('#portfolio_descr').val(),
		link: $('#portfolio_link').val(),
		image_id: $('#portfolio_hidden_id').val()
	};

	const rand = Math.round(1 + Math.random() * (999 - 1));

	$('#portfolio_link_prefix, #portfolio_link').removeClass('err');

	ajax_request('portfolio', 'edit', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 37);
		}

		$('#portfolio_' + id + ' img').attr('src', '/modules/upl/portfolio/100/' + json.image_name + '?' + rand);
		portfolio_reload();
	}, btn);
}

function portfolio_delete(id, jin) {
	var data = { id: id };

	ajax_request('portfolio', 'delete', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 37);
		}

		portfolio_reload();
		show_msg(json.success);
	});
}

function portfolio_sort() {
	var sort = [];

	$('.dragon_ui .bar_images_cover').each(function() {
		sort.push($(this).attr('data-portfolio-id'));
	});

	ajax_request('portfolio', 'sort', { sort: sort }, function(json) {
		portfolio_reload();
	});
}

$(document).on('change', '#upload_portfolio_file', function() {
	$('#upload_portfolio').submit();
});

$(document).on('submit', '#upload_portfolio', function(e) {
	e.preventDefault();

	upload_file(this, '/apps/portfolio_upload.app.php', '#upload_portfolio_preloader', '#modal_upload_portfolio_button', function(json) {
		portfolio_presave(json.id);
		portfolio_reload();
		close_modal('#modal_upload_portfolio');
	}, '#upload_portfolio_err');
});

$(document).on('change', '#upload_gallery_file', function() {
	$('#upload_gallery').submit();
});

$(document).on('submit', '#upload_gallery', function(e) {
	e.preventDefault();

	upload_file(this, '/apps/portfolio_upload.app.php', '#upload_gallery_preloader', '#modal_upload_gallery_button', function(json) {
		portfolio_presave(json.id, true);
		portfolio_reload();
		close_modal('#modal_upload_gallery');
	}, '#upload_gallery_err');
});

// ██╗   ██╗ ██╗ ██████╗  ███████╗  █████╗   ██████╗ 
// ██║   ██║ ██║ ██╔══██╗ ██╔════╝ ██╔══██╗ ██╔════╝ 
// ╚██╗ ██╔╝ ██║ ██║  ██║ █████╗   ██║  ██║ ╚█████╗  
//  ╚████╔╝  ██║ ██║  ██║ ██╔══╝   ██║  ██║  ╚═══██╗ 
//   ╚██╔╝   ██║ ██████╔╝ ███████╗ ╚█████╔╝ ██████╔╝ 
//    ╚═╝    ╚═╝ ╚═════╝  ╚══════╝  ╚════╝  ╚═════╝  

function videos_reload() {
	$('.profile_group_videos').each(function() {
		let group_id = $(this).attr('data-sort-gid');

		reload_content('videos', '#profile #profile_videos_' + group_id, function() {
			$('.peppermint').Peppermint({
				dots: true
			});

			jin_edit_controls();
			profile_sort();
		}, { gid: group_id });
	});
}

function videos_load(id) {
	load_content(72, id, 2);
}

function videos_sam(i, extra_data) {
	const btn = preload_btn(i);

	const data = {
		gid: $('#gid').val(),
		hash: $('#video_' + $('#type').val()).val(),
		type: $('#type').val(),
		preview: ($('#video_preview').val() == '' || !$('.bar_preview_custom').hasClass('active')) ? 0 : $('#video_preview').val()
	};

	$('#videos_err').removeClass('err');

	ajax_request('videos', 'sam', data, function(json) {
		if (extra_data && extra_data.jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 70);
		}

		if (json.is_new != false) {
			$('#profile_sort').append('<div class="profile_sort_block jin_edit_block profile_group_videos" data-sort-id="3" data-sort-gid="' + json.is_new + '" id="profile_videos_' + json.is_new + '"></div>');
		}

		profile_sort();

		videos_reload();
	}, btn, extra_data);
}

function videos_sort() {
	var sort = [];

	$('.dragon_ui .bar_block').each(function() {
		sort.push($(this).attr('data-videos-id'));
	});

	ajax_request('videos', 'sort', { sort: sort }, function(json) {
		videos_reload();
	});
}

function videos_delete(i, id, jin) {
	var btn = preload_btn(i);

	ajax_request('videos', 'delete', { id: id }, function(json) {
		if (jin) {
			jin_sam_close();
		} else {
			bar_slide('prev', 1, 70);
		}

		videos_reload();
		show_msg(json.success);
	}, btn);
}

function video_type(id) {
	let a = $('#video_' + id).val();

	$('.video_type').fadeOut(0);
	$('#video_type_' + id).fadeIn(100);

	if (a == '') {
		$('#video_cover').fadeOut(0);
	} else {
		$('#video_cover').fadeIn(100);
		$('#video_youtube img').fadeOut(0);
		$('#video_img_' + id).fadeIn(0);
	}
}

function videos_preview(hash, type) {
	if (type == 0) {
		if (hash.length == 11) {
			$('#video_cover').fadeIn(100);
			$('#video_button').fadeIn(100);
			$('#video_img_0').attr('src', '//img.youtube.com/vi/' + hash + '/sddefault.jpg');

			$('#video_youtube img').fadeOut(0);
			$('#video_img_' + type).fadeIn(0);
		} else {
			$('#video_cover').fadeOut(0);
			$('#video_button').fadeOut(0);
		}
	} else if (type == 1) {
		if (/^\d+$/.test(hash)) {
			ajax_request('videos', 'vimeo', { hash: hash }, function(json) {
				$('#video_cover').fadeIn(100);
				$('#video_button').fadeIn(100);
				$('#video_img_1').attr('src', json.img);

				$('#video_youtube img').fadeOut(0);
				$('#video_img_' + type).fadeIn(0);
			});
		} else {
			$('#video_cover').fadeOut(0);
			$('#video_button').fadeOut(0);
		}
	}
}

$(document).on('input keyup', '#video_0', function() {
	let hash = $(this).val();

	videos_preview(hash, 0);
});

$(document).on('input keyup', '#video_1', function() {
	let hash = $(this).val();

	videos_preview(hash, 1);
});

function videos_modal(hash, type) {
	if (type == 0 || type == 2) {
		$('#yt_player').append('<iframe class="video_yt_player" width="100%" height="100%" src="https://www.youtube.com/embed/' + hash + '?enablejsapi=1&amp;autoplay=1&amp;start=0&amp;autohide=1&amp;wmode=opaque&amp;showinfo=0&amp;origin=https://uadd.me&amp;rel=0&amp;iv_load_policy=3" frameborder="0" allowfullscreen="" allow="autoplay; encrypted-media"></iframe>');
	} else if (type == 1) {
		$('#yt_player').append('<iframe class="video_yt_player" width="100%" height="100%" src="https://player.vimeo.com/video/' + hash + '?autoplay=1&autopause=0&loop=1&title=0&byline=0&portrait=0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen="" frameborder="0"></iframe>');
	}
		

	open_modal('#video_modal');
}

$(document).on('change', '#upload_cover_file', function() {
	$('#upload_cover').submit();
});

$(document).on('submit', '#upload_cover', function(e) {
	e.preventDefault();

	upload_file(this, '/apps/videos_upload.app.php', '#upload_cover_preloader', '#modal_upload_cover_button', function(json) {
		$('.bar_preview_plus').fadeOut(0);
		$('.bar_preview_custom').append('<img src="/modules/upl/460/' + json.filename + '" /><div class="bar_preview_delete"></div>').addClass('bar_preview_check active').attr('onclick', '');
		$('.bar_preview_youtube').removeClass('active');
		$('#video_preview').val(json.id);
		close_modal('#modal_upload_cover');
	}, '#upload_cover_err');
});

// ███╗  ██╗  █████╗  ███╗   ███╗ ███████╗ 
// ████╗ ██║ ██╔══██╗ ████╗ ████║ ██╔════╝ 
// ██╔██╗██║ ███████║ ██╔████╔██║ █████╗   
// ██║╚████║ ██╔══██║ ██║╚██╔╝██║ ██╔══╝   
// ██║ ╚███║ ██║  ██║ ██║ ╚═╝ ██║ ███████╗ 
// ╚═╝  ╚══╝ ╚═╝  ╚═╝ ╚═╝     ╚═╝ ╚══════╝ 

function name_reload() {
	reload_content('name', '#profile .profile_title');
}

function name_sam(i, jin) {
	const btn = preload_btn(i);

	const data = get_data(['fname', 'lname']);

	$('#fname').removeClass('err');

	ajax_request('name', 'sam', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 104);
		}

		if (json.title !== '') {
			$('head title').text(json.title);
		}

		name_reload();
	}, btn);
}

function name_portal() {
	let a = $('#fname').val();
	let b = $('#lname').val();
	let c = $.trim(a + ' ' + b);
	let d = $('#name_portal h1');
	let e = ['🤪', '🤓', '😍', '😇', '😶', '🤬'];
	let f = rand_min_max(0, 5);

	if (c == '') {
		c = e[f];
	}

	d.text(c);
}

$(function() {
	$(document).on('input keyup', '.input_name_portal', function() {
		name_portal();
	});
});

// ██╗  ██╗  █████╗  ██████╗  ██████╗  ██╗   ██╗ 
// ██║  ██║ ██╔══██╗ ██╔══██╗ ██╔══██╗ ╚██╗ ██╔╝ 
// ███████║ ██║  ██║ ██████╦╝ ██████╦╝  ╚████╔╝  
// ██╔══██║ ██║  ██║ ██╔══██╗ ██╔══██╗   ╚██╔╝   
// ██║  ██║ ╚█████╔╝ ██████╦╝ ██████╦╝    ██║    
// ╚═╝  ╚═╝  ╚════╝  ╚═════╝  ╚═════╝     ╚═╝    

function hobby_reload() {
	reload_content('hobby', '#profile .profile_subtitle');
}

function hobby_search(search) {
	var hobbies = [];

	$('#hobby_check .tags_cell').each(function() {
		let a = $(this).children('.tags_cell_text').text();
		if (a != '') {
			hobbies.push(a);
		}
	});

	ajax_request('hobby', 'search', { search: search, hobbies: hobbies }, function(html) {
		$('#hobby_result').empty().append(html);
	}, null, null, true);
}

$(function() {
	$(document).on('input keyup', '#hobby', function() {
		if ($(this).val().length >= 1) {
			hobby_search($(this).val());
		} else {
			hobby_search(0);
		}
	});
});

function hobby_delete(e) {
	let a = $(e);
	a.text('').parent('.tags_cell.active').removeClass('active');
	hobby_search(0);
	hobby_update();
}

function hobby_remove(e) {
	let a = $(e),
		b = a.text(),
		c = $('#hobby_check .tags_cell.active');

	c.each(function() {
		let d = $(this),
			f = d.children('.tags_cell_text').text();

		if (b == f) {
			d.removeClass('active').children('.tags_cell_text').text('');
			return false;
		}
	});

	a.parents('.select_input').children('.input').val('');
	hobby_search(0);
	hobby_update();
}

function hobby_update() {
	let a = $('#hobby_check .tags_cell').length,
		b = $('#hobby_check .tags_cell.active').length,
		c = $('#hobby'),
		d = $('#hobby_check'),
		g = $('#hobby_check .tags_cell');

	if (a == b) {
		c.attr('disabled', 'disabled');
	} else {
		c.removeAttr('disabled');
	}

	g.each(function() {
		let f = $(this),
			t = f.children('.tags_cell_text').text();

		if (!f.hasClass('active') && t == '') {
			d.append(f);
		}
	});

	hobby_portal();
}

function hobby_portal() {
	let a = $('#hobby_check .tags_cell.active'),
		b = [],
		c,
		n = $('#hobby_and').val(),
		h = $('#hobby_choose').val();

	a.each(function() {
		let d = $(this).text();
		b.push(d);
	});

	c = parts(n, h, b[0], b[1], b[2]);
	$('#hobby_portal').text(c);
}

function hobby_add(e) {
	let a = $(e),
		b = a.text(),
		c = $('#hobby_check .tags_cell');

	c.each(function() {
		let d = $(this),
			f = d.children('.tags_cell_text').text();

		if (!d.hasClass('active') && f == '') {
			d.addClass('active').children('.tags_cell_text').text(b);
			return false;
		}
	});

	a.parents('.select_input').children('.input').val('');
	hobby_search(0);
	hobby_update();
}

function hobby_sam(i, jin) {
	var btn = preload_btn(i);
	var hobbies = [];

	$('#hobby_check .tags_cell').each(function() {
		let a = $(this).children('.tags_cell_text').text();
		hobbies.push(a);
	});

	$('#hobby_err').removeClass('err');

	ajax_request('hobby', 'sam', { hobbies: hobbies }, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 104);
		}

		hobby_reload();
	}, btn);
}

// ██████╗  ███████╗ ███████╗ ███████╗ ██████╗  ██████╗   █████╗  ██╗      
// ██╔══██╗ ██╔════╝ ██╔════╝ ██╔════╝ ██╔══██╗ ██╔══██╗ ██╔══██╗ ██║      
// ██████╔╝ █████╗   █████╗   █████╗   ██████╔╝ ██████╔╝ ███████║ ██║      
// ██╔══██╗ ██╔══╝   ██╔══╝   ██╔══╝   ██╔══██╗ ██╔══██╗ ██╔══██║ ██║      
// ██║  ██║ ███████╗ ██║      ███████╗ ██║  ██║ ██║  ██║ ██║  ██║ ███████╗ 
// ╚═╝  ╚═╝ ╚══════╝ ╚═╝      ╚══════╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚══════╝ 

function referral_approve(i) {
	var btn = preload_btn(i);

	ajax_request('referral', 'approve', {}, function(json) {
		bar_slide('next', 1, 107);
	}, btn);
}

function referral_search(search) {
	var data = { search: search };

	ajax_request('referral', 'search', data, function(html) {
		$('#search_referral_result').empty().append(html);
	}, null, null, true);
}

function referral_withdrawals(i, jin) {
	var btn = preload_btn(i);
	var data = {
		amount: $('#amount').val()
	};

	$('#amount, #amount_prefix').removeClass('err');

	ajax_request('referral', 'withdrawals', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 107);
		}

		show_msg(json.success);
	}, btn);
}

function referral_bank(i, jin) {
	const btn = preload_btn(i);

	const data = get_data(['bank_name', 'bank_account_number', 'iban', 'beneficiary_name', 'swift', 'address']);

	$('#bank_name, #bank_account_number, #iban, #beneficiary_name, #swift, #address').removeClass('err');

	ajax_request('referral', 'bank', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 107);
		}

		show_msg(json.success);
	}, btn);
}

$(function() {
	$(document).on('input keyup', '#search_by_referral', function() {
		var a = $(this).val();

		if (a.length >= 1) {
			referral_search(a);
		} else {
			referral_search(0);
		}
	});
});

// ██╗   ██╗ ███████╗ ██████╗  ██╗ ███████╗ ██╗   ██╗ 
// ██║   ██║ ██╔════╝ ██╔══██╗ ██║ ██╔════╝ ╚██╗ ██╔╝ 
// ╚██╗ ██╔╝ █████╗   ██████╔╝ ██║ █████╗    ╚████╔╝  
//  ╚████╔╝  ██╔══╝   ██╔══██╗ ██║ ██╔══╝     ╚██╔╝   
//   ╚██╔╝   ███████╗ ██║  ██║ ██║ ██║         ██║    
//    ╚═╝    ╚══════╝ ╚═╝  ╚═╝ ╚═╝ ╚═╝         ╚═╝    

function verify_profile(i, jin) {
	var btn = preload_btn(i);

	ajax_request('verify', 'profile', {}, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('next', 2, 110);
		}
	}, btn);
}

// ███████╗  █████╗   █████╗  ███████╗ ██████╗   █████╗   █████╗  ██╗  ██╗ 
// ██╔════╝ ██╔══██╗ ██╔══██╗ ██╔════╝ ██╔══██╗ ██╔══██╗ ██╔══██╗ ██║ ██╔╝ 
// █████╗   ███████║ ██║  ╚═╝ █████╗   ██████╦╝ ██║  ██║ ██║  ██║ █████═╝  
// ██╔══╝   ██╔══██║ ██║  ██╗ ██╔══╝   ██╔══██╗ ██║  ██║ ██║  ██║ ██╔═██╗  
// ██║      ██║  ██║ ╚█████╔╝ ███████╗ ██████╦╝ ╚█████╔╝ ╚█████╔╝ ██║ ╚██╗ 
// ╚═╝      ╚═╝  ╚═╝  ╚════╝  ╚══════╝ ╚═════╝   ╚════╝   ╚════╝  ╚═╝  ╚═╝ 

function facebook_sam(i, jin) {
	var btn = preload_btn(i);
	var facebook = $('#facebook').val();

	$('#facebook').removeClass('err');

	ajax_request('facebook', 'sam', { facebook: facebook }, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}

		show_msg(json.success);
	}, btn);
}

// ████████╗ ██╗ ██╗  ██╗ ████████╗  █████╗  ██╗  ██╗ 
// ╚══██╔══╝ ██║ ██║ ██╔╝ ╚══██╔══╝ ██╔══██╗ ██║ ██╔╝ 
//    ██║    ██║ █████═╝     ██║    ██║  ██║ █████═╝  
//    ██║    ██║ ██╔═██╗     ██║    ██║  ██║ ██╔═██╗  
//    ██║    ██║ ██║ ╚██╗    ██║    ╚█████╔╝ ██║ ╚██╗ 
//    ╚═╝    ╚═╝ ╚═╝  ╚═╝    ╚═╝     ╚════╝  ╚═╝  ╚═╝ 

function tiktok_sam(i, jin) {
	var btn = preload_btn(i);
	var tiktok = $('#tiktok').val();

	$('#tiktok').removeClass('err');

	ajax_request('tiktok', 'sam', { tiktok: tiktok }, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}

		show_msg(json.success);
	}, btn);
}

//  ██████╗   █████╗   █████╗   ██████╗  ██╗      ███████╗ 
// ██╔════╝  ██╔══██╗ ██╔══██╗ ██╔════╝  ██║      ██╔════╝ 
// ██║  ██╗  ██║  ██║ ██║  ██║ ██║  ██╗  ██║      █████╗   
// ██║  ╚██╗ ██║  ██║ ██║  ██║ ██║  ╚██╗ ██║      ██╔══╝   
// ╚██████╔╝ ╚█████╔╝ ╚█████╔╝ ╚██████╔╝ ███████╗ ███████╗ 
//  ╚═════╝   ╚════╝   ╚════╝   ╚═════╝  ╚══════╝ ╚══════╝ 

function google_sam(i, jin) {
	var btn = preload_btn(i);
	var google = $('#google').val();

	$('#google').removeClass('err');

	ajax_request('google', 'sam', { google: google }, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}

		show_msg(json.success);
	}, btn);
}

// ██╗  ██╗ ██████╗  ██╗      
// ██║  ██║ ██╔══██╗ ██║      
// ██║  ██║ ██████╔╝ ██║      
// ██║  ██║ ██╔══██╗ ██║      
// ╚█████╔╝ ██║  ██║ ███████╗ 
//  ╚════╝  ╚═╝  ╚═╝ ╚══════╝ 

function url_sam(i, jin) {
	var btn = preload_btn(i);

	var data = {
		url: $('#url').val(),
		password: $('#password').val()
	};

	$('#url_prefix').removeClass('err');
	$('#url').removeClass('err');
	$('#password').removeClass('err');

	ajax_request('url', 'sam', data, function(json) {
		history.replaceState(null, null, '/' + data.url);

		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}
	}, btn);
}

function url_realtime(url) {
	var data = { url: url };

	ajax_request('url', 'realtime', data, function(html) {
		var json = JSON.parse(html);

		if (json.process == 1) {
			$('#url_status').html('<div class="bar_status scs">' + json.success + '</div>');
		} else {
			if (json.errs && json.errs.err_url) {
				$('#url_status').html('<div class="bar_status err">' + json.errs.err_url + '</div>');
			}
		}
	}, null, null, true);
}

$(function() {
	$(document).on('change keyup input', '.url_realtime', function() {
		url_realtime($(this).val());
	});
});

// ███████╗ ███╗   ███╗  █████╗  ██╗ ██╗      
// ██╔════╝ ████╗ ████║ ██╔══██╗ ██║ ██║      
// █████╗   ██╔████╔██║ ███████║ ██║ ██║      
// ██╔══╝   ██║╚██╔╝██║ ██╔══██║ ██║ ██║      
// ███████╗ ██║ ╚═╝ ██║ ██║  ██║ ██║ ███████╗ 
// ╚══════╝ ╚═╝     ╚═╝ ╚═╝  ╚═╝ ╚═╝ ╚══════╝ 

function email_sam(i, jin) {
	const btn = preload_btn(i);

	const data = get_data(['email', 'email_repeat', 'password']);

	$('#email, #email_repeat, #password').removeClass('err');

	ajax_request('email', 'sam', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}
	}, btn);
}

function email_repeat(i) {
	ajax_request('email', 'repeat', {}, function(json) {
		show_msg(json.success);
		$(i).attr('onclick', '');
	});
}

function email_preferences_save(i, jin) {
	var btn = preload_btn(i);
	var weekly = $('#weekly').is(':checked') ? 1 : 0;

	var data = { weekly: weekly };

	ajax_request('email', 'preferences_save', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}

		show_msg(json.success);
	}, btn);
}

// ██████╗   █████╗   ██████╗  ██████╗ ██╗       ██╗  █████╗  ██████╗  ██████╗  
// ██╔══██╗ ██╔══██╗ ██╔════╝ ██╔════╝ ██║  ██╗  ██║ ██╔══██╗ ██╔══██╗ ██╔══██╗ 
// ██████╔╝ ███████║ ╚█████╗  ╚█████╗  ╚██╗████╗██╔╝ ██║  ██║ ██████╔╝ ██║  ██║ 
// ██╔═══╝  ██╔══██║  ╚═══██╗  ╚═══██╗  ████╔═████║  ██║  ██║ ██╔══██╗ ██║  ██║ 
// ██║      ██║  ██║ ██████╔╝ ██████╔╝  ╚██╔╝ ╚██╔╝  ╚█████╔╝ ██║  ██║ ██████╔╝ 
// ╚═╝      ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚═╝    ╚════╝  ╚═╝  ╚═╝ ╚═════╝  

function password_sam(i, jin) {
	const btn = preload_btn(i);

	const data = get_data(['password_now', 'password_new', 'password_new_repeat']);

	$('#password_now, #password_new, #password_new_repeat').removeClass('err');

	ajax_request('password', 'sam', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}
	}, btn);
}

// ██████╗   █████╗  ██╗  ██╗ ███╗  ██╗ ██████╗  
// ██╔══██╗ ██╔══██╗ ██║  ██║ ████╗ ██║ ██╔══██╗ 
// ██████╔╝ ██║  ██║ ██║  ██║ ██╔██╗██║ ██║  ██║ 
// ██╔══██╗ ██║  ██║ ██║  ██║ ██║╚████║ ██║  ██║ 
// ██║  ██║ ╚█████╔╝ ╚█████╔╝ ██║ ╚███║ ██████╔╝ 
// ╚═╝  ╚═╝  ╚════╝   ╚════╝  ╚═╝  ╚══╝ ╚═════╝  

function round_reload() {
	reload_content('round', null, function(html) {
		var json = JSON.parse(html);

		var a = ['var_round_standart', 'var_round_null', 'var_round_mini', 'var_round_max'];

		if (json.process == 1) {
			$('#profile').removeClass('var_round_null var_round_mini var_round_standart var_round_max').addClass(a[json.format]);
		}
	});
}

function round_format(format) {
	var a = ['var_round_standart', 'var_round_null', 'var_round_mini', 'var_round_max'];

	$('#profile').removeClass('var_round_null var_round_mini var_round_standart var_round_max').addClass(a[format]);

	var data = { format: format };

	ajax_request('round', 'format', data, function(json) {
		show_msg(json.success);
	});
}

//  ██████╗ ██╗  ██╗ ██████╗  
// ██╔════╝ ██║  ██║ ██╔══██╗ 
// ╚█████╗  ██║  ██║ ██████╦╝ 
//  ╚═══██╗ ██║  ██║ ██╔══██╗ 
// ██████╔╝ ╚█████╔╝ ██████╦╝ 
// ╚═════╝   ╚════╝  ╚═════╝  

function sub_create() {
	const data = get_data(['fname', 'lname', 'url']);

	$('#url, #url_prefix, #fname').removeClass('err');

	ajax_request('sub', 'create', data, function(json) {
		$(location).attr('href', '/' + data.url);
	});
}

function sub_login(id) {
	var data = { id: id };

	ajax_request('sub', 'login', data, function(json) {
		$(location).attr('href', '/' + json.url);
	});
}

// ██████╗  ███████╗  ██████╗  ██╗  ██╗ ███████╗  ██████╗ ████████╗ 
// ██╔══██╗ ██╔════╝ ██╔═══██╗ ██║  ██║ ██╔════╝ ██╔════╝ ╚══██╔══╝ 
// ██████╔╝ █████╗   ██║   ██║ ██║  ██║ █████╗   ╚█████╗     ██║    
// ██╔══██╗ ██╔══╝   ╚██████╔╝ ██║  ██║ ██╔══╝    ╚═══██╗    ██║    
// ██║  ██║ ███████╗  ╚══██╔╝  ╚█████╔╝ ███████╗ ██████╔╝    ██║    
// ╚═╝  ╚═╝ ╚══════╝     ╚═╝    ╚════╝  ╚══════╝ ╚═════╝     ╚═╝    

var request_hash_id = '';

function request_modal(id) {
	open_modal('#request_modal');

	if (id != request_hash_id) {
		$('#request_err').html('');
		$('#request_fname').removeClass('err').val('');
		$('#request_email').removeClass('err').val('');
		$('#request_mail').removeClass('err').val('');

		request_hash_id = id;
	}

	$('#request_button').val(id);
}

function request_send(i, id) {
	const btn = preload_btn(i);

	const data = get_data(['request_fname', 'request_email', 'request_mail', 'request_button']);

	data.pid = id;

	$('#request_fname, #request_email, #request_mail').removeClass('err');

	ajax_request('request', 'send', data, function(json) {
		close_modal('#request_modal');

		$('#request_err').html('');
		$('#request_fname, #request_email, #request_mail').removeClass('err').val('');

		show_msg(json.success);

		stats(id, 4);
	}, btn);
}

// ██████╗  ███████╗  ██████╗ ██╗  ██████╗  ███╗  ██╗ 
// ██╔══██╗ ██╔════╝ ██╔════╝ ██║ ██╔════╝  ████╗ ██║ 
// ██║  ██║ █████╗   ╚█████╗  ██║ ██║  ██╗  ██╔██╗██║ 
// ██║  ██║ ██╔══╝    ╚═══██╗ ██║ ██║  ╚██╗ ██║╚████║ 
// ██████╔╝ ███████╗ ██████╔╝ ██║ ╚██████╔╝ ██║ ╚███║ 
// ╚═════╝  ╚══════╝ ╚═════╝  ╚═╝  ╚═════╝  ╚═╝  ╚══╝ 

function design_reload() {
	reload_content('design', null, function(html) {
		var json = JSON.parse(html);

		if (json.process == 1) {
			$('#profile').removeClass('var_mini var_simple').addClass('var_' + json.format);

			if ($('#peppermint').length) {
				pepper_slider.data('Peppermint').recalcWidth();
			}
		}
	});
}

function design_sam(format, e) {
	$('#profile').removeClass('var_mini var_simple').addClass('var_' + format);
	$('.bar_format').removeClass('active');
	$(e).addClass('active');

	if (format == 'medium') {
		$('#content').removeClass('hidden');
	} else {
		$('#content').addClass('hidden');
	}

	var data = { format: format };

	ajax_request('design', 'sam', data, function(json) {
		show_msg(json.success);

		if ($('#peppermint').length) {
			pepper_slider.data('Peppermint').recalcWidth();
		}
	});
}

//  █████╗  ██╗ 
// ██╔══██╗ ██║ 
// ███████║ ██║ 
// ██╔══██║ ██║ 
// ██║  ██║ ██║ 
// ╚═╝  ╚═╝ ╚═╝ 

function reload_content(name, selector, callback, extra_data = null) {
	$.ajax({
		type: 'POST',
		url: '/apps/reloads/' + name + '.app.php',
		data: extra_data,

		success: function(html) {
			if (selector) {
				$(selector).empty().append(html);
			}

			if (callback) {
				callback(html);
			}
		},

		error: function(error) {
			console.log(error);
		}
	});
}

function ajax_aireload(url, uid, lang, success_selector, extra_data = false) {
	let data = { uid, lang };

	if (extra_data) {
		$.extend(data, extra_data);
	}

	$.ajax({
		type: 'POST',
		url: url,
		data: data,

		success: function(html) {
			$(success_selector).empty().append(html);
		},

		error: function(error) {
			console.log(error);
		}
	});
}

function ai_faqs_reload(uid, lang) {
	ajax_aireload('/apps/aireloads/faqs.app.php', uid, lang, '#profile_faqs');
}

function ai_buttons_reload(uid, lang) {
	$('.profile_group_buttons').each(function() {
		let group_id = $(this).attr('data-sort-gid');

		ajax_aireload('/apps/aireloads/target.app.php', uid, lang, '#profile #profile_button_' + group_id, { gid: group_id });
	});
}

function ai_nets_reload(uid, lang) {
	$('.profile_group_nets').each(function() {
		let group_id = $(this).attr('data-sort-gid');

		ajax_aireload('/apps/aireloads/nets.app.php', uid, lang, '#profile #profile_nets_' + group_id, { gid: group_id });
	});
}

function ai_hobby_reload(uid, lang) {
	ajax_aireload('/apps/aireloads/hobby.app.php', uid, lang, '#profile .profile_subtitle');
}

function ai_descr_reload(uid, lang) {
	ajax_aireload('/apps/aireloads/descr.app.php', uid, lang, '#profile #profile_descr');
}

function ai_texts_reload(uid, lang) {
	$('.profile_group_texts').each(function() {
		let group_id = $(this).attr('data-sort-gid');

		ajax_aireload('/apps/aireloads/texts.app.php', uid, lang, '#profile #profile_descr_' + group_id, { gid: group_id });
	});
}

function ai_lang(uid = false, lang = false, i) {
	const $i = $(i);
	const original_onclick = $i.attr('onclick');

	$i.removeAttr('onclick').addClass('loaded');

	if (original_onclick) {
		$.ajax({
			type: 'POST',
			url: '/apps/ai_lang.app.php',
			data: { uid, lang },

			success: function(response) {
				try {
					const json = JSON.parse(response);

					close_modal('#modal_translation');

					if (lang) {
						$('.lang_button').fadeIn(0);
					} else {
						$('.lang_button').fadeOut(0);
					}

					ai_faqs_reload(uid, lang);
					ai_buttons_reload(uid, lang);
					ai_nets_reload(uid, lang);
					ai_hobby_reload(uid, lang);
					// ai_descr_reload(uid, lang);
					ai_texts_reload(uid, lang);

					console.log(json);
				} catch (error) {
					console.error('Error parsing JSON:', error);
				}

				$i.attr('onclick', original_onclick).removeClass('loaded');
			},

			error: function(xhr, status, error) {
				$i.attr('onclick', original_onclick).removeClass('loaded');;

				console.error('AJAX Error:', status, error);
			}
		});
	}
}

function ai_preferences_save(i, jin) {
	var btn = preload_btn(i);
	var translation = $('#translation').is(':checked') ? 1 : 0;

	var data = { translation: translation };

	ajax_request('ai', 'preferences_save', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}

		if (translation == 1) {
			$('.bar_translation').fadeIn(100);
		} else {
			$('.bar_translation').fadeOut(0);
		}
	}, btn);
}

function rgb_to_hex(r, g, b) {
	return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function getDominantColors(count, mode) {
	let colorThief = new ColorThief();
	let image = $('#color_thief')[0];

	// Перевірка, чи зображення завантажене
	if (image.complete) {
		let colors = colorThief.getPalette(image, count);
		colors = shuffleArray(colors); // Перемішування масиву

		let secondColor = colors[1];

		// Визначення функцій для обробки кольорів
		let functions = [general_set_color, content_set_color, bg_set_color];

		// Перевірка яскравості другого кольору
		let brightnessSecondColor = getBrightness(secondColor);

		// Пошук кольору з протилежною яскравістю
		let oppositeColorIndex = colors.findIndex((color, index) => {
			return index !== 1 && isOppositeBrightness(getBrightness(color), brightnessSecondColor);
		});

		// Збереження протилежного кольору та видалення його з масиву, якщо знайдено
		let oppositeColor = null;

		if (oppositeColorIndex !== -1) {
			oppositeColor = colors.splice(oppositeColorIndex, 1)[0];
		}

		// Перетворення кольорів у HEX та виклик функцій
		colors.forEach(function(color, index) {
			let colorHex = rgb_to_hex(color[0], color[1], color[2]);

			if (index < functions.length) {
				if (index == 2) {
					if (mode && mode != 3) {
						functions[index](colorHex);
					}
				} else {
					functions[index](colorHex);
				}
			}
		});

		if (mode && mode == 1 && rand_min_max(0, 1) == 1) {
			let color_second_hex = rgb_to_hex(secondColor[0], secondColor[1], secondColor[2]);

			bg_set_color(color_second_hex);
		}

		// Використання протилежного кольору (наприклад, для окремої функції)
		if (oppositeColor) {
			let oppositeColorHex = rgb_to_hex(oppositeColor[0], oppositeColor[1], oppositeColor[2]);

			text_set_color(oppositeColorHex);
		} else {
			if (brightnessSecondColor > 128) {
				text_set_color('FFF');
			} else {
				text_set_color('000');
			}
		}
	} else {
		image.addEventListener('load', function() {
			getDominantColors(count);
		});
	}
}

// Функція для перемішування масиву
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

// Функція для визначення яскравості кольору
function getBrightness(color) {
	// Використовуємо формулу для розрахунку яскравості
	return 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
}

// Функція для перевірки протилежної яскравості
function isOppositeBrightness(brightness1, brightness2) {
	let threshold = 128; // Порогове значення для яскравості (можна налаштувати)
	return Math.abs(brightness1 - brightness2) > threshold;
}


// ████████╗ ██╗  ██╗ ███████╗ ███╗   ███╗ ███████╗  ██████╗ 
// ╚══██╔══╝ ██║  ██║ ██╔════╝ ████╗ ████║ ██╔════╝ ██╔════╝ 
//    ██║    ███████║ █████╗   ██╔████╔██║ █████╗   ╚█████╗  
//    ██║    ██╔══██║ ██╔══╝   ██║╚██╔╝██║ ██╔══╝    ╚═══██╗ 
//    ██║    ██║  ██║ ███████╗ ██║ ╚═╝ ██║ ███████╗ ██████╔╝ 
//    ╚═╝    ╚═╝  ╚═╝ ╚══════╝ ╚═╝     ╚═╝ ╚══════╝ ╚═════╝  

function themes_load(id) {
	load_content(61, id, 2, function(html) {
		$('link[href^="/styles/themes/"]').remove();

		var rand = Math.round(1 + Math.random() * (999 - 1)),
			url = '/styles/themes/' + id + '.theme.css?' + rand,
			el = $('head link:last');

		$('<link/>', {
			rel: 'stylesheet',
			href: url,
			type: 'text/css'
		}).insertBefore(el);
	});
}

function themes_jin(id) {
	$('link[href^="/styles/themes/"]').remove();

	var rand = Math.round(1 + Math.random() * (999 - 1)),
		url = '/styles/themes/' + id + '.theme.css?' + rand,
		el = $('head link:last');

	$('<link/>', {
		rel: 'stylesheet',
		href: url,
		type: 'text/css'
	}).insertBefore(el);

	console.log('Okey, God.');
}

function themes_check(id, e) {
	var a = $(e);
	var data = { id: id };

	ajax_request('themes', 'check', data, function(json) {
		$('#content').addClass('theme_' + id);

		bg_reload();
		round_reload();
		design_reload();
		name_reload();
		nets_reload();
		buttons_reload();

		$('#themes_button_2').fadeIn(300);

		a.text(json.check_active).attr('onclick', '');

		bar_slide('prev', 1, 60);

		console.log(json);
	});
}

function themes_delete(e, btn) {
	ajax_request('themes', 'delete', {}, function(json) {
		$('#content').removeClass('theme_' + json.id);

		$('#themes_button_2').fadeOut(300);

		if (btn) {
			$('#theme_button_check').text(json.check).attr('onclick', 'themes_check(' + json.id + ', this)');
		}

		show_msg(json.success);

		bar_slide('prev', 1, 60);
	});
}

// ██╗       █████╗  ███╗  ██╗  ██████╗  
// ██║      ██╔══██╗ ████╗ ██║ ██╔════╝  
// ██║      ███████║ ██╔██╗██║ ██║  ██╗  
// ██║      ██╔══██║ ██║╚████║ ██║  ╚██╗ 
// ███████╗ ██║  ██║ ██║ ╚███║ ╚██████╔╝ 
// ╚══════╝ ╚═╝  ╚═╝ ╚═╝  ╚══╝  ╚═════╝  

function lang_sam(id) {
	var data = { id: id };

	ajax_request('lang', 'sam', data, function(json) {
		location.reload();
	});
}

//  ██████╗  █████╗  ██████╗  ████████╗ 
// ██╔════╝ ██╔══██╗ ██╔══██╗ ╚══██╔══╝ 
// ╚█████╗  ██║  ██║ ██████╔╝    ██║    
//  ╚═══██╗ ██║  ██║ ██╔══██╗    ██║    
// ██████╔╝ ╚█████╔╝ ██║  ██║    ██║    
// ╚═════╝   ╚════╝  ╚═╝  ╚═╝    ╚═╝    

function profile_sort() {
	var sort = [];

	$('#profile_sort .profile_sort_block').each(function() {
		let a = $(this).attr('data-sort-id'),
			b = $(this).attr('data-sort-gid');

		if (b != 0) {
			sort.push(a + '|' + b);
		} else {
			sort.push(a);
		}
	});

	var data = { sort: sort };

	console.log(sort);

	ajax_request('profile', 'sort', data, function(json) {
		if (json.delete.length != 0) {
			$.each(json.delete, function(index, value) {
				var pairs = value.split(',');

				$.each(pairs, function(i, pair) {
					var numbers = pair.split('|');

					$('#profile_' + numbers[0] + '_' + numbers[1]).remove();
				});
			});
		}
	});
}

function profile_sort_start() {
	var dragon_item;

	bar('#burg');

	$('#profile_sort').sortable({
		// handle: '.dragon_handle',
		connectWith: '.dragon_ui',
		tolerance: 'pointer',
		placeholder: 'profile_sort_placeholder',
		revert: 100,
		axis: 'y',
		classes: {
			'ui-sortable-helper': 'profile_sort_helper'
		},
		create: function( event, ui ) {
			let dragon_items = $('.profile_sort_block');

			dragon_items.removeClass('unsort');

			dragon_items.each(function() {
				let dragon_item = $(this),
					dragon_item_height = dragon_item.height();

				if (dragon_item_height == 0) {
					dragon_item.addClass('unsort');
				}
			});
		},
		activate: function(event, ui) {
			dragon_item = $(ui.item);

			let dragon_width = dragon_item.width(),
				dragon_height = dragon_item.height();

			$('.profile_sort_placeholder').outerWidth(dragon_width).outerHeight(dragon_height);
		},
		update: function() {
			profile_sort();
		}
	});

	$('#profile_sort').addClass('start');
}

function profile_sort_stop() {
	var a = $('#profile_sort');

	if (a.hasClass('start')) {
		a.sortable('destroy').removeClass('start');
	}
}

// ████████╗ ██╗ ███╗   ███╗ ███████╗ ███████╗  █████╗  ███╗  ██╗ ███████╗ 
// ╚══██╔══╝ ██║ ████╗ ████║ ██╔════╝ ╚════██║ ██╔══██╗ ████╗ ██║ ██╔════╝ 
//    ██║    ██║ ██╔████╔██║ █████╗     ███╔═╝ ██║  ██║ ██╔██╗██║ █████╗   
//    ██║    ██║ ██║╚██╔╝██║ ██╔══╝   ██╔══╝   ██║  ██║ ██║╚████║ ██╔══╝   
//    ██║    ██║ ██║ ╚═╝ ██║ ███████╗ ███████╗ ╚█████╔╝ ██║ ╚███║ ███████╗ 
//    ╚═╝    ╚═╝ ╚═╝     ╚═╝ ╚══════╝ ╚══════╝  ╚════╝  ╚═╝  ╚══╝ ╚══════╝ 

function timezone_sam(i, jin) {
	var btn = preload_btn(i);
	var data = { time_zone: $('#time_zone').val() };

	$('#time_zone').removeClass('err');

	ajax_request('timezone', 'sam', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}
	}, btn);
}

// ███╗   ███╗ ███████╗ ████████╗  █████╗  
// ████╗ ████║ ██╔════╝ ╚══██╔══╝ ██╔══██╗ 
// ██╔████╔██║ █████╗      ██║    ███████║ 
// ██║╚██╔╝██║ ██╔══╝      ██║    ██╔══██║ 
// ██║ ╚═╝ ██║ ███████╗    ██║    ██║  ██║ 
// ╚═╝     ╚═╝ ╚══════╝    ╚═╝    ╚═╝  ╚═╝ 

function meta_sam(i, jin) {
	const btn = preload_btn(i);

	const data = get_data(['meta_title', 'meta_descr']);

	$('#meta_title, #meta_descr').removeClass('err');

	ajax_request('meta', 'sam', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}

		if (json.title !== '') {
			$('head title').text(json.title);
		}

		if (json.descr !== '') {
			$('meta[name="description"]').attr('content', json.descr);
		}
	}, btn);
}

// ██████╗  ██████╗  ██╗ ██╗   ██╗  █████╗  ████████╗ ███████╗ 
// ██╔══██╗ ██╔══██╗ ██║ ██║   ██║ ██╔══██╗ ╚══██╔══╝ ██╔════╝ 
// ██████╔╝ ██████╔╝ ██║ ╚██╗ ██╔╝ ███████║    ██║    █████╗   
// ██╔═══╝  ██╔══██╗ ██║  ╚████╔╝  ██╔══██║    ██║    ██╔══╝   
// ██║      ██║  ██║ ██║   ╚██╔╝   ██║  ██║    ██║    ███████╗ 
// ╚═╝      ╚═╝  ╚═╝ ╚═╝    ╚═╝    ╚═╝  ╚═╝    ╚═╝    ╚══════╝ 

function private_type(id) {
	let a = $('#private_pass');

	if (id == 2) {
		a.show('slow');
	} else {
		a.slideUp();
	}
}

function private_sam(i, jin) {
	const btn = preload_btn(i);

	const data = get_data(['private', 'private_password']);

	$('#private_password').removeClass('err');

	ajax_request('private', 'sam', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}
	}, btn);
}

function private_login(i, pid) {
	var btn = preload_btn(i);

	var data = {
		pid: pid,
		password: $('#password').val()
	};

	$('#password').removeClass('err');

	ajax_request('private', 'login', data, function(json) {
		$(location).attr('href', '/' + json.url);
	}, btn);
}

// ██████╗   █████╗  ███╗   ███╗  █████╗  ██╗ ███╗  ██╗ 
// ██╔══██╗ ██╔══██╗ ████╗ ████║ ██╔══██╗ ██║ ████╗ ██║ 
// ██║  ██║ ██║  ██║ ██╔████╔██║ ███████║ ██║ ██╔██╗██║ 
// ██║  ██║ ██║  ██║ ██║╚██╔╝██║ ██╔══██║ ██║ ██║╚████║ 
// ██████╔╝ ╚█████╔╝ ██║ ╚═╝ ██║ ██║  ██║ ██║ ██║ ╚███║ 
// ╚═════╝   ╚════╝  ╚═╝     ╚═╝ ╚═╝  ╚═╝ ╚═╝ ╚═╝  ╚══╝ 

function domain_sam(i, jin) {
	const btn = preload_btn(i);

	const data = get_data(['domain']);

	$('#domain, #domain_prefix').removeClass('err');

	ajax_request('domain', 'sam', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('next', 1, 92);
		}
	}, btn);
}

//  █████╗   █████╗  ███╗   ███╗ ███╗   ███╗ ██╗  ██╗ ███╗  ██╗ ██╗ ████████╗ ██╗   ██╗ 
// ██╔══██╗ ██╔══██╗ ████╗ ████║ ████╗ ████║ ██║  ██║ ████╗ ██║ ██║ ╚══██╔══╝ ╚██╗ ██╔╝ 
// ██║  ╚═╝ ██║  ██║ ██╔████╔██║ ██╔████╔██║ ██║  ██║ ██╔██╗██║ ██║    ██║     ╚████╔╝  
// ██║  ██╗ ██║  ██║ ██║╚██╔╝██║ ██║╚██╔╝██║ ██║  ██║ ██║╚████║ ██║    ██║      ╚██╔╝   
// ╚█████╔╝ ╚█████╔╝ ██║ ╚═╝ ██║ ██║ ╚═╝ ██║ ╚█████╔╝ ██║ ╚███║ ██║    ██║       ██║    
//  ╚════╝   ╚════╝  ╚═╝     ╚═╝ ╚═╝     ╚═╝  ╚════╝  ╚═╝  ╚══╝ ╚═╝    ╚═╝       ╚═╝    

function community_reload() {
	reload_content('community', '#profile #profile_community');
}

function community_sam(i, extra_data) {
	var btn = preload_btn(i);

	var data = {
		username: $('#username').val(),
		activities: $('#descr').val()
	};

	$('#username, #username_prefix').removeClass('err');

	ajax_request('community', 'sam', data, function(json) {
		if (extra_data && extra_data.jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 94);
		}

		community_reload();
	}, btn, extra_data);
}

function community_load(id) {
	load_content(97, id, 2);
}

function community_delete(i, id, jin) {
	var btn = preload_btn(i);
	var data = { id: id };

	ajax_request('community', 'delete', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 94);
		}

		community_reload();
		show_msg(json.success);
	}, btn);
}

function community_sort() {
	var sort = [];

	$('.dragon_ui .bar_block').each(function() {
		sort.push($(this).attr('data-community-id'));
	});

	var data = { sort: sort };

	ajax_request('community', 'sort', data, function(json) {
		community_reload();
	});
}

function community_search(search) {
	var data = { search: search };

	ajax_request('community', 'search', data, function(html) {
		$('#search_community_result').empty().append(html);
	}, null, null, true);
}

function community_settings(i, jin) {
	const btn = preload_btn(i);

	const data = get_data(['community_title', 'aligment']);

	ajax_request('community', 'settings', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 94);
		}

		community_reload();
	}, btn);
}

function community_list(id) {
	var data = { id: id };

	ajax_request('community', 'list', data, function(html) {
		$('#community_list').html(html);
		open_modal('#community_modal');
	}, null, null, true);
}

function community_search_modal(search, id) {
	var data = { search: search, id: id };

	ajax_request('community', 'search_modal', data, function(html) {
		$('#search_community_modal_result').empty().append(html);
	}, null, null, true);
}

function community_username_realtime(username) {
	var data = {
		username: username,
		activities: $('#descr').val()
	};

	ajax_request('community', 'username_realtime', data, function(html) {
		var json = JSON.parse(html);

		if (json.process == 1) {
			$('#username_status').html('');
			$('#community_portal').slideDown().children('.portal_community').html(json.success);
		} else {
			$('#community_portal').slideUp();
			if (json.errs && json.errs.username) {
				$('#username_status').html('<div class="bar_status err">' + json.errs.username + '</div>');
			}
		}
	}, null, null, true);
}

$(function() {
	$(document).on('input keyup', '#search_by_community', function() {
		var a = $(this).val();

		if (a.length >= 1) {
			community_search(a);
		} else {
			community_search(0);
		}
	});

	$(document).on('input keyup', '#search_by_community_modal', function() {
		var a = $(this).val(),
			b = $(this).attr('data-id');

		if (a.length >= 1) {
			community_search_modal(a, b);
		} else {
			community_search_modal(0, b);
		}
	});

	$(document).on('change keyup input', '.username_realtime', function() {
		community_username_realtime($(this).val());
	});
});

//  ██████╗ ██╗  ██╗  █████╗  ██████╗  
// ██╔════╝ ██║  ██║ ██╔══██╗ ██╔══██╗ 
// ╚█████╗  ███████║ ██║  ██║ ██████╔╝ 
//  ╚═══██╗ ██╔══██║ ██║  ██║ ██╔═══╝  
// ██████╔╝ ██║  ██║ ╚█████╔╝ ██║      
// ╚═════╝  ╚═╝  ╚═╝  ╚════╝  ╚═╝      

function shop_reload() {
	reload_content('shop', '#profile #profile_shop', function (html) {
		jin_edit_controls();
		profile_sort();
	});
}

function shop_settings(i, jin) {
	const btn = preload_btn(i);

	const data = get_data(['shop_title', 'aligment', 'mode']);

	ajax_request('shop', 'settings', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 98);
		}

		shop_reload();
	}, btn);
}

function shop_category_sam(i, extra_data) {
	const btn = preload_btn(i);

	const data = get_data(['title']);

	data.image = $('#shop_category').val();

	$('#title').removeClass('err');

	ajax_request('shop', 'category_sam', data, function(json) {
		if (extra_data && extra_data.jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 98);
		}

		shop_reload();
		show_msg(json.success);
	}, btn, extra_data);
}

function shop_product_sam(i, extra_data) {
	const btn = preload_btn(i);

	const data = get_data(['title', 'subtitle', 'category', 'price', 'button_title', 'url']);

	data.image = $('#shop_product').val();
	data.descr = $('#editor').html();
	data.allergens = $('#allergens .autocomplete_block').map(function() { 
		return $(this).attr('data-select-id'); 
	}).get();

	$('#title, #price, #button_title, #url, #url_prefix').removeClass('err');

	ajax_request('shop', 'product_sam', data, function(json) {
		if (extra_data && extra_data.jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 98);
		}

		shop_reload();
		show_msg(json.success);
	}, btn, extra_data);
}

function shop_product_sort(e) {
	var sort = e.children('.bar_block').map(function() { return $(this).attr('data-shop-product-id'); }).get();
	var data = { sort: sort };

	ajax_request('shop', 'product_sort', data, function(json) {
		shop_reload();
	});
}

function shop_category_sort() {
	var sort = $('.bar_group.sort').map(function() { return $(this).attr('data-shop-category-id'); }).get();
	var data = { sort: sort };

	ajax_request('shop', 'category_sort', data, function(json) {
		shop_reload();
	});
}

function shop_product_load(id) {
	load_content(102, id, 2);
}

function shop_category_load(id) {
	load_content(103, id, 2);
}

function shop_product_delete(i, id, jin) {
	var btn = preload_btn(i);
	var data = { id: id };

	ajax_request('shop', 'product_delete', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 98);
		}

		shop_reload();
		show_msg(json.success);
	}, btn);
}

function shop_category_delete(i, id, jin) {
	var btn = preload_btn(i);
	var data = { id: id };

	ajax_request('shop', 'category_delete', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 98);
		}

		shop_reload();
		show_msg(json.success);
	}, btn);
}

function shop_category_list(id) {
	var data = { id: id };

	ajax_request('shop', 'category_list', data, function(html) {
		$('#shop_category_list').html(html);
		close_modal('#shop_product_modal');
		open_modal('#shop_category_modal');
	}, null, null, true);
}

function shop_product_list(id, category) {
	var data = { id: id };

	$('#shop_product_modal .modal_back').fadeOut(0);

	ajax_request('shop', 'product_list', data, function(html) {
		$('#shop_product_list').html(html);

		if (category) {
			if (category != 0) {
				$('#shop_product_modal .modal_back').attr('onclick', 'shop_category_list(' + category + ');').fadeIn(0);
			}
		}

		close_modal('#shop_category_modal');
		open_modal('#shop_product_modal');
	}, null, null, true);
}

$(document).on('change', '#upload_category_file', function() {
	$('#upload_category').submit();
});

$(document).on('submit', '#upload_category', function(e) {
	e.preventDefault();

	upload_file(this, '/apps/shop_category_upload.app.php', '#upload_category_preloader', '#modal_upload_category_button', function(json) {
		$('#shop_category').val(json.id);
		$('#shop_category_filename').val(json.filename);
		$('#upload_category_button .button_preview').remove();
		$('#upload_category_button').append('<div class="button_preview"><img src="/modules/upl/160/' + json.filename + '"></div>').addClass('preview');
		close_modal('#modal_upload_category');
	}, '#upload_category_err');
});

$(document).on('change', '#upload_product_file', function() {
	$('#upload_product').submit();
});

$(document).on('submit', '#upload_product', function(e) {
	e.preventDefault();

	upload_file(this, '/apps/shop_product_upload.app.php', '#upload_product_preloader', '#modal_upload_product_button', function(json) {
		$('#shop_product').val(json.id);
		$('#shop_product_filename').val(json.filename);
		$('#upload_product_button .button_preview').remove();
		$('#upload_product_button').append('<div class="button_preview"><img src="/modules/upl/200/' + json.filename + '"></div>').addClass('preview');
		close_modal('#modal_upload_product');
	}, '#upload_product_err');
});

//  █████╗  ██╗   ██╗  █████╗  ████████╗  █████╗  ██████╗  
// ██╔══██╗ ██║   ██║ ██╔══██╗ ╚══██╔══╝ ██╔══██╗ ██╔══██╗ 
// ███████║ ╚██╗ ██╔╝ ███████║    ██║    ███████║ ██████╔╝ 
// ██╔══██║  ╚████╔╝  ██╔══██║    ██║    ██╔══██║ ██╔══██╗ 
// ██║  ██║   ╚██╔╝   ██║  ██║    ██║    ██║  ██║ ██║  ██║ 
// ╚═╝  ╚═╝    ╚═╝    ╚═╝  ╚═╝    ╚═╝    ╚═╝  ╚═╝ ╚═╝  ╚═╝ 

function avatar_filter(e, filter) {
	const id = $(e).attr('data-image-id');

	const data = {
		id: id,
		filter: filter
	};

	ajax_request('avatar', 'filter', data, function(json) {
		console.log(json);
	});
}

function avatar_sam(i) {
	const btn = preload_btn(i);

	const data = get_data(['avatar', 'avatar_filename']);

	ajax_request('avatar', 'sam', data, function(json) {
		$('#profile .profile_avatar').removeClass('none');
		$('#profile .profile_avatar img').attr('src', '/modules/upl/' + json.size + '/' + data.avatar_filename);

		$('#avatar_preview .button_preview').remove();
		$('#avatar_preview').html('<div class="button_preview"><img id="avatar_preview_img" src="/modules/upl/160/' + data.avatar_filename + '"></div>');

		$('.filters_block').removeClass('active').eq(0).addClass('active');
		$('.filters_block img').attr('src', '/modules/upl/160/' + data.avatar_filename).attr('data-image-id', data.avatar);

		loadImage('/modules/upl/160/' + data.avatar_filename);
	});
}

function avatar_cover() {
	const data = get_data(['cover', 'cover_filename']);

	ajax_request('avatar', 'cover', data, function(json) {
		$('#profile .profile_cover img, #cover_preview .button_preview').remove();
		$('#cover_preview').html('<div class="button_preview"><img src="/modules/upl/660/' + data.cover_filename + '"></div>');
		$('#profile .profile_cover').html('<img src="/modules/upl/660/' + data.cover_filename + '">');

		$('#cover_button_delete').fadeIn(100);
	});
}

function avatar_cover_delete(e) {
	ajax_request('avatar', 'cover_delete', {}, function(json) {
		$('#profile .profile_cover img, #cover_preview img').remove();
		$('#cover_button_delete').fadeOut(100);

		show_msg(json.success);
	});
}

$(document).on('change', '#upload_avatar_file', function() {
	$('#upload_avatar').submit();
});

$(document).on('submit', '#upload_avatar', function(e) {
	e.preventDefault();

	upload_file(this, '/apps/avatar_upload.app.php', '#upload_avatar_preloader', '#modal_upload_button', function(json) {
		$('#avatar').val(json.id);
		$('#avatar_filename').val(json.filename);
		avatar_sam();
		close_modal('#modal_upload_avatar');
	}, '#upload_err');
});

$(document).on('change', '#upload_avatar_cover_file', function() {
	$('#upload_avatar_cover').submit();
});

$(document).on('submit', '#upload_avatar_cover', function(e) {
	e.preventDefault();

	upload_file(this, '/apps/avatar_cover_upload.app.php', '#upload_avatar_cover_preloader', '#modal_upload_avatar_cover_button', function(json) {
		$('#cover').val(json.id);
		$('#cover_filename').val(json.filename);
		avatar_cover();
		close_modal('#modal_upload_avatar_cover');
	}, '#upload_avatar_cover_err');
});

//  ██████╗ ████████╗  █████╗  ████████╗  ██████╗ 
// ██╔════╝ ╚══██╔══╝ ██╔══██╗ ╚══██╔══╝ ██╔════╝ 
// ╚█████╗     ██║    ███████║    ██║    ╚█████╗  
//  ╚═══██╗    ██║    ██╔══██║    ██║     ╚═══██╗ 
// ██████╔╝    ██║    ██║  ██║    ██║    ██████╔╝ 
// ╚═════╝     ╚═╝    ╚═╝  ╚═╝    ╚═╝    ╚═════╝  

$(document).on({
	mouseenter: function () {
		let c = $(this).attr('data-stats-id'),
			d = $('#stats_number_' + c),
			f = $('#stats_unreg_' + c),
			j = $('#stats_period_' + c);

		let a = $(this).attr('data-stats-number'),
			b = $(this).attr('data-stats-unreg'),
			g = $(this).attr('data-stats-percent'),
			h = $(this).attr('data-stats-period');

		d.html(a + (g != 0 ? '<span class="' + (g < 0 ? 'minus' : 'plus') + '">' + g + '%</span>' : ''));
		f.text(b);
		j.text(h);
	},
	mouseleave: function () {
		let c = $(this).attr('data-stats-id'),
			d = $('#stats_number_' + c),
			f = $('#stats_unreg_' + c),
			j = $('#stats_period_' + c);

		d.html($(this).attr('data-stats-number-all'));
		f.text($(this).attr('data-stats-unreg-all'));
		j.text('');
	}
}, '.bar_stats_graph_pic');

function stats_reload(mode, e) {
    var a = $(e),
        b = a.parents('.select_mini'),
        c = b.find('.select_mini_li');

    b.addClass('select_mini_preloader').removeClass('active');
    c.removeClass('active');
    a.addClass('active');

    $.ajax({
        type: 'POST',
        url: '/apps/reloads/stats.app.php',
        data: { mode: mode },

        success: function(html) {
            b.removeClass('select_mini_preloader');

            $('#stats').empty().append(html);
        },

        error: function(error) {
            b.removeClass('select_mini_preloader');

            console.log(error);
        }
    });
}

function stats(pid, type, options = 0) {
	var data = {
		pid: pid,
		type: type,
		options: options
	};

	ajax_request('stats', 'update', data, function(json) {
		console.log(json);
	});
}

//  █████╗   █████╗  ██╗       █████╗  ██████╗  
// ██╔══██╗ ██╔══██╗ ██║      ██╔══██╗ ██╔══██╗ 
// ██║  ╚═╝ ██║  ██║ ██║      ██║  ██║ ██████╔╝ 
// ██║  ██╗ ██║  ██║ ██║      ██║  ██║ ██╔══██╗ 
// ╚█████╔╝ ╚█████╔╝ ███████╗ ╚█████╔╝ ██║  ██║ 
//  ╚════╝   ╚════╝  ╚══════╝  ╚════╝  ╚═╝  ╚═╝ 

function color_hex_to_rgb(hex) {
	let result;

	if (hex.length === 3) {
		result = hex.match(/^([a-f\d])([a-f\d])([a-f\d])$/i).slice(1);
		result = result.map(x => x + x);
	} else if (hex.length === 6) {
		result = hex.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).slice(1);
	}

	return {
		r: parseInt(result[0], 16),
		g: parseInt(result[1], 16),
		b: parseInt(result[2], 16)
	};
}

$(document).ready(function () {
	let colorPicker;
	const colorSquare = $('<div id="color-square" class="color-square"><div id="color-indicator" class="indicator" style="background-color: white;"></div></div>');
	const hueSlider = $('<div id="hue-slider" class="hue-slider"><div id="hue-indicator" class="indicator" style="top: 16px; background-color: red;"></div></div>');
	const colorHex = $('<input type="text" id="color-hex" class="input micro">');
	const predefinedColorsContainer = $('<div class="predefined-colors"></div>');
	let hue = 200;
	let s = 0.5;
	let v = 0.5;
	let activeInput = null;

	// Конвертація HSV в RGB
	function hsvToRgb(h, s, v) {
		let r, g, b;
		const i = Math.floor(h * 6);
		const f = h * 6 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	// Конвертація RGB в Hex
	function rgbToHex(r, g, b) {
		return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
	}

	// Конвертація Hex в RGB
	function hexToRgb(hex) {
		const bigint = parseInt(hex.slice(1), 16);
		return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
	}

	// Конвертація RGB в HSV
	function rgbToHsv(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const d = max - min;
		const s = max === 0 ? 0 : d / max;
		const v = max;
		let h;

		if (max === min) {
			h = 0;
		} else {
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [h, s, v];
	}

	// Оновлення кольорового квадрата
	function updateColorSquare() {
		colorSquare.css('background', `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0)), hsl(${hue}, 100%, 50%)`);
	}

	// Оновлення індикатора
	function updateIndicator(indicator, x, y, color) {
		indicator.css({
			left: `${x}px`,
			top: `${y}px`,
			backgroundColor: color
		});
	}

	// Функція для оновлення кольору
	function updateColor() {
		const rgb = hsvToRgb(hue / 360, s, v);
		const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
		colorHex.val(hex);
		updateActiveInput();
		updateIndicator(colorSquare.find('.indicator'), s * colorSquare.width(), (1 - v) * colorSquare.height(), hex);
		// console.log(`Color updated to: ${hex}`);
	}

	// Оновлення активного інпуту
	function updateActiveInput() {
		if (activeInput) {
			const hex = colorHex.val();
			$(activeInput).val(hex).trigger('input');
			$(`#${$(activeInput).attr('id')}-preview`).css('background-color', hex);
			// console.log(`Active input updated with color: ${hex}`);
		}
	}

	// Обробка руху індикатора
	function handleMovement(e, element, type) {
		const offset = element.offset();
		const x = (e.pageX || e.originalEvent.touches[0].pageX) - offset.left;
		const y = (e.pageY || e.originalEvent.touches[0].pageY) - offset.top;
		const boundedX = Math.max(0, Math.min(element.width(), x));
		const boundedY = Math.max(0, Math.min(element.height(), y));
		if (type === 'hue') {
			hue = (boundedX / element.width()) * 360;
			updateColorSquare();
			updateIndicator(hueSlider.find('.indicator'), boundedX, element.height() / 2, `hsl(${hue}, 100%, 50%)`);
		} else if (type === 'square') {
			s = boundedX / element.width();
			v = 1 - boundedY / element.height();
		}
		updateColor();
		return { x: boundedX, y: boundedY };
	}

	// Слухач подій для руху індикатора відтінків
	hueSlider.on('mousedown touchstart', function (e) {
		e.preventDefault(); // Додаємо для запобігання прокрутці на мобільних
		const moveIndicator = e => {
			e.preventDefault(); // Додаємо для запобігання прокрутці на мобільних
			handleMovement(e, hueSlider, 'hue');
		};
		moveIndicator(e);
		$(document).on('mousemove touchmove', moveIndicator);
		$(document).on('mouseup touchend', () => $(document).off('mousemove touchmove', moveIndicator));
	});

	// Слухач подій для руху кольорового квадрата
	colorSquare.on('mousedown touchstart', function (e) {
		e.preventDefault(); // Додаємо для запобігання прокрутці на мобільних
		const moveIndicator = e => {
			e.preventDefault(); // Додаємо для запобігання прокрутці на мобільних
			handleMovement(e, colorSquare, 'square');
		};
		moveIndicator(e);
		$(document).on('mousemove touchmove', moveIndicator);
		$(document).on('mouseup touchend', () => $(document).off('mousemove touchmove', moveIndicator));
	});

	// Оновлення кольору за введенням Hex значення
	function updateFromHexInput(hex) {
		if (/^#[0-9A-F]{6}$/i.test(hex)) {
			const rgb = hexToRgb(hex);
			const hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]);
			hue = hsv[0] * 360;
			s = hsv[1];
			v = hsv[2];
			const hueX = (hue / 360) * hueSlider.width();
			updateIndicator(hueSlider.find('.indicator'), hueX, hueSlider.height() / 2, `hsl(${hue}, 100%, 50%)`);
			updateColorSquare();
			updateColor();
		}
	}

	colorHex.on('input', function () {
		const hex = $(this).val();
		updateFromHexInput(hex);
	});

	$(document).on('input', '.color-input', function () {
		const hex = $(this).val();
		updateFromHexInput(hex);
		$(this).next('.color-display').css('background-color', hex);
	});

	// Встановлення початкового кольору
	function setInitialColor() {
		$('.color-input').each(function () {
			const hex = $(this).val();
			if (/^#[0-9A-F]{6}$/i.test(hex)) {
				$(this).next('.color-display').css('background-color', hex);
				// console.log(`Initial color set for input: ${hex}`);
			}
		});
	}

	// Додавання кольорів з data атрибуту
	function addPredefinedColors(colors) {
		predefinedColorsContainer.empty().show();
		if (colors) {
			const colorArray = colors.split(',');
			colorArray.forEach(color => {
				const colorSquare = $(`<div class="predefined-color" style="background-color: ${color};"></div>`);
				predefinedColorsContainer.append(colorSquare);

				colorSquare.on('click', function () {
					colorHex.val(color);
					updateFromHexInput(color);
					updateActiveInput();
				});
			});
		} else {
			predefinedColorsContainer.hide();
		}
	}

	// Показ палітри кольорів
	function showColorPicker(element, isButton = false, button = null) {
		if (!colorPicker) {
			colorPicker = $('<div id="color-picker" class="color-picker"></div>').append(colorSquare).append(hueSlider).append(colorHex).append(predefinedColorsContainer).appendTo('body');
		}
		activeInput = element;
		let offset;
		if (isButton && button) {
			offset = $(button).offset();
			colorPicker.css({
				// top: offset.top + $(button).outerHeight(),
				// left: offset.left
				left: '30px',
				bottom: '30px'
			}).fadeIn();
		} else {
			offset = $(element).offset();
			colorPicker.css({
				// top: offset.top + $(element).outerHeight(),
				// left: offset.left
				left: '30px',
				bottom: '30px'
			}).fadeIn();
		}
		const hex = $(element).val();
		const predefinedColors = $(element).data('colors');
		addPredefinedColors(predefinedColors);
		if (/^#[0-9A-F]{6}$/i.test(hex)) {
			colorHex.val(hex);
			const rgb = hexToRgb(hex);
			const hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]);
			hue = hsv[0] * 360;
			s = hsv[1];
			v = hsv[2];
			const hueX = (hue / 360) * hueSlider.width();
			updateIndicator(hueSlider.find('.indicator'), hueX, hueSlider.height() / 2, `hsl(${hue}, 100%, 50%)`);
			updateColorSquare();
			updateColor();
		}
	}

	// Закриття палітри кольорів при кліку поза нею
	$(document).on('click', function (e) {
		if (!$(e.target).closest('.color-picker, .color-input, .color-picker-button').length) {
			if (colorPicker) colorPicker.fadeOut();
		}
	});

	setInitialColor();

	// Показ палітри кольорів при фокусі на інпуті
	$(document).on('focus', '.color-input', function () {
		showColorPicker(this);
	});

	// Показ палітри кольорів при натисканні на кнопку
	$(document).on('click', '.color-picker-button', function () {
		const target = $($(this).data('target'));
		showColorPicker(target, true, this);
	});

	// Запобігання закриття палітри при кліку на ній
	$(document).on('click', '#color-picker', function (e) {
		e.stopPropagation();
	});
});

//  █████╗   █████╗  ██╗       █████╗  ██████╗   ██████╗ 
// ██╔══██╗ ██╔══██╗ ██║      ██╔══██╗ ██╔══██╗ ██╔════╝ 
// ██║  ╚═╝ ██║  ██║ ██║      ██║  ██║ ██████╔╝ ╚█████╗  
// ██║  ██╗ ██║  ██║ ██║      ██║  ██║ ██╔══██╗  ╚═══██╗ 
// ╚█████╔╝ ╚█████╔╝ ███████╗ ╚█████╔╝ ██║  ██║ ██████╔╝ 
//  ╚════╝   ╚════╝  ╚══════╝  ╚════╝  ╚═╝  ╚═╝ ╚═════╝  

function colors_reload(general, text, content) {
	[general, text, content].forEach((color, i) => {
		if (/^#[0-9A-F]{6}$/i.test(color)) {
			arguments[i] = color.replace(/#/g, '');
		}
	});

	const color_rgb = color_hex_to_rgb(general);
	const gray = 0.299 * color_rgb['r'] + 0.587 * color_rgb['g'] + 0.114 * color_rgb['b'];
	const isLight = gray > 160;
	const fillColor = isLight ? '#000' : '#FFF';
	const bgColor = isLight ? '#' + general : `rgba(${color_rgb.r}, ${color_rgb.g}, ${color_rgb.b}, .08)`;
	const borderColor = isLight ? '#' + general : `rgba(${color_rgb.r}, ${color_rgb.g}, ${color_rgb.b}, .16)`;

	$('#profile .profile_target:not(.custom)').css({'color': fillColor, 'background-color': '#' + general, 'border-color': '#' + general});
	$('#profile .profile_verify svg *').eq(1).css('fill', fillColor);
	$('#profile .profile_verify svg *').eq(0).css('fill', '#' + general);

	$('#profile .nets_block:not(.custom) path, #profile .nets_block:not(.custom) circle').css('fill', isLight ? '#000' : '#' + general);
	$('#profile .nets_block:not(.custom)').toggleClass('is_gray', !isLight).css('background-color', bgColor);

	$('#profile .profile_descr a, #profile .profile_faqs_descr a').css({'color': fillColor, 'background-color': '#' + general});

	$('#profile_faqs .profile_faqs_block').css('border-color', borderColor);

	if (gray > 160) {
		$('#profile .profile_faqs_arrow path').css('fill', '#000');
	} else {
		$('#profile .profile_faqs_arrow path').css('fill', '#' + general);
	}

	if (!$('#profile .nets_group').hasClass('line')) {
		$('#profile .nets_block span').css('color', '#000');
		$('#profile .nets_block.is_gray span').css('color', '#' + text);
	}

	$('#profile .profile_info').css('color', '#' + text);

	$('#profile .profile').css('background-color', '#' + content);
	$('#profile .profile_avatar img').css('border-color', '#' + content);
}

function colors_sam(i, jin) {
	const btn = preload_btn(i);

	const data = get_data(['general_color', 'text_color', 'content_color']);

	data.image_id = $('#bg_image_id').val();
	data.bg_type = $('#bg_type').val();
	data.bg_color = $('#bg_color').val();

	ajax_request('colors', 'sam', data, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 0);
		}

		show_msg(json.success);
		colors_reload(data['general_color'], data['text_color'], data['content_color']);
		bg_reload();
	}, btn);
}

// - - - General.

function color_general_portal(color) {
	$('#colors_portal .portal_colors_nets_icon').css('background-color', '#' + color);
}

function color_pallet(func, e) {
	let a = $('#color_pallet');

	if (func == 'open') {
		a.fadeIn(300);

		if (e) {
			$('#general_color_pal .bar_pal').removeClass('active');
			$(e).addClass('active');
		}
	}

	if (func == 'close') {
		a.fadeOut(0);
	}
}

function general_set_color(color) {
	let a = $('#general_color_pal .bar_pal[data-color="' + color + '"]');

	$('#general_color_pal .bar_pal').removeClass('active');

	if (a.length > 0) {
		a.addClass('active');
	} else {
		$('#general_color_pal .bar_pal.multic').addClass('active');
	} 

	$('#general_color').val('#' + color);

	color_general_portal(color);
}

$(document).on('input', '#general_color', function () {
	let hex = $(this).val();

	if (/^#[0-9A-F]{6}$/i.test(hex)) {
		hex = hex.replace(/#/g, '');

		general_set_color(hex);
	}
});

// - - - Text Color.

function color_text_portal(color) {
	$('#colors_portal .portal_colors_text').css('color', '#' + color);
}

function color_text_pallet(func, e) {
	let a = $('#color_text_pallet');

	if (func == 'open') {
		a.fadeIn(300);

		if (e) {
			$('#text_color_pal .bar_pal').removeClass('active');
			$(e).addClass('active');
		}
	}

	if (func == 'close') {
		a.fadeOut(0);
	}
}

function text_set_color(color) {
	let a = $('#text_color_pal .bar_pal[data-color="' + color + '"]');

	$('#text_color_pal .bar_pal').removeClass('active');

	if (a.length > 0) {
		a.addClass('active');
	} else {
		$('#text_color_pal .bar_pal.multic').addClass('active');
	} 

	$('#text_color').val('#' + color);

	color_text_portal(color);
}

$(document).on('input', '#text_color', function () {
	let hex = $(this).val();

	if (/^#[0-9A-F]{6}$/i.test(hex)) {
		hex = hex.replace(/#/g, '');

		text_set_color(hex);
	}
});

// - - - Content Color.

function color_content_portal(color) {
	$('#colors_portal .portal_colors_content').css('background-color', '#' + color);
}

function color_content_pallet(func, e) {
	let a = $('#color_content_pallet');

	if (func == 'open') {
		a.fadeIn(300);

		if (e) {
			$('#content_color_pal .bar_pal').removeClass('active');
			$(e).addClass('active');
		}
	}

	if (func == 'close') {
		a.fadeOut(0);
	}
}

function content_set_color(color) {
	let a = $('#content_color_pal .bar_pal[data-color="' + color + '"]');

	$('#content_color_pal .bar_pal').removeClass('active');

	if (a.length > 0) {
		a.addClass('active');
	} else {
		$('#content_color_pal .bar_pal.multic').addClass('active');
	} 

	$('#content_color').val('#' + color);

	color_content_portal(color);
}

$(document).on('input', '#content_color', function () {
	let hex = $(this).val();

	if (/^#[0-9A-F]{6}$/i.test(hex)) {
		hex = hex.replace(/#/g, '');

		content_set_color(hex);
	}
});

// - - - Bg Color.

function bg_reload() {
	reload_content('bg', null, function(html) {
		var json = JSON.parse(html);

		if (json.process == 1) {
			if (json.filename !== '' && json.filename != 0) {
				$('body').css('background-image', 'url(\'/modules/upl/bg/' + json.filename + '\')');
			} else if (json.color !== '') {
				$('body').css({'background-color': '#' + json.color, 'background-image': 'none'});
			}
		}
	});
}

function bg_color_type(func) {
	let a = $('#bg_color_type'),
		b = $('#bg_image_type');

	if (func == 'open') {
		a.fadeIn(300);
		b.fadeOut(0);

		var button_text = $('#bg_button').attr('data-load');

		$('#bg_button').text(button_text);
		$('#bg_image_id').val('0');
		$('#bg_image_filename').val('');
	}

	if (func == 'close') {
		b.fadeIn(300);
		a.fadeOut(0);
	}
}

function color_bg_portal(a) {
	$('#colors_portal').css({'background-color': '#' + a, 'background-image': 'none'});
}

function bg_set_color(color) {
	let a = $('#bg_color_pal .bar_pal[data-color="' + color + '"]');

	$('#bg_color_pal .bar_pal').removeClass('active');

	if (a.length > 0) {
		a.addClass('active');
	} else {
		$('#bg_color_pal .bar_pal.multic').addClass('active');
	} 

	$('#bg_color').val('#' + color);

	color_bg_portal(color);
}

function color_bg_pallet(func, e) {
	let a = $('#color_bg_pallet');

	if (func == 'open') {
		a.fadeIn(300);

		if (e) {
			$('#bg_color_pal .bar_pal').removeClass('active');
			$(e).addClass('active');
		}
	}

	if (func == 'close') {
		a.fadeOut(0);
	}
}

$(document).on('change', '#upload_bg_file', function() {
	$('#upload_bg').submit();
});

$(document).on('submit', '#upload_bg', function(e) {
	e.preventDefault();

	upload_file(this, '/apps/bg_upload.app.php', '#upload_bg_preloader', '#modal_upload_bg_button', function(json) {
		var button_text = $('#bg_button').attr('data-edit');
		$('#bg_button').text(button_text);
		$('#colors_portal').css('background-image', 'url(\'/modules/upl/bg/' + json.filename + '\')');
		$('#bg_image_id').val(json.id);
		$('#bg_image_filename').val(json.filename);
		close_modal('#modal_upload_bg');
	}, '#upload_bg_err');
});

$(document).on('input', '#bg_color', function () {
	let hex = $(this).val();

	if (/^#[0-9A-F]{6}$/i.test(hex)) {
		hex = hex.replace(/#/g, '');

		bg_set_color(hex);
	}
});

// ███╗  ██╗  █████╗  ████████╗ ██╗ ███████╗  ██████╗ 
// ████╗ ██║ ██╔══██╗ ╚══██╔══╝ ██║ ██╔════╝ ██╔════╝ 
// ██╔██╗██║ ██║  ██║    ██║    ██║ █████╗   ╚█████╗  
// ██║╚████║ ██║  ██║    ██║    ██║ ██╔══╝    ╚═══██╗ 
// ██║ ╚███║ ╚█████╔╝    ██║    ██║ ██║      ██████╔╝ 
// ╚═╝  ╚══╝  ╚════╝     ╚═╝    ╚═╝ ╚═╝      ╚═════╝  

function notifs(e) {
	let el = $(e).children('.burg_bar');
	el.toggleClass('active');
	$('#notifications').toggleClass('active', el.hasClass('active'));
}

// ███╗   ███╗  ██████╗  ██████╗  
// ████╗ ████║ ██╔════╝ ██╔════╝  
// ██╔████╔██║ ╚█████╗  ██║  ██╗  
// ██║╚██╔╝██║  ╚═══██╗ ██║  ╚██╗ 
// ██║ ╚═╝ ██║ ██████╔╝ ╚██████╔╝ 
// ╚═╝     ╚═╝ ╚═════╝   ╚═════╝  

$(function() {
	$('.msg').addClass('active');

	$(document).on('click', '.msg', function() {
		let e = $(this),
			url = e.attr('data-url');

		$('.msg').removeClass('active');

		if (url) {
			history.replaceState(null, null, '/' + url);
		}
	});
});

function show_msg(txt, type = false) {
	let rand = Math.floor(Math.random() * 999) + 1;

	$('.msg').removeClass('active');

	if (type) {
		$('body').prepend('<div class="msg msg_' + rand + ' red">' + txt + '</div>');	
	} else {
		$('body').prepend('<div class="msg msg_' + rand + '">' + txt + '</div>');
	}

	setTimeout(() => {
		$('.msg_' + rand).addClass('active');
	}, 100);

	setTimeout(() => {
		$('.msg_' + rand).removeClass('active');
	}, 5000);
}

// ██████╗   █████╗  ██████╗  ██████╗  ██╗      ███████╗ 
// ██╔══██╗ ██╔══██╗ ██╔══██╗ ██╔══██╗ ██║      ██╔════╝ 
// ██████╔╝ ███████║ ██║  ██║ ██║  ██║ ██║      █████╗   
// ██╔═══╝  ██╔══██║ ██║  ██║ ██║  ██║ ██║      ██╔══╝   
// ██║      ██║  ██║ ██████╔╝ ██████╔╝ ███████╗ ███████╗ 
// ╚═╝      ╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ╚══════╝ ╚══════╝ 

function paddle_pause(i) {
	var btn = preload_btn(i);
	var data = {
		reason_pause: $('#reason_pause').val()
	};

	$('#reason_pause').removeClass('err');

	ajax_request('paddle', 'pause', data, function(json) {
		jin_sam();
	}, btn);
}

function paddle_cancel(i) {
	var btn = preload_btn(i);
	var data = {
		reason_pause: $('#reason_pause').val()
	};

	$('#reason_pause').removeClass('err');

	ajax_request('paddle', 'cancel', data, function(json) {
		jin_sam();
	}, btn);
}

function paddle_start(i) {
	var btn = preload_btn(i);

	ajax_request('paddle', 'start', {}, function(json) {
		jin_sam();
	}, btn);
}

function paddle_activation() {
	ajax_request('paddle', 'activation', {}, function(json) {
		location.reload();
	});
}

function paddle_plan(i) {
	var btn = preload_btn(i);
	var plan_id = $('#plan_id').val();
	var period_id = $('#period_id').val();
	var paddle_plan = [
		[832568, 832570, 832572],
		[832569, 832571, 832573]
	];

	var paddle_id = paddle_plan[period_id][plan_id];

	var data = {
		plan: paddle_id
	};

	ajax_request('paddle', 'plan', data, function(json) {
		jin_sam();
	}, btn);
}

function paddle_pay() {
	var plan_id = $('#plan_id').val();
	var period_id = $('#period_id').val();
	var paddle_plan = [
		[832568, 832570, 832572],
		[832569, 832571, 832573]
	];

	var paddle_id = paddle_plan[period_id][plan_id];

	jin_edit_window(91, paddle_id);

	jin_burger_back();
}

// ██╗ ███╗  ██╗ ███████╗  █████╗  ██████╗   █████╗   ██████╗  ███████╗  ██████╗ 
// ██║ ████╗ ██║ ██╔════╝ ██╔══██╗ ██╔══██╗ ██╔══██╗ ██╔════╝  ██╔════╝ ██╔════╝ 
// ██║ ██╔██╗██║ █████╗   ██║  ██║ ██████╔╝ ███████║ ██║  ██╗  █████╗   ╚█████╗  
// ██║ ██║╚████║ ██╔══╝   ██║  ██║ ██╔═══╝  ██╔══██║ ██║  ╚██╗ ██╔══╝    ╚═══██╗ 
// ██║ ██║ ╚███║ ██║      ╚█████╔╝ ██║      ██║  ██║ ╚██████╔╝ ███████╗ ██████╔╝ 
// ╚═╝ ╚═╝  ╚══╝ ╚═╝       ╚════╝  ╚═╝      ╚═╝  ╚═╝  ╚═════╝  ╚══════╝ ╚═════╝  

function infopages_sam(i, extra_data) {
	const btn = preload_btn(i);

	const data = get_data(['title', 'subtitle', 'url', 'button_title', 'button_type']);

	data.image = $('#infopages_image_id').val();
	data.descr = $('#editor').html();
	data.button_value = $('#button_value_' + data.button_type).val();
	data.phone_type = $('#phone_number_type input[name="radio"]:checked').val();
	data.button_on = $('#button_on').is(':checked') ? 1 : 0;

	$('#title, #descr, #button_title, #button_value_prefix_' + data.button_type + ', #button_value_' + data.button_type).removeClass('err');

	ajax_request('infopages', 'sam', data, function(json) {
		if (extra_data && extra_data.jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 98);
		}

		// shop_reload();
		show_msg(json.success);
	}, btn, extra_data);
}

function infopages_button_on(e) {
	let a = $('#infopages_button_on'),
		b = $(e).siblings('input');

	if (b.is(':checked')) {
		a.fadeOut(0);
	} else {
		a.fadeIn(300);
	}
}

function infopages_url(url) {
	var data = { url: url };

	ajax_request('infopages', 'url', data, function(html) {
		var json = JSON.parse(html);

		if (json.process == 1) {
			$('#infopages_url_result').html('<div class="bar_status scs">' + json.success + '</div>');
		} else {
			if (json.errs && json.errs.err_url) {
				$('#infopages_url_result').html('<div class="bar_status err">' + json.errs.err_url + '</div>');
			}
		}
	}, null, null, true);
}

function infopages_delete(i, id, jin) {
	var btn = preload_btn(i);

	ajax_request('infopages', 'delete', { id: id }, function(json) {
		if (jin) {
			jin_sam();
		} else {
			bar_slide('prev', 1, 44);
		}

		show_msg(json.success);
	}, btn);
}

$(function() {
	$(document).on('change keyup input', '.infopages_url', function() {
		infopages_url($(this).val());
	});
});

$(document).on('change', '#upload_infopages_file', function() {
	$('#upload_infopages').submit();
});

$(document).on('submit', '#upload_infopages', function(e) {
	e.preventDefault();

	upload_file(this, '/apps/infopages_upload.app.php', '#upload_infopages_preloader', '#modal_upload_infopages_button', function(json) {
		$('#infopages_image_id').val(json.id);
		$('#infopages_filename').val(json.filename);
		$('#upload_infopages_button .button_preview').remove();
		$('#upload_infopages_button').append('<div class="button_preview"><img src="/modules/upl/500/' + json.filename + '"></div>').addClass('preview');
		close_modal('#modal_upload_infopages');
	}, '#upload_infopages_err');
});