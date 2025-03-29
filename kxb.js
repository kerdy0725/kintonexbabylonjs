(function() {
    'use strict';

    kintone.events.on('app.record.detail.show', function(event) {
        const spaceElement = kintone.app.record.getSpaceElement('view3d_space');

        const div = document.createElement('div');
        div.innerText = 'テスト表示';
        div.style.color = 'red';

        spaceElement.appendChild(div);
    });
})();
