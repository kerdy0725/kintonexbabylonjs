(function() {
    'use strict';

    // CDNからBabylon.jsを読み込む
    const babylonScript = document.createElement('script');
    babylonScript.src = 'https://cdn.babylonjs.com/babylon.js';
    document.head.appendChild(babylonScript);

    const loadersScript = document.createElement('script');
    loadersScript.src = 'https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js';
    document.head.appendChild(loadersScript);

    kintone.events.on('app.record.detail.show', function(event) {
        const record = event.record;

        // GLBファイルのURLを取得
        const fileField = record['glb'].value;

        const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
        const canvas = document.createElement('canvas');
        canvas.style.width = '500px';
        canvas.style.height = '500px';
        spaceElement.appendChild(canvas);

        if (fileField.length === 0) {
            canvas.value="error";
        }
        const glbUrl = fileField[0].url;

        // Babylon.jsの描画エリアを作成

        babylonScript.onload = loadersScript.onload = function() {
            const engine = new BABYLON.Engine(canvas, true);
            const scene = new BABYLON.Scene(engine);
            
            // カメラを設定
            const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
            camera.attachControl(canvas, true);

            // 照明の設定
            new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

            // GLBモデルを読み込み
            BABYLON.SceneLoader.Append('', glbUrl, scene, function() {
                scene.createDefaultCameraOrLight(true, true, true);
                engine.runRenderLoop(() => {
                    scene.render();
                });
            });
            
            // リサイズ対応
            window.addEventListener('resize', () => {
                engine.resize();
            });
        };
    });
})();
