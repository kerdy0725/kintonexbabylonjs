//1135
(function () {
    'use strict';
  
    function loadScript(src) {
      return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
  
    // Babylon.js & loaders を順番にロードして、GLB表示
    kintone.events.on('app.record.detail.show', async function () {
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      if (!spaceElement) {
        console.error("スペースフィールド 'view3d_space' が見つかりません");
        return;
      }
  
      // 既にcanvasが追加されている場合は何もしない（再描画防止）
      if (spaceElement.querySelector('canvas')) return;
  
      // Babylon.js & Loaders読み込み
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
  
      // canvas 作成
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
  
      // Babylon.js 初期化
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
  
      // カメラとライト
      const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  
      // GLBファイルのURL（GitHub Pagesなど）
      const modelUrl = 'https://kerdy0725.github.io/kintonexbabylonjs/rx-78f00.glb';
  
      // GLB読み込み
      BABYLON.SceneLoader.Append('', modelUrl, scene, function () {
        engine.runRenderLoop(() => scene.render());
      }, null, function (scene, message) {
        console.error("Babylon.js Load Error:", message);
      });
  
      // リサイズ対応
      window.addEventListener('resize', () => {
        engine.resize();
      });
    });
  })();
  