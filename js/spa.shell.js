spa.shell = (function() {

    let configMap = {
        anchor_schema_map : {
            chat : { opened : true, closed : true}
        },
        resize_interval : 200,
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
            + '<div class="spa-shell-modal"></div>'
    };

    let stateMap = {
        $container : undefined,
        anchor_map : {},
        resize_idto : undefined
    };

    let jqueryMap = {};

    let copyAnchorMap;
    let setJqueryMap;
    let changeAnchorPart;
    let onHashchange;
    let onResize;
    let setChatAnchor;
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

    setJqueryMap = function() {
        let $container = stateMap.$container;
        jqueryMap = {
            $container : $container
        };
    };

    //DOM method end

    //EventHandler
    onHashchange = function(event) {
        let _s_chat_previous;
        let _s_chat_proposed;
        let s_chat_proposed;
        let anchor_map_proposed;
        let is_ok = true;
        let anchor_map_previous = copyAnchorMap();

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
                case 'opened' :
                    is_ok = spa.chat.setSliderPosition('opened');
                    break;
                case 'closed' :
                    is_ok = spa.chat.setSliderPosition('closed');
                    break;
                default :
                    spa.chat.setSliderPosition('closed');
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }

        if (!is_ok) {
            if (anchor_map_previous) {
                $.uriAnchor.setAnchor(anchor_map_previous, null, true);
                stateMap.anchor_map = anchor_map_previous;
            } else {
                delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }

        return false;
    };

    onResize = function() {
        if (stateMap.resize_idto) { return true; }

        spa.chat.handleResize();
        stateMap.resize_idto = setTimeout(function() {
            stateMap.resize_idto = undefined;
        }, configMap.resize_interval);
    };
    //EventHandler end

    //Callback
    setChatAnchor = function(position_type) {
        return changeAnchorPart({ chat : position_type });
    };

    //Callback end

    //public
    initModule = function($container) {
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();

        $.uriAnchor.configModule({
            schema_map : configMap.anchor_schema_map
        });

        spa.chat.configModule({
            set_chat_anchor : setChatAnchor,
            chat_model : spa.model.chat,
            people_model : spa.model.people
        });
        spa.chat.initModule(jqueryMap.$container);

        $(window)
            .bind('resize', onResize)
            .bind('hashchange', onHashchange)
            .trigger('hashchange');

    };

    return { initModule : initModule };
    //public end

})();
