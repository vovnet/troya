// ==UserScript==
// @name         Injury
// @namespace    http://vovvvv.net
// @version      0.1
// @description  лечилка травм в трое
// @author       Vladimir
// @include     https://3k.mail.ru/main.php*
// @include     http://3k.mail.ru/main.php*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js
// @grant        none
// ==/UserScript==

;(function() {
    if (window.self != window.top) {
        return;
    }

    $(document).ready(function() {

        var injury_data = {
            type: 0,
            roll_id: '2245589217',
            roll_num: 1,
            injuryLevels: [0, 1],
            rolls: ['2350902140', '2350902140'],
            action_id: '937'
        };

        var injuryTypes = [
            ['Ушиб головы',
             'Ушиб ноги',
             'Ушиб груди',
             'Ушиб бедра',
             'Ушиб плеча',
             'Ушиб руки'
            ],

            ['Поверхностная рана головы',
             'Поверхностная рана ноги',
             'Поверхностная рана груди',
             'Поверхностная рана бедра',
             'Поверхностная рана плеча',
             'Поверхностная рана руки'
            ],

            ['Глубокая рана головы',
             'Глубокая рана ноги',
             'Глубокая рана груди',
             'Глубокая рана бедра',
             'Глубокая рана плеча',
             'Глубокая рана руки'
            ],

            ['Глубокая рваная рана головы',
             'Глубокая рваная рана ноги',
             'Глубокая рваная рана груди',
             'Глубокая рваная рана бедра',
             'Глубокая рваная рана плеча',
             'Глубокая рваная рана руки'
            ],

            ['Глубокая зараженная рана головы',
             'Глубокая зараженная рана ноги',
             'Глубокая зараженная рана груди',
             'Глубокая зараженная рана бедра',
             'Глубокая зараженная рана плеча',
             'Глубокая зараженная рана руки'
            ],

            ['Серьезная рана головы',
             'Серьезная рана ноги',
             'Серьезная рана груди',
             'Серьезная рана бедра',
             'Серьезная рана плеча',
             'Серьезная рана руки'
            ],

            ['Пролом черепа',
             'Перелом ноги',
             'Перелом ребра',
             'Перелом бедра',
             'Перелом ключицы',
             'Перелом руки'
            ],

            ['Обширный пролом черепа',
             'Открытый перелом ноги',
             'Открытый перелом ребра',
             'Открытый перелом бедра',
             'Открытый перелом ключицы',
             'Открытый перелом руки'
            ]
        ];

        var INJURIES = ['HEAD', 'FOOT', 'ARMOR', 'LEG', 'SHOULDER', 'GLOVE'];

        var interval = null;

        var curedInjuries = 0;

        var lastCuredUsers = {}; // информация о полеченных юзерах и время последнего лечения каждого

        var tickDelay = 5000; // интервал проверки локации на травмированных
        var minCureDelay = 20000; // минимальное время задержки после лечения перса

        window.inj = injury;

        function injury() {
            return lastCuredUsers;
        }

        $('head').append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">');
        $('head').append('<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>');
        $('body').append('<div id="main_bot_container"></div>');
        $('#main_bot_container').append('<div class="panel panel-default">'+
                                        '<div class="panel-body" id="panel_container_bot"></div></div>');
        $('#panel_container_bot').append('<div id="injury">'+
                                     '<h2>Знахарь</h2>'+
                                     '<div><span class="label label-default" id="farmInfo">Остановлен</span></div><br>'+
                                     '<label for="usr">Тип травмы:</label>'+
                                     '<input type="text" class="form-control" id="injury_type" value="">'+
                                     '<label for="usr">ID свитков:</label>'+
                                     '<input type="text" class="form-control" id="roll_id" value="">'+
                                     '<label for="usr">Количество свитков на травму:</label>'+
                                     '<input type="text" class="form-control" id="roll_num" value="">'+
                                     '<br><button id="start_btn" type="button" class="btn btn-primary">Лечить</button>'+
                                     '</div>');

        $("#main_bot_container").css ( {
            position:   "fixed",
            top:        10,
            left:       "100px",
        } );
        $('#main_bot_container').css("z-index", 555);
        $('#main_bot_container').draggable();


        /*
        * Start
        */
        $('#start_btn').click(function(){
            if (!interval) {
                start();
            } else {
                stop();
            }
        });

        function start() {
            //injury_data.type = $('#injury_type').val();
            //injury_data.roll_id = $('#roll_id').val();
            //injury_data.roll_num = $('#roll_num').val();

            interval = setInterval(update, tickDelay);

            $('.form-control').attr('disabled', true);
            $('#start_btn').removeClass('btn-primary').addClass('btn-danger').html('Стоп');
        }

        function stop() {
            clearInterval(interval);
            interval = null;

            $('.form-control').attr('disabled', false);
            $('#start_btn').removeClass('btn-danger').addClass('btn-primary').html('Лечить');
        }

        function update() {
            _top().chat.chatRefreshUsers();
            execute(getChatFrame().chatUserHtml);
        }

        function execute(htmlData) {
            $(htmlData).each(function(index, value) {
                if (value.nodeName == "DIV") {

                    if ( isInjury(value.children) ) {
                        var nick = getNickname(value.textContent);
                        //var injury = getInjury( $(value).html(), injuryTypes[injury_data.type] );
                        var injury = getInjury( $(value).html() );

                        if ( injury && isValidDelayUser(nick) ) {
                            console.log('Лечим ' + nick + ' ' + injury.name);
                            // обновляем юзеру время лечения травмы
                            setCureTime(nick);
                            // лечим юзера
                            cure(nick, injury);
                            curedInjuries++;
                            updateLog();
                        } else {
                            console.log('Подходящих травм у ' + nick + ' не обнаружено.');
                        }
                    }
                }
            });

            console.log('----------------');
        }


        /*
        * Проверяет есть ли у юзера хоть какая-нибудь травма.
        */
        function isInjury(node) {
            var result = false;

            $(node).each(function(index, value) {
                if ( value.outerHTML.search('showInjuryInfo') > 0 ) {
                    result = true;
                    return;
                }
            });

            return result;
        }


        /*
        * Возвращает инфу о травме юзера, если она нам подходит, иначе false.
        */
        /*
        function getInjury(html, allowInjuries) {
            for (var i = 0; i < allowInjuries.length; i++) {
                if ( html.search(allowInjuries[i]) > -1 ) {
                    return {
                        name: allowInjuries[i],
                        index: i,
                        type: INJURIES[i]
                    };
                }
            }

            return false;
        }
        */

        /*
        * Возвращает инфу о травме юзера, если она нам подходит, иначе false.
        */
        function getInjury(html) {
            for (var i = 0; i < injury_data.injuryLevels.length; i++) {
                var injuryLevel = injury_data.injuryLevels[i];

                for (var j = 0; j < injuryTypes[injuryLevel].length; j++) {
                    if ( html.search(injuryTypes[injuryLevel][j]) > -1 ) {
                        return {
                            name: injuryTypes[injuryLevel][j],
                            injuryLevel: injuryLevel,
                            type: INJURIES[j]
                        };
                    }
                }
            }
        }


        /*
        * Лечит травму юзеру.
        */
        function cure(nick, injury) {
            var actionId = injury_data.action_id;
            var rollId = injury_data.rolls[injury.injuryLevel];

            sendPostForm('action_run.php', {
                'object_class': 'ARTIFACT',
                'object_id': rollId,
                'action_id': actionId,
                'url_success': 'action_form.php?success=1&default=ARTIFACT_' + rollId + '_' + actionId,
                'url_error': 'action_form.php?failed=1&default=ARTIFACT_' + rollId + '_' + actionId,
                'artifact_id' : rollId,
                'in[object_class]': 'ARTIFACT',
                'in[object_id]': rollId,
                'in[action_id]': actionId,
                'in[url_success]': 'action_form.php?success=1',
                'in[url_error]': 'action_form.php?failed=1',
                'in[param_success][url_close]': 'user_iframe.php?group=1&external=1',
                'in[nick]': nick,
                'in[slot_id]': injury.type,
                'in[num_artifacts]': injury_data.roll_num,
            });
        }


        // отправка формы
        function sendPostForm(path, parameters) {
            var formAnven = $('<form></form>');

            formAnven.attr("target", "_blank");
            formAnven.attr("method", "post");
            formAnven.attr("action", path);

            $.each(parameters, function(key, value) {
                var field = $('<input></input>');

                field.attr("type", "hidden");
                field.attr("name", key);
                field.attr("value", value);

                formAnven.append(field);
            });

            $(document.body).append(formAnven);

            formAnven.submit();
        }


        /*
        * Возвращает ник юзера
        */
        function getNickname(str) {
            var result = str.split('[');
            return result[0].trim();
        }



        function updateLog() {
            $('#farmInfo').text('Вылечено травм: ' + curedInjuries);
        }


        function isValidDelayUser(nick) {
            if (nick in lastCuredUsers) {
                return (new Date().getTime() - lastCuredUsers[nick].time) > minCureDelay;
            }

            return true;
        }


        function setCureTime(nick) {
            lastCuredUsers[nick] = { time: Date.now() };
        }

    });
})();