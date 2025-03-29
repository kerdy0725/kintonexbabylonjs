(function() {
    'use strict';

    function loadScript(src) {
        return new Promise(resolve => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    kintone.events.on('app.record.detail.show', function(event) {
        const record = event.record;

        // ★ ここを必ず正しく指定 ★
        const fileField = record['glb'].value;
        if (fileField.length === 0) {
            console.log("GLBファイルが添付されていません。");
            return;
        }
        const glbUrl = fileField[0].url;

        const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '500px';
        spaceElement.appendChild(canvas);

        // 明確な順序でロード（エラー①解決）
        loadScript('https://cdn.babylonjs.com/babylon.js').then(() => {
            return loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
        }).then(() => {
            const engine = new BABYLON.Engine(canvas, true);
            const scene = new BABYLON.Scene(engine);

            const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(canvas, true);

            new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

            // Proxyの引数を正しく設定（エラー②解決）
            kintone.proxy(glbUrl, 'GET', {}, {}, function(body, status, headers) {
                if (status !== 200) {
                    console.error("Proxy Error: Status", status);
                    return;
                }

                const byteArray = new Uint8Array(body);
                const blob = new Blob([byteArray], {type: 'model/gltf-binary'});
                const blobUrl = URL.createObjectURL(blob);

                BABYLON.SceneLoader.Append('', blobUrl, scene, function() {
                    scene.createDefaultCameraOrLight(true, true, true);
                    engine.runRenderLoop(() => scene.render());
                }, null, function(scene, message) {
                    console.error("Babylon.js Load Error:", message);
                });
            }, function(error) {
                console.error("Proxy Fetch Error:", error);
            });

            window.addEventListener('resize', () => {
                engine.resize();
            });
        });
    });
})();
