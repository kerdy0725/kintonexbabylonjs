//1102
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
  
    kintone.events.on('app.record.detail.show', function () {
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
  
      const externalGlbUrl = 'https://kerdy0725.github.io/kintonexbabylonjs/'; // ← 公開したGLBファイルのURL
  
      Promise.all([
        loadScript('https://cdn.babylonjs.com/babylon.js'),
        loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js')
      ]).then(() => {
        const engine = new BABYLON.Engine(canvas, true);
        const scene = new BABYLON.Scene(engine);
  
        const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
  
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

        
        BABYLON.SceneLoader.Append(
            "https://kerdy0725.github.io/kintonexbabylonjs/",
            "rx-78f00.glb",
            scene,
            function (scene) {
              scene.createDefaultCameraOrLight(true, true, true);
              engine.runRenderLoop(function () {
                scene.render();
              });
            },
            null,
            function (scene, message) {
              console.error("読み込みエラー:", message);
            },
            ".glb"
        );
  
        window.addEventListener('resize', () => engine.resize());
      });
    });
  })();
  