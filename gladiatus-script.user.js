// ==UserScript==
// @name         Gladiatus Script
// @version      3.0
// @description  Gladiatus Bot
// @author       Eryk Bodziony
// @mainteiner   Taeko
// @match        *://*.gladiatus.gameforge.com/game/index.php*
// @exclude      *://*.gladiatus.gameforge.com/game/index.php?mod=start
// @downloadURL  https://github.com/Taeko-ar/gladiatus-script/raw/master/gladiatus-script.js
// @updateURL    https://github.com/Taeko-ar/gladiatus-script/raw/master/gladiatus-script.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @resource     customCSS_global  https://raw.githubusercontent.com/Taeko-ar/gladiatus-script/master/global.css
// ==/UserScript==

const cssUrl = "https://raw.githubusercontent.com/Taeko-ar/gladiatus-script/master/global.css?v=" + Date.now();
(function () {
    'use strict';

    // Add CSS

    function addCustomCSS() {
        const getStyle = async () => {
            const res = await fetch(cssUrl)
            const css = await res.text()
            GM_addStyle(css);
        }
        getStyle();
    };

    addCustomCSS();

    /*****************
    *     Global     *
    *****************/

    const assetsUrl = 'https://raw.githubusercontent.com/Taeko-ar/gladiatus-script/master/assets';

    let autoGoActive = sessionStorage.getItem('autoGoActive') === "true" ? true : false;

    const currentDate = $("#server-time").html().split(',')[0];

    const player = {
        level: Number($("#header_values_level").first().html()),
        hp: Number($("#header_values_hp_percent").first().html().replace(/[^0-9]/gi, '')),
        gold: Number($("#sstat_gold_val").first().html().replace(/\./g, '')),
    };

    /*****************
    *     Config     *
    *****************/

    // Mode

    let safeMode = false;
    let nextEncounterTime = Number(localStorage.getItem('nextEncounter'));

    // Quests

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

    // Expedition

    let doExpedition = true;
    if (localStorage.getItem('doExpedition')) {
        doExpedition = localStorage.getItem('doExpedition') === "true" ? true : false;
    };
    let monsterId = 0;
    if (localStorage.getItem('monsterId')) {
        monsterId = Number(localStorage.getItem('monsterId'));
    };

    // Dungeon

    let doDungeon = true;
    if (localStorage.getItem('doDungeon')) {
        doDungeon = localStorage.getItem('doDungeon') === "true" ? true : false;
    };
    if (player.level < 10) {
        doDungeon = false;
    };
    let dungeonDifficulty = localStorage.getItem('dungeonDifficulty') === 'advanced' ? 'advanced' : 'normal';

    // Arena

    let doArena = true;
    if (localStorage.getItem('doArena')) {
        doArena = localStorage.getItem('doArena') === "true" ? true : false;
    };
    if (player.level < 2) {
        doArena = false;
    };
    let arenaOpponentLevel = "min"
    if (localStorage.getItem('arenaOpponentLevel')) {
        arenaOpponentLevel = localStorage.getItem('arenaOpponentLevel');
    };

    // Circus

    let doCircus = true;
    if (localStorage.getItem('doCircus')) {
        doCircus = localStorage.getItem('doCircus') === "true" ? true : false;
    };
    if (player.level < 10) {
        doCircus = false;
    };
    let circusOpponentLevel = "min"
    if (localStorage.getItem('circusOpponentLevel')) {
        circusOpponentLevel = localStorage.getItem('circusOpponentLevel');
    };

    // Event Expedition

    let doEventExpedition = true;
    if (localStorage.getItem('doEventExpedition')) {
        doEventExpedition = localStorage.getItem('doEventExpedition') === "true" ? true : false;
    };
    if (!document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0]) {
        doEventExpedition = false;
    };

    let eventMonsterId = 0;
    if (localStorage.getItem('eventMonsterId')) {
        eventMonsterId = Number(localStorage.getItem('eventMonsterId'));
    };

    let nextEventExpeditionTime = 0;
    if (localStorage.getItem('nextEventExpeditionTime')) {
        nextEventExpeditionTime = Number(localStorage.getItem('nextEventExpeditionTime'));
    };

    let eventPoints = 16;
    if (localStorage.getItem('eventPoints')) {
        const savedEventPoints = JSON.parse(localStorage.getItem('eventPoints'));

        if (savedEventPoints.date === currentDate) {
            eventPoints = savedEventPoints.count;
        };
    };

    // Food

    let doFood = true;
    if (localStorage.getItem('doFood')) {
        doFood = localStorage.getItem('doFood') === "true" ? true : false;
    };
    let useFoodAtLowHealth = true;
    if (localStorage.getItem('useFoodAtLowHealth')) {
        useFoodAtLowHealth = localStorage.getItem('useFoodAtLowHealth') === "true" ? true : false;
    };
    let foodTab = 1;
    if (localStorage.getItem('foodTab')) {
        foodTab = Number(localStorage.getItem('foodTab'));
    };
    let healthTreshold = 80;
    if (localStorage.getItem('healthTreshold')) {
        healthTreshold = Number(localStorage.getItem('healthTreshold'));
    };

    setTimeout(() => {
        if (document.querySelector("#set_food_tab")) document.querySelector("#set_food_tab").value = localStorage.getItem('foodTab')
        if (document.querySelector("#set_health_treshold")) document.querySelector("#set_health_treshold").value = localStorage.getItem('healthTreshold')
    }, 100)

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
        yes: 'Yes',
        food: 'Food',
        healthTreshold: '% Health',
        foodTab: 'Food tab'
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
        yes: 'Tak',
        food: 'Food',
        healthTreshold: '% Health',
        foodTab: 'Food tab' // Needs PL translation
    }

    const contentES = {
        advanced: 'Avanzado',
        arena: 'Arena',
        circusTurma: 'Circus Turma',
        difficulty: 'Dificultad',
        dungeon: 'Mazmorra',
        eventExpedition: 'Expedición de Evento',
        expedition: 'Expedición',
        highest: 'Más alto',
        in: 'En',
        lastUsed: "Último visitado",
        location: 'Localización',
        lowest: 'Más bajo',
        nextAction: 'Próxima Acción',
        no: 'No',
        normal: 'Normal',
        opponent: 'Oponente',
        opponentLevel: 'Nivel de oponente',
        quests: 'Misiones',
        random: 'Aleatorio',
        settings: 'Configuración',
        soon: 'Próximamente...',
        type: 'Tipo',
        yes: 'Si',
        food: 'Comida',
        healthTreshold: '% Vida',
        foodTab: 'Pestaña de comida'
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
        case 'ES':
            content = { ...contentES }
            break;
        default:
            content = { ...contentEN }
    }

    /****************
    *   Interface   *
    ****************/

    // Set Auto Go Active
    function setAutoGoActive() {
        sessionStorage.setItem('autoGoActive', true);
        document.getElementById("autoGoButton").innerHTML = 'STOP'
        document.getElementById("autoGoButton").removeEventListener("click", setAutoGoActive);
        document.getElementById("autoGoButton").addEventListener("click", setAutoGoInactive);
        autoGo();
    };

    // Set Auto Go Inactive
    function setAutoGoInactive() {
        sessionStorage.setItem('autoGoActive', false);
        document.getElementById("autoGoButton").innerHTML = 'Auto GO'
        document.getElementById("autoGoButton").addEventListener("click", setAutoGoActive);
        document.getElementById("autoGoButton").removeEventListener("click", setAutoGoInactive);

        clearTimeout(setTimeout);

        if (document.getElementById("nextActionWindow")) {
            document.getElementById("nextActionWindow").remove();
        };

        if (document.getElementById("lowHealth")) {
            document.getElementById("lowHealth").remove();
        };
    };

    // Open Settings
    function openSettings() {

        function closeSettings() {
            document.getElementById("settingsWindow").remove();
            document.getElementById("overlayBack").remove();
        };

        var settingsWindow = document.createElement("div");
        settingsWindow.setAttribute("id", "settingsWindow")
        settingsWindow.innerHTML = `
                <span id="settingsLanguage">
                    <img id="languageEN" src="${assetsUrl}/GB.png">
                    <img id="languagePL" src="${assetsUrl}/PL.png">
                    <img id="languageES" src="${assetsUrl}/ES.png">
                </span>
                <span id="settingsHeader">${content.settings}</span>
                <div id="settingsContent">
                    <div
                        id="expedition_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.expedition}</div>
                        <div class="settingsSubcontent">
                            <div id="do_expedition_true" class="settingsButton">${content.yes}</div>
                            <div id="do_expedition_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponent}</div>
                        <div class="settingsSubcontent">
                            <div id="set_monster_id_0" class="settingsButton">1</div>
                            <div id="set_monster_id_1" class="settingsButton">2</div>
                            <div id="set_monster_id_2" class="settingsButton">3</div>
                            <div id="set_monster_id_3" class="settingsButton">Boss</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.location}</div>
                        <div class="settingsSubcontent">
                            <div id="set_expedition_location" class="settingsButton">${content.lastUsed}</div>
                        </div>
                    </div>

                    <div
                        id="dungeon_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.dungeon}</div>
                        <div class="settingsSubcontent">
                            <div id="do_dungeon_true" class="settingsButton">${content.yes}</div>
                            <div id="do_dungeon_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.difficulty}</div>
                        <div class="settingsSubcontent">
                            <div id="set_dungeon_difficulty_normal" class="settingsButton">${content.normal}</div>
                            <div id="set_dungeon_difficulty_advanced" class="settingsButton">${content.advanced}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.location}</div>
                        <div class="settingsSubcontent">
                            <div id="set_dungeon_location" class="settingsButton">${content.lastUsed}</div>
                        </div>
                    </div>

                    <div
                        id="arena_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.arena}</div>
                        <div class="settingsSubcontent">
                            <div id="do_arena_true" class="settingsButton">${content.yes}</div>
                            <div id="do_arena_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponentLevel}</div>
                        <div class="settingsSubcontent">
                            <div id="set_arena_opponent_level_min" class="settingsButton">${content.lowest}</div>
                            <div id="set_arena_opponent_level_max" class="settingsButton">${content.highest}</div>
                            <div id="set_arena_opponent_level_random" class="settingsButton">${content.random}</div>
                        </div>
                    </div>

                    <div
                        id="circus_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.circusTurma}</div>
                        <div class="settingsSubcontent">
                            <div id="do_circus_true" class="settingsButton">${content.yes}</div>
                            <div id="do_circus_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponentLevel}</div>
                        <div class="settingsSubcontent">
                            <div id="set_circus_opponent_level_min" class="settingsButton">${content.lowest}</div>
                            <div id="set_circus_opponent_level_max" class="settingsButton">${content.highest}</div>
                            <div id="set_circus_opponent_level_random" class="settingsButton">${content.random}</div>
                        </div>
                    </div>

                    <div
                        id="quests_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.quests}</div>
                        <div class="settingsSubcontent">
                            <div id="do_quests_true" class="settingsButton">${content.yes}</div>
                            <div id="do_quests_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.type}</div>
                        <div class="settingsSubcontent">
                            <div id="do_combat_quests" class="settingsButton quest-type combat"></div>
                            <div id="do_arena_quests" class="settingsButton quest-type arena"></div>
                            <div id="do_circus_quests" class="settingsButton quest-type circus"></div>
                            <div id="do_expedition_quests" class="settingsButton quest-type expedition"></div>
                            <div id="do_dungeon_quests" class="settingsButton quest-type dungeon"></div>
                            <div id="do_items_quests" class="settingsButton quest-type items"></div>
                        </div>
                    </div>

                    <div
                        id="event_expedition_settings"
                        class="settings_box"
                    >
                        <div class="settingsHeaderBig">${content.eventExpedition}</div>
                        <div class="settingsSubcontent">
                            <div id="do_event_expedition_true" class="settingsButton">${content.yes}</div>
                            <div id="do_event_expedition_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsHeaderSmall">${content.opponent}</div>
                        <div class="settingsSubcontent">
                            <div id="set_event_monster_id_0" class="settingsButton">1</div>
                            <div id="set_event_monster_id_1" class="settingsButton">2</div>
                            <div id="set_event_monster_id_2" class="settingsButton">3</div>
                            <div id="set_event_monster_id_3" class="settingsButton">Boss</div>
                        </div>
                    </div>

                    <div id="health_settings" style="padding-bottom: 50px" class="settings_box">
                        <div style="display: flex; flex-direction: column;">
                        <div class="settingsHeaderBig">${content.food}</div>
                        <div class="settingsSubcontent">
                            <div id="do_health_true" class="settingsButton">${content.yes}</div>
                            <div id="do_health_false" class="settingsButton">${content.no}</div>
                        </div>
                        <div class="settingsSubcontent" style="display: flex; flex-direction: row;">
                            <div style="flex: 1; display: flex; flex-direction: column;">
                                <label class="settingsHeaderSmall" style="margin: 10px 0;text-align: left;">${content.healthTreshold}</label>
                                <input id="set_health_treshold" style="width: 50%" max="100" min="0" value="${healthTreshold}" placeholder="${healthTreshold}" type="number"/>
                            </div>
                            <div style="flex: 1; display: flex; flex-direction: column;">
                                <label class="settingsHeaderSmall" style="margin: 10px 0; white-space: nowrap;">${content.foodTab}</label>
                                <select id="set_food_tab" value="${foodTab}" name="numero">
                                    ${[1, 2, 3, 4, 5, 6, 7, 8].map((tab) => `<option ${tab === foodTab ? "selected" : ""} value="${tab}">${tab}</option>`)}
                                </select>

                            </div>
                        </div>
                    </div>
                </div>`;
        document.getElementById("header_game").insertBefore(settingsWindow, document.getElementById("header_game").children[0]);

        var overlayBack = document.createElement("div");
        const wrapperHeight = document.getElementById("wrapper_game").clientHeight;
        overlayBack.setAttribute("id", "overlayBack");
        overlayBack.setAttribute("style", `height: ${wrapperHeight}px;`);
        overlayBack.addEventListener("click", closeSettings);
        document.getElementsByTagName("body")[0].appendChild(overlayBack);

        // Set Language

        function setLanguage(language) {
            localStorage.setItem('settings.language', language)

            switch (language) {
                case 'EN':
                    content = { ...contentEN }
                    break;
                case 'PL':
                    content = { ...contentPL }
                    break;
                case 'ES':
                    content = { ...contentES }
                    break;
                default:
                    content = { ...contentEN }
            };

            reloadSettings();
        };

        $("#languageEN").click(function () { setLanguage('EN') });
        $("#languagePL").click(function () { setLanguage('PL') });
        $("#languageES").click(function () { setLanguage('ES') });

        // Change Settings

        function setDoExpedition(bool) {
            doExpedition = bool;
            localStorage.setItem('doExpedition', bool);
            reloadSettings();
        };

        $("#do_expedition_true").click(function () { setDoExpedition(true) });
        $("#do_expedition_false").click(function () { setDoExpedition(false) });

        function setMonster(id) {
            monsterId = id;
            localStorage.setItem('monsterId', id);
            reloadSettings();
        };

        $("#set_monster_id_0").click(function () { setMonster('0') });
        $("#set_monster_id_1").click(function () { setMonster('1') });
        $("#set_monster_id_2").click(function () { setMonster('2') });
        $("#set_monster_id_3").click(function () { setMonster('3') });

        function setDoDungeon(bool) {
            doDungeon = bool;
            localStorage.setItem('doDungeon', bool);
            reloadSettings();
        };

        $("#do_dungeon_true").click(function () { setDoDungeon(true) });
        $("#do_dungeon_false").click(function () { setDoDungeon(false) });

        function setDungeonDifficulty(difficulty) {
            dungeonDifficulty = difficulty;
            localStorage.setItem('dungeonDifficulty', difficulty);
            reloadSettings();
        };

        $("#set_dungeon_difficulty_normal").click(function () { setDungeonDifficulty("normal") });
        $("#set_dungeon_difficulty_advanced").click(function () { setDungeonDifficulty("advanced") });

        function setDoArena(bool) {
            doArena = bool;
            localStorage.setItem('doArena', bool);
            reloadSettings();
        };

        $("#do_arena_true").click(function () { setDoArena(true) });
        $("#do_arena_false").click(function () { setDoArena(false) });

        function setArenaOpponentLevel(level) {
            arenaOpponentLevel = level;
            localStorage.setItem('arenaOpponentLevel', level);
            reloadSettings();
        };

        $("#set_arena_opponent_level_min").click(function () { setArenaOpponentLevel('min') });
        $("#set_arena_opponent_level_max").click(function () { setArenaOpponentLevel('max') });
        $("#set_arena_opponent_level_random").click(function () { setArenaOpponentLevel('random') });

        function setDoCircus(bool) {
            doCircus = bool;
            localStorage.setItem('doCircus', bool);
            reloadSettings();
        };

        $("#do_circus_true").click(function () { setDoCircus(true) });
        $("#do_circus_false").click(function () { setDoCircus(false) });

        function setCircusOpponentLevel(level) {
            circusOpponentLevel = level;
            localStorage.setItem('circusOpponentLevel', level);
            reloadSettings();
        };

        $("#set_circus_opponent_level_min").click(function () { setCircusOpponentLevel('min') });
        $("#set_circus_opponent_level_max").click(function () { setCircusOpponentLevel('max') });
        $("#set_circus_opponent_level_random").click(function () { setCircusOpponentLevel('random') });

        function setDoQuests(bool) {
            doQuests = bool;
            localStorage.setItem('doQuests', bool);
            reloadSettings();
        };

        $("#do_quests_true").click(function () { setDoQuests(true) });
        $("#do_quests_false").click(function () { setDoQuests(false) });

        function setQuestTypes(type) {
            questTypes[type] = !questTypes[type];
            localStorage.setItem('questTypes', JSON.stringify(questTypes));
            reloadSettings();
        };

        $("#do_combat_quests").click(function () { setQuestTypes('combat') });
        $("#do_arena_quests").click(function () { setQuestTypes('arena') });
        $("#do_circus_quests").click(function () { setQuestTypes('circus') });
        $("#do_expedition_quests").click(function () { setQuestTypes('expedition') });
        $("#do_dungeon_quests").click(function () { setQuestTypes('dungeon') });
        $("#do_items_quests").click(function () { setQuestTypes('items') });

        function setDoEventExpedition(bool) {
            doEventExpedition = bool;
            localStorage.setItem('doEventExpedition', bool);
            reloadSettings();
        };

        $("#do_event_expedition_true").click(function () { setDoEventExpedition(true) });
        $("#do_event_expedition_false").click(function () { setDoEventExpedition(false) });

        function setEventMonster(id) {
            eventMonsterId = id;
            localStorage.setItem('eventMonsterId', id);
            reloadSettings();
        };

        $("#set_event_monster_id_0").click(function () { setEventMonster('0') });
        $("#set_event_monster_id_1").click(function () { setEventMonster('1') });
        $("#set_event_monster_id_2").click(function () { setEventMonster('2') });
        $("#set_event_monster_id_3").click(function () { setEventMonster('3') });

        function setDoFood(bool) {
            doFood = bool;
            localStorage.setItem('doFood', bool);
            reloadSettings();
        };

        $("#do_health_true").click(function () { setDoFood(true) });
        $("#do_health_false").click(function () { setDoFood(false) });

        function setHealthTreshold(threshold) {
            healthTreshold = Number(threshold);
            localStorage.setItem('healthTreshold', threshold);
            reloadSettings();
        }

        function setFoodTab(tab) {
            foodTab = Number(tab);
            localStorage.setItem('foodTab', tab);
            reloadSettings();
        }
        let debounceTimer;

        document.querySelector('#set_health_treshold').addEventListener('keyup', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const value = Number(e.target.value)
                const min = Number(e.target.min)
                const max = Number(e.target.max)

                if (value < min) {
                    e.target.value = e.target.min;
                }

                if (value > max) {
                    e.target.value = e.target.max;
                }
                setHealthTreshold(e.target.value);
            }, 500);
        });


        document.querySelector('#set_food_tab').addEventListener('change', (e) => {
            setFoodTab(e.target.value);
        });

        function reloadSettings() {
            closeSettings();
            openSettings();
        }

        function setActiveButtons() {
            $('#expedition_settings').addClass(doExpedition ? 'active' : 'inactive');
            $(`#do_expedition_${doExpedition}`).addClass('active');
            $(`#set_monster_id_${monsterId}`).addClass('active');

            $('#dungeon_settings').addClass(doDungeon ? 'active' : 'inactive');
            $(`#do_dungeon_${doDungeon}`).addClass('active');
            $(`#set_dungeon_difficulty_${dungeonDifficulty}`).addClass('active');

            $('#arena_settings').addClass(doArena ? 'active' : 'inactive');
            $(`#do_arena_${doArena}`).addClass('active');
            $(`#set_arena_opponent_level_${arenaOpponentLevel}`).addClass('active');

            $('#circus_settings').addClass(doCircus ? 'active' : 'inactive');
            $(`#do_circus_${doCircus}`).addClass('active');
            $(`#set_circus_opponent_level_${circusOpponentLevel}`).addClass('active');

            $('#quests_settings').addClass(doQuests ? 'active' : 'inactive');
            $(`#do_quests_${doQuests}`).addClass('active');

            for (const type in questTypes) {
                if (questTypes[type]) {
                    $(`#do_${type}_quests`).addClass('active');
                }
            }

            $('#event_expedition_settings').addClass(doEventExpedition ? 'active' : 'inactive');
            $(`#do_event_expedition_${doEventExpedition}`).addClass('active');
            $(`#set_event_monster_id_${eventMonsterId}`).addClass('active');

            $('#health_settings').addClass(doFood ? 'active' : 'inactive');
            $(`#do_food_${doFood}`).addClass('active');
        };

        setActiveButtons();
    };

    // Auto GO button

    var autoGoButton = document.createElement("button");
    autoGoButton.setAttribute("id", "autoGoButton")
    autoGoButton.className = 'menuitem';

    if (autoGoActive == false) {
        autoGoButton.innerHTML = 'Auto GO';
        autoGoButton.addEventListener("click", setAutoGoActive);
    } else {
        autoGoButton.innerHTML = 'STOP';
        autoGoButton.addEventListener("click", setAutoGoInactive);
    };

    document.getElementById("mainmenu").insertBefore(autoGoButton, document.getElementById("mainmenu").children[0]);

    // Settings button

    var settingsButton = document.createElement("button");
    settingsButton.className = 'menuitem';
    settingsButton.innerHTML = `<img src="${assetsUrl}/cog.svg" title="Ustawienia" height="20" width="20" style="filter: invert(83%) sepia(52%) saturate(503%) hue-rotate(85deg) brightness(103%) contrast(101%); z-index: 999;">`;
    settingsButton.setAttribute("style", "display: flex; justify-content: center; align-items: center; height: 27px; width: 27px; cursor: pointer; border: none; color: #5dce5d; padding: 0; background-image: url('https://i.imgur.com/jf7BXTX.png')");
    settingsButton.addEventListener("click", openSettings);
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
        const ms = Number(t.split(':')[0]) * 60 * 60 * 1000 + Number(t.split(':')[1]) * 60 * 1000 + Number(t.split(':')[2]) * 1000;

        return ms;
    };

    function getElementsByXPath(xpath, parent) {
        let results = [];
        let query = document.evaluate(xpath, parent || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        for (let i = 0, length = query.snapshotLength; i < length; ++i) {
            results.push(query.snapshotItem(i));
        }

        return results;
    }

    function autoHealth() {
        /* 
            If on underworld you can comment everything and use pots only

            document.querySelector("#header_life_pot").click()
        
        */

        const isOverviewPage = $("body").first().attr("id") === "overviewPage";

        if (!isOverviewPage) {
            $("#mainmenu a.menuitem")[0].click();
        } else {
            const tab = document.querySelectorAll("#inventory_nav > a")[foodTab - 1]
            const clickEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true
            });
            tab.dispatchEvent(clickEvent);

            // Double click (only works with Gladiatus Crazy addon)
            setTimeout(() => {
                const firstCha = document.querySelector("#char > div.charmercsel> div").click();
                const bestFood = document.querySelector("[style*='filter: drop-shadow(black 0px 0px 1px) drop-shadow(yellow 0px 0px 3px) drop-shadow(yellow 0px 0px 3px)']");
                const nearFood = document.querySelector("#inv .ui-draggable-handle");

                if (!bestFood || !nearFood) {
                    localStorage.setItem('doArena', false);
                    /*
                        You can use pots here too

                        document.querySelector("#header_life_pot").click()

                    */
                }

                if (bestFood || nearFood) {
                    var dbClickEvent = new MouseEvent("dblclick", {
                        bubbles: true,
                        cancelable: true
                    });
                    (bestFood || nearFood).dispatchEvent(dbClickEvent);
                }

                console.log(`Used food at %${player.hp} with threshold ${healthTreshold}`);
            }, 1000);
        }
    }

    /****************
    *    Auto Go    *
    ****************/

    function autoGo() {

        // Variables

        const currentTime = new Date().getTime();
        const clickDelay = getRandomInt(900, 2400);

        // Claim Daily Reward

        if (document.getElementById("blackoutDialogLoginBonus") !== null) {
            setTimeout(function () {
                document.getElementById("blackoutDialogLoginBonus").getElementsByTagName("input")[0].click();
            }, clickDelay);
        };

        // Close Notifications

        if (document.getElementById("blackoutDialognotification") !== null && document.getElementById("blackoutDialognotification").isDisplayed()) {
            setTimeout(function () {
                document.getElementById("blackoutDialognotification").getElementsByTagName("input")[0].click();
            }, clickDelay);
        };


        /****************
        * Handle Quests *
        ****************/

        if (doQuests === true && nextQuestTime < currentTime) {
            if (player.hp < healthTreshold) {
                autoHealth();
            }

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
                        if (url.includes('8aada67d4c5601e009b9d2a88f478c')) {
                            return 'combat';
                        }

                        if (url.includes('00f1a594723515a77dcd6d66c918fb')) {
                            return 'arena';
                        }

                        if (url.includes('586768e942030301c484347698bc5e')) {
                            return 'circus';
                        }

                        if (url.includes('4e41ab43222200aa024ee177efef8f')) {
                            return 'expedition';
                        }

                        if (url.includes('dc366909fdfe69897d583583f6e446')) {
                            return 'dungeon';
                        }

                        if (url.includes('5a358e0a030d8551a5a65d284c8730')) {
                            return 'items';
                        }

                        return null;
                    }

                    const availableQuests = $("#content .contentboard_slot_inactive");

                    for (const quest of availableQuests) {
                        let icon = getIconName(quest.getElementsByClassName("quest_slot_icon")[0].style.backgroundImage);

                        if (!icon) {
                            console.log('No quest was found')
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

            setTimeout(function () {
                completeQuests();
            }, clickDelay);
        }

        /****************
        * Go Expedition *
        ****************/

        else if (doExpedition === true && document.getElementById("cooldown_bar_fill_expedition").classList.contains("cooldown_bar_fill_ready") === true) {

            if (player.hp < healthTreshold) {
                autoHealth();
            }

            function goExpedition() {
                const inExpeditionPage = $("body").first().attr("id") === "locationPage";
                const inEventExpeditionPage = document.getElementById("content").getElementsByTagName('img')[1].getAttribute('src') === 'img/ui/expedition_points2.png';

                if (!inExpeditionPage || inEventExpeditionPage) {
                    document.getElementsByClassName("cooldown_bar_link")[0].click();
                } else {

                    if (document.getElementsByClassName("disabled")) {
                        location.reload();
                    }
                    document.getElementsByClassName("expedition_button")[monsterId].click();
                };
            };

            setTimeout(function () {
                goExpedition();
            }, clickDelay);

        }

        /**************
        * Go Dungeon  *
        **************/

        else if (doDungeon === true && document.getElementById("cooldown_bar_fill_dungeon").classList.contains("cooldown_bar_fill_ready") === true) {
            function goDungeon() {
                const inDungeonPage = $("body").first().attr("id") === "dungeonPage";

                if (!inDungeonPage) {
                    document.getElementsByClassName("cooldown_bar_link")[1].click();
                } else {
                    const inSelectDifficultyPage = !document.getElementById("content").getElementsByTagName("area")[0];

                    if (inSelectDifficultyPage) {
                        if (dungeonDifficulty === "advanced") {
                            document.getElementById("content").getElementsByClassName("button1")[1].click();
                        } else {
                            document.getElementById("content").getElementsByClassName("button1")[0].click();
                        }
                    } else {
                        document.getElementById("content").getElementsByTagName("area")[0].click();
                    };
                };
            };

            setTimeout(function () {
                goDungeon();
            }, clickDelay);
        }

        /************************
        * Go Arena Provinciarum *
        ************************/

        else if (doArena === true && document.getElementById("cooldown_bar_fill_arena").classList.contains("cooldown_bar_fill_ready") === true) {

            if (player.hp < healthTreshold) {
                autoHealth();
            }

            function goArena() {
                const inArenaPage = document.getElementsByTagName("body")[0].id === "arenaPage";

                if (!inArenaPage && player.level < 10) {
                    document.getElementsByClassName("cooldown_bar_link")[1].click();
                } else if (!inArenaPage) {
                    document.getElementsByClassName("cooldown_bar_link")[2].click();
                } else {
                    const inArenaProvPage = document.getElementById("mainnav").getElementsByTagName("td")[1].firstChild.hasClass("awesome-tabs current");

                    if (!inArenaProvPage) {
                        document.getElementById("mainnav").getElementsByTagName("td")[1].firstElementChild.click();
                    } else {
                        const levels = new Array();
                        const levelValues = getElementsByXPath('//section/table/tbody/tr/td[2]');

                        for (const levelValue of levelValues) {
                            levels.push(levelValue.textContent);
                        }

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

            setTimeout(function () {
                goArena();
            }, clickDelay + 600);

        }

        /*************************
        * Go Circus Provinciarum *
        *************************/

        else if (doCircus === true && document.getElementById("cooldown_bar_fill_ct").classList.contains("cooldown_bar_fill_ready") === true) {
            function goCircus() {
                const inArenaPage = document.getElementsByTagName("body")[0].id === "arenaPage";

                if (!inArenaPage) {
                    document.getElementsByClassName("cooldown_bar_link")[3].click();
                } else {
                    const inCircusProvPage = document.querySelector("#mainnav > li > table > tbody > tr > td:nth-child(4) > a")

                    if (!inCircusProvPage) {
                        document.getElementsByTagName("td")[3].firstElementChild.click();
                    } else {
                        const levels = new Array();
                        const levelValues = getElementsByXPath('//section/table/tbody/tr/td[2]');

                        for (const levelValue of levelValues) {
                            levels.push(levelValue.textContent);
                        }

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

            setTimeout(function () {
                goCircus();
            }, clickDelay + 600);

        }

        /************************
        *  Go Event Expedition  *
        ************************/

        else if (doEventExpedition === true && nextEventExpeditionTime < currentTime) {

            if (player.hp < healthTreshold) {
                autoHealth();
            }

            function goEventExpedition() {
                const inEventExpeditionPage = document.getElementById("submenu2").getElementsByClassName("menuitem active glow")[0];

                if (!inEventExpeditionPage) {
                    document.getElementById("submenu2").getElementsByClassName("menuitem glow")[0].click();
                } else {
                    eventPoints = document.getElementById("content").getElementsByClassName("section-header")[0].getElementsByTagName("p")[1].firstChild.nodeValue.replace(/[^0-9]/gi, '')
                    localStorage.setItem('eventPoints', JSON.stringify({ count: eventPoints, date: currentDate }));

                    const isTimer = $('#content .ticker').first()

                    if (isTimer.length) {
                        nextEventExpeditionTime = currentTime + Number($('#content .ticker').first().attr('data-ticker-time-left'));
                        localStorage.setItem('nextEventExpeditionTime', nextEventExpeditionTime);

                        location.reload();
                    } else if (eventPoints == 0) {
                        location.reload();
                    } else if (eventPoints == 1 && eventMonsterId == 3) {
                        localStorage.setItem('eventPoints', JSON.stringify({ count: 0, date: currentDate }));

                        document.getElementsByClassName("expedition_button")[2].click();
                    } else {
                        if (eventMonsterId == 3) {
                            localStorage.setItem('eventPoints', JSON.stringify({ count: eventPoints - 2, date: currentDate }));
                        } else {
                            localStorage.setItem('eventPoints', JSON.stringify({ count: eventPoints - 1, date: currentDate }));
                        }

                        nextEventExpeditionTime = currentTime + 303000;
                        localStorage.setItem('nextEventExpeditionTime', nextEventExpeditionTime);

                        document.getElementsByClassName("expedition_button")[eventMonsterId].click();
                    }
                }
            };

            setTimeout(function () {
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

            if (safeMode === false) {
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

                if (doEventExpedition === true && eventPoints > 0) {
                    const timeTo = localStorage.getItem('nextEventExpeditionTime') - currentTime;

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
                        }
                    };
                    return actions[index]
                };

                const nextAction = getNextAction(actions);

                // @TODO fix nextAction if !actions.length

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
                    nextActionWindow.setAttribute("style", `
                        display: block;
                        position: absolute;
                        top: 120px;
                        left: 506px;
                        height: 72px;
                        width: 365px;
                        padding-top: 13px;
                        color: #58ffbb;
                        background-color: #000000db;
                        font-size: 20px;
                        border-radius: 20px;
                        border-left: 10px solid #58ffbb;
                        border-right: 10px solid #58ffbb;
                        z-index: 999;
                    `);
                    nextActionWindow.innerHTML = `
                        <span style="color: #fff;">${content.nextAction}: </span>
                        <span>${content[nextAction.name]}</span></br>
                        <span style="color: #fff;">${content.in}: </span>
                        <span>${formatTime(nextAction.time)}</span>`;
                    document.getElementById("header_game").insertBefore(nextActionWindow, document.getElementById("header_game").children[0]);
                };
                showNextActionWindow();

                let nextActionCounter;

                nextActionCounter = setInterval(function () {
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
                            setTimeout(function () {
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

    if (autoGoActive) {
        window.onload = autoGo();
    };

})();
