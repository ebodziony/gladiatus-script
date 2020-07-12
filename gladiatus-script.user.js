// ==UserScript==
// @name         Gladiatus Script
// @version      2.34
// @description  Dodatek do gry Gladiatus
// @author       Eryk Bodziony
// @match        *://*.gladiatus.gameforge.com/game/index.php*
// @exclude      *://*.gladiatus.gameforge.com/game/index.php?mod=start
// @downloadURL  https://github.com/ebodziony/gladiatus-script/raw/master/gladiatus-script.js
// @updateURL    https://github.com/ebodziony/gladiatus-script/raw/master/gladiatus-script.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @resource     customCSS_global  https://raw.githubusercontent.com/ebodziony/css/master/style.css?ver=2.34
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

    const playerLevel = $("#header_values_level").first().html();

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
    let questTypes = {
        combat: true,
        arena: true,
        circus: true,
        expedition: true,
        dungeon: true,
        items: true
    };
    if (localStorage.getItem('questTypes')) {
        questTypes = JSON.parse(localStorage.getItem('questTypes'));
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
    // let dungeonId = 0;
    let dungeonDifficulty = "normal";
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
        highest: 'Highest',
        in: 'In',
        lastUsed: "Last Used",
        location: 'Location',
        lowest: 'Lowest',
        nextAction: 'Next action',
        no: 'No',
        normal: 'Normal',
        opponent: 'Opponent',
        opponentLevel: 'Opponent Level',
        quests: 'Quests',
        random: 'Random',
        settings: 'Settings',
        soon: 'Soon...',
        type: 'Type',
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
        highest: 'Najwyższy',
        in: 'Za',
        lastUsed: "Ostatnio Używana",
        location: 'Lokacja',
        lowest: 'Najniższy',
        nextAction: 'Następna akcja',
        no: 'Nie',
        normal: 'Normalne',
        opponent: 'Przeciwnik',
        opponentLevel: 'Poziom Przeciwnika',
        quests: 'Zadania',
        random: 'Losowy',
        settings: 'Ustawienia',
        soon: 'Wkrótce...',
        type: 'Rodzaj',
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

        if (document.getElementById("nextActionWindow")) {
            document.getElementById("nextActionWindow").remove();
        };

        if (document.getElementById("lowHealth")) {
            document.getElementById("lowHealth").remove();
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
                            <div id="expeditionLocation" class="settingsButton">${content.lastUsed}</div>
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
                            <div id="setDungeonDifficultyNormal" class="settingsButton">${content.normal}</div>
                            <div id="setDungeonDifficultyAdvanced" class="settingsButton">${content.advanced}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.location}</div>
                        <div class="settingsSubcontent">
                            <div id="dungeonLocation" class="settingsButton">${content.lastUsed}</div>
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
                            <div id="setArenaOpponentLevelMin" class="settingsButton">${content.lowest}</div>
                            <div id="setArenaOpponentLevelMax" class="settingsButton">${content.highest}</div>
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
                            <div id="setCircusOpponentLevelMin" class="settingsButton">${content.lowest}</div>
                            <div id="setCircusOpponentLevelMax" class="settingsButton">${content.highest}</div>
                            <div id="setCircusOpponentLevelRandom" class="settingsButton">${content.random}</div>
                        </div>
                    </div>

                    <div>
                        <div class="settingsHeaderBig">${content.quests}</div>
                        <div class="settingsSubcontent">
                            <div id="doQuestsTrue" class="settingsButton">${content.yes}</div>
                            <div id="doQuestsFalse" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.type}</div>
                        <div class="settingsSubcontent">
                            <div id="doCombatQuests" class="settingsButton quest-type combat"></div>
                            <div id="doArenaQuests" class="settingsButton quest-type arena"></div>
                            <div id="doCircusQuests" class="settingsButton quest-type circus"></div>
                            <div id="doExpeditionQuests" class="settingsButton quest-type expedition"></div>
                            <div id="doDungeonQuests" class="settingsButton quest-type dungeon"></div>
                            <div id="doItemsQuests" class="settingsButton quest-type items"></div>
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

        $("#setDungeonDifficultyNormal").click(function() { setDungeonDifficulty("normal") });
        $("#setDungeonDifficultyAdvanced").click(function() { setDungeonDifficulty("advanced") });

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

        function setQuestTypes(type) {
            questTypes[type] = !questTypes[type];
            localStorage.setItem('questTypes', JSON.stringify(questTypes));
            setActiveButtons();
        };

        $("#doCombatQuests").click(function() { setQuestTypes('combat') });
        $("#doArenaQuests").click(function() { setQuestTypes('arena') });
        $("#doCircusQuests").click(function() { setQuestTypes('circus') });
        $("#doExpeditionQuests").click(function() { setQuestTypes('expedition') });
        $("#doDungeonQuests").click(function() { setQuestTypes('dungeon') });
        $("#doItemsQuests").click(function() { setQuestTypes('items') });

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
    
            if (dungeonDifficulty == "advanced"){
                document.getElementById("setDungeonDifficultyAdvanced").classList.add("settingsActive")
                document.getElementById("setDungeonDifficultyNormal").classList.remove("settingsActive")
            } else {
                document.getElementById("setDungeonDifficultyNormal").classList.add("settingsActive")
                document.getElementById("setDungeonDifficultyAdvanced").classList.remove("settingsActive")
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

            if (questTypes.combat == true){
                document.getElementById("doCombatQuests").classList.add("settingsActive");
            } else {
                document.getElementById("doCombatQuests").classList.remove("settingsActive");
            }

            if (questTypes.arena == true){
                document.getElementById("doArenaQuests").classList.add("settingsActive");
            } else {
                document.getElementById("doArenaQuests").classList.remove("settingsActive");
            }

            if (questTypes.circus == true){
                document.getElementById("doCircusQuests").classList.add("settingsActive");
            } else {
                document.getElementById("doCircusQuests").classList.remove("settingsActive");
            }

            if (questTypes.expedition == true){
                document.getElementById("doExpeditionQuests").classList.add("settingsActive");
            } else {
                document.getElementById("doExpeditionQuests").classList.remove("settingsActive");
            }

            if (questTypes.dungeon == true){
                document.getElementById("doDungeonQuests").classList.add("settingsActive");
            } else {
                document.getElementById("doDungeonQuests").classList.remove("settingsActive");
            }

            if (questTypes.items == true){
                document.getElementById("doItemsQuests").classList.add("settingsActive");
            } else {
                document.getElementById("doItemsQuests").classList.remove("settingsActive");
            }
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

    function convertTimeToMs(t) {
        var ms = Number(t.split(':')[0]) * 60 * 60 * 1000 + Number(t.split(':')[1]) * 60 * 1000 + Number(t.split(':')[2]) * 1000;
        return ms;
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

            var lowHealthAlert = document.createElement("div");

            function showLowHealthAlert() {
                lowHealthAlert.setAttribute("id", "lowHealth")
                lowHealthAlert.setAttribute("style", "width: 365px; padding: 20px 0; color: #58ffbb; font-size: 20px; background-color: #000000aa; border-radius: 15px; display: block; position: absolute; left: 506px; top: 120px; z-index: 999;" );
                lowHealthAlert.innerHTML = `
                    <span style="color: #ea1414;">Low Health!</span>`;
                document.getElementById("header_game").insertBefore(lowHealthAlert, document.getElementById("header_game").children[0]);
            };
            showLowHealthAlert();

            //TODO
        }

        /****************
        * Handle Quests *
        ****************/

        else if (doQuests === true && nextQuestTime < currentTime) {
            function completeQuests() {
                const inPanteonPage = $("body").first().attr("id") === "questsPage";

                if (!inPanteonPage) {
                    $("#mainmenu a.menuitem")[1].click();
                } else {
                    const completedQuests = $("#content .contentboard_slot a.quest_slot_button_finish");

                    if (completedQuests.length) {
                        completedQuests[0].click();
                    } else {
                        repeatQuests();
                    }
                }
            };

            function repeatQuests() {
                const failedQuests = $("#content .contentboard_slot a.quest_slot_button_restart");

                if (failedQuests.length) {
                    failedQuests[0].click();
                } else {
                    takeQuest();
                }
            }

            function takeQuest() {
                const canTakeQuest = $("#content .contentboard_slot a.quest_slot_button_accept");

                if (canTakeQuest.length) {
                    function getIconName(url) {
                        return url.split("/quest/icon_")[1].split("_inactive")[0];
                    }

                    const availableQuests = $("#content .contentboard_slot_inactive");

                    for (const quest of availableQuests) {
                        let icon = getIconName(quest.getElementsByClassName("quest_slot_icon")[0].style.backgroundImage);

                        if (icon === "grouparena") {
                            icon = "circus";
                        };

                        if (questTypes[icon]) {
                            return quest.getElementsByClassName("quest_slot_button_accept")[0].click();
                        };
                    }           

                    $("#quest_footer_reroll input").first().click()
                }  

                checkNextQuestTime();
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
                        if (dungeonDifficulty === "advanced") {
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
                const actions = [];
    
                if (doExpedition === true) {
                    const timeTo = convertTimeToMs(document.getElementById("cooldown_bar_text_expedition").innerText);

                    actions.push({
                        name: 'expedition',
                        time: timeTo,
                        index: 0
                    });
                };

                if (doDungeon === true) {
                    const timeTo = convertTimeToMs(document.getElementById("cooldown_bar_text_dungeon").innerText);

                    actions.push({
                        name: 'dungeon',
                        time: timeTo,
                        index: 1
                    });
                };

                if (doArena === true) {
                    const timeTo = convertTimeToMs(document.getElementById("cooldown_bar_text_arena").innerText);

                    actions.push({
                        name: 'arena',
                        time: timeTo,
                        index: 2,
                    });
                };

                if (doCircus === true) {
                    const timeTo = convertTimeToMs(document.getElementById("cooldown_bar_text_ct").innerText);

                    actions.push({
                        name: 'circusTurma',
                        time: timeTo,
                        index: 3,
                    });
                };

                if (doEventExpedition === true && freeEventPoints > 0) {
                    const timeTo = sessionStorage.getItem('eventExpeditionTimer') - currentTime;

                    actions.push({
                        name: 'eventExpedition',
                        time: timeTo,
                        index: 4,
                    });
                };

                function getNextAction(actions) {
                    let index = 0;
                    let minValue = actions[0].time;

                    for (let i = 1; i < actions.length; i++) {
                        if (actions[i].time < minValue) {
                            minValue = actions[i].time;
                            index = i;

                            console.log(actions[i].time)
                            console.log(minValue)
                        }
                    };
                    return actions[index]
                };

                const nextAction = getNextAction(actions);
    
                function formatTime(timeInMs) {
                    if (timeInMs < 1000) {
                        return "0:00:00"
                    };

                    let timeInSecs = timeInMs / 1000;
                    timeInSecs = Math.round(timeInSecs);
                    let secs = timeInSecs % 60;
                    if (secs < 10) {
                        secs = "0" + secs;
                    };
                    timeInSecs = (timeInSecs - secs) / 60;
                    let mins = timeInSecs % 60;
                    if (mins < 10) {
                        mins = "0" + mins;
                    };
                    let hrs = (timeInSecs - mins) / 60;
    
                    return hrs + ':' + mins + ':' + secs;
                };

                var nextActionWindow = document.createElement("div");
    
                function showNextActionWindow() {
                    nextActionWindow.setAttribute("id", "nextActionWindow")
                    nextActionWindow.setAttribute("style", "height: 72px; width: 365px; padding-top: 13px; color: #58ffbb; font-size: 20px; background-color: #000000aa; border-radius: 15px; display: block; position: absolute; left: 506px; top: 120px; z-index: 999;" );
                    nextActionWindow.innerHTML = `
                        <span style="color: #fff;">${content.nextAction}: </span>
                        <span>${content[nextAction.name]}</span></br>
                        <span style="color: #fff;">${content.in}: </span>
                        <span>${formatTime(nextAction.time)}</span>`;
                    document.getElementById("header_game").insertBefore(nextActionWindow, document.getElementById("header_game").children[0]);
                };
                showNextActionWindow();

                let nextActionCounter;
    
                nextActionCounter = setInterval(function() {
                    nextAction.time = nextAction.time - 1000;
    
                    nextActionWindow.innerHTML = `
                        <span style="color: #fff;">${content.nextAction}: </span>
                        <span>${content[nextAction.name]}</span></br>
                        <span style="color: #fff;">${content.in}: </span>
                        <span>${formatTime(nextAction.time)}</span>`;
    
                    if (nextAction.time <= 0) {
                        if (nextAction.index === 4) {
                            document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0].click();
                        }
                        else {
                            setTimeout(function(){
                                document.getElementsByClassName("cooldown_bar_link")[nextAction.index].click();
                            }, clickDelay);
                        };
                    };
                }, 1000);
            }

            /******************
            *    Safe Mode    *
            ******************/

            else {
                //TODO
                console.log("No safe mode yet")
            };
        };
    };

    if (autoGoActive == true) {
        window.onload = autoGo();
    };

})();
