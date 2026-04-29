<?php
ob_start();
session_start();
date_default_timezone_set('Europe/Moscow'); 
$db_file = 'database.json';

$data = file_exists($db_file) ? json_decode(file_get_contents($db_file), true) : ['users' => [], 'links' => [], 'user_links' => []];

function cleanUrl($url) { return preg_replace('#^https?://#', '', rtrim($url, '/')); }

function setMsg($txt, $type = 'success') {
    $_SESSION['msg'] = $txt;
    $_SESSION['msg_type'] = $type;
}

// --- УДАЛЕНИЕ ССЫЛКИ ---
if (isset($_SESSION['user']) && isset($_GET['delete'])) {
    $slug = $_GET['delete'];
    if (isset($data['links'][$slug])) {
        unset($data['links'][$slug]);
        if (isset($data['user_links'][$_SESSION['user']])) {
            $data['user_links'][$_SESSION['user']] = array_values(array_diff($data['user_links'][$_SESSION['user']], [$slug]));
        }
        file_put_contents($db_file, json_encode($data));
        setMsg("Ссылка удалена");
        header("Location: index.php"); exit;
    }
}

// --- РЕДИРЕКТ ---
if (isset($_GET['slug'])) {
    $slug = $_GET['slug'];
    if (isset($data['links'][$slug])) {
        $link = $data['links'][$slug];
        $target = $link['url'];
        $delay = isset($link['delay']) ? (int)$link['delay'] : 10;
        
        $data['links'][$slug]['clicks'] = ($data['links'][$slug]['clicks'] ?? 0) + 1;
        $data['links'][$slug]['logs'][] = ['time' => time(), 'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown'];
        if (count($data['links'][$slug]['logs']) > 50) array_shift($data['links'][$slug]['logs']);
        file_put_contents($db_file, json_encode($data));

        if ($link['no_timer'] ?? false) { header("Location: " . $target); exit; }

        $display_url = ($link['show_dest'] ?? true) ? htmlspecialchars(cleanUrl($target)) : 'Защищенное соединение...';
        ?>
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                :root { --bg: #000; --txt: #fff; --acc: #00ff88; }
                body { background: var(--bg); color: var(--txt); font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                .bar-bg { width: 100%; height: 3px; background: #111; border-radius: 4px; margin-top: 20px; overflow: hidden; }
                .bar-fill { width: 0%; height: 100%; background: var(--acc); transition: width <?= $delay ?>s linear; }
            </style>
        </head>
        <body>
            <div style="text-align:center; width:85%; max-width:400px;">
                <span style="color:var(--acc); font-weight:bold; word-break:break-all;"><?= $display_url ?></span>
                <div class="bar-bg"><div class="bar-fill" id="p"></div></div>
            </div>
            <script>
                setTimeout(() => document.getElementById('p').style.width = '100%', 100);
                setTimeout(() => window.location.href = "<?= $target ?>", <?= $delay * 1000 ?> + 200);
            </script>
        </body>
        </html>
        <?php
        exit;
    }
}

// --- ФОРМЫ ---
if (isset($_POST['register'])) {
    $u = trim($_POST['user']); $p = $_POST['pass'];
    if ($u && $p && !isset($data['users'][$u])) {
        $data['users'][$u] = password_hash($p, PASSWORD_DEFAULT);
        file_put_contents($db_file, json_encode($data));
        setMsg("Вы зарегистрировались! Теперь войдите!");
    } else { setMsg("Ошибка регистрации", "error"); }
    header("Location: index.php"); exit;
}
if (isset($_POST['login'])) {
    $u = $_POST['user'] ?? ''; $p = $_POST['pass'] ?? '';
    if (isset($data['users'][$u]) && password_verify($p, $data['users'][$u])) {
        $_SESSION['user'] = $u; setMsg("Вы вошли!!");
    } else { setMsg("Неправильный логин/пароль!", "error"); }
    header("Location: index.php"); exit;
}
if (isset($_GET['logout'])) { session_destroy(); header("Location: index.php"); exit; }
if (isset($_SESSION['user']) && isset($_POST['add'])) {
    $url = trim($_POST['url']);
    if (!preg_match("~^(?:f|ht)tps?://~i", $url)) $url = "https://" . $url;
    $slug = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 8); 
    $data['links'][$slug] = [
        'url' => $url, 
        'delay' => isset($_POST['delay']) ? (int)$_POST['delay'] : 10, 
        'show_dest' => isset($_POST['show_dest']), 
        'no_timer' => isset($_POST['no_timer']), 
        'clicks' => 0, 'logs' => []
    ];
    $data['user_links'][$_SESSION['user']][] = $slug;
    file_put_contents($db_file, json_encode($data));
    setMsg("Реферал создан!");
    header("Location: index.php"); exit;
}
?>

<!DOCTYPE html>
<html lang="ru" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>RedictHub</title>
    <style>
        :root[data-theme="dark"] { --bg: #0a0a0a; --card: #141414; --acc: #00ff88; --txt: #eee; --brd: #222; --item: #1c1c1c; --muted: #777; --modal-bg: rgba(0,0,0,0.9); }
        :root[data-theme="light"] { --bg: #f8f9fa; --card: #fff; --acc: #007bff; --txt: #222; --brd: #eaeaea; --item: #f1f3f5; --muted: #999; --modal-bg: rgba(0,0,0,0.6); }
        
        body { background: var(--bg); color: var(--txt); font-family: -apple-system, sans-serif; margin: 0; padding: 15px; display: flex; justify-content: center; min-height: 100vh; box-sizing: border-box; }
        .card { background: var(--card); border: 1px solid var(--brd); padding: 20px; border-radius: 24px; width: 100%; max-width: 480px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); align-self: flex-start; }
        
        .alert { padding: 15px; border-radius: 14px; margin-bottom: 20px; font-size: 14px; font-weight: 700; text-align: center; transition: 0.5s ease; }
        .alert-success { background: rgba(0, 255, 136, 0.1); color: var(--acc); border: 1px solid var(--acc); }
        .alert-error { background: rgba(255, 80, 80, 0.1); color: #ff5050; border: 1px solid #ff5050; }
        .alert.hide { opacity: 0; transform: translateY(-10px); margin-bottom: -50px; }

        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; gap: 10px; }
        .header-btns { display: flex; gap: 8px; }
        
        .btn { padding: 14px; border-radius: 14px; cursor: pointer; font-weight: 700; border: none; font-size: 15px; transition: 0.2s; -webkit-tap-highlight-color: transparent; }
        .btn-primary { background: var(--acc); color: #000; width: 100%; }
        .btn-outline { background: var(--item); border: 1px solid var(--brd); color: var(--txt); padding: 8px 12px; font-size: 13px; text-decoration: none; display: inline-block; }
        
        input { background: var(--bg); border: 1px solid var(--brd); padding: 15px; border-radius: 14px; color: var(--txt); width: 100%; box-sizing: border-box; outline: none; margin-bottom: 12px; font-size: 16px; }
        .item { background: var(--item); padding: 18px; border-radius: 18px; margin-top: 15px; border: 1px solid var(--brd); }
        .url-display { display: block; font-size: 14px; color: var(--acc); margin-bottom: 15px; word-break: break-all; font-weight: 600; }
        .btns-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .b-sm { padding: 10px; font-size: 12px; border-radius: 10px; border: 1px solid var(--brd); cursor: pointer; font-weight: 600; text-align: center; color: var(--txt); background: var(--card); text-decoration: none; }

        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: var(--modal-bg); align-items: center; justify-content: center; backdrop-filter: blur(8px); padding: 20px; box-sizing: border-box; }
        .modal.active { display: flex; }
        .modal-content { background: var(--card); padding: 25px; border-radius: 24px; width: 100%; max-width: 400px; border: 1px solid var(--brd); }
    </style>
</head>
<body>

<div class="card">
    <?php if(isset($_SESSION['msg'])): ?>
        <div class="alert alert-<?= $_SESSION['msg_type'] ?>" id="flash-msg"><?= $_SESSION['msg'] ?></div>
        <?php unset($_SESSION['msg'], $_SESSION['msg_type']); ?>
    <?php endif; ?>

    <div class="header-top">
        <h2 style="margin:0; font-size: 1.3rem;">RedictHub</h2>
        <div class="header-btns">
            <a href="https://lbs.su" class="btn btn-outline">🌐 lbs.su</a>
            <button class="btn btn-outline" onclick="toggleTheme()">🌓</button>
        </div>
    </div>

    <?php if (!isset($_SESSION['user'])): ?>
        <form method="post">
            <input type="text" name="user" placeholder="Логин" required>
            <input type="password" name="pass" placeholder="Пароль" required>
            <button class="btn btn-primary" name="login">Войти</button>
            <button name="register" style="background:none; border:none; color:var(--muted); margin-top:20px; width:100%; cursor:pointer;">Регистрация</button>
        </form>
    <?php else: ?>
        <button class="btn btn-primary" onclick="openM('modal-create')">+ Создать реферал</button>
        
        <?php 
        $my_links = $data['user_links'][$_SESSION['user']] ?? [];
        foreach (array_reverse($my_links) as $slug): 
            $l = $data['links'][$slug];
        ?>
            <div class="item">
                <span class="url-display"><?= ($l['no_timer']??false) ? '⚡ ' : '' ?><?= htmlspecialchars(cleanUrl($l['url'])) ?></span>
                <div class="btns-grid">
                    <button class="b-sm" onclick="openM('stat-<?= $slug ?>')">📊 Анализ</button>
                    <button class="b-sm" onclick="cp('<?= "https://" . $_SERVER['HTTP_HOST'] . "/RedictHub/links/" . $slug . ".html" ?>', this)">Копировать</button>
                    <a href="?delete=<?= $slug ?>" class="b-sm" style="grid-column: span 2; color:#ff5050; border-color:rgba(255,50,50,0.2)" onclick="return confirm('Удалить?')">Удалить</a>
                </div>
            </div>

            <div id="stat-<?= $slug ?>" class="modal" onclick="if(event.target==this) closeM('stat-<?= $slug ?>')">
                <div class="modal-content">
                    <h3 style="margin-top:0">Статистика</h3>
                    <p style="color:var(--acc); font-size:26px; font-weight:800; margin:10px 0"><?= $l['clicks'] ?> <small style="font-size:10px; color:var(--muted)">КЛИКОВ</small></p>
                    <div style="max-height:200px; overflow-y:auto; border-top:1px solid var(--brd)">
                        <?php foreach(array_reverse($l['logs'] ?? []) as $log): ?>
                            <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:12px; color:var(--muted); border-bottom:1px dashed var(--brd)">
                                <span><?= date("d.m H:i", $log['time']) ?></span>
                                <span><?= $log['ip'] ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <button class="btn btn-primary" onclick="closeM('stat-<?= $slug ?>')" style="margin-top:15px">Закрыть</button>
                </div>
            </div>
        <?php endforeach; ?>
        
        <a href="?logout" style="display:block; text-align:center; margin-top:25px; color:var(--muted); text-decoration:none; font-size:12px;">Выйти (<?= $_SESSION['user'] ?>)</a>
    <?php endif; ?>
</div>

<div id="modal-create" class="modal" onclick="if(event.target==this) closeM('modal-create')">
    <div class="modal-content">
        <h3 style="margin-top:0">Новый реферал</h3>
        <form method="post">
            <input type="text" name="url" placeholder="google.com" required>
            <input type="number" name="delay" id="d-in" value="10" min="1">
            <label style="display:flex; align-items:center; font-size:13px; color:var(--muted); margin-bottom:10px;"><input type="checkbox" name="show_dest" checked style="width:20px; margin-right:10px;"> Показать URL</label>
            <label style="display:flex; align-items:center; font-size:13px; color:var(--acc); margin-bottom:15px;"><input type="checkbox" name="no_timer" onchange="document.getElementById('d-in').disabled = this.checked" style="width:20px; margin-right:10px;"> ⚡ Без таймера</label>
            <button class="btn btn-primary" name="add">Создать</button>
        </form>
    </div>
</div>

<script>
    if(localStorage.getItem('theme') === 'light') document.documentElement.setAttribute('data-theme', 'light');
    function toggleTheme() {
        const d = document.documentElement, t = d.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        d.setAttribute('data-theme', t); localStorage.setItem('theme', t);
    }
    function openM(id) { document.getElementById(id).classList.add('active'); }
    function closeM(id) { document.getElementById(id).classList.remove('active'); }
    function cp(t, b) {
        navigator.clipboard.writeText(t).then(() => {
            const s = b.innerText; b.innerText = 'Скопировано!';
            setTimeout(() => b.innerText = s, 1500);
        });
    }
    const alertBox = document.getElementById('flash-msg');
    if (alertBox) {
        setTimeout(() => {
            alertBox.classList.add('hide');
            setTimeout(() => alertBox.remove(), 600);
        }, 5000); 
    }
</script>
</body>
</html>
