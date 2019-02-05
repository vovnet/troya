// ==UserScript==
// @name         Candle Calculator
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       Vladimir Velikiy
// @include     https://3k.mail.ru/main.php*
// @include     http://3k.mail.ru/main.php*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js
// @grant        none
// ==/UserScript==

;(function(){
    if (window.self != window.top) {
        return;
    }

    $(document).ready(function() {
        $items = [];
        prepare();

        $('head').append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">');
        $('head').append('<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>');
        $('body').append('<div id="candle_container" class="col-xs-4"></div>');
        $('#candle_container').append('<div class="panel panel-primary">'+
                                      '<div class="panel-heading"><h5>Анализатор Светочей</h5></div>'+
                                      '<div class="panel-body" id="candle_container_id"></div></div>');
        $('#candle_container_id').append('<div class="dropdown">'+
                                         '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">Выберите вещь'+
                                         '<span class="caret"></span></button>'+
                                         '<ul class="dropdown-menu">'+
                                         generateDropDown()+
                                         '</ul>'+
                                         '</div>');
        $('#candle_container_id').append('<div id="res_id"><h5>Зайдите в рюкзак и откройте вкладку со светочами. Затем нажмите кнопку "Поиск" или выберите нужную вещь.</h5></div>');
        $('#candle_container_id').append('<br><button id="start_analyze_btn" type="button" class="btn btn-primary">Поиск готового комплекта</button>');

        $('#candle_container').draggable();
        $("#candle_container").css ( {
            position:   "fixed",
            top:        10,
            left:       "100px",
        } );

        // выбираем из списка вещь
        $('.candle_drop_down').click(function(e){
            item = getItemByName($(e.target).text());
            result = analyzeItem(item);
            console.log(result);
            $('#res_id h5').html(differenceToString(result));
        });

        // нажимаем кнопку старта анализа
        $('#start_analyze_btn').click(function(){
            $('#start_analyze_btn').attr("disabled", true);
            res = toStringResults(analyze());
            $('#res_id h5').html(res);
            $('#start_analyze_btn').attr("disabled", false);
        });
    });

    function analyze() {
        var results = [];
        for (var key in $items) {
            if (compareItem($items[key])) {
                results.push($items[key]);
            }
        }
        return results;
    }

    function compareItem(item) {
        for (var key in item.candle) {
            if (!isEnoughCandles(item.candle[key].title, item.candle[key].count)) {
                return false;
            }
        }
        return true;
    }

    function isEnoughCandles(candleName, count) {
        for(var key in _top().art_alt) {
            if (_top().art_alt[key].title == candleName && _top().art_alt[key].count >= count) {
                return true;
            }
        }
        return false;
    }

    function toStringResults(results) {
        if (results.length <= 0) {
            return "Ничего нельзя собрать из имеющихся светочей.";
        }

        resString = "<ul><b><h4>Можно собрать:</h4></b><br>";
        for (var i in results) {
            resString += "<li><h5>" + results[i].title + "</h5></li>";
        }
        resString += "</ul>";
        return resString;
    }

    function generateDropDown() {
        res = "";
        for (var i in $items) {
            res += '<li class="candle_drop_down"><a href="#">' + $items[i].title + '</a></li>';
        }
        return res;
    }

    function getItemByName(itemName) {
        for (var i in $items) {
            if (itemName == $items[i].title) {
                return $items[i];
            }
        }
    }

    function analyzeItem(item) {
        result = {};
        result.title = item.title;
        result.difference = [];
        for (var i in item.candle) {
            userCandleCount = getUserCandleCount(item.candle[i].title);
            difference = userCandleCount - item.candle[i].count;
            result.difference.push({candleName: item.candle[i].title, diff: difference});
        }
        return result;
    }


    function getUserCandleCount(candleName) {
        for (var i in _top().art_alt) {
            if (_top().art_alt[i].title == candleName) {
                count = (_top().art_alt[i].count >= 2) ? _top().art_alt[i].count : 1;
                return count;
            }
        }
        return 0;
    }

    function differenceToString(result) {
        str = '<h4>' + result.title + '</h4><br>';
        for (var i in result.difference) {
            if (result.difference[i].diff >= 0) {
                pClass = '<p class="text-success">';
                diff = "(+" + result.difference[i].diff + ")";
            } else {
                pClass = '<p class="text-danger">';
                diff = result.difference[i].diff;
            }
            str += pClass + result.difference[i].candleName + " " + diff + '</p>';
        }
        return str;
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //
    function prepare() {
        item = {};
        item.title = "Оружие Исполина";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч истока силы", count: 54 } );
        item.candle.push( { title: "Пылающий светоч истока жизни", count: 18 } );
        item.candle.push( { title: "Пылающий светоч истока магии", count: 18 } );
        $items.push(item);

        item = {};
        item.title = "Оружие Небесного Гнева";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч истока силы", count: 18 } );
        item.candle.push( { title: "Пылающий светоч истока жизни", count: 18 } );
        item.candle.push( { title: "Пылающий светоч истока магии", count: 54 } );
        $items.push(item);

        item = {};
        item.title = "Оружие Бесстрашия";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч истока силы", count: 18 } );
        item.candle.push( { title: "Пылающий светоч истока жизни", count: 54 } );
        item.candle.push( { title: "Пылающий светоч истока магии", count: 18 } );
        $items.push(item);

        item = {};
        item.title = "Кольчуга или сапоги Исполина";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч сияния силы", count:12 } );
        item.candle.push( { title: "Пылающий светоч сияния жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч сияния магии", count:4 } );
        item.candle.push( { title: "Пылающий светоч звучания силы", count:9 } );
        item.candle.push( { title: "Пылающий светоч звучания жизни", count:3 } );
        item.candle.push( { title: "Пылающий светоч звучания магии", count:3 } );
        item.candle.push( { title: "Пылающий светоч истока силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч истока жизни", count:2 } );
        item.candle.push( { title: "Пылающий светоч истока магии", count:2 } );
        $items.push(item);

        item = {};
        item.title = "Кольчуга или сапоги Небесного Гнева";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч сияния силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч сияния жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч сияния магии", count:12 } );
        item.candle.push( { title: "Пылающий светоч звучания силы", count:3 } );
        item.candle.push( { title: "Пылающий светоч звучания жизни", count:3 } );
        item.candle.push( { title: "Пылающий светоч звучания магии", count:9 } );
        item.candle.push( { title: "Пылающий светоч истока силы", count:2 } );
        item.candle.push( { title: "Пылающий светоч истока жизни", count:2 } );
        item.candle.push( { title: "Пылающий светоч истока магии", count:6 } );
        $items.push(item);

        item = {};
        item.title = "Кольчуга или сапоги Бесстрашия";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч сияния силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч сияния жизни", count:12 } );
        item.candle.push( { title: "Пылающий светоч сияния магии", count:4 } );
        item.candle.push( { title: "Пылающий светоч звучания силы", count:3 } );
        item.candle.push( { title: "Пылающий светоч звучания жизни", count:9 } );
        item.candle.push( { title: "Пылающий светоч звучания магии", count:3 } );
        item.candle.push( { title: "Пылающий светоч истока силы", count:2 } );
        item.candle.push( { title: "Пылающий светоч истока жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч истока магии", count:2 } );
        $items.push(item);

        item = {};
        item.title = "Наручи или наплечники Исполина";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч знака силы", count:12 } );
        item.candle.push( { title: "Пылающий светоч знака жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч знака магии", count:4 } );
        item.candle.push( { title: "Пылающий светоч сияния силы", count:9 } );
        item.candle.push( { title: "Пылающий светоч сияния жизни", count:3 } );
        item.candle.push( { title: "Пылающий светоч сияния магии", count:3 } );
        item.candle.push( { title: "Пылающий светоч звучания силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч звучания жизни", count:2 } );
        item.candle.push( { title: "Пылающий светоч звучания магии", count:2 } );
        $items.push(item);

        item = {};
        item.title = "Наручи или наплечники Небесного Гнева";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч знака силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч знака жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч знака магии", count:12 } );
        item.candle.push( { title: "Пылающий светоч сияния силы", count:3 } );
        item.candle.push( { title: "Пылающий светоч сияния жизни", count:3 } );
        item.candle.push( { title: "Пылающий светоч сияния магии", count:9 } );
        item.candle.push( { title: "Пылающий светоч звучания силы", count:2 } );
        item.candle.push( { title: "Пылающий светоч звучания жизни", count:2 } );
        item.candle.push( { title: "Пылающий светоч звучания магии", count:6 } );
        $items.push(item);

        item = {};
        item.title = "Наручи или наплечники Бесстрашия";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч знака силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч знака жизни", count:12 } );
        item.candle.push( { title: "Пылающий светоч знака магии", count:4 } );
        item.candle.push( { title: "Пылающий светоч сияния силы", count:3 } );
        item.candle.push( { title: "Пылающий светоч сияния жизни", count:9 } );
        item.candle.push( { title: "Пылающий светоч сияния магии", count:3 } );
        item.candle.push( { title: "Пылающий светоч звучания силы", count:2 } );
        item.candle.push( { title: "Пылающий светоч звучания жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч звучания магии", count:2 } );
        $items.push(item);

        item = {};
        item.title = "Шлем Исполина";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч основ силы", count:24 } );
        item.candle.push( { title: "Пылающий светоч основ жизни", count:8 } );
        item.candle.push( { title: "Пылающий светоч основ магии", count:8 } );
        item.candle.push( { title: "Пылающий светоч знака силы", count:18 } );
        item.candle.push( { title: "Пылающий светоч знака жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч знака магии", count:6 } );
        item.candle.push( { title: "Пылающий светоч сияния силы", count:12 } );
        item.candle.push( { title: "Пылающий светоч сияния жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч сияния магии", count:4 } );
        $items.push(item);

        item = {};
        item.title = "Шлем Небесного Гнева";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч основ силы", count:8 } );
        item.candle.push( { title: "Пылающий светоч основ жизни", count:8 } );
        item.candle.push( { title: "Пылающий светоч основ магии", count:24 } );
        item.candle.push( { title: "Пылающий светоч знака силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч знака жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч знака магии", count:18 } );
        item.candle.push( { title: "Пылающий светоч сияния силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч сияния жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч сияния магии", count:12 } );
        $items.push(item);

        item = {};
        item.title = "Шлем Бесстрашия";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч основ силы", count:8 } );
        item.candle.push( { title: "Пылающий светоч основ жизни", count:24 } );
        item.candle.push( { title: "Пылающий светоч основ магии", count:8 } );
        item.candle.push( { title: "Пылающий светоч знака силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч знака жизни", count:18 } );
        item.candle.push( { title: "Пылающий светоч знака магии", count:6 } );
        item.candle.push( { title: "Пылающий светоч сияния силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч сияния жизни", count:12 } );
        item.candle.push( { title: "Пылающий светоч сияния магии", count:4 } );
        $items.push(item);

        item = {};
        item.title = "Оружие Великого Исполина";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч дара силы", count:24 } );
        item.candle.push( { title: "Пылающий светоч дара жизни", count:8 } );
        item.candle.push( { title: "Пылающий светоч дара магии", count:8 } );
        item.candle.push( { title: "Пылающий светоч основ силы", count:18 } );
        item.candle.push( { title: "Пылающий светоч основ жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч основ магии", count:6 } );
        item.candle.push( { title: "Пылающий светоч знака силы", count:12 } );
        item.candle.push( { title: "Пылающий светоч знака жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч знака магии", count:4 } );
        $items.push(item);

        item = {};
        item.title = "Оружие Великого Гнева";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч дара силы", count:8 } );
        item.candle.push( { title: "Пылающий светоч дара жизни", count:8 } );
        item.candle.push( { title: "Пылающий светоч дара магии", count:24 } );
        item.candle.push( { title: "Пылающий светоч основ силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч основ жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч основ магии", count:18 } );
        item.candle.push( { title: "Пылающий светоч знака силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч знака жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч знака магии", count:18 } );
        $items.push(item);

        item = {};
        item.title = "Оружие Великого Бесстрашия";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч дара силы", count:8 } );
        item.candle.push( { title: "Пылающий светоч дара жизни", count:24 } );
        item.candle.push( { title: "Пылающий светоч дара магии", count:8 } );
        item.candle.push( { title: "Пылающий светоч основ силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч основ жизни", count:18 } );
        item.candle.push( { title: "Пылающий светоч основ магии", count:6 } );
        item.candle.push( { title: "Пылающий светоч знака силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч знака жизни", count:12 } );
        item.candle.push( { title: "Пылающий светоч знака магии", count:4 } );
        $items.push(item);

        item = {};
        item.title = "Броня или поножи Великого Исполина";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч стихии силы", count:12 } );
        item.candle.push( { title: "Пылающий светоч стихии жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч стихии магии", count:4 } );
        item.candle.push( { title: "Пылающий светоч дара силы", count:9 } );
        item.candle.push( { title: "Пылающий светоч дара жизни", count:3 } );
        item.candle.push( { title: "Пылающий светоч дара магии", count:3 } );
        item.candle.push( { title: "Пылающий светоч основ силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч основ жизни", count:2 } );
        item.candle.push( { title: "Пылающий светоч основ магии", count:2 } );
        $items.push(item);

        item = {};
        item.title = "Броня или поножи Великого Гнева";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч стихии силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч стихии жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч стихии магии", count:12 } );
        item.candle.push( { title: "Пылающий светоч дара силы", count:3 } );
        item.candle.push( { title: "Пылающий светоч дара жизни", count:3 } );
        item.candle.push( { title: "Пылающий светоч дара магии", count:9 } );
        item.candle.push( { title: "Пылающий светоч основ силы", count:2 } );
        item.candle.push( { title: "Пылающий светоч основ жизни", count:2 } );
        item.candle.push( { title: "Пылающий светоч основ магии", count:6 } );
        $items.push(item);

        item = {};
        item.title = "Броня или поножи Великого Бесстрашия";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч стихии силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч стихии жизни", count:12 } );
        item.candle.push( { title: "Пылающий светоч стихии магии", count:4 } );
        item.candle.push( { title: "Пылающий светоч дара силы", count:3 } );
        item.candle.push( { title: "Пылающий светоч дара жизни", count:9 } );
        item.candle.push( { title: "Пылающий светоч дара магии", count:3 } );
        item.candle.push( { title: "Пылающий светоч основ силы", count:2 } );
        item.candle.push( { title: "Пылающий светоч основ жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч основ магии", count:2 } );
        $items.push(item);

        item = {};
        item.title = "Кольчуга или сапоги Великого Исполина";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч ценности силы", count:12 } );
        item.candle.push( { title: "Пылающий светоч ценности жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч ценности магии", count:4 } );
        item.candle.push( { title: "Пылающий светоч стихии силы", count:9 } );
        item.candle.push( { title: "Пылающий светоч стихии жизни", count:3 } );
        item.candle.push( { title: "Пылающий светоч стихии магии", count:3 } );
        item.candle.push( { title: "Пылающий светоч дара силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч дара жизни", count:2 } );
        item.candle.push( { title: "Пылающий светоч дара магии", count:2 } );
        $items.push(item);

        item = {};
        item.title = "Кольчуга или сапоги Великого Гнева";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч ценности силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч ценности жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч ценности магии", count:12 } );
        item.candle.push( { title: "Пылающий светоч стихии силы", count:3 } );
        item.candle.push( { title: "Пылающий светоч стихии жизни", count:3 } );
        item.candle.push( { title: "Пылающий светоч стихии магии", count:9 } );
        item.candle.push( { title: "Пылающий светоч дара силы", count:2 } );
        item.candle.push( { title: "Пылающий светоч дара жизни", count:2 } );
        item.candle.push( { title: "Пылающий светоч дара магии", count:6 } );
        $items.push(item);

        item = {};
        item.title = "Кольчуга или сапоги Великого Бесстрашия";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч ценности силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч ценности жизни", count:12 } );
        item.candle.push( { title: "Пылающий светоч ценности магии", count:4 } );
        item.candle.push( { title: "Пылающий светоч стихии силы", count:3 } );
        item.candle.push( { title: "Пылающий светоч стихии жизни", count:9 } );
        item.candle.push( { title: "Пылающий светоч стихии магии", count:3 } );
        item.candle.push( { title: "Пылающий светоч дара силы", count:2 } );
        item.candle.push( { title: "Пылающий светоч дара жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч дара магии", count:2 } );
        $items.push(item);

        item = {};
        item.title = "Наплечники или наручи Великого Исполина";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч торжества силы", count:12 } );
        item.candle.push( { title: "Пылающий светоч торжества жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч торжества магии", count:4 } );
        item.candle.push( { title: "Пылающий светоч ценности силы", count:9 } );
        item.candle.push( { title: "Пылающий светоч ценности жизни", count:3 } );
        item.candle.push( { title: "Пылающий светоч ценности магии", count:3 } );
        item.candle.push( { title: "Пылающий светоч стихии силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч стихии жизни", count:2 } );
        item.candle.push( { title: "Пылающий светоч стихии магии", count:2 } );
        $items.push(item);

        item = {};
        item.title = "Наплечники или наручи Великого Гнева";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч торжества силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч торжества жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч торжества магии", count:12 } );
        item.candle.push( { title: "Пылающий светоч ценности силы", count:3 } );
        item.candle.push( { title: "Пылающий светоч ценности жизни", count:3 } );
        item.candle.push( { title: "Пылающий светоч ценности магии", count:9 } );
        item.candle.push( { title: "Пылающий светоч стихии силы", count:2 } );
        item.candle.push( { title: "Пылающий светоч стихии жизни", count:2 } );
        item.candle.push( { title: "Пылающий светоч стихии магии", count:6 } );
        $items.push(item);

        item = {};
        item.title = "Наплечники или наручи Великого Бесстрашия";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч торжества силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч торжества жизни", count:12 } );
        item.candle.push( { title: "Пылающий светоч торжества магии", count:4 } );
        item.candle.push( { title: "Пылающий светоч ценности силы", count:3 } );
        item.candle.push( { title: "Пылающий светоч ценности жизни", count:9 } );
        item.candle.push( { title: "Пылающий светоч ценности магии", count:3 } );
        item.candle.push( { title: "Пылающий светоч стихии силы", count:2 } );
        item.candle.push( { title: "Пылающий светоч стихии жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч стихии магии", count:2 } );
        $items.push(item);

        item = {};
        item.title = "Шлем Великого Исполина";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч величия силы", count:24 } );
        item.candle.push( { title: "Пылающий светоч величия жизни", count:8 } );
        item.candle.push( { title: "Пылающий светоч величия магии", count:8 } );
        item.candle.push( { title: "Пылающий светоч торжества силы", count:18 } );
        item.candle.push( { title: "Пылающий светоч торжества жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч торжества магии", count:6 } );
        item.candle.push( { title: "Пылающий светоч ценности силы", count:12 } );
        item.candle.push( { title: "Пылающий светоч ценности жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч ценности магии", count:4 } );
        $items.push(item);

        item = {};
        item.title = "Шлем Великого Гнева";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч величия силы", count:8 } );
        item.candle.push( { title: "Пылающий светоч величия жизни", count:8 } );
        item.candle.push( { title: "Пылающий светоч величия магии", count:24 } );
        item.candle.push( { title: "Пылающий светоч торжества силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч торжества жизни", count:6 } );
        item.candle.push( { title: "Пылающий светоч торжества магии", count:18 } );
        item.candle.push( { title: "Пылающий светоч ценности силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч ценности жизни", count:4 } );
        item.candle.push( { title: "Пылающий светоч ценности магии", count:12 } );
        $items.push(item);

        item = {};
        item.title = "Шлем Великого Бесстрашия";
        item.candle = [];
        item.candle.push( { title: "Пылающий светоч величия силы", count:8 } );
        item.candle.push( { title: "Пылающий светоч величия жизни", count:24 } );
        item.candle.push( { title: "Пылающий светоч величия магии", count:8 } );
        item.candle.push( { title: "Пылающий светоч торжества силы", count:6 } );
        item.candle.push( { title: "Пылающий светоч торжества жизни", count:18 } );
        item.candle.push( { title: "Пылающий светоч торжества магии", count:6 } );
        item.candle.push( { title: "Пылающий светоч ценности силы", count:4 } );
        item.candle.push( { title: "Пылающий светоч ценности жизни", count:12 } );
        item.candle.push( { title: "Пылающий светоч ценности магии", count:4 } );
        $items.push(item);
    }

}());