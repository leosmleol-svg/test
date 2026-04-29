$(function() {
	$(document).on('keydown', '#login_form input', function(e) {
		if (e.keyCode === 13) {
			$('#login_form .button').click();
		}
	});

	$(document).on('keydown', '#steps_1 input', function(e) {
		if (e.keyCode === 13) {
			$('#steps_button_3').click();
		}
	});

	$(document).on('keydown', '#steps_2 input', function(e) {
		if (e.keyCode === 13) {
			$('#steps_button_1').click();
		}
	});

	$(document).on('keydown', '#steps_3 input', function(e) {
		if (e.keyCode === 13) {
			$('#steps_button_2').click();
		}
	});

	$(document).on('keydown', '#steps_4 input', function(e) {
		if (e.keyCode === 13) {
			$('#steps_button_4').click();
		}
	});

	$(document).on('keydown', '#password_form input', function(e) {
		if (e.keyCode === 13) {
			$('#password_form .button').click();
		}
	});

	$(document).on('keydown', '#password_edit input', function(e) {
		if (e.keyCode === 13) {
			$('#password_edit .button').click();
		}
	});
});

function index_login(e) {
	var a = $('#login').val();

	$(location).attr('href', '/reg?login=' + a);
}

$(document).on('keydown', '#index_login input', function(e) {
	if (e.keyCode === 13) {
		index_login();
	}
});

function login(i) {
	var btn = preload_btn(i);
	var email = $('#email').val();
	var password = $('#password').val();

	$('#email').removeClass('err');
	$('#password').removeClass('err');

	$.ajax({
		type: 'POST',
		url: '/apps/login.app.php',
		data: {
			email: email,
			password: password
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				$(location).attr('href', '/' + json.url);
			} else {
				if (json.errs.err_all) {
					$('#email').addClass('err');
					$('#password').addClass('err');

					$('#steps_err_1').html('<div class="error">' + json.errs.err_all + '</div>');
				} else {
					if (json.errs.err_email) {
						$('#email').addClass('err');

						$('#steps_err_1').html('<div class="error">' + json.errs.err_email + '</div>');
					}

					if (json.errs.err_password) {
						$('#password').addClass('err');

						$('#steps_err_1').html('<div class="error">' + json.errs.err_password + '</div>');
					}
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

function steps_1(i) {
	var btn = preload_btn(i);
	var email = $('#email').val();

	$('#email').removeClass('err');

	$.ajax({
		type: 'POST',
		url: '/apps/steps/step_1.app.php',
		data: {
			email: email
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				$('#steps_err_1').html('');
				$('#steps_2').fadeOut(0);
				$('#steps_3').fadeIn(250);
				$('#fname').focus();
			} else {
				if (json.errs.err_email) {
					$('#email').addClass('err');

					$('#steps_err_1').html('<div class="error">' + json.errs.err_email + '</div>');
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

function steps_2(i) {
	var btn = preload_btn(i);
	var fname = $('#fname').val();
	var lname = $('#lname').val();

	$('#fname').removeClass('err');

	$.ajax({
		type: 'POST',
		url: '/apps/steps/step_2.app.php',
		data: {
			fname: fname,
			lname: lname
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				$('#steps_err_2').html('');
				$('#steps_3').fadeOut(0);
				$('#steps_4').fadeIn(250);
				$('#password').focus();
			} else {
				if (json.errs.err_fname) {
					$('#fname').addClass('err');

					$('#steps_err_2').html('<div class="error">' + json.errs.err_fname + '</div>');
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

function steps_3(i) {
	var btn = preload_btn(i);
	var url = $('#url').val();

	$('#url_prefix').removeClass('err');
	$('#url').removeClass('err');

	$.ajax({
		type: 'POST',
		url: '/apps/steps/step_3.app.php',
		data: {
			url: url
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				$('#steps_err_3').html('');
				$('#steps_1').fadeOut(0);
				$('#steps_2').fadeIn(250);
				$('#email').focus();
			} else {
				if (json.errs.err_url) {
					$('#url_prefix').addClass('err');
					$('#url').addClass('err');

					$('#steps_err_3').html('<div class="error">' + json.errs.err_url + '</div>');
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

function steps_4(i) {
	var btn = preload_btn(i);
	var password = $('#password').val();
	var password_repeat = $('#password_repeat').val();

	$('#password').removeClass('err');
	$('#password_repeat').removeClass('err');

	$.ajax({
		type: 'POST',
		url: '/apps/steps/step_4.app.php',
		data: {
			password: password,
			password_repeat: password_repeat
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				reg();
				$('#steps_err_4').html('');
				$('#steps').addClass('finish');
				$('#steps_4').fadeOut(0);
				$('#steps_5').fadeIn(250);

				dataLayer.push({'event': 'reg'});
			} else {
				if (json.errs.err_all) {
					$('#password').addClass('err');
					$('#password_repeat').addClass('err');

					$('#steps_err_4').html('<div class="error">' + json.errs.err_all + '</div>');
				} else {
					if (json.errs.err_password) {
						$('#password').addClass('err');

						$('#steps_err_4').html('<div class="error">' + json.errs.err_password + '</div>');
					}

					if (json.errs.err_password_repeat) {
						$('#password_repeat').addClass('err');

						$('#steps_err_4').html('<div class="error">' + json.errs.err_password_repeat + '</div>');
					}
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

function reg() {
	var email = $('#email').val();
	var fname = $('#fname').val();
	var lname = $('#lname').val();
	var url = $('#url').val();
	var password = $('#password').val();

	$.ajax({
		type: 'POST',
		url: '/apps/reg.app.php',
		data: {
			email: email,
			fname: fname,
			lname: lname,
			url: url,
			password: password
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				
			} else {
				if (json.errs.err_all) {
					alert(json.errs.err_all);
				}
			}

			console.log(json);
		},

		error: function(error) {
			console.log(error);
		}
	});
}

function steps_5(i) {
	var url = $('#url').val();

	$(location).attr('href', '/' + url);
}

function password(i) {
	var btn = preload_btn(i);
	var email = $('#email').val();

	$('#email').removeClass('err');

	$.ajax({
		type: 'POST',
		url: '/apps/password_new.app.php',
		data: {
			email: email
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				$('#steps').removeClass('login').addClass('finish');
				$('#steps_email').fadeOut(0);
				$('#steps_send').fadeIn(250);
			} else {
				if (json.errs.err_email) {
					$('#email').addClass('err');

					$('#err_email').html('<div class="error">' + json.errs.err_email + '</div>');
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

function password_edit(i) {
	var btn = preload_btn(i);
	var password = $('#password').val();
	var password_repeat = $('#password_repeat').val();

	$('#password').removeClass('err');
	$('#password_repeat').removeClass('err');

	$.ajax({
		type: 'POST',
		url: '/apps/password_edit.app.php',
		data: {
			password: password,
			password_repeat: password_repeat
		},

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				$(location).attr('href', '/');
			} else {
				if (json.errs.err_all) {
					$('#password').addClass('err');
					$('#password_repeat').addClass('err');

					$('#err_password').html('<div class="error">' + json.errs.err_all + '</div>');
				} else {
					if (json.errs.err_password) {
						$('#password').addClass('err');

						$('#err_password').html('<div class="error">' + json.errs.err_password + '</div>');
					}

					if (json.errs.err_password_repeat) {
						$('#password_repeat').addClass('err');

						$('#err_password').html('<div class="error">' + json.errs.err_password_repeat + '</div>');
					}
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

function quit(i) {
	$.ajax({
		url: '/apps/quit.app.php',

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				$(location).attr('href', '/login');
			}

			console.log(json);
		},

		error: function(error) {
			console.log(error);
		}
	});
}

function cookie_ok() {
	$.ajax({
		url: '/apps/cookie.app.php',

		success: function(html) {
			var json = JSON.parse(html);

			if (json.process == 1) {
				$('#cookies').fadeOut(300);
			}

			console.log(json);
		},

		error: function(error) {
			console.log(error);
		}
	});
}

var clr_h = 0,
	clr_s = 100,
	clr_l = 50,
	cntr_coof = 0.5;

function hsl_result() {
	let a = hsl2rgb(clr_h, clr_s, clr_l),
		b = $('#color_h'),
		c = $('#color_s'),
		d = $('#color_l'),
		f = hsl2rgb(clr_h, 100, 50),
		g = hsl2rgb(0, clr_s, clr_l),
		h = hsl2rgb(clr_h, clr_s, 50),
		min = contr_res(g['g']),
		max = contr_res(g['r']),
		c_r_f = contr_res(127),
		c_g_f = contr_res(127),
		c_b_f = contr_res(127),
		c_r_l = contr_res(f['r']),
		c_g_l = contr_res(f['g']),
		c_b_l = contr_res(f['b']);

	$('#color_result').css('background-color', 'rgb(' + a['r'] + ', ' + a['g'] + ', ' + a['b'] + ')');

	color_input(a['r'], a['g'], a['b']);

	b.css('background-image', 'linear-gradient(to right, rgb(' + g['r'] + ', ' + g['g'] + ', ' + g['g'] + '), rgb(' + g['r'] + ', ' + g['r'] + ', ' + g['g'] + '), rgb(' + g['g'] + ', ' + g['r'] + ', ' + g['g'] + '), rgb(' + g['g'] + ', ' + g['r'] + ', ' + g['r'] + '), rgb(' + g['g'] + ', ' + g['g'] + ', ' + g['r'] + '), rgb(' + g['r'] + ', ' + g['g'] + ', ' + g['r'] + '), rgb(' + g['r'] + ', ' + g['g'] + ', ' + g['g'] + '))');
	c.css('background-image', 'linear-gradient(to right, rgb(' + c_r_f + ', ' + c_g_f + ', ' + c_b_f + '), rgb(' + c_r_l + ', ' + c_g_l + ', ' + c_b_l + '))');
	d.css('background-image', 'linear-gradient(to right, rgb(0, 0, 0), rgb(' +  h['r'] + ', ' +  h['g'] + ', ' +  h['b'] + '), rgb(255, 255, 255))');
}

function color_reload() {
	let a = hsl2hex(clr_h, clr_s, clr_l);

	$('#multicolor_input').val('#' + a);

	color_pick(a, '.bar_pal.multic');
}

function contr_coof(step) {
	cntr_coof = step / 100;
}

function color_input(r, g, b) {
	let gray = 0.299 * r + 0.587 * g + 0.114 * b;

	console.log(gray);

	if (gray > 160) {
		$('#multicolor_input').addClass('black');
	} else {
		$('#multicolor_input').removeClass('black');
	}
}

function contr_res(a) {
	let c = cntr_coof * 2;

	if (cntr_coof <= 0.5) {
		a = Math.ceil(a * c);
	} else {
		a = Math.ceil((255 - a) * (c - 1) + a);
	}

	return a;
}

function hsl2rgb(h, s, l) {
	var r, g, b, m, c, x;

	if (!isFinite(h)) h = 0;
	if (!isFinite(s)) s = 0;
	if (!isFinite(l)) l = 0;

	h /= 60;
	if (h < 0) h = 6 - (-h % 6);
	h %= 6;

	s = Math.max(0, Math.min(1, s / 100));
	l = Math.max(0, Math.min(1, l / 100));

	c = (1 - Math.abs((2 * l) - 1)) * s;

	x = c * (1 - Math.abs((h % 2) - 1));

	if (h < 1) {
		r = c;
		g = x;
		b = 0;
	} else if (h < 2) {
		r = x;
		g = c;
		b = 0;
	} else if (h < 3) {
		r = 0;
		g = c;
		b = x;
	} else if (h < 4) {
		r = 0;
		g = x;
		b = c;
	} else if (h < 5) {
		r = x;
		g = 0;
		b = c;
	} else {
		r = c;
		g = 0;
		b = x;
	}

	m = l - c / 2;

	r = Math.round((r + m) * 255);
	g = Math.round((g + m) * 255);
	b = Math.round((b + m) * 255);

	return { r: r, g: g, b: b }
}

function hex2hsl(hex) {
	if (hex.length == 4) {
		var a = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);

		a[1] += a[1];
		a[2] += a[2];
		a[3] += a[3];
	} else if (hex.length == 7) {
		var a = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	}

	r = parseInt(a[1], 16);
	g = parseInt(a[2], 16);
	b = parseInt(a[3], 16);

	r /= 255;
	g /= 255;
	b /= 255;

	var max = Math.max(r, g, b),
		min = Math.min(r, g, b);

	var h, s, l = (max + min) / 2;

	if (max == min) {
		h = s = 0;
	} else {
		var d = max - min;

		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch(max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}

		h /= 6;
	}

	h = Math.round(h * 360);
	s = Math.round(s * 100);
	l = Math.round(l * 100);

	return { h: h, s: s, l: l }
}

function hsl2hex(h, s, l) {
	 h /= 360;
	 s /= 100;
	 l /= 100;
	 let r, g, b;
	 if (s === 0) {
	   r = g = b = l; // achromatic
	 } else {
	   const hue2rgb = (p, q, t) => {
		 if (t < 0) t += 1;
		 if (t > 1) t -= 1;
		 if (t < 1 / 6) return p + (q - p) * 6 * t;
		 if (t < 1 / 2) return q;
		 if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		 return p;
	   };
	   const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	   const p = 2 * l - q;
	   r = hue2rgb(p, q, h + 1 / 3);
	   g = hue2rgb(p, q, h);
	   b = hue2rgb(p, q, h - 1 / 3);
	 }
	 const toHex = x => {
	   const hex = Math.round(x * 255).toString(16);
	   return hex.length === 1 ? '0' + hex : hex;
	 };
	 return `${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function start_nex(hex) {
	if (hex) {
		var a = hex2hsl(hex);
	} else {
		var a = $('#multicolor_input').val();

		a = hex2hsl(a);
	}

	$('#slider_h').slider('value', a['h']);
	$('#slider_s').slider('value', a['s']);
	$('#slider_l').slider('value', a['l']);
}

$(document).on('input', '#multicolor_input', function() {
	let a = $( this ).val();

	if (a.length == 4 || a.length == 7) {
		start_nex(a);

		a = a.replace('#', '');

		if (!a.hasClass('not')) {
			color_pick(a, '.bar_pal.multic');
		}
	}
});

function calendly_list(link) {
	var a = $('#calendly_list');

	a.html('<div class="modal_universal_preloader"></div>');

	open_modal('#calendly_modal');

	$.ajax({
		type: 'POST',
		url: '/apps/calendly.app.php',
		data: {
			link: link
		},

		success: function(html) {
			a.html(html);
		},

		error: function(error) {
			console.log(error);
		}
	});
}

function x_list(link) {
	var a = $('#x_list');

	a.html('<div class="modal_universal_preloader"></div>');

	open_modal('#x_modal');

	$.ajax({
		type: 'POST',
		url: '/apps/x.app.php',
		data: {
			link: link
		},

		success: function(html) {
			a.html(html);
		},

		error: function(error) {
			console.log(error);
		}
	});
}

function tb_list(link) {
	var a = $('#tb_list');

	a.html('<iframe class="ticketsbox_iframe" width="100%" height="100%" src="//widget.ticketcrm.com/?widgetHash=' + link + '" frameborder="0" allowfullscreen="" allow="autoplay; encrypted-media"></iframe>');

	open_modal('#tb_modal');
}

function applyFilter(filterName, e, img) {
	if (img) {
		$(e).attr('src', img);
	}

	switch (filterName) {
		case 'black-white':
			blackWhiteFilter(e);
		break;

		case 'bright':
			brightFilter(e);
		break;

		case 'sepia':
			sepiaFilter(e);
		break;

		case 'green':
			greenFilter(e);
		break;

		case 'red':
			redFilter(e);
		break;

		case 'yellow':
			yellowFilter(e);
		break;
	}
}

function copyFilter(from, to) {
	var f = $(from),
		s = f.attr('src'),
		t = $(to),
		i = $('.filters_block');

	t.attr('src', s);
	i.removeClass('active');
	f.parent().addClass('active');
}

function processFilterElements(func) {
	$('img[data-filter]').each(function() {
		var filter = $(this).data('filter');

		applyFilter(filter, this);

		if (func) {
			$(this).removeAttr('data-filter');
		}
	});
}

function blackWhiteFilter($image) {
	$image = $($image);
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');

	var originalWidth = $image[0].naturalWidth;
	var originalHeight = $image[0].naturalHeight;

	canvas.width = originalWidth;
	canvas.height = originalHeight;
	context.drawImage($image[0], 0, 0, originalWidth, originalHeight);

	var imageData = context.getImageData(0, 0, originalWidth, originalHeight);
	var data = imageData.data;

	for (var i = 0; i < data.length; i += 4) {
		var red = data[i];
		var green = data[i + 1];
		var blue = data[i + 2];

		var gray = red * 0.299 + green * 0.587 + blue * 0.114;

		data[i] = data[i + 1] = data[i + 2] = gray;
	}

	context.putImageData(imageData, 0, 0);
	$image.attr('src', canvas.toDataURL());
}

function brightFilter($image) {
	$image = $($image);
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');

	var originalWidth = $image[0].naturalWidth;
	var originalHeight = $image[0].naturalHeight;

	canvas.width = originalWidth;
	canvas.height = originalHeight;
	context.drawImage($image[0], 0, 0, originalWidth, originalHeight);

	var imageData = context.getImageData(0, 0, originalWidth, originalHeight);
	var data = imageData.data;
	var brightnessFactor = 1.3;

	for (var i = 0; i < data.length; i += 4) {
		data[i] *= brightnessFactor;
		data[i + 1] *= brightnessFactor;
		data[i + 2] *= brightnessFactor;
	}

	context.putImageData(imageData, 0, 0);
	$image.attr('src', canvas.toDataURL());
}

function sepiaFilter($image) {
	$image = $($image);
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');

	var originalWidth = $image[0].naturalWidth;
	var originalHeight = $image[0].naturalHeight;

	canvas.width = originalWidth;
	canvas.height = originalHeight;
	context.drawImage($image[0], 0, 0, originalWidth, originalHeight);

	var imageData = context.getImageData(0, 0, originalWidth, originalHeight);
	var data = imageData.data;

	for (var i = 0; i < data.length; i += 4) {
		var red = data[i];
		var green = data[i + 1];
		var blue = data[i + 2];

		var newRed = red * 0.393 + green * 0.769 + blue * 0.189;
		var newGreen = red * 0.349 + green * 0.686 + blue * 0.168;
		var newBlue = red * 0.272 + green * 0.534 + blue * 0.131;

		data[i] = Math.min(newRed, 255);
		data[i + 1] = Math.min(newGreen, 255);
		data[i + 2] = Math.min(newBlue, 255);
	}

	context.putImageData(imageData, 0, 0);
	$image.attr('src', canvas.toDataURL());
}

function greenFilter($image) {
	$image = $($image);
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');

	var originalWidth = $image[0].naturalWidth;
	var originalHeight = $image[0].naturalHeight;

	canvas.width = originalWidth;
	canvas.height = originalHeight;
	context.drawImage($image[0], 0, 0, originalWidth, originalHeight);

	var imageData = context.getImageData(0, 0, originalWidth, originalHeight);
	var data = imageData.data;
	var factor = (0.0 + 1) / (1 - 0.0);

	for (var i = 0; i < data.length; i += 4) {
		var red = data[i];
		var green = data[i + 1];
		var blue = data[i + 2];

		var newRed = factor * (red - 128) + 128;
		var newGreen = factor * (green - 128) + 128;
		var newBlue = factor * (blue - 128) + 128;

		var gray = newRed * 0.299 + newGreen * 0.587 + newBlue * 0.114;
		var brightness = Math.sqrt(newRed * newRed * 0.299 + newGreen * newGreen * 0.587 + newBlue * newBlue * 0.114);

		if (brightness < 130) {
			var brightnessRatio = brightness / 130;
			var lightnessFactor = 1.2;

			data[i] = 50 * brightnessRatio * lightnessFactor + gray * 0.3;
			data[i + 1] = 35 * brightnessRatio * lightnessFactor + gray * 0.7;
			data[i + 2] = 140 * brightnessRatio * lightnessFactor + gray * 0.5;
		} else {
			data[i] = 81 + gray * 0.3; // Красный канал
			data[i + 1] = 51 + gray * 0.8; // Зеленый канал
			data[i + 2] = 15 + gray * 0.4; // Синий канал
		}
	}

	context.putImageData(imageData, 0, 0);
	$image.attr('src', canvas.toDataURL());
}

function redFilter($image) {
	$image = $($image);
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');

	var originalWidth = $image[0].naturalWidth;
	var originalHeight = $image[0].naturalHeight;

	canvas.width = originalWidth;
	canvas.height = originalHeight;
	context.drawImage($image[0], 0, 0, originalWidth, originalHeight);

	var imageData = context.getImageData(0, 0, originalWidth, originalHeight);
	var data = imageData.data;
	var factor = (0.15 + 1) / (1 - 0.15);

	for (var i = 0; i < data.length; i += 4) {
		var red = data[i];
		var green = data[i + 1];
		var blue = data[i + 2];

		var newRed = factor * (red - 128) + 128;
		var newGreen = factor * (green - 128) + 128;
		var newBlue = factor * (blue - 128) + 128;

		var gray = newRed * 0.299 + newGreen * 0.587 + newBlue * 0.114;

		if (gray < 110) {
			var lightnessFactor = 1;

			data[i] = 0 * lightnessFactor + gray * 1;
			data[i + 1] = 0 * lightnessFactor + gray * 0.4;
			data[i + 2] = 65 * lightnessFactor + gray * 0.3;
		} else {
			data[i] = gray * 1; // Красный канал
			data[i + 1] = gray * 0.4; // Зеленый канал
			data[i + 2] = 49 + gray * 0.3; // Синий канал
		}
	}

	context.putImageData(imageData, 0, 0);
	$image.attr('src', canvas.toDataURL());
}

function yellowFilter($image) {
	$image = $($image);
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');

	var originalWidth = $image[0].naturalWidth;
	var originalHeight = $image[0].naturalHeight;

	canvas.width = originalWidth;
	canvas.height = originalHeight;
	context.drawImage($image[0], 0, 0, originalWidth, originalHeight);

	var imageData = context.getImageData(0, 0, originalWidth, originalHeight);
	var data = imageData.data;
	var factor = (0.05 + 1) / (1 - 0.05);

	for (var i = 0; i < data.length; i += 4) {
		var red = data[i];
		var green = data[i + 1];
		var blue = data[i + 2];

		var newRed = factor * (red - 128) + 128;
		var newGreen = factor * (green - 128) + 128;
		var newBlue = factor * (blue - 128) + 128;

		var gray = red * 0.299 + green * 0.587 + blue * 0.114;
		var brightness = Math.sqrt(newRed * newRed * 0.299 + newGreen * newGreen * 0.587 + newBlue * newBlue * 0.114);

		if (brightness < 130) {
			var lightnessFactor = 1;
			var brightnessRatio = brightness / 130;

			data[i] = 60 * brightnessRatio * lightnessFactor + gray * 0.7;
			data[i + 1] = 61 * brightnessRatio * lightnessFactor + gray * 0.4;
			data[i + 2] = 76 * brightnessRatio * lightnessFactor + gray * 0.4;
		} else {
			data[i] = 107 + gray * 0.7; // Красный канал
			data[i + 1] = 125 + gray * 0.4; // Зеленый канал
			data[i + 2] = 27 + gray * 0.4; // Синий канал
		}
	}

	context.putImageData(imageData, 0, 0);
	$image.attr('src', canvas.toDataURL());
}

function loadImage(src) {
	var image = new Image();

	image.src = src;

	image.onload = function() {
		processFilterElements();
	};
}

function share_button(title, text, url) {
	if (navigator.share) {
		navigator.share({
			title: title,
			text: text,
			url: url
		})
		.then(() => console.log('Done.'))
		.catch((error) => console.error('Error:', error));
	} else {
		console.log('Not supported.');
	}
}

$(document).ready(function() {
	// Максимальна кількість зображень у тексті
	var MAX_IMAGES = 10; // Змініть це значення за потребою

	// Функція для отримання перекладу з сервера
	function getTranslation(key, params, callback) {
		$.post('/apps/translations.php', {
			key: key,
			params: params
		}, function(response) {
			var result = JSON.parse(response);
			if (result.success) {
				callback(result.translation);
			} else {
				callback('Translation error');
			}
		}).fail(function() {
			callback('Translation error');
		});
	}

	// Функція для показу повідомлень з перекладом
	function showTranslatedAlert(key, params) {
		getTranslation(key, params || {}, function(translation) {
			show_msg(translation, true);
		});
	}

	function exCommand(f) {
		document.execCommand(f, false, null);
		updateUI();
		$('.editor_link').slideUp(); // ⬅ Приховати поле при зміні стилю
	}

	// Функція підрахунку зображень у редакторі
	function countImagesInEditor() {
		return $('#editor img').length;
	}

	// Функція перевірки чи можна додати ще зображення
	function canAddMoreImages() {
		return countImagesInEditor() < MAX_IMAGES;
	}

	$(document).on('click', '#editor_h2', function() {
		var isH2 = document.queryCommandValue('formatBlock') === 'h2';
		if (isH2) {
			document.execCommand('formatBlock', false, 'p');
		} else {
			document.execCommand('formatBlock', false, 'h2');
		}
		updateUI();
	});

	$(document).on('click', '#editor_bold', function() {
		exCommand('bold');
	});

	$(document).on('click', '#editor_italic', function() {
		exCommand('italic');
	});

	$(document).on('click', '#editor_strike', function() {
		exCommand('strikeThrough');
	});

	$(document).on('click', '#editor_list', function() {
		exCommand('insertUnorderedList');
	});

	$(document).on('click', '#editor_link', function() {
		var a = getCurrentStyles();
		if (a.link) {
			exCommand('unlink');
			$('.editor_link').slideUp();
		} else {
			insertLink();
		}
	});

	// Новий обробник для кнопки зображення
	$(document).on('click', '#editor_image', function() {
		if (canAddMoreImages()) {
			$('#image_file_input').click();
		} else {
			showTranslatedAlert('editor_max_images_alert', {'%d': MAX_IMAGES});
		}
	});

	// Обробник вибору файлу зображення
	$(document).on('change', '#image_file_input', function() {
		var file = this.files[0];
		if (file) {
			if (canAddMoreImages()) {
				uploadImage(file);
			} else {
				showTranslatedAlert('editor_max_images_alert', {'%d': MAX_IMAGES});
			}
		}
		// Очищаємо input для можливості вибору того ж файлу знову
		this.value = '';
	});

	$(document).on('keydown', '#editor', function(e) {
		if (e.ctrlKey || e.metaKey) {
			var key = String.fromCharCode(e.which).toLowerCase();
			switch (key) {
				case 'b': exCommand('bold'); e.preventDefault(); break;
				case 'i': exCommand('italic'); e.preventDefault(); break;
				case 'l': exCommand('insertUnorderedList'); e.preventDefault(); break;
				case 'k':
					var a = getCurrentStyles();
					if (a.link) {
						exCommand('unlink');
						$('.editor_link').slideUp();
					} else {
						insertLink();
					}
					e.preventDefault();
					break;
				case 'm': // Ctrl+M для зображення
					if (canAddMoreImages()) {
						$('#image_file_input').click();
					} else {
						showTranslatedAlert('editor_max_images_alert', {'%d': MAX_IMAGES});
					}
					e.preventDefault();
					break;
			}
		}
	});

	$(document).on('paste drop', '#editor', function(e) {
		e.preventDefault();

		let descr = '';

		if (e.type === 'paste') {
			const clipboard = e.originalEvent.clipboardData;
			descr = clipboard.getData('text/html') || clipboard.getData('text/plain');
		} else if (e.type === 'drop') {
			const dt = e.originalEvent.dataTransfer;
			descr = dt.getData('text/html') || dt.getData('text/plain');
		}

		// Спочатку обробляємо зображення у вставленому контенті
		processImagesInContent(descr).then(function(processedContent) {
			$.post('/apps/editor.app.php', { descr: processedContent }, function(html) {
				document.execCommand("insertHTML", false, html);
				updateUI(); // Оновлюємо UI після вставки
			});
		});
	});

	$(document).on('keypress', '#editor', function(e) {
		if (e.which === 13) {
			document.execCommand('formatBlock', false, 'p');
		}
	});

	$(document).on('keypress', '#editor_url', function(e) {
		if (e.which === 13) {
			$('#button_add').click();
		}
	});

	$(document).on('mouseup keyup', '#editor', function() {
		updateUI();
		const styles = getCurrentStyles();
		if (styles.link) {
			showEditLink(styles.href, true);
		} else {
			$('.editor_link').slideUp();
		}
	});

	$(document).on('blur', '#editor', function() {
		$('.editor_bar_button').removeClass('active');
	});

	// Функція завантаження зображення з комп'ютера
	function uploadImage(file) {
		var formData = new FormData();
		formData.append('image', file);

		$.ajax({
			url: '/apps/image_upload.php',
			type: 'POST',
			data: formData,
			contentType: false,
			processData: false,
			success: function(response) {
				var result = JSON.parse(response);
				if (result.process === 1) {
					var img = $('<img>').attr('src', result.image_url);
					insertImageIntoEditor(img[0]);
					updateUI();
				} else {
					getTranslation('editor_error_uploading', {}, function(translation) {
						show_msg(translation + ': ' + result.errs.err_image, true);
					});
				}
			},
			error: function() {
				showTranslatedAlert('editor_error_generic');
			}
		});
	}

	// Функція безпечної вставки зображення в редактор
	function insertImageIntoEditor(imgElement) {
		var editor = document.getElementById('editor');
		var selection = window.getSelection();
		
		// Перевіряємо чи є активний selection і чи він в нашому редакторі
		if (selection.rangeCount > 0) {
			var range = selection.getRangeAt(0);
			var container = range.commonAncestorContainer;
			
			// Перевіряємо чи selection знаходиться в редакторі
			var isInEditor = editor.contains(container) || editor === container;
			
			if (isInEditor) {
				// Вставляємо в поточну позицію курсору
				range.insertNode(imgElement);
				range.collapse(false);
				return;
			}
		}
		
		// Якщо курсор не в редакторі - додаємо зображення в кінець
		editor.focus();
		var range = document.createRange();
		range.selectNodeContents(editor);
		range.collapse(false);
		range.insertNode(imgElement);
		range.collapse(false);
		
		// Оновлюємо selection
		selection.removeAllRanges();
		selection.addRange(range);
	}

	// Функція обробки зображень у вставленому контенті
	function processImagesInContent(content) {
		return new Promise(function(resolve) {
			var tempDiv = $('<div>').html(content);
			var images = tempDiv.find('img');
			
			if (images.length === 0) {
				resolve(content);
				return;
			}

			// Перевіряємо загальну кількість зображень після вставки
			var currentImageCount = countImagesInEditor();
			var totalAfterPaste = currentImageCount + images.length;
			
			if (totalAfterPaste > MAX_IMAGES) {
				var allowedImages = MAX_IMAGES - currentImageCount;
				if (allowedImages <= 0) {
					showTranslatedAlert('editor_cannot_paste_images', {'%d': MAX_IMAGES});
					resolve(tempDiv.text()); // Повертаємо тільки текст без зображень
					return;
				} else {
					getTranslation('editor_only_x_more_images', {'%d': allowedImages}, function(translation1) {
						getTranslation('editor_extra_images_removed', {}, function(translation2) {
							show_msg(translation1 + ' ' + translation2, true);
						});
					});
					// Залишаємо тільки дозволену кількість зображень
					images = images.slice(0, allowedImages);
					// Видаляємо зайві зображення з tempDiv
					tempDiv.find('img').slice(allowedImages).remove();
				}
			}

			var processedCount = 0;
			var totalImages = images.length;

			if (totalImages === 0) {
				resolve(tempDiv.html());
				return;
			}

			images.each(function() {
				var img = $(this);
				var src = img.attr('src');
				
				// Пропускаємо data: URLs та відносні шляхи
				if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
					// Перевіряємо чи це не наше зображення
					if (src.indexOf('/modules/upl/texts/1200/') !== -1) {
						processedCount++;
						if (processedCount === totalImages) {
							resolve(tempDiv.html());
						}
					} else {
						// Завантажуємо стороннє зображення
						$.post('/apps/image_upload.php', { image_url: src }, function(response) {
							var result = JSON.parse(response);
							if (result.process === 1) {
								img.attr('src', result.image_url);
							}
							processedCount++;
							if (processedCount === totalImages) {
								resolve(tempDiv.html());
							}
						}).fail(function() {
							processedCount++;
							if (processedCount === totalImages) {
								resolve(tempDiv.html());
							}
						});
					}
				} else {
					processedCount++;
					if (processedCount === totalImages) {
						resolve(tempDiv.html());
					}
				}
			});
		});
	}

	function insertLink() {
		var range = window.getSelection().getRangeAt(0);
		var selectionContents = range.cloneContents();
		var selection = window.getSelection();
		var linkInput = $('#editor_url');
		var linkButton = $('#button_add');
		var linkBone = $('.editor_link');
		linkButton.off('click');
		linkInput.val('');
		linkBone.slideDown();
		linkButton.click(function handleClick() {
			var linkUrl = linkInput.val();
			var linkText = selectionContents.textContent;
			var link = $('<a>').attr('href', linkUrl).append(linkText.length > 0 ? cleanHref(selectionContents) : linkUrl);
			range.deleteContents();
			range.insertNode(link[0]);
			range.collapse(false);
			selection.removeAllRanges();
			selection.addRange(range);
			linkBone.slideUp();
			linkButton.off('click');
		});
	}

	function showEditLink(currentHref, noFocus) {
		var selection = window.getSelection();
		var range = selection.rangeCount ? selection.getRangeAt(0) : null;
		if (!range) return;

		var linkInput = $('#editor_url');
		var linkButton = $('#button_add');
		var linkBone = $('.editor_link');
		linkButton.off('click');
		linkInput.val(currentHref);
		linkBone.slideDown();

		linkButton.click(function handleClick() {
			var newHref = linkInput.val();
			var anchor = $(range.commonAncestorContainer).closest('a')[0];
			if (!anchor) anchor = $(range.startContainer).closest('a')[0];
			if (anchor) anchor.setAttribute('href', newHref);
			linkBone.slideUp();
			linkButton.off('click');
		});

		linkInput.off('blur').on('blur', function handleBlur() {
			linkBone.slideUp();
		});

		if (!noFocus) {
			linkInput.focus();
		}
	}

	function cleanHref(htm) {
		var temp = $('<div>').html(htm);
		temp.find('*').each(function() {
			let ths = $(this);
			if (ths.is('a')) ths.replaceWith(cleanHref(ths.html()));
		});
		return temp.html();
	}

	function getCurrentStyles() {
		var selection = window.getSelection();
		if (selection.rangeCount > 0) {
			var range = selection.getRangeAt(0);
			var container = range.commonAncestorContainer;
			var start = range.startContainer;
			var end = range.endContainer;

			var $check = $(container).add($(start)).add($(end));

			var styles = {};
			styles.h2 = $check.closest('h2').length > 0;
			styles.bold = $check.closest('b,strong').length > 0;
			styles.italic = $check.closest('i,em').length > 0;
			styles.strikethrough = $check.closest('strike,s,del').length > 0;
			styles.link = $check.closest('a').length > 0;
			styles.href = $check.closest('a').attr('href') || '';
			styles.list = $check.closest('ul,ol').length > 0;

			return styles;
		}
	}

	function updateUI() {
		var styles = getCurrentStyles();
		$('#editor_h2').toggleClass('active', styles.h2);
		$('#editor_bold').toggleClass('active', styles.bold);
		$('#editor_italic').toggleClass('active', styles.italic);
		$('#editor_strike').toggleClass('active', styles.strikethrough);
		$('#editor_link').toggleClass('active', styles.link);
		$('#editor_list').toggleClass('active', styles.list);
		
		// Додаткова перевірка для кнопки зображень
		$('#editor_image').toggleClass('disabled', !canAddMoreImages());
	}
});