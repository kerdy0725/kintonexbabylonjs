//1115
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
      const space = kintone.app.record.getSpaceElement('view3d_space');
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      space.innerHTML = '';
      space.appendChild(canvas);
  
      loadScript('https://cdn.babylonjs.com/babylon.js').then(() => {
        const engine = new BABYLON.Engine(canvas, true);
        const scene = new BABYLON.Scene(engine);
  
        const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 4, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
  
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  
        // ✅ Box Mesh を作成
        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);
        box.position.y = 0.5;
  
        // ✅ レンダリング開始
        engine.runRenderLoop(() => {
          scene.render();
        });
  
        window.addEventListener('resize', () => {
          engine.resize();
        });
      });
    });
  })();
  