// ==UserScript==
// @name         Troya
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       Vladimir Velikiy
// @include     https://3k.mail.ru/main.php*
// @include     http://3k.mail.ru/main.php*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js
// @grant       none
// ==/UserScript==

//unsafeWindow.openBox = openBox;

;(function(){

    if (window.self != window.top) {
        return;
    }

    $(document).ready(function() {
        $isFarming = false;
        $farmDelay = 3;
        $farmTime = 22;
        $item_1 = getItemData('item_1', 'Серый карась');
        $item_2 = getItemData('item_2', 'Полосатый окунь');
        $item_3 = getItemData('item_3', 'Пятнистый ёрш');
        $dataItem_1 = null;
        $dataItem_2 = null;
        $dataItem_3 = null;
        $farmTool = 1; // 1 - инструмент надет, 0 - инструмента нет
        $interval = null;
        $totalFarm = 0;
        $cutsCount = 0;
        $chtMsgCount = 0;
        $sayPerCut = 0; // сколько раз просили полечить за текущий порез
        $botName = getItemData('botName', 'Молодая Зедра');
        $botId = null;
        $nick = 'Тестостерон';

        // красные анвены
        $anvenId = '2131863901';
        $actionId = '8426';
        $isAutoAnven = false;
        $formAnven = null;
        $anvenCount = 9;
        $anvenInterval = null;

        // настройки пореза
        $isAutoTool = false;
        $cutPhrase = getItemData('cutPhrase', 'Получено: порез 1шт. Полечите пожалуйста. :cry2: :cry2:');
        $idTool = getItemData('idTool', 2079440532);
        $delayAfterSay = 80 * 1000;
        $cutTimer = null;

        $('head').append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">');
        $('head').append('<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>');
        $('body').append('<div id="main_bot_container"></div>');
        $('#main_bot_container').append('<div class="panel panel-default">'+
                                        '<div class="panel-body" id="panel_container_bot"></div></div>');
        $('#panel_container_bot').append('<ul class="nav nav-tabs">'+
                                         '<li class="active"><a data-toggle="tab" href="#f">Фарм</a></li>'+
                                         '<li><a data-toggle="tab" href="#p">Автофарм</a></li>'+
                                         '<li><a data-toggle="tab" href="#h">Охота</a></li>'+
                                         '<li><a data-toggle="tab" href="#r">Сундуки</a></li>'+
                                         '</ul>');
        $('#panel_container_bot').append('<div class="tab-content" id="all_tab_content"></div>');
        // фарм
        $('#all_tab_content').append('<div id="f" class="tab-pane fade in active">'+
                                     '<h2>Фарм</h2>'+
                                     '<div><span class="label label-default" id="farmInfo">Остановлен</span></div><br>'+
                                     '<label for="usr">Ресурс 1:</label>'+
                                     '<input type="text" class="form-control" id="usr_item_1" value="'+$item_1+'">'+
                                     '<label for="usr">Ресурс 2:</label>'+
                                     '<input type="text" class="form-control" id="usr_item_2" value="'+$item_2+'">'+
                                     '<label for="usr">Ресурс 3:</label>'+
                                     '<input type="text" class="form-control" id="usr_item_3" value="'+$item_3+'">'+
                                     '<br><button id="start_farm_btn" type="button" class="btn btn-primary">Старт</button>'+
                                     '</div>');
        // автофарм
        $('#all_tab_content').append('<div id="p" class="tab-pane fade">'+
                                     '<h3>Автофарм</h3>'+
                                     '<div class="checkbox">'+
                                     '<label>'+
                                     '<input id="auto_check_tool" type="checkbox" data-toggle="toggle">Вкл/Выкл</label>'+
                                     '</div>'+
                                     '<label for="usr_tool">Id инструмента:</label>'+
                                     '<input type="text" class="form-control" id="usr_tool_input" value="'+$idTool+'">'+
                                     '<label for="usr_cut_phrase">Фраза при порезе:</label>'+
                                     '<input type="text" class="form-control" id="usr_cut_phrase_input" value="'+$cutPhrase+'">'+
                                     '<p><label id="usr_cuts_count">Количество порезов: </label></p>'+
                                     '<p><label id="usr_cht_msg_count">Просьб полечить: </label></p>'+
                                     '<div class="checkbox">'+
                                     '<label>'+
                                     '<input id="is_auto_anven" type="checkbox" data-toggle="toggle">Красные анвены Вкл/Выкл</label>'+
                                     '</div>'+
                                     '</div>');
        // охота
        $('#all_tab_content').append('<div id="h" class="tab-pane fade">'+
                                     '<h3>Охота</h3>'+
                                     '<br><div><span class="label label-default" id="huntInfo">Остановлен</span></div><br>'+
                                     '<label for="usr_bot">Бот:</label>'+
                                     '<input type="text" class="form-control" id="usr_bot" value="'+$botName+'">'+
                                     '<br><button id="start_attack_btn" type="button" class="btn btn-primary">Атаковать</button>'+
                                     '</div>');

        // сундуки
        $('#all_tab_content').append('<div id="r" class="tab-pane fade">'+
                                     '<h3>Сундуки</h3>'+
                                     '<div><span class="label label-default" id="chestInfo">Остановлен</span></div><br>'+
                                     '<label for="usr_chest">Id сундуков:</label>'+
                                     '<input type="text" class="form-control" id="usr_chest" value="">'+
                                     '<label for="usr_num_chest">Количество:</label>'+
                                     '<input type="text" class="form-control" id="usr_num_chest" value="">'+
                                     '<label for="select_chest_type">Тип:</label>'+
                                     '<select class="form-control" id="select_chest_type">'+
                                     '<option value="1410">Серый</option>'+
                                     '<option value="1498">Зеленый</option>'+
                                     '<option value="1499">Синий</option>'+
                                     '<option value="1413">Фиолет</option>'+
                                     '<option value="5712">Красный</option>'+
                                     '</select>'+
                                     '<label for="option_chest_id">Id действия (опционально):</label>'+
                                     '<input type="text" class="form-control" id="option_chest_id" value="">'+
                                     '<br><button id="start_open_chest" type="button" class="btn btn-primary">Открывать</button>'+
                                     '</div>'
        );

        $("#main_bot_container").css ( {
            position:   "fixed",
            top:        10,
            left:       "100px",
        } );
        $('#main_bot_container').css("z-index", 555);
        $('#main_bot_container').draggable();

        if (_top().myNick !== $nick) {
            alert('Troya: ники не совпадают');
            $('#main_bot_container').hide();
            return;
        }

        $('#start_farm_btn').click(function(){
            if (!$isFarming) {
                startFarm();
            } else {
                stopFarm();
            }
        });

        $('#start_open_chest').click(function(){
            var boxId = $('#usr_chest').val();
            var numBoxes = $('#usr_num_chest').val();
            if (boxId !== "" && numBoxes !== "") {
                openBox(boxId, numBoxes);
            }
        });

        $('#start_attack_btn').click(function(){
            $botName = $('#usr_bot').val();
            getHunt();
        });

        $('#auto_check_tool').change(function(){
            $isAutoTool = $(this).prop('checked');
            console.log('Автопорез вкл/выкл: ' + $isAutoTool);
            // если мы отключили автофарм
            if (!$isAutoTool) {
                // отменяем таймер
                if ($cutTimer !== null) {
                    clearInterval($cutTimer);
                    $cutTimer = null;
                }
                // сбрасываем количество сообщений в чат для текущего пореза
                $sayPerCut = 0;
            }
        });

        $('#is_auto_anven').change(function(){
            $isAutoAnven = $(this).prop('checked');
            console.log('Автолечение красными анвенами: ' + $isAutoAnven);
        });

        logCut();
        // console.log(_top().frames['chat']); обращаемся к разным фреймам и их методам

    });

    function startFarm(){
        console.log('start farm');
        $isFarming = true;
        $farmTool = 1; // инструмент одет
        $item_1 = $('#usr_item_1').val();
        $item_2 = $('#usr_item_2').val();
        $item_3 = $('#usr_item_3').val();
        $('.form-control').attr('disabled', true);
        logMsg('Запуск!', '#farmInfo', 'label label-success');
        $('#start_farm_btn').removeClass('btn-primary').addClass('btn-danger').html('Стоп');
        beginFarm();
        saveAllData();
    }

    function stopFarm(){
        $isFarming = false;
        $('#start_farm_btn').removeClass('btn-danger').addClass('btn-primary').html('Старт');
        $('.form-control').attr('disabled', false);
        logMsg('Остановлен', '#farmInfo', 'label label-default');
    }

    function beginFarm() {
        if (!$isFarming) {
            stopTimer();
            return;
        }
        var items = [];
        $.get('http://3k.mail.ru/hunt_conf.php/' + getCookie('sess_uid') + '/203601/', function(data){
            $(data).find('item').each(function() {
                var x = Number($(this).attr('x'));
                var y = Number($(this).attr('y'));
                if ($(this).attr('farming') == '0' &&  x < 1550 && y < 1550) {
                    items.push({
                        name: $(this).attr('name'),
                        num: $(this).attr('num')
                    });
                }
            });

            $dataItem_1 = null;
            $dataItem_2 = null;
            $dataItem_3 = null;

            for (var i = 0; i < items.length; i++) {
                if ($item_1 == items[i].name) {
                    $dataItem_1 = items[i];
                }
                if ($item_2 == items[i].name) {
                    $dataItem_2 = items[i];
                }
                if ($item_3 == items[i].name) {
                    $dataItem_3 = items[i];
                }
            }

            if ($dataItem_1 !== null) {
                farm($dataItem_1);
            } else if ($dataItem_2 !== null) {
                farm($dataItem_2);
            } else if ($dataItem_3 !== null) {
                farm($dataItem_3);
            } else {
                // ни одного реса нет в локе
                console.log('Нет ресов');
                logMsg('Ресурсов не найдено', '#farmInfo', 'label label-warning');
                stopTimer();
                $interval = setInterval(beginFarm, 2000);
            }
        });
    }

    function farm(item) {
        logMsg('Сбор: ' + item.name + ', id = ' + item.num + ' (' + $totalFarm + ')', '#farmInfo', 'label label-primary');
        var rand = Math.floor((Math.random() * 500) + 300);
        $.ajax({
            type: 'POST',
            url: 'http://3k.mail.ru/hunt_conf.php/4580127/997630/?mode=farm&action=chek&lid=1&num=' + item.num + '&xy=' + rand + '&t=1&sig=6474b563235dd5454ba53a3a3b84590a',
            dataType: 'xml',
            success: farmItemResult
        });
    }

    function farmItemResult(data, textStatus, xhr) {
        $farmTool = $(data).find('req').attr('status');
        var farmMsg = $(data).find('req').attr('msg');
        var startTime = $(data).find('req').attr('stime');
        var finishTime = $(data).find('req').attr('ftime');
        var delay = finishTime - startTime;
        console.log('Сбор будет идти ' + delay);

        stopTimer();

        if ($farmTool == 0) {
            $isFarming = false;
            $('#start_farm_btn').removeClass('btn-danger').addClass('btn-primary').html('Старт');
            $('.form-control').attr('disabled', false);
            logMsg(farmMsg, '#farmInfo', 'label label-danger');

            if (farmMsg == 'Вы находитесь в бою!') {
                alert(farmMsg);
                return;
            }

            // если это мы еще не просили полечить порез
            if ($sayPerCut === 0) {
                $cutsCount++;
                logCut();
            }

            if ($isAutoAnven && $anvenCount > 0) {
                $anvenCount--;
                // пробуем полечить себя
                sendHealCut();
                $anvenInterval = setTimeout(function(){
                    setTool();
                    clearInterval($anvenInterval);
                }, 3000);
                
                return;
                // Выполнение кода прерывается, если счетчик анвен не достиг 0 и включены красные анвены.
            }


            if ($isAutoTool && farmMsg != 'Вы находитесь в бою!'){
                persCut();
            } else {
                alert(farmMsg);
            }

        } else {
            $totalFarm++;
            // если собираем ресы после пореза
            if ($sayPerCut > 0) {
                var thPhrases = Array("спасибо", "благодарю", "большое спасибо", "спасиб)", ":drink:", "спасибо :drink:", "благодарствую :drink:");
                var thanks = thPhrases[Math.floor(Math.random()*thPhrases.length)];
                var doctor = getDoctorName();
                console.log("Порез вылечил " + doctor);
                top.frames.chat.chatClearText();
                _top().frames['chat'].chatSendMessage('prv['+doctor+']' + thanks);
            }
            $sayPerCut = 0;
            $interval = setInterval(beginFarm, delay * 1000);
        }
    }

    function getItemData(key, defValue) {
        var result = localStorage.getItem(key);
        return (result === null) ? defValue : result;
    }

    function stopTimer() {
        if ($interval !== null) {
            clearInterval($interval);
        }
    }

    ///////////////////////////////////////////// Порез ///////////////////////////////////////////////////

    function persCut() {
        $cutPhrase = $('#usr_cut_phrase_input').val();
        sayToChat($cutPhrase);
        if ($cutTimer !== null) {
            clearInterval($cutTimer);
            $cutTimer = null;
        }
        $cutTimer = setInterval(cutLoop, $delayAfterSay);
    }

    function cutLoop(){
        clearInterval($cutTimer);
        $cutTimer = null;
        if ($isAutoTool) {
            setTool();
        }
    }

    function sayToChat(txt){
        // кричим в чат
        console.log('В чат: ' + txt);
        _top().frames['chat'].chatSendMessage(txt);
        $chtMsgCount++;
        $sayPerCut++;
        logCut();
    }

    function setTool(){
        $idTool = $('#usr_tool_input').val();
        $.ajax({
            type: 'GET',
            url: 'http://3k.mail.ru/action_run.php?code=PUT_ON&url_success=user_iframe.php%3Fgroup%3D2%26update_swf%3D1&url_error=user_iframe.php%3Fgroup%3D2%26update_swf%3D1&artifact_id='+$idTool+'&in[slot_num]=0&in[variant_effect]=0',
            success: onPut
        });
    }

    function onPut(data, status, xhr){
        console.log('Попытались одеть инструмент...');
        startFarm();
    }

    function logCut(){
        $('#usr_cuts_count').text('Количество порезов: ' +$cutsCount);
        $('#usr_cht_msg_count').text('Просьб полечить: '+$chtMsgCount);
    }

    ///////////////////////////////////////////// Hunt //////////////////////////////////////////////////

    function getHunt() {
        $.get('http://3k.mail.ru/hunt_conf.php', function(data) {
            $(data).find('bot').each(function() {
                if ($(this).attr('name') == $botName) {
                    $botId = $(this).attr('id');
                }
            });
            if ($botId !== null) {
                $('#huntInfo').removeClass().addClass('label label-success').html('Атакован');
                attackBot();
            } else {
                $('#huntInfo').removeClass().addClass('label label-warning').html('Не найден');
            }
        });

    }

    function attackBot() {
        botAttack($botId, '', '', ''); // нападение встроенным способом
        /* // нападение самописным запросом
    $.get('http://3k.mail.ru/action_run.php?code=ATTACK_BOT&url_success=/fight.php?853395748&url_error=/hunt.php&bot_id='+$botId+'&in[hunt]=1&in[confirmed]=0');
    _top().frames.main_frame.frames.main.location.href='fight.php';
    */
        $botId = null;
    }

    function getDoctorName() {
        var cht = top.frames.chat;
        console.log(cht.chatOpts.main.data[0].innerText);
        var reg = new RegExp("\\d+:\\d+(.*)(?=исцелил порез персонажу "+$nick+".)");
        var str = cht.chatOpts.main.data[0].innerText;
        str = str.match(reg);
        str = str ? str[1]:"";
        return str.trim();
    }

    //////////////////////////////////////// Tools //////////////////////////////////////////////

    function logMsg(msg, src, classes) {
        $(src).removeClass().addClass(classes).html(msg);
    }

    function saveAllData() {
        localStorage.setItem('item_1', $item_1);
        localStorage.setItem('item_2', $item_2);
        localStorage.setItem('item_3', $item_3);
        $botName = $('#usr_bot').val();
        localStorage.setItem('botName', $botName);

        $cutPhrase = $('#usr_cut_phrase_input').val();
        $idTool = $('#usr_tool_input').val();
        localStorage.setItem('cutPhrase', $cutPhrase);
        localStorage.setItem('idTool', $idTool);
    }

    // отправка формы
    function sendPostForm(path, parameters) {
        if ($formAnven == null) {
            $formAnven = $('<form></form>');

            $formAnven.attr("target", "_blank");
            $formAnven.attr("method", "post");
            $formAnven.attr("action", path);

            $.each(parameters, function(key, value) {
                var field = $('<input></input>');

                field.attr("type", "hidden");
                field.attr("name", key);
                field.attr("value", value);

                $formAnven.append(field);
            });

            $(document.body).append($formAnven);
        }
        $formAnven.submit();
    }

    // лечит порез персонажу
    function sendHealCut() {
        
        sendPostForm('action_run.php', {
            object_class: 'ARTIFACT',
            object_id: $anvenId,
            action_id: $actionId,
            url_success: 'action_form.php?success=1&amp;default=ARTIFACT_'+$anvenId+'_'+$actionId,
            url_error: 'action_form.php?failed=1&amp;default=ARTIFACT_'+$anvenId+'_'+$actionId,
            artifact_id: $anvenId,
            'in[object_class]': 'ARTIFACT',
            'in[object_id]': $anvenId,
            'in[action_id]': $actionId,
            'in[url_success]': 'action_form.php?success=1',
            'in[url_error]': 'action_form.php?failed=1',
            'in[param_success][url_close]': 'user_iframe.php?group=1&amp;external=1',
            'in[target_nick]': $nick
        });
        /*
        console.log('отправляем запрос на лечение');
        $.ajax({
            method: 'POST',
            url: 'action_run.php',
            data: {
                object_class: 'ARTIFACT',
                object_id: $anvenId,
                action_id: $actionId,
                url_success: 'action_form.php?success=1&amp;default=ARTIFACT_'+$anvenId+'_'+$actionId,
                url_error: 'action_form.php?failed=1&amp;default=ARTIFACT_'+$anvenId+'_'+$actionId,
                artifact_id: $anvenId,
                'in[object_class]': 'ARTIFACT',
                'in[object_id]': $anvenId,
                'in[action_id]': $actionId,
                'in[url_success]': 'action_form.php?success=1',
                'in[url_error]': 'action_form.php?failed=1',
                'in[param_success][url_close]': 'user_iframe.php?group=1&amp;external=1',
                'in[target_nick]': 'Тестостерон'
            }
        })
        .done(function(msg){
            console.log('полечились ' + msg);
            return true;
        });
        */
    }


    ///////////////////////////////////// сундуки

    // открывает сундуки
    function openBox(boxId, numBoxes) {
        if (numBoxes <= 0) {
            console.log('Сундуки открыты!');
            return;
        }

        // fio 1413
        // green 1498
        var actionId = $("#select_chest_type").val();
        var optionId = $("#option_chest_id").val();
        if (optionId.length > 1) {
            actionId = optionId;
        }

        $.ajax({
            method: "POST",
            url: "action_run.php",
            data: {
                object_class: "ARTIFACT",
                object_id: boxId,
                action_id: actionId,
                url_success: "action_form.php?success=1&amp;default=ARTIFACT_"+boxId+"_"+actionId,
                url_error: "action_form.php?failed=1&amp;default=ARTIFACT_"+boxId+"_"+actionId,
                artifact_id: boxId,
                'in[object_class]': "ARTIFACT",
                'in[object_id]': boxId,
                'in[action_id]': actionId,
                'in[url_success]': 'action_form.php?success=1',
                'in[url_error]': 'action_form.php?failed=1',
                'in[param_success][url_close]': 'user.php?mode=personage&amp;group=3&amp;update_swf=1'
            }
        })
        .done(function(msg){
            console.log('Сундук открыт.');
            openBox(boxId, --numBoxes);
            $('#chestInfo').html(numBoxes);
        });
    }

}());


