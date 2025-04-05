(function () {
    'use strict';
  
    // 外部スクリプトを読み込む関数
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          resolve();
        };
        script.onerror = () => {
          console.error(`❌ Failed to load script: ${src}`);
          reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
      });
    }
  
    // kintone レコード詳細表示イベント
    kintone.events.on('app.record.detail.show', async (event) => {
  
      // スペースフィールド取得
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      if (!spaceElement) return console.error("❌ スペースフィールドが見つかりません");
      if (spaceElement.querySelector('canvas')) return;
  
      // ライブラリ読み込み
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
  
      // Canvas 作成
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
  
      // Babylon.js 初期化
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
      const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
  
      // GLBファイルURL（外部）
      const glbUrl = 'https://kerdy0725.github.io/kintonexbabylonjs/rx-78f00.glb';
  
      // 読み込み処理
      BABYLON.SceneLoader.LoadAssetContainer(
        "", // rootUrl は空
        glbUrl,
        scene,
        (container) => {
          container.addAllToScene();
          engine.runRenderLoop(() => {
            scene.render();
          });
        },
        null,
        (scene, message) => {
          console.error("❌ Babylon.js Load Error:", message);
        },
        '.glb'
      );
  
      // ウィンドウサイズ対応
      window.addEventListener('resize', () => engine.resize());
    });
  })();
  