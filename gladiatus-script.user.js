// ==UserScript==
// @name         Gladiatus Script
// @version      2.30
// @description  Dodatek do gry Gladiatus
// @author       Eryk Bodziony
// @match        *://*.gladiatus.gameforge.com/game/index.php*
// @exclude      *://*.gladiatus.gameforge.com/game/index.php?mod=start
// @downloadURL  https://github.com/ebodziony/gladiatus-script/raw/master/gladiatus-script.js
// @updateURL    https://github.com/ebodziony/gladiatus-script/raw/master/gladiatus-script.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @resource     customCSS_global  https://raw.githubusercontent.com/ebodziony/gladiatus-script/master/global.css?ver=1.9
// ==/UserScript==


(function() {
    'use strict';

    // Add CSS

    function addCustomCSS(){

        const globalCSS = GM_getResourceText("customCSS_global");
        GM_addStyle(globalCSS);

    }
    addCustomCSS();

    /*****************
    *     Global     *
    *****************/

    let autoGoActive = false;
    if (sessionStorage.getItem('autoGoActive')) {
        autoGoActive = sessionStorage.getItem('autoGoActive') === "true" ? true : false;
    };

    const currentTime = new Date().getTime();

    const playerLevel = $("#header_values_level").first().html()

    const healthPoints = Number(document.getElementById("header_values_hp_percent").firstChild.nodeValue.replace(/[^0-9]/gi, ''));

    /*****************
    *     Config     *
    *****************/

    //Mode
    let safeMode = false;

    //Quests
    let doQuests = true;
    if (localStorage.getItem('doQuests')) {
        doQuests = localStorage.getItem('doQuests') === "true" ? true : false;
    }
    let nextQuestTime = 0;
    if (localStorage.getItem('nextQuestTime')) {
        nextQuestTime = Number(localStorage.getItem('nextQuestTime'));
    }

    //Expedition
    let doExpedition = true;
    if (localStorage.getItem('doExpedition')) {
        doExpedition = localStorage.getItem('doExpedition') === "true" ? true : false;
    };
    // let locationId = 0;
    // let locationName = "Not selected";
    let monsterId = 0;
    if (localStorage.getItem('monsterId')) {
        monsterId = Number(localStorage.getItem('monsterId'));
    };

    //Dungeon
    let doDungeon = true;
    if (localStorage.getItem('doDungeon')) {
        doDungeon = localStorage.getItem('doDungeon') === "true" ? true : false;
    };
    if (playerLevel < 10) {
        doDungeon = false;
    };
    let dungeonId = 0;
    let dungeonDifficulty = "normalne";
    if (localStorage.getItem('dungeonDifficulty')) {
        dungeonDifficulty = localStorage.getItem('dungeonDifficulty');
    };

    //Arena
    let doArena = true;
    if (localStorage.getItem('doArena')) {
        doArena = localStorage.getItem('doArena') === "true" ? true : false;
    };
    if (playerLevel < 2) {
        doArena = false;
    };
    let arenaOpponentLevel = "min"
    if (localStorage.getItem('arenaOpponentLevel')) {
        arenaOpponentLevel = localStorage.getItem('arenaOpponentLevel');
    };

    //Circus
    let doCircus = true;
    if (localStorage.getItem('doCircus')){
        doCircus = localStorage.getItem('doCircus') === "true" ? true : false;
    };
    if (playerLevel < 10) {
        doCircus = false;
    };
    let circusOpponentLevel = "min"
    if (localStorage.getItem('circusOpponentLevel')) {
        circusOpponentLevel = localStorage.getItem('circusOpponentLevel');
    };

    //Event Expedition
    var doEventExpedition = true;
    if (document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0] === undefined){
        doEventExpedition = false;
    };
    var eventMonsterId = 0;
    var eventExpeditionTimerDone = true;
    if (sessionStorage.getItem('eventExpeditionTimer') !== null){
        eventExpeditionTimerDone = sessionStorage.getItem('eventExpeditionTimer') < currentTime;
    };
    var freeEventPoints = 16;
    if (sessionStorage.getItem('freeEventPoints') !== null){
        freeEventPoints = sessionStorage.getItem('freeEventPoints');
    };
    if (document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0] === undefined){
        freeEventPoints = 0;
    };

    /*****************
    *  Translations  *
    *****************/

    const contentEN = {
        advanced: 'Advanced',
        arena: 'Arena',
        circusTurma: 'Circus Turma',
        difficulty: 'Difficulty',
        dungeon: 'Dungeon',
        eventExpedition: 'Event Expedition',
        expedition: 'Expedition',
        in: 'In',
        largest: 'Largest',
        location: 'Location',
        nextAction: 'Next action',
        no: 'No',
        normal: 'Normal',
        opponent: 'Opponent',
        opponentLevel: 'Opponent Level',
        quests: 'Quests',
        random: 'Random',
        settings: 'Settings',
        smallest: 'Smallest',
        soon: 'Soon...',
        yes: 'Yes'
    }

    const contentPL = {
        advanced: 'Zaawansowane',
        arena: 'Arena',
        circusTurma: 'Circus Turma',
        difficulty: 'Trudność',
        dungeon: 'Lochy',
        eventExpedition: 'Wyprawa Eventowa',
        expedition: 'Wyprawa',
        in: 'Za',
        largest: 'Największy',
        location: 'Lokacja',
        nextAction: 'Następna akcja',
        no: 'Nie',
        normal: 'Normalne',
        opponent: 'Przeciwnik',
        opponentLevel: 'Poziom Przeciwnika',
        quests: 'Zadania',
        random: 'Losowy',
        settings: 'Ustawienia',
        smallest: 'Najmniejszy',
        soon: 'Wkrótce...',
        yes: 'Tak'
    }

    let content;

    const language = localStorage.getItem('settings.language')

    switch (language) {
        case 'EN':
            content = { ...contentEN }
            break;
        case 'PL':
            content = { ...contentPL }
            break;
        default:
            content = { ...contentEN }
    }


    /****************
    *   Interface   *
    ****************/

    //Set Auto Go Active
    var setAutoGoActive = function() {
        sessionStorage.setItem('autoGoActive', true);
        document.getElementById("autoGoButton").innerHTML = 'STOP'
        document.getElementById("autoGoButton").removeEventListener ("click", setAutoGoActive);
        document.getElementById("autoGoButton").addEventListener ("click", setAutoGoDeactive);
        autoGo();
    };

    //Set Auto Go Deactive
    var setAutoGoDeactive = function() {
        sessionStorage.setItem('autoGoActive', false);
        document.getElementById("autoGoButton").innerHTML = 'Auto GO'
        document.getElementById("autoGoButton").addEventListener ("click", setAutoGoActive);
        document.getElementById("autoGoButton").removeEventListener ("click", setAutoGoDeactive);

        clearTimeout(setTimeout);

        if (document.getElementById("nextActionWindow") !== null) {
            document.getElementById("nextActionWindow").remove();
        };

    };

    //Open Settings
    var openSettings = function(){

        var closeSettings = function() {
            document.getElementById("settingsWindow").remove();
            document.getElementById("overlayBack").remove();
        };

        var settingsWindow = document.createElement("div");
            settingsWindow.setAttribute("id", "settingsWindow")
            settingsWindow.innerHTML = `
                <span id="settingsLanguage">
                    <img id="languageEN" src="https://raw.githubusercontent.com/ebodziony/gladiatus-script/master/assets/GB.png">
                    <img id="languagePL" src="https://raw.githubusercontent.com/ebodziony/gladiatus-script/master/assets/PL.png">
                </span>
                <span id="settingsHeader">${content.settings}</span>
                <div id="settingsContent">
                    <div>
                        <div class="settingsHeaderBig">${content.expedition}</div>
                        <div class="settingsSubcontent">
                            <div id="doExpeditionTrue" class="settingsButton">${content.yes}</div>
                            <div id="doExpeditionFalse" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponent}</div>
                        <div class="settingsSubcontent">
                            <div id="setMonsterId0" class="settingsButton">1</div>
                            <div id="setMonsterId1" class="settingsButton">2</div>
                            <div id="setMonsterId2" class="settingsButton">3</div>
                            <div id="setMonsterId3" class="settingsButton">Boss</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.location}</div>
                        <div class="settingsSubcontent">
                            <div id="expeditionLocation" class="settingsButton">${content.soon}</div>
                        </div>
                    </div>

                    <div>
                        <div class="settingsHeaderBig">${content.dungeon}</div>
                        <div class="settingsSubcontent">
                            <div id="doDungeonTrue" class="settingsButton">${content.yes}</div>
                            <div id="doDungeonFalse" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.difficulty}</div>
                        <div class="settingsSubcontent">
                            <div id="setDungeonDifficultyNormalne" class="settingsButton">${content.normal}</div>
                            <div id="setDungeonDifficultyZaawansowane" class="settingsButton">${content.advanced}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.location}</div>
                        <div class="settingsSubcontent">
                            <div id="dungeonLocation" class="settingsButton">${content.soon}</div>
                        </div>
                    </div>

                    <div>
                        <div class="settingsHeaderBig">${content.arena}</div>
                        <div class="settingsSubcontent">
                            <div id="doArenaTrue" class="settingsButton">${content.yes}</div>
                            <div id="doArenaFalse" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponentLevel}</div>
                        <div class="settingsSubcontent">
                            <div id="setArenaOpponentLevelMin" class="settingsButton">${content.smallest}</div>
                            <div id="setArenaOpponentLevelMax" class="settingsButton">${content.largest}</div>
                            <div id="setArenaOpponentLevelRandom" class="settingsButton">${content.random}</div>
                        </div>
                    </div>

                    <div>
                        <div class="settingsHeaderBig">${content.circusTurma}</div>
                        <div class="settingsSubcontent">
                            <div id="doCircusTrue" class="settingsButton">${content.yes}</div>
                            <div id="doCircusFalse" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponentLevel}</div>
                        <div class="settingsSubcontent">
                            <div id="setCircusOpponentLevelMin" class="settingsButton">${content.smallest}</div>
                            <div id="setCircusOpponentLevelMax" class="settingsButton">${content.largest}</div>
                            <div id="setCircusOpponentLevelRandom" class="settingsButton">${content.random}</div>
                        </div>
                    </div>

                    <div>
                        <div class="settingsHeaderBig">${content.quests}</div>
                        <div class="settingsSubcontent">
                            <div id="doQuestsTrue" class="settingsButton">${content.yes}</div>
                            <div id="doQuestsFalse" class="settingsButton">${content.no}</div>
                        </div>
                    </div>

                    <div>
                        <div class="settingsHeaderBig">${content.eventExpedition}</div>
                        <div class="settingsSubcontent">
                            <div id="zzz" class="settingsButton">${content.soon}</div>
                        </div>
                    </div>
                </div>`;
        document.getElementById("header_game").insertBefore(settingsWindow, document.getElementById("header_game").children[0]);

        var overlayBack = document.createElement("div");
            var wrapperHeight = document.getElementById("wrapper_game").clientHeight;
            overlayBack.setAttribute("id", "overlayBack");
            overlayBack.setAttribute("style", "height: " + wrapperHeight + "px;");
            overlayBack.addEventListener ("click", closeSettings);
        document.getElementsByTagName("body")[0].appendChild(overlayBack);

        //Set Language

        const setLanguage = function(language) {
            localStorage.setItem('settings.language', language)

            switch (language) {
                case 'EN':
                    content = { ...contentEN }
                    break;
                case 'PL':
                    content = { ...contentPL }
                    break;
                default:
                    content = { ...contentEN }
            }

            closeSettings();
            openSettings();
        };

        $("#languageEN").click(function() { setLanguage('EN') });
        $("#languagePL").click(function() { setLanguage('PL') });


        //Change Settings

        function setDoExpedition(bool) {
            doExpedition = bool;
            localStorage.setItem('doExpedition', bool);
            setActiveButtons();
        };

        $("#doExpeditionTrue").click(function() { setDoExpedition(true) });
        $("#doExpeditionFalse").click(function() { setDoExpedition(false) });

        function setMonster(id) {
            monsterId = id;
            localStorage.setItem('monsterId', id);
            setActiveButtons();
        };

        $("#setMonsterId0").click(function() { setMonster('0') });
        $("#setMonsterId1").click(function() { setMonster('1') });
        $("#setMonsterId2").click(function() { setMonster('2') });
        $("#setMonsterId3").click(function() { setMonster('3') });

        function setDoDungeon(bool) {
            doDungeon = bool;
            localStorage.setItem('doDungeon', bool);
            setActiveButtons();
        };

        $("#doDungeonTrue").click(function() { setDoDungeon(true) });
        $("#doDungeonFalse").click(function() { setDoDungeon(false) });

        function setDungeonDifficulty(difficulty) {
            dungeonDifficulty = difficulty;
            localStorage.setItem('dungeonDifficulty', difficulty);
            setActiveButtons();
        };

        $("#setDungeonDifficultyNormalne").click(function() { setDungeonDifficulty("normalne") });
        $("#setDungeonDifficultyZaawansowane").click(function() { setDungeonDifficulty("zaawansowane") });

        function setDoArena(bool) {
            doArena = bool;
            localStorage.setItem('doArena', bool);
            setActiveButtons();
        };

        $("#doArenaTrue").click(function() { setDoArena(true) });
        $("#doArenaFalse").click(function() { setDoArena(false) });

        function setArenaOpponentLevel(level) {
            arenaOpponentLevel = level;
            localStorage.setItem('arenaOpponentLevel', level);
            setActiveButtons();
        };

        $("#setArenaOpponentLevelMin").click(function() { setArenaOpponentLevel('min') });
        $("#setArenaOpponentLevelMax").click(function() { setArenaOpponentLevel('max') });
        $("#setArenaOpponentLevelRandom").click(function() { setArenaOpponentLevel('random') });

        function setDoCircus(bool) {
            doCircus = bool;
            localStorage.setItem('doCircus', bool);
            setActiveButtons();
        };

        $("#doCircusTrue").click(function() { setDoCircus(true) });
        $("#doCircusFalse").click(function() { setDoCircus(false) });

        function setCircusOpponentLevel(level) {
            circusOpponentLevel = level;
            localStorage.setItem('circusOpponentLevel', level);
            setActiveButtons();
        };

        $("#setCircusOpponentLevelMin").click(function() { setCircusOpponentLevel('min') });
        $("#setCircusOpponentLevelMax").click(function() { setCircusOpponentLevel('max') });
        $("#setCircusOpponentLevelRandom").click(function() { setCircusOpponentLevel('random') });

        function setDoQuests(bool) {
            doQuests = bool;
            localStorage.setItem('doQuests', bool);
            setActiveButtons();
        };

        $("#doQuestsTrue").click(function() { setDoQuests(true) });
        $("#doQuestsFalse").click(function() { setDoQuests(false) });

        function setActiveButtons() {
            if (doExpedition == true){
                document.getElementById("doExpeditionTrue").classList.add("settingsActive")
                document.getElementById("doExpeditionFalse").classList.remove("settingsDeactive")
            } else {
                document.getElementById("doExpeditionFalse").classList.add("settingsDeactive")
                document.getElementById("doExpeditionTrue").classList.remove("settingsActive")
            };
    
            if (monsterId == 0){
                document.getElementById("setMonsterId0").classList.add("settingsActive")
                document.getElementById("setMonsterId1").classList.remove("settingsActive")
                document.getElementById("setMonsterId2").classList.remove("settingsActive")
                document.getElementById("setMonsterId3").classList.remove("settingsActive")
            } else if (monsterId == 1){
                document.getElementById("setMonsterId1").classList.add("settingsActive")
                document.getElementById("setMonsterId0").classList.remove("settingsActive")
                document.getElementById("setMonsterId2").classList.remove("settingsActive")
                document.getElementById("setMonsterId3").classList.remove("settingsActive")
            } else if (monsterId == 2){
                document.getElementById("setMonsterId2").classList.add("settingsActive")
                document.getElementById("setMonsterId0").classList.remove("settingsActive")
                document.getElementById("setMonsterId1").classList.remove("settingsActive")
                document.getElementById("setMonsterId3").classList.remove("settingsActive")
            } else {
                document.getElementById("setMonsterId3").classList.add("settingsActive")
                document.getElementById("setMonsterId0").classList.remove("settingsActive")
                document.getElementById("setMonsterId1").classList.remove("settingsActive")
                document.getElementById("setMonsterId2").classList.remove("settingsActive")
            };
    
            if (doDungeon == true){
                document.getElementById("doDungeonTrue").classList.add("settingsActive")
                document.getElementById("doDungeonFalse").classList.remove("settingsDeactive")
            } else {
                document.getElementById("doDungeonFalse").classList.add("settingsDeactive")
                document.getElementById("doDungeonTrue").classList.remove("settingsActive")
            };
    
            if (dungeonDifficulty == "zaawansowane"){
                document.getElementById("setDungeonDifficultyZaawansowane").classList.add("settingsActive")
                document.getElementById("setDungeonDifficultyNormalne").classList.remove("settingsActive")
            } else {
                document.getElementById("setDungeonDifficultyNormalne").classList.add("settingsActive")
                document.getElementById("setDungeonDifficultyZaawansowane").classList.remove("settingsActive")
            };
    
            if (doArena == true){
                document.getElementById("doArenaTrue").classList.add("settingsActive")
                document.getElementById("doArenaFalse").classList.remove("settingsDeactive")
            } else {
                document.getElementById("doArenaFalse").classList.add("settingsDeactive")
                document.getElementById("doArenaTrue").classList.remove("settingsActive")
            };

            if (arenaOpponentLevel == "min"){
                document.getElementById("setArenaOpponentLevelMin").classList.add("settingsActive")
                document.getElementById("setArenaOpponentLevelMax").classList.remove("settingsActive")
                document.getElementById("setArenaOpponentLevelRandom").classList.remove("settingsActive")
            } else if (arenaOpponentLevel == "max"){
                document.getElementById("setArenaOpponentLevelMax").classList.add("settingsActive")
                document.getElementById("setArenaOpponentLevelMin").classList.remove("settingsActive")
                document.getElementById("setArenaOpponentLevelRandom").classList.remove("settingsActive")
            } else {
                document.getElementById("setArenaOpponentLevelRandom").classList.add("settingsActive")
                document.getElementById("setArenaOpponentLevelMin").classList.remove("settingsActive")
                document.getElementById("setArenaOpponentLevelMax").classList.remove("settingsActive")
            }
    
            if (doCircus == true){
                document.getElementById("doCircusTrue").classList.add("settingsActive")
                document.getElementById("doCircusFalse").classList.remove("settingsDeactive")
            } else {
                document.getElementById("doCircusFalse").classList.add("settingsDeactive")
                document.getElementById("doCircusTrue").classList.remove("settingsActive")
            };

            if (circusOpponentLevel == "min"){
                document.getElementById("setCircusOpponentLevelMin").classList.add("settingsActive")
                document.getElementById("setCircusOpponentLevelMax").classList.remove("settingsActive")
                document.getElementById("setCircusOpponentLevelRandom").classList.remove("settingsActive")
            } else if (circusOpponentLevel == "max"){
                document.getElementById("setCircusOpponentLevelMax").classList.add("settingsActive")
                document.getElementById("setCircusOpponentLevelMin").classList.remove("settingsActive")
                document.getElementById("setCircusOpponentLevelRandom").classList.remove("settingsActive")
            } else {
                document.getElementById("setCircusOpponentLevelRandom").classList.add("settingsActive")
                document.getElementById("setCircusOpponentLevelMin").classList.remove("settingsActive")
                document.getElementById("setCircusOpponentLevelMax").classList.remove("settingsActive")
            }

            if (doQuests == true){
                document.getElementById("doQuestsTrue").classList.add("settingsActive")
                document.getElementById("doQuestsFalse").classList.remove("settingsDeactive")
            } else {
                document.getElementById("doQuestsFalse").classList.add("settingsDeactive")
                document.getElementById("doQuestsTrue").classList.remove("settingsActive")
            };
        };

        setActiveButtons();

    };

    //Auto GO button
    var autoGoButton = document.createElement("button");
    autoGoButton.setAttribute("id", "autoGoButton")
    autoGoButton.className = 'menuitem';

    if (autoGoActive == false){
        autoGoButton.innerHTML = 'Auto GO';
        autoGoButton.addEventListener ("click", setAutoGoActive);
    }

    else {
        autoGoButton.innerHTML = 'STOP';
        autoGoButton.addEventListener ("click", setAutoGoDeactive);
    };

    document.getElementById("mainmenu").insertBefore(autoGoButton, document.getElementById("mainmenu").children[0]);

    //Settings button
    var settingsButton = document.createElement("button");
    settingsButton.className = 'menuitem';
    settingsButton.innerHTML = '<img src="https://image.flaticon.com/icons/svg/76/76716.svg" title="Ustawienia" height="20" width="20" style="filter: invert(83%) sepia(52%) saturate(503%) hue-rotate(85deg) brightness(103%) contrast(101%); z-index: 999;">';
    settingsButton.setAttribute("style", "height: 27px; width: 27px; cursor: pointer; border: none; color: #5dce5d; padding: 0; background-image: url('https://i.imgur.com/jf7BXTX.png')" );
    settingsButton.addEventListener ("click", openSettings);
    document.getElementById("mainmenu").insertBefore(settingsButton, document.getElementById("mainmenu").children[1]);

    /****************
    *    Helpers    *
    ****************/

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    function getSmallestIntIndex(values) {
        let index = 0;
        let minValue = values[0];

        for (let i = 1; i < values.length; i++) {
            if (values[i] < minValue) {
                minValue = values[i];
                index = i;
            }
        };
        return index;
    };

    function getLargestIntIndex(values) {
        let index = 0;
        let maxValue = values[0];

        for (let i = 1; i < values.length; i++) {
            if (values[i] > maxValue) {
                maxValue = values[i];
                index = i;
            }
        };
        return index;
    };

    function getRandomIntIndex(values) {
        const index = Math.floor(Math.random() * values.length);

        return index;
    };

    /****************
    *    Auto Go    *
    ****************/

    var autoGo = function() {

        //Click Delay 0.9 - 2.4 s

        const clickDelay = getRandomInt(900, 2400);

        //Claim Daily Reward

        if (document.getElementById("blackoutDialogLoginBonus") !== null) {
            setTimeout(function(){
                document.getElementById("blackoutDialogLoginBonus").getElementsByTagName("input")[0].click();
            }, clickDelay);
        };

        //Close Notifications

        if (document.getElementById("blackoutDialognotification") !== null && document.getElementById("blackoutDialognotification").isDisplayed()) { //isVisible()
            setTimeout(function(){
                document.getElementById("blackoutDialognotification").getElementsByTagName("input")[0].click();
            }, clickDelay);
        };

        /***************
        *   Use Food   *
        ***************/

        if (healthPoints < 10) {
            console.log("Low health");
            //TODO
        }

        /****************
        * Handle Quests *
        ****************/

        else if (doQuests === true && nextQuestTime < currentTime) {
            function completeQuests() {
                const inPanteonPage = $("body").first().attr("id") === "questsPage"

                if (!inPanteonPage) {
                    $("#mainmenu a.menuitem")[1].click();
                } else {
                    const completedQuests = $("#content .contentboard_slot a.quest_slot_button_finish")

                    if (completedQuests.length) {
                        completedQuests[0].click();
                    } else {
                        repeatQuests();
                    }
                }
            };

            function repeatQuests() {
                const failedQuests = $("#content .contentboard_slot a.quest_slot_button_restart")

                if (failedQuests.length) {
                    failedQuests[0].click();
                } else {
                    takeQuest();
                }
            }

            function takeQuest() {
                const availableQuests = $("#content .contentboard_slot a.quest_slot_button_accept")

                if (availableQuests.length) {
                    availableQuests[0].click();
                } else {
                    checkNextQuestTime();
                }
            }

            function checkNextQuestTime() {
                const isTimer = $("#quest_header_cooldown")

                if (isTimer.length) {
                    const nextQuestIn = Number($("#quest_header_cooldown b span").attr("data-ticker-time-left"))

                    nextQuestTime = currentTime + nextQuestIn
                    localStorage.setItem('nextQuestTime', nextQuestTime)
                } else {
                    nextQuestTime = currentTime + 300000;
                    localStorage.setItem('nextQuestTime', nextQuestTime)
                }

                autoGo();
            }

            setTimeout(function(){
                completeQuests();
            }, clickDelay);
        }

        /****************
        * Go Expedition *
        ****************/

        else if (doExpedition === true && document.getElementById("cooldown_bar_fill_expedition").classList.contains("cooldown_bar_fill_ready")===true) {
            var goExpedition = function() {

                var expeditionPageCheck = document.getElementsByTagName("body")[0].id === "locationPage";

                if (expeditionPageCheck === false) {
                    document.getElementsByClassName("cooldown_bar_link")[0].click();
                }

                //document.getElementById("submenu2").getElementsByTagName("a")[1].getAttribute("href").contains("location&loc="+locationId);

                else { 
                    document.getElementsByClassName("expedition_button")[monsterId].click();
                };
            };

            setTimeout(function(){
                goExpedition();
            }, clickDelay);

        }

        /**************
        * Go Dungeon  *
        **************/

        else if (doDungeon === true && document.getElementById("cooldown_bar_fill_dungeon").classList.contains("cooldown_bar_fill_ready")===true) {
            var goDungeon = function() {

                var dungeonPageCheck = document.getElementsByTagName("body")[0].id === "dungeonPage";

                if (dungeonPageCheck === false) {
                    document.getElementsByClassName("cooldown_bar_link")[1].click();
                }

                else {
                    if (document.getElementById("content").getElementsByClassName("button1")[0].value === "normalne") {
                        if (dungeonDifficulty === "zaawansowane") {
                            document.getElementById("content").getElementsByClassName("button1")[1].click();
                        }
                        else {
                            document.getElementById("content").getElementsByClassName("button1")[0].click();
                        }
                    }

                    else {
                        document.getElementsByTagName("area")[0].click();
                    };
                };
            };

            setTimeout(function(){
                goDungeon();
            }, clickDelay);
        }

        /************************
        * Go Arena Provinciarum *
        ************************/

        else if (doArena === true && document.getElementById("cooldown_bar_fill_arena").classList.contains("cooldown_bar_fill_ready")===true) {
            var goArena = function() {

                var arenaPageCheck = document.getElementsByTagName("body")[0].id === "arenaPage";

                if (arenaPageCheck === false && playerLevel < 10) {
                    document.getElementsByClassName("cooldown_bar_link")[1].click();
                }

                else if (arenaPageCheck === false) {
                    document.getElementsByClassName("cooldown_bar_link")[2].click();
                }

                else {

                    var arenaProvPageCheck = document.getElementsByTagName("td")[1].firstChild.hasClass("awesome-tabs current");

                    if (arenaProvPageCheck === false) {
                        document.getElementsByTagName("td")[1].firstElementChild.click();
                    }

                    else { 
                        const levels = new Array();
                        levels[0] = Number(document.getElementById("own2").getElementsByTagName("td")[1].firstChild.nodeValue)
                        levels[1] = Number(document.getElementById("own2").getElementsByTagName("td")[5].firstChild.nodeValue)
                        levels[2] = Number(document.getElementById("own2").getElementsByTagName("td")[9].firstChild.nodeValue)
                        levels[3] = Number(document.getElementById("own2").getElementsByTagName("td")[13].firstChild.nodeValue)
                        levels[4] = Number(document.getElementById("own2").getElementsByTagName("td")[17].firstChild.nodeValue)

                        let opponentIndex;

                        if (arenaOpponentLevel === "min") {
                            opponentIndex = getSmallestIntIndex(levels)
                        } else if (arenaOpponentLevel === "max") {
                            opponentIndex = getLargestIntIndex(levels)
                        } else {
                            opponentIndex = getRandomIntIndex(levels)
                        }
                
                        document.getElementsByClassName("attack")[opponentIndex].click();
                    }
                }
            };

            setTimeout(function(){
                goArena();
            }, clickDelay+600);

        }

        /*************************
        * Go Circus Provinciarum *
        *************************/

        else if (doCircus === true && document.getElementById("cooldown_bar_fill_ct").classList.contains("cooldown_bar_fill_ready")===true) {
            var goCircus = function() {

                var arenaPageCheck = document.getElementsByTagName("body")[0].id === "arenaPage";

                if (arenaPageCheck === false) {
                    document.getElementsByClassName("cooldown_bar_link")[3].click();
                }

                else {

                    var circusProvPageCheck = document.getElementsByTagName("td")[3].firstChild.hasClass("awesome-tabs current");

                    if (circusProvPageCheck === false) {
                        document.getElementsByTagName("td")[3].firstElementChild.click();
                    }

                    else { 
                        const levels = new Array();
                        levels[0] = Number(document.getElementById("own3").getElementsByTagName("td")[1].firstChild.nodeValue)
                        levels[1] = Number(document.getElementById("own3").getElementsByTagName("td")[5].firstChild.nodeValue)
                        levels[2] = Number(document.getElementById("own3").getElementsByTagName("td")[9].firstChild.nodeValue)
                        levels[3] = Number(document.getElementById("own3").getElementsByTagName("td")[13].firstChild.nodeValue)
                        levels[4] = Number(document.getElementById("own3").getElementsByTagName("td")[17].firstChild.nodeValue)

                        let opponentIndex;

                        if (circusOpponentLevel === "min") {
                            opponentIndex = getSmallestIntIndex(levels)
                        } else if (circusOpponentLevel === "max") {
                            opponentIndex = getLargestIntIndex(levels)
                        } else {
                            opponentIndex = getRandomIntIndex(levels)
                        }

                        document.getElementsByClassName("attack")[opponentIndex].click();
                    };
                };
            };

            setTimeout(function(){
                goCircus();
            }, clickDelay+600);

        }

        /************************
        *  Go Event Expedition  *
        ************************/

        else if (doEventExpedition === true && eventExpeditionTimerDone===true && freeEventPoints > 0) {
            var goEventExpedition = function() {

                var expeditionPageCheck = document.getElementsByTagName("body")[0].id === "locationPage";
                var eventExpeditionNameCheck = document.getElementById("mainnav").getElementsByTagName("a")[0].firstChild.nodeValue;

                if (expeditionPageCheck === false || document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0].firstChild.nodeValue.contains(eventExpeditionNameCheck) === false) {
                    document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0].click();
                }

                else if (document.getElementById("content").getElementsByClassName("section-header")[0].getElementsByTagName("p")[1].firstChild.nodeValue.replace(/[^0-9]/gi, '') <= 0 ) {
                    sessionStorage.setItem('freeEventPoints', 0); //sprawdzam czy jest co najmniej 1 punkt eventowy
                    location.reload();
                }

                else if (document.getElementById("content").getElementsByClassName("section-header")[1].getElementsByTagName("span")[0]===undefined) {
                    freeEventPoints = document.getElementById("content").getElementsByClassName("section-header")[0].getElementsByTagName("p")[1].firstChild.nodeValue.replace(/[^0-9]/gi, '');

                    if (eventMonsterId == 3 && freeEventPoints == 1 ) {
                        sessionStorage.setItem('freeEventPoints', 0);
                        sessionStorage.setItem('eventExpeditionTimer', currentTime+301000);
                        document.getElementsByClassName("expedition_button")[2].click();
                    }

                    else {
                        if (eventMonsterId == 3 && freeEventPoints > 1) {
                            document.getElementsByClassName("expedition_button")[3].click();
                            sessionStorage.setItem('freeEventPoints', freeEventPoints - 2);
                            sessionStorage.setItem('eventExpeditionTimer', currentTime+301000);
                        }
                        else {
                            document.getElementsByClassName("expedition_button")[eventMonsterId].click();
                            sessionStorage.setItem('freeEventPoints', freeEventPoints - 1);
                            sessionStorage.setItem('eventExpeditionTimer', currentTime+301000);
                        };
                    };
                }

                else {
                    //document.getElementById("content").getElementsByClassName("section-header")[1].getElementsByTagName("span")[0].firstChild.nodeValue.replace(/[^:0-9]/gi, '')
                    sessionStorage.setItem('eventExpeditionTimer', currentTime+300000); //sprawdzam czy załadował się czas
                    location.reload();
                };
            };

            setTimeout(function(){
                goEventExpedition();
            }, clickDelay);

        }

        /***********************
        * Wait for Next Action *
        ***********************/

        else {

            /******************
            *    Fast Mode    *
            ******************/

            if (safeMode===false) {

                var convertTimeToMs = function(t) {
                    var ms = Number(t.split(':')[0]) * 60 * 60 * 1000 + Number(t.split(':')[1]) * 60 * 1000 + Number(t.split(':')[2]) * 1000;
                    return ms;
                };
    
                var nextActionTime = new Array();
    
                if (doExpedition === true) {
                    nextActionTime[0] = convertTimeToMs(document.getElementById("cooldown_bar_text_expedition").innerText);
                //     console.log('doExpedition')
                // } else {
                //     nextActionTime[0] = 999000
                };
                if (doDungeon === true) {
                    nextActionTime[1] = convertTimeToMs(document.getElementById("cooldown_bar_text_dungeon").innerText);
                };
                if (doArena === true) {
                    nextActionTime[2] = convertTimeToMs(document.getElementById("cooldown_bar_text_arena").innerText);
                };
                if (doCircus === true) {
                    nextActionTime[3] = convertTimeToMs(document.getElementById("cooldown_bar_text_ct").innerText);
                };
                if (doEventExpedition === true && freeEventPoints > 0) {
                    nextActionTime[4] = sessionStorage.getItem('eventExpeditionTimer') - currentTime;
                };
    
                var index = 0;
                var minValue = nextActionTime[0];
                for (var i = 1; i < nextActionTime.length; i++) {
                    if (nextActionTime[i] < minValue) {
                        minValue = nextActionTime[i];
                        index = i;
                    }
                };

                var nextActionName;
    
                if (index === 0) {
                    nextActionName = content.expedition;
                }
                else if (index === 1) {
                    nextActionName = content.dungeon;
                }
                else if (index === 2) {
                    nextActionName = content.arena;
                }
                else if (index === 3) {
                    nextActionName = content.circusTurma;
                }
                else if (index === 4) {
                    nextActionName = "Event expedition";
                }
                else {
                    nextActionName = "Unkown";
                };
    
                var convertTimeToDate = function(timeInMs) {
                    var timeInSecs = timeInMs / 1000;
                    timeInSecs = Math.round(timeInSecs);
                    var secs = timeInSecs % 60;
                    if (secs < 10) {
                        secs = "0" + secs;
                    };
                    timeInSecs = (timeInSecs - secs) / 60;
                    var mins = timeInSecs % 60;
                    if (mins < 10) {
                        mins = "0" + mins;
                    };
                    var hrs = (timeInSecs - mins) / 60;
    
                    return hrs + ':' + mins + ':' + secs;
                };

                var nextActionWindow = document.createElement("div");
    
                var showNextActionWindow = function() {
                    nextActionWindow.setAttribute("id", "nextActionWindow")
                    nextActionWindow.setAttribute("style", "height: 72px; width: 365px; padding-top: 13px; color: #58ffbb; font-size: 20px; background-color: #000000aa; border-radius: 15px; display: block; position: absolute; left: 506px; top: 120px; z-index: 999;" );
                    nextActionWindow.innerHTML = `<span style="color: #fff;">${content.nextAction}: </span><span>${nextActionName}</span></br><span style="color: #fff;">${content.in}: </span><span>${convertTimeToDate(nextActionTime[index])}</span>`;
                    document.getElementById("header_game").insertBefore(nextActionWindow, document.getElementById("header_game").children[0]);
                };
                showNextActionWindow();
    
                nextActionCounter = setInterval(function() {
                    nextActionTime[index] = nextActionTime[index]-1000;
    
                    nextActionWindow.innerHTML = `<span style="color: #fff;">${content.nextAction}: </span><span>${nextActionName}</span></br><span style="color: #fff;">${content.in}: </span><span>${convertTimeToDate(nextActionTime[index])}</span>`;
    
                    if (nextActionTime[index]<=0) {
                        if (index === 4) {
                            document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0].click();
                        }
                        else {
                            setTimeout(function(){
                                document.getElementsByClassName("cooldown_bar_link")[index].click();
                            }, clickDelay);
                        };
                    };
                }, 1000);
            }

            /******************
            *    Safe Mode    *
            ******************/

            else {
                //do zrobienia
                console.log("No safe mode yet")
            };
        };
    };

    if (autoGoActive == true) {
        window.onload = autoGo();
    };

})();
