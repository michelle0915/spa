spa.avtr = (function() {
    'use strict';

    let configMap = {
        chat_model : null,
        people_model : null,
        settable_map : {
            chat_model : true,
            people_model : true
        }
    };

    let stateMap = {
        drag_map : null,
        $drag_target : null,
        drag_bg_color : undefined
    };

    let jqueryMap = {};

    let getRandRgb;
    let setJaueryMap;
    let updateAvatar;
    let onTapNav;
    let onHeldstartNav;
    let onHeldmoveNav;
    let onHeldendNav;
    let onSetchatee;
    let onListchange;
    let onLogout;
    let configModule;
    let initModule;

    getRandRgb = function() {
        let i;
        let rgb_list = [];
        for (i = 0; i < 3; i++) {
            rgb_list.push(Math.floor(Math.random() * 128) + 128);
        }
        return 'rgb(' + rgb_list.join(',') + ')';
    };

    setJaueryMap = function($container) {
        jqueryMap = { $container : $container };
    };

    updateAvatar = function($target) {
        let css_map;
        let person_id;

        css_map = {
            top : parseInt($target.css('top'), 10),
            left : parseInt($target.css('left'), 10),
            'background-color' : $target.css('background-color')
        };
        person_id = $target.attr('data-id');

        configMap.chat_model.update_avatar({
            person_id : person_id,
            css_map : css_map
        });
    };

    onTapNav = function(event) {
        let css_map;
        let $target = $(event.elem_target).closest('.spa-avtr-box');

        if ($target.length === 0) { return false; }
        $target.css({ 'background-color' : getRandRgb() });
        updateAvatar($target);
    };

    onHeldstartNav = function(event) {
        let offset_target_map;
        let offset_nav_map;
        let $target = $(event.elem_target).closest('.spa-avtr-box');

        if ($target.length === 0) { return false; }

        stateMap.$drag_target = $target;
        offset_target_map = $target.offset();
        offset_nav_map = jqueryMap.$container.offset();

        offset_target_map.top -= offset_nav_map.top;
        offset_target_map.left -= offset_nav_map.left;

        stateMap.drag_map = offset_target_map;
        stateMap.drag_bg_color = $target.css('background-color');

        $target
            .addClass('spa-x-is-drag')
            .css('background-color', '');
    };

    onHeldmoveNav = function(event) {
        let drag_map = stateMap.drag_map;
        if (!drag_map) { return false; }

        drag_map.top += event.px_delta_y;
        drag_map.left += event.px_delta_x;

        stateMap.$drag_target.css({
            top : drag_map.top,
            left : drag_map.left
        });
    };

    onHeldendNav = function(event) {
        let $drag_target = stateMap.$drag_target;
        if (!$drag_target) { return false; }

        $drag_target
            .removeClass('spa-x-is-drag')
            .css('background-color', stateMap.drag_bg_color);

        stateMap.drag_bg_color = undefined;
        stateMap.$drag_target = null;
        stateMap.drag_map = null;
        updateAvatar($drag_target);
    };

    onSetchatee = function(event, arg_map) {
        let $nav = $(this);
        let new_chatee = arg_map.new_chatee;
        let old_chatee = arg_map.old_chatee;

        if (old_chatee) {
            $nav
                .find('.spa-avtr-box[data-id=' + old_chatee.cid + ']')
                .removeClass('spa-x-is-chatee');
        }

        if (new_chatee) {
            $nav
                .find('.spa-avtr-box[data-id=' + new_chatee.cid + ']')
                .addClass('spa-x-is-chatee');
        }
    };

    onListchange = function(event) {
        let $nav = $(this);
        let people_db = configMap.people_model.get_db();
        let user = configMap.people_model.get_user();
        let chatee = configMap.chat_model.get_chatee() || {};
        let $box;

        $nav.empty();
        if (user.get_is_anon()) { return false; }

        people_db().each(function(person, idx) {
            let class_list;
            if (person.get_is_anon()) { return true; }
            class_list = ['spa-avtr-box'];

            if (person.id === chatee.id) {
                class_list.push('spa-x-is-chatee');
            }
            if (person.get_is_user()) {
                class_list.push('spa-x-is-user');
            }

            $box = $('<div/>')
                .addClass(class_list.join(' '))
                .css(person.css_map)
                .attr('data-id', String(person.id))
                .prop('title', spa.util_b.encodeHtml(person.name))
                .text(person.name)
                .appendTo($nav);
        });
    };

    onLogout = function() {
        jqueryMap.$container.empty();
    };

    configModule = function(input_map) {
        spa.util.setConfigMap({
            input_map : input_map,
            settable_map : configMap.settable_map,
            configMap : configMap
        });
        return true;
    };

    initModule = function($container) {
        setJaueryMap($container);

        $.gevent.subscribe($container, 'spa-setchatee', onSetchatee);
        $.gevent.subscribe($container, 'spa-listchange', onListchange);
        $.gevent.subscribe($container, 'spa-logout', onLogout);

        $container
            .bind('utap', onTapNav)
            .bind('uheldstart', onHeldstartNav)
            .bind('uheldmove', onHeldmoveNav)
            .bind('uheldend', onHeldendNav);

        return true;
    };

    return {
        configModule : configModule,
        initModule : initModule
    };
})();
