// ==UserScript==
// @name         TroyaDealer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Массовое добавление товаров на рынок.
// @author       Владимир Великий.
// @include      https://3k.mail.ru/main.php*
// @include      http://3k.mail.ru/main.php*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @require      http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js
// @grant        none
// ==/UserScript==

(function() {
    if (window.self != window.top) {
        return;
    }

    $(document).ready(function() {
        $('head').append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">');
        $('head').append('<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>');
        $('body').append('<div id="main_bot_container"></div>');
        $('#main_bot_container').append('<div class="panel panel-default">'+
                                        '<div class="panel-body" id="panel_container_bot"></div></div>');
        $('#panel_container_bot').append('<div id="f" class="tab-pane fade in active">'+
                                     '<h2>Торгаш</h2>'+
                                     '<label>ID товара:</label>'+
                                     '<input type="text" class="form-control" id="id_product" value="">'+
                                     '<label>Количество:</label>'+
                                     '<input type="text" class="form-control" id="num_product" value="">'+
                                     '<label>Ставка:</label>'+
                                     '<input type="text" class="form-control" id="start_price" value="">'+
                                     '<label>Выкуп:</label>'+
                                     '<input type="text" class="form-control" id="buyout" value="">'+
                                     '<div class="form-group">'+
                                     '<label for="duration">Срок:</label>'+
                                     '<select class="form-control" id="duration">'+
                                         '<option value="2">2 часа</option>'+
                                         '<option value="8">8 часов</option>'+
                                         '<option value="24">24 часа</option>'+
                                         '<option value="48">2 дня</option>'+
                                         '<option value="72">3 дня</option>'+
                                     '</select></div>'+
                                     '<br><button id="start_btn" type="button" class="btn btn-primary">Выставить</button>'+
                                     '</div>');
        $("#main_bot_container").css ( {
            position:   "fixed",
            top:        10,
            left:       "100px",
        } );
        $('#main_bot_container').css("z-index", 555);
        $('#main_bot_container').draggable();

        $('#start_btn').click(function(){
            /*
            var frame = top.frames[1].gebi('main');
            var form = frame.contentWindow.document.getElementById('new_message');
            var formData = $(form).serialize();
            */
            var productId = $('#id_product').val();
            var buyout = $('#buyout').val();
            var num = $('#num_product').val();
            var startPrice = $('#start_price').val();
            var duration = $('#duration').val();

            $.ajax({
                type: 'post',
                url: 'area.php?&mode=newlot&action=lot_add',
                data: {
                    'form[anonym]': '',
                    'form[artifact_id]': productId,
                    'form[buyout]':	buyout,
                    'form[drop_price]': 0,
                    'form[duration]': duration,
                    'form[lot_add]': '%C2%FB%F1%F2%E0%E2%E8%F2%FC',
                    'form[n]':	num,
                    'form[start_price]': startPrice,
                    'lot_dration_radio': duration,
                },
                success: function(data) {
                    console.log('Лот выставлен.');
                },
                error: function(data) {
                    console.log('Ошибка при добавлении лота!');
                },
            });
        });


    });
})();