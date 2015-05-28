Modules.ResizeChatWindow = (function () {
    var bcplus = null;

    var initialize = function(_bcplus) {
        console.log('Modules.ResizeChatWindow.initialize()');
        bcplus = _bcplus;

        buildUI();
        addEventListeners();
    };

    var buildUI = function() {
        bcplus.addBoolOption('bcplusResizeChatWindow', 'Chatfenster anpassen', 'bcplusResizeChatWindow', 'Chatfenster', true);
    };

    var addEventListeners = function() {
        console.log('Modules.ResizeChatWindow.addEventListeners()');
        $('#timsChatSmilies').on("click", function() {
            console.log('Klick');
            setTimeout(function() {
        });
    };

    return {
        initialize: initialize
    }
})();
