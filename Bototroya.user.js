// ==UserScript==
// @name         Bototroya
// @namespace    http://your.homepage/
// @version      0.1
// @description  Бот для игры Троецарствие
// @author       Vladimir Velikiy
// @include     https://3k.mail.ru/main.php*
// @include     http://3k.mail.ru/main.php*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js
// @grant       none
// ==/UserScript==

;(function() {

    // xml данные охоты
    var huntData;

    var updateTimer;

    var parser;
    var farmer;
    var protector;
    var doctor;

    var observer;
    var startObserver;

    $huntUpdateDelay = 2500;
    var isRunBot = false;



    $(document).ready(function() {
        observer = new Observer();
        startObserver = new Observer();

        createGui();
        parser = new Parser();
        farmer = new Farmer(parser, stopFarm);
        protector = new Protector(parser, farmer);
        doctor = new Doctor(farmer, stopFarm);

        observer.subscribe(parser.onUpdate.bind(parser));
        observer.subscribe(farmer.onUpdate.bind(farmer));
        observer.subscribe(protector.onUpdate.bind(protector));
        observer.subscribe(doctor.onUpdate.bind(doctor));

        startObserver.subscribe(parser.onStart.bind(parser));
        startObserver.subscribe(farmer.onStart.bind(farmer));
        startObserver.subscribe(protector.onStart.bind(protector));
        startObserver.subscribe(doctor.onStart.bind(doctor));

        Tools.logMsg('Остановлен', '');

        $('#start_farm_btn').on('click', () => {
            if (!isRunBot) {
                startFarm();
            } else {
                stopFarm();
            }
        });

        Tools.sendNotification('Добро пожаловать, ' + window.myNick + '!', {
            body: 'Бот успешно запущен...'
        });

    });

    function startFarm() {
        Tools.logMsg('Стартуем...', 'green');
        isRunBot = true;
        $('#start_farm_btn').removeClass('btn-primary').addClass('btn-danger').html('Стоп');
        $('.form-control').attr('disabled', true);
        $('.checkbox').attr('disabled', true);
        var res1 = $('#usr_item_1').val();
        var res2 = $('#usr_item_2').val();
        var res3 = $('#usr_item_3').val();
        var toolId = $('#tool_id').val();
        var anvenId = $('#anven_id').val();
        localStorage.setItem('res1', res1);
        localStorage.setItem('res2', res2);
        localStorage.setItem('res3', res3);
        localStorage.setItem('tool', toolId);
        localStorage.setItem('anven', anvenId);
        startObserver.broadcast(null);
        updateHunt();
        updateTimer = setInterval(updateHunt, $huntUpdateDelay);
    }

    function stopFarm() {
        Tools.logMsg('Остановлен', '');
        isRunBot = false;
        $('#start_farm_btn').removeClass('btn-danger').addClass('btn-primary').html('Старт');
        $('.form-control').attr('disabled', false);
        $('.checkbox').attr('disabled', false);
        clearInterval(updateTimer);
        farmer.interruptFarm();
    }

    function updateHunt() {
        $.get('http://3k.mail.ru/hunt_conf.php/' + getCookie('sess_uid') + '/203601/', data => {
            observer.broadcast(data);
        });
    }


    function createGui() {
        var res1 = Tools.getValue('res1', 'Болиглав');
        var res2 = Tools.getValue('res2', 'Болиглав');
        var res3 = Tools.getValue('res3', 'Болиглав');
        var toolId = Tools.getValue('tool', '1234');
        var anvenId = Tools.getValue('anven', '1234');

        $('head').append('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">');
        $('head').append('<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>');
        $('body').append('<div id="main_bot_container"></div>');
        $('#main_bot_container').append('<div class="panel panel-default">'+
                                        '<div class="panel-body" id="panel_container_bot"></div></div>');
        $('#panel_container_bot').append('<label for="usr">Ресурс 1:</label>'+
                                         '<input type="text" class="form-control" id="usr_item_1" value="'+res1+'">'+
                                         '<label for="usr">Ресурс 2:</label>'+
                                         '<input type="text" class="form-control" id="usr_item_2" value="'+res2+'">'+
                                         '<label for="usr">Ресурс 3:</label>'+
                                         '<input type="text" class="form-control" id="usr_item_3" value="'+res3+'">');
        $('#panel_container_bot').append('<div class="checkbox">'+
                                         '<label>'+
                                         '<input id="protect_check" class="checkbox" type="checkbox" data-toggle="toggle">Смотреть по сторонам</label>'+
                                         '</div>'+
                                         '<div class="checkbox">'+
                                         '<label>'+
                                         '<input id="auto_check_tool" class="checkbox" type="checkbox" data-toggle="toggle">Попрошайка</label>'+
                                         '</div>'+
                                         '<label for="tool_id">ID инструмента:</label>'+
                                         '<input type="text" class="form-control" id="tool_id" value="'+toolId+'">');
        $('#panel_container_bot').append('<div class="checkbox">'+
                                         '<label>'+
                                         '<input id="anven_check" class="checkbox" type="checkbox" data-toggle="toggle">Красные анвены</label>'+
                                         '</div>'+
                                         '<label for="anven_id">ID анвен:</label>'+
                                         '<input type="text" class="form-control" id="anven_id" value="'+anvenId+'">'+
                                         '<div><span class="label label-default" id="bot_info">Остановлен</span></div><br>');
        $('#panel_container_bot').append('<button id="start_farm_btn" type="button" class="btn btn-primary">Старт</button>');

        $("#main_bot_container").css ( {
            position:   "fixed",
            top:        10,
            left:       "100px",
        } );
        $('#main_bot_container').css("z-index", 555);
        $('#main_bot_container').draggable();
    }

})();



////////////////////////////////////////////////// Observer //////////////////////////////////////////////////
class Observer {
    constructor () {
        this.observers = []
    }

    subscribe (fn) {
        this.observers.push(fn)
    }

    unsubscribe (fn) {
        this.observers = this.observers.filter(subscriber => subscriber !== fn)
    }

    broadcast (data) {
        this.observers.forEach(subscriber => subscriber(data))
    }
}


////////////////////////////////////// Farmer /////////////////////////////////////////////////
class Farmer {

    constructor(parser, stopCallback) {
        this.stopCallback = stopCallback;
        this.parser = parser;
        this.isSafetyFarm = true;
        this.isEnable = false;
        this.isFarming = false;
        this.isPause = false;
        this.enabledRes = [];
        this.currentRes = null;
        this.tick = 0;
        this.pickUpTime = 21 * 1000;
    }

    onStart(data) {
        this.farmResources = [Tools.getValue('res1', 'Болиглав'), Tools.getValue('res2', 'Болиглав'), Tools.getValue('res3', 'Болиглав')];
        this.isEnable = true;
        this.isPause = false;
        this.isSafetyFarm = $('#protect_check').prop('checked');
    }

    onUpdate(data) {
        if (this.isPause) {
            //console.log('Добыча на паузе.');
            Tools.logMsg('Пауза', 'yellow');
            return;
        }
        //console.log(this.tick + ' - ' + this.pickUpTime);
        if (this.isFarming) {
            this.tick += $huntUpdateDelay;
            if (this.tick >= this.pickUpTime) {
                this.isFarming = false;
            }
        }
        if (this.isEnable && !this.isFarming) {
            // find res
            this.isFarming = true;
            this.tick = 0;
            this.currentRes = this.getResource();
            if (this.currentRes != null) {
                this.farmRes();
            } else {
                this.isFarming = false;
                //console.log('Ресов нет!');
                Tools.logMsg('Ресурсов не найдено...', 'yellow');
            }
        }
    }

    farmRes() {
        Tools.logMsg('Сбор ' + this.currentRes.name + ', id ' + this.currentRes.num, 'blue');
        var rand = Math.floor((Math.random() * 500) + 300);
        var self = this;
        $.ajax({
            type: 'POST',
            url: 'http://3k.mail.ru/hunt_conf.php/4580127/997630/?mode=farm&action=chek&lid=1&num=' + this.currentRes.num + '&xy=' + rand + '&t=1&sig=6474b563235dd5454ba53a3a3b84590a',
            dataType: 'xml',
            success: self.farmItemResult.bind(self)
        });
    }

    farmItemResult(data, textStatus, xhr) {
        var status = $(data).find('req').attr('status');
        var farmMsg = $(data).find('req').attr('msg');
        var startTime = $(data).find('req').attr('stime');
        var finishTime = $(data).find('req').attr('ftime');
        this.pickUpTime = (finishTime - startTime) * 1000;

        // добыча была прервана
        if (status == '0') {
            // У Вас не хватает места в рюкзаке!
            // Вы находитесь в бою!
            // У Вас нет необходимого инструмента!
            this.isFarming = false;

            if (farmMsg == 'У Вас не хватает места в рюкзаке!' || farmMsg == 'Вы находитесь в бою!') {
                this.stopCallback();
                Tools.sendNotification('ВНИМАНИЕ!', {body: farmMsg});
                Tools.logMsg(farmMsg, 'red');
            }

            console.log(farmMsg);
            if (farmMsg == 'У Вас нет необходимого инструмента!') {
                if ($('#auto_check_tool').prop('checked') || $('#anven_check').prop('checked')) {
                    this.isPause = true;
                } else {
                    this.stopCallback();
                    Tools.sendNotification('Бот остановлен.', {body: farmMsg});
                }
            }
        }

        //console.log('идет сбор... id: ' + this.currentRes.num);
    }

    interruptFarm() {
        this.isFarming = false;
        $.get('http://3k.mail.ru/hunt_conf.php/' + getCookie('sess_uid') + '/203601/?mode=farm&action=cancel', (data) => {
            //console.log('Сбор отменен!');
            Tools.logMsg('Сбор отменен!', 'red');
        });
    }


    // Возвращает ресурс, который нужно собрать.
    getResource() {
        this.filterResources();
        this.sortResources();
        //console.log(this.enabledRes);
        if (this.isSafetyFarm) {
            return this.getSafetyResource();
        }
        return this.enabledRes[0];
    }

    getSafetyResource() {
        var isSafety = true;
        for (var i = 0; i < this.enabledRes.length; i++) {
            isSafety = true;
            for (var j = 0; j < this.parser.bots.length; j++) {
                if (!Tools.isSafetyDistance(this.enabledRes[i], this.parser.bots[j])) {
                    isSafety = false;
                }
            }
            if (isSafety) {
                return this.enabledRes[i];
            }
        }
        return null;
    }

    filterResources() {
        this.enabledRes = [];
        for (var i = 0; i < this.parser.items.length; i++) {
            for (var j = 0; j < this.farmResources.length; j++) {
                if (this.parser.items[i].name == this.farmResources[j]) {
                    this.enabledRes.push(this.parser.items[i]);
                }
            }
        }
    }

    sortResources() {
        var tmpRes = this.enabledRes;
        this.enabledRes = [];
        for (var i = 0; i < this.farmResources.length; i++) {
            for (var j = 0; j < tmpRes.length; j++) {
                if (this.farmResources[i] == tmpRes[j].name) {
                    this.enabledRes.push(tmpRes[j]);
                }
            }
        }
    }



}


//////////////////////////////////////////// Parser ///////////////////////////////////////////////
class Parser {
    constructor() {
        this.items = [];
        this.bots = [];
    }

    onStart(data) {

    }

    onUpdate(data) {
        this.parseRecources(data);
        this.parseBots(data);
        //console.log('Распарсил');
    }

    parseRecources(data) {
        this.items = [];
        $(data).find('item').each((index, value) => {
            var x = Number($(value).attr('x'));
            var y = Number($(value).attr('y'));
            if ($(value).attr('farming') == '0' &&  x < 1550 && y < 1550) {
                this.items.push({
                    name: $(value).attr('name'),
                    num: $(value).attr('num'),
                    x: $(value).attr('x'),
                    y: $(value).attr('y')
                });
            }
        });
    }

    parseBots(data) {
        this.bots = [];
        $(data).find('bot').each((index, value) => {
            var x = Number($(value).attr('x'));
            var y = Number($(value).attr('y'));
            if ($(value).attr('fight_id') == '0' &&  x < 1550 && y < 1550 && $(value).attr('agrforbid') == 0) {
                this.bots.push({
                    name: $(value).attr('name'),
                    x: $(value).attr('x'),
                    y: $(value).attr('y')
                });
            }
        });
    }
}


//////////////////////////////////////////// Protector ///////////////////////////////////////////
class Protector {
    constructor(parser, farmer) {
        this.parser = parser;
        this.farmer = farmer;
        this.isSafetyFarm = true;
    }

    onStart(data) {
        this.isSafetyFarm = $('#protect_check').prop('checked');
    }

    onUpdate(data) {
        if (this.isSafetyFarm && this.farmer.isFarming && this.farmer.currentRes != null) {
            //console.log('Проверка реса: ' + this.farmer.currentRes.num);
            for (var i = 0; i < this.parser.bots.length; i++) {
                if (!Tools.isSafetyDistance(this.farmer.currentRes, this.parser.bots[i])) {
                    this.farmer.interruptFarm();
                }
            }
        }
    }

}


////////////////////////////////////////// Doctor /////////////////////////////////////////////////
class Doctor {
    constructor(farmer, stopFarm) {
        this.farmer = farmer;
        this.stopFarm = stopFarm;
        this.cutPhrase = ['Получено: порез 1шт.:cry2:', 'Полечите порез пожалуйста!:cry2:'];
        this.tnxPhrase = ['Спасибо!', 'Спасибо доктору!', 'Большое спасибо!', 'Благодарю!', 'Огромное спасибо!'];
        this.reset();
    }

    onStart(data) {
        this.anvenId = Tools.getValue('anven');
        this.toolId = Tools.getValue('tool');
        this.isEnableAnven = $('#anven_check').prop('checked');
        this.isAutoTool = $('#auto_check_tool').prop('checked');
    }

    onUpdate() {
        if (this.farmer.isPause && this.isEnableAnven) {
            this.goAnven();
        } else if (this.farmer.isPause && this.isAutoTool && !this.isEnableAnven) {
            this.goChat();
        } else {
            this.reset();
        }
        
    }

    goAnven() {
        var self = this;
        this.anvenTick--;
        if (this.anvenTick <= 0) {
            this.anvenTick = 4;
            this.cureYorself(function(){
                self.checkCut(function(){
                    // порез не полечился, анвены кончиилсь
                    self.isEnableAnven = false;
                }, function(){
                    // пореза нет, можно надевать инструмент
                    console.log('порез вылечен, теперь надеваем инструмент...');
                    self.putTool();
                });
            }, self);

        }
    }

    goChat() {
        var self = this;
        this.tick++;
        this.lastTimePhrase += $huntUpdateDelay;
        if (this.tick % 3 == 0) {
            //console.log('Запуск проверки пореза...' + this.lastTimePhrase);
            this.checkCut(function(){
                // есть порез
                if (self.lastTimePhrase >= self.timeoutPhrase) {
                    //console.log('Кричим за порез.');
                    Tools.sayToChat(self.getCutPhrase());
                    self.lastTimePhrase = 0;
                    self.isSayThx = false;
                }
            }, function(){
                if (!self.isSayThx) {
                    self.isSayThx = true;
                    var doctorName = self.getDoctorName();
                    if (doctorName != null && doctorName != window.myNick) {
                        Tools.sayToChat('prv['+doctorName+']'+self.tnxPhrase[Math.floor(Math.random()*self.tnxPhrase.length)]);
                    }
                }
                self.putTool();
            });
        }
    }

    checkCut(cut, nonCut) {
        $.get('effect_info.php?nick=' + window.myNick, function(data){
            if (data.search('Порез') > 0) {
                cut();
            } else {
                nonCut();
            }
        });
    }

    putTool() {
        //console.log('Надеваем инструмент...');
        $.ajax({
            type: 'GET',
            url: 'http://3k.mail.ru/action_run.php?code=PUT_ON&url_success=user_iframe.php%3Fgroup%3D2%26update_swf%3D1&url_error=user_iframe.php%3Fgroup%3D2%26update_swf%3D1&artifact_id='+this.toolId+'&in[slot_num]=0&in[variant_effect]=0',
            success: this.onPut.bind(this)
        });

    }

    onPut(data, status, xhr){
        //console.log('Инструмент надет...');
        this.farmer.isPause = false;
        this.reset();
    }

    reset() {
        this.tick = 0;
        this.timeoutPhrase = 180000;
        this.lastTimePhrase = this.timeoutPhrase;
        this.isSayThx = true;

        this.anvenTick = 0;
    }

    getCutPhrase() {
        return this.cutPhrase[Math.floor(Math.random()*this.cutPhrase.length)];
    }

    getDoctorName() {
        var cht = top.frames.chat;
        var reg = new RegExp("\\d+:\\d+(.*)(?=исцелил порез персонажу "+window.myNick+".)", 'g');
        var str = cht.chatOpts.main.data[0].innerText;
        str = str.match(reg);
        //console.log(str);
        if (str != null) {
            var last = str[str.length-1].trim();
            return last.substring(7);
        } else {
            return null;
        }
    }

    cureYorself(onDone, self) {
        self.sendPostForm(onDone, 'action_run.php', {
            object_class: 'ARTIFACT',
            object_id: this.anvenId,
            action_id: '8426',
            url_success: 'action_form.php?success=1&amp;default=ARTIFACT_'+this.anvenId+'_8426',
            url_error: 'action_form.php?failed=1&amp;default=ARTIFACT_'+this.anvenId+'_8426',
            artifact_id: this.anvenId,
            'in[object_class]': 'ARTIFACT',
            'in[object_id]': this.anvenId,
            'in[action_id]': '8426',
            'in[url_success]': 'action_form.php?success=1',
            'in[url_error]': 'action_form.php?failed=1',
            'in[param_success][url_close]': 'user_iframe.php?group=1&amp;external=1',
            'in[target_nick]': window.myNick
        });
    }

    sendPostForm(onDone, path, parameters) {
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

        formAnven.bind('ajax:complete', onDone);
        $(document.body).append(formAnven);

        formAnven.submit();
    }


}


////////////////////////////////////////// Tools ///////////////////////////////////////////////////
class Tools {
    static isSafetyDistance(res, bot) {
        var dist = Tools.getDistance(res.x, res.y, bot.x, bot.y);
        if (dist > 60) {
            return true;
        } else {
            return false;
        }
    }

    static getDistance(x1, y1, x2, y2) {
        var r = ((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1));
        return Math.round(Math.sqrt(r));
    }

    static sayToChat(txt){
        //console.log('В чат: ' + txt);
        window._top().frames['chat'].chatSendMessage(txt);
    }

    static sendNotification(title, options) {
        options.icon = '/info/pictures/image/new_logo_dlya_ip.png';
        options.dir = 'auto';

        if (!("Notification" in window)) {
            console.log('Ваш браузер не поддерживает HTML Notifications, его необходимо обновить.');
        }

        // Проверим, есть ли права на отправку уведомлений
        else if (Notification.permission === "granted") {
            // Если права есть, отправим уведомление
            var notification = new Notification(title, options);
        }

        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {
                // Если права успешно получены, отправляем уведомление
                if (permission === "granted") {
                    var notification = new Notification(title, options);
                } else {
                    alert('Вы запретили показывать уведомления'); // Юзер отклонил наш запрос на показ уведомлений
                }
            });
        } else {
            // Пользователь ранее отклонил наш запрос на показ уведомлений
        }
    }

    static getValue(key, def) {
        var result = localStorage.getItem(key);
        return (result === null) ? def : result;
    }

    static logMsg(msg, type) {
        var classes;
        if (type == 'red') {
            classes = 'label label-warning';
        } else if (type == 'yellow') {
            classes = 'label label-danger';
        } else if (type == 'green') {
            classes = 'label label-success';
        } else if (type == 'blue') {
            classes = 'label label-primary';
        } else {
            classes = 'label label-default';
        }
        $('#bot_info').removeClass().addClass(classes).html(msg);
    }

}

