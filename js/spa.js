let spa = (function() {

    //public
    let initModule = function($container) {
        spa.shell.initModule($container);
    };

    return { initModule : initModule };
    //end public

})();
