let spa = (function() {
    'use strict';

    //public
    let initModule = function($container) {
        spa.model.initModule();
        spa.shell.initModule($container);
    };

    return { initModule : initModule };
    //end public

})();
