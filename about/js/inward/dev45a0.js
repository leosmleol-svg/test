function profile_load(id) {
	load_content(118, id, 2);
}

function profile_ban(i, id) {
	var btn = preload_btn(i);
	ajax_request('dev', 'profile_ban', { id: id }, function(json) {
		if (json.status == 0) {
			show_msg('Успішно розблоковано.');
		} else {
			show_msg('Успішно заблоковано.');
		}

		bar_slide('next', 2, 42);
	}, btn);
}










function stats_dev_reload(date_from, date_to, e) {
	var a = $(e),
		b = a.parents('.select_mini'),
		c = b.find('.select_mini_li');

	b.addClass('select_mini_preloader').removeClass('active');
	c.removeClass('active');
	a.addClass('active');

	if (a.hasClass('range')) {
		$('#range').fadeIn(100);
	} else {
		$('#range').fadeOut(0);
	}

	$.ajax({
		type: 'POST',
		url: '/apps/reloads/stats_dev.app.php',
		data: {
			date_from: date_from,
			date_to: date_to
		},

		success: function(html) {
			$('#stats_dev').empty().append(html);

			b.removeClass('select_mini_preloader');
		},

		error: function(error) {
			b.removeClass('select_mini_preloader');

			console.log(error);
		}
	});
}

function pro_save(i) {
	var btn = preload_btn(i);
	var login = $('#login').val();
	var pro_now = $('#pro_now');
	var pro_plan = $('#pro_plan').val();
	var pro_date = $('#pro_date').val();
	var ver_now = $('#ver_now');
	var ver_status = $('#ver_status').val();

	if (pro_now.is(':checked')) {
		pro_now = 1;
	} else {
		pro_now = 0;
	}

	if (ver_now.is(':checked')) {
		ver_now = 1;
	} else {
		ver_now = 0;
	}

	$('#login').removeClass('err');

	$.ajax({
		type: 'POST',
		url: '/apps/pro_save.app.php',
		data: {
			login: login,
			pro_now: pro_now,
			pro_plan: pro_plan,
			pro_date: pro_date,
			ver_now: ver_now,
			ver_status: ver_status
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				bar_slide('prev', 2, 113);
			} else {
				if (json.errs.err_login) {
					$('#login').addClass('err');

					$('#pro_err').html('<div class="error">' + json.errs.err_login + '</div>');
				}
			}

			console.log(json);

			restore_btn(btn);
		},

		error: function(error) {
			console.log(error);

			restore_btn(btn);
		}
	});
}

function hobby_edit_save(i) {
	var btn = preload_btn(i);
	var name = $('#name').val();
	var lang = $('#lang').val();

	$('#name').removeClass('err');

	$.ajax({
		type: 'POST',
		url: '/apps/hobby_edit_save.app.php',
		data: {
			name: name,
			lang: lang
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				bar_slide('prev', 1, 55);
			} else {
				if (json.errs.err_name) {
					$('#name').addClass('err');

					$('#hobby_err').html('<div class="error">' + json.errs.err_name + '</div>');
				}
			}

			console.log(json);

			restore_btn(btn);
		},

		error: function(error) {
			console.log(error);

			restore_btn(btn);
		}
	});
}

function hobby_edit_edit(i, id) {
	var btn = preload_btn(i);
	var name = $('#name').val();
	var lang = $('#lang').val();

	$('#name').removeClass('err');

	$.ajax({
		type: 'POST',
		url: '/apps/hobby_edit_edit.app.php',
		data: {
			id: id,
			name: name,
			lang: lang
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				bar_slide('prev', 1, 55);
			} else {
				if (json.errs.err_name) {
					$('#name').addClass('err');

					$('#hobby_err').html('<div class="error">' + json.errs.err_name + '</div>');
				}
			}

			console.log(json);

			restore_btn(btn);
		},

		error: function(error) {
			console.log(error);

			restore_btn(btn);
		}
	});
}

function hobby_edit_load(id) {
	$.ajax({
		type: 'POST',
		url: '/incs/bar/bar_57.inc.php',
		data: {
			id: id
		},

		success: function(html) {
			$('#bar_level_2 .bar_scroll').empty().append(html);

			console.log(html);
		},

		error: function(error) {
			console.log(error);
		}
	});
}
function hobby_edit_delete(i, id) {
	var btn = preload_btn(i);

	$.ajax({
		type: 'POST',
		url: '/apps/hobby_edit_delete.app.php',
		data: {
			id: id
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				bar_slide('prev', 1, 55);

				show_msg(json.success);
			}

			restore_btn(btn);
		},

		error: function(error) {
			console.log(error);

			restore_btn(btn);
		}
	});
}