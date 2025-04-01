//kintone
//  Field : glb ... Upload to glb file.
//  Field : view3d_space ... Space field.
(function () {
    'use strict';
  
    // 外部スクリプトを読み込む関数
    function loadScript(src) {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => {
            console.log(`✅ Script loaded: ${src}`);
            resolve();
          };
          script.onerror = () => {
            console.error(`❌ Failed to load script: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
          };
          document.head.appendChild(script);
        });
    }
  
    // kintoneの詳細画面イベント
    kintone.events.on('app.record.detail.show', async (event) => {
      // スペースフィールド取得
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      if (!spaceElement) return console.error("❌ スペースフィールドが見つかりません");
      if (spaceElement.querySelector('canvas')) return;
  
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
      await loadScript('https://js.cybozu.com/kintone-rest-api-client/5.6.0/KintoneRestAPIClient.min.js');
  
      // canvas追加
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
  
      // Babylon.js初期化
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
      const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 4, 1.5, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

      var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size: 1000.0}, scene);
      var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://www.babylonjs.com/assets/skybox/nebula", scene);
      skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
      skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      skybox.material = skyboxMaterial;
  
      //レコード取得とfileKey取得
      const record = event.record;
      const fileField = record.glb // ← あなたのファイルフィールドのフィールドコード
  
      if (!fileField || !fileField.value || fileField.value.length === 0) {
        return console.warn('❌ GLBファイルが登録されていません');
      }
      const fileKey = fileField.value[0].fileKey;
  
      try {
        // ファイルをBlobで取得
        const client = new KintoneRestAPIClient();
        const response = await fetch(`/k/v1/file.json?fileKey=${fileKey}`, {
            method: 'GET',
            headers: {
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

        const fileBlob = await response.blob();
        const blobUrl = URL.createObjectURL(fileBlob);
        BABYLON.SceneLoader.LoadAssetContainer(
            "",
            blobUrl,
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
      } catch (error) {
        console.error('❌ GLBの読み込みに失敗しました:', error);
      }
  
      // ウィンドウリサイズ対応
      window.addEventListener('resize', () => engine.resize());
    });
  })();