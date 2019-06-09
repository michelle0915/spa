spa.shell = (function() {

    let configMap = {
        anchor_schema_map : {
            chat : { open : true, closed : true}
        },
        main_html : String()
            + '<div class="spa-shell-head">'
                + '<div class="spa-shell-head-logo"></div>'
                + '<div class="spa-shell-head-acct"></div>'
                + '<div class="spa-shell-head-search"></div>'
            + '</div>'
            + '<div class="spa-shell-main">'
                + '<div class="spa-shell-main-nav"></div>'
                + '<div class="spa-shell-main-content"></div>'
            + '</div>'
            + '<div class="spa-shell-foot"></div>'
            + '<div class="spa-shell-chat"></div>'
            + '<div class="spa-shell-modal"></div>',
        chat_extend_time : 250,
        chat_retract_time : 300,
        chat_extend_height : 450,
        chat_retract_height : 15,
        chat_extended_title : 'Click to retract',
        chat_retracted_title : 'Click to extend'
    };

    let stateMap = {
        $container : null,
        anchor_map : {},
        is_chat_retracted : true
    };

    let jqueryMap = {};

    let copyAnchorMap;
    let setJqueryMap;
    let toggleChat;
    let changeAnchorPart;
    let onHashchange;
    let onClickChat;
    let initModule;

    //utility method
    copyAnchorMap = function() {
        return $.extend(true, {}, stateMap.anchor_map);
    };
    //utility method end

    //DOM method
    changeAnchorPart = function(arg_map) {
        let anchor_map_revise = copyAnchorMap();
        let bool_return = true;
        let key_name;
        let key_name_dep;

        KEYVAL:
        for (key_name in arg_map) {
            if (arg_map.hasOwnProperty(key_name)) {
                if (key_name.indexOf('_') === 0) continue KEYVAL;

                anchor_map_revise[key_name] = arg_map[key_name];
                key_name_dep = '_' + key_name;
                if (arg_map[key_name_dep]) {
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                } else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
                }
            }
        }

        try {
            $.uriAnchor.setAnchor(anchor_map_revise);
        } catch (error) {
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            bool_return = false;
        }

        return bool_return;
    };

    onHashchange = function(event) {
        let anchor_map_previous = copyAnchorMap();
        let anchor_map_proposed;
        let _s_chat_previous;
        let _s_chat_proposed;
        let s_chat_proposed;

        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        } catch (error) {
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;

        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;

        if (!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
            s_chat_proposed = anchor_map_proposed.chat;
            switch (s_chat_proposed) {
                case 'open' :
                    toggleChat(true);
                    break;
                case 'closed' :
                    toggleChat(false);
                    break;
                default :
                    toggleChat(false);
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }

        return false;
    };

    setJqueryMap = function() {
        let $container = stateMap.$container;
        jqueryMap = {
            $container : $container,
            $chat : $container.find('.spa-shell-chat')
        };
    };

    toggleChat = function(do_extend, callback) {
        let px_chat_ht = jqueryMap.$chat.height();
        let is_open = px_chat_ht === configMap.chat_extend_height;
        let is_closed = px_chat_ht === configMap.chat_retract_height;
        let is_sliding = !is_open && !is_closed;

        if (is_sliding) return false;

        //retracted -> extended
        if (do_extend) {
            jqueryMap.$chat.animate(
                { height : configMap.chat_extend_height },
                configMap.chat_extend_time,
                function() {
                    jqueryMap.$chat.attr('title', configMap.chat_extended_title);
                    stateMap.is_chat_retracted = false;
                    if (callback) { callback(jqueryMap.$chat); }
                }
            );
            return true;
        }

        //extended -> retracted
        jqueryMap.$chat.animate(
            { height : configMap.chat_retract_height },
            configMap.chat_retract_time,
            function() {
                jqueryMap.$chat.attr('title', configMap.chat_retracted_title);
                stateMap.is_chat_retracted = true;
                if (callback) { callback(jqueryMap.$chat); }
            }
        );
        return true;
    }
    //DOM method end

    //EventHandler
    onClickChat = function(event) {
        changeAnchorPart({
            chat : (stateMap.is_chat_retracted ? 'open' : 'closed')
        });
        return false;
    }
    //EventHandler end

    //public
    initModule = function($container) {
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();

        //chatslider init
        stateMap.is_chat_retracted = true;
        jqueryMap.$chat
            .attr('title', configMap.chat_retracted_title)
            .click(onClickChat);

        $.uriAnchor.configModule({
            schema_map : configMap.anchor_schema_map
        });

        $(window)
            .bind('hashchange', onHashchange)
            .trigger('hashchange');

    };

    return { initModule : initModule };
    //public end

})();
