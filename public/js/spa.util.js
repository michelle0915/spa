spa.util = (function() {
    let makeError;
    let setConfigMap;

    makeError = function(name_text, msg_text, data) {
        let error = new Error();
        error.name = name_text;
        error.message = msg_text;

        if (data) { error.data = data; }

        return error;
    };

    setConfigMap = function(arg_map) {
        let input_map = arg_map.input_map;
        let settable_map = arg_map.settable_map;
        let configMap = arg_map.configMap;
        let key_name;
        let error;

        for (key_name in input_map) {
            if (input_map.hasOwnProperty(key_name)) {
                if (settable_map.hasOwnProperty(key_name)) {
                    configMap[key_name] = input_map[key_name];
                } else {
                    error = makeError(
                        'Bad Input',
                        'Setting config key |' + key_name + '| is not supported'
                    );
                    throw error;
                }
            }
        }
    };

    return {
        makeError : makeError,
        setConfigMap : setConfigMap
    };

})();
