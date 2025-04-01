//2023
(function () {
    'use strict';
  
    // ログ出力のprefix
    const log = (msg, ...args) => console.log(`kxb.js: ${msg}`, ...args);
  
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
      log('🚀 Babylon Viewer Start');
  
      // STEP1: スペースフィールド取得
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      if (!spaceElement) return console.error("❌ スペースフィールドが見つかりません");
      log('📦 STEP1: スペースフィールド取得');
  
      // すでにcanvasがあるなら何もしない
      if (spaceElement.querySelector('canvas')) return;
  
      // STEP2: 必要なライブラリをロード
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      log('📦 STEP2: babylon.js スクリプト読み込み完了');
    
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
      log('📦 STEP2: babylonjs.loaders.miniスクリプト読み込み完了');

      await loadScript('https://js.cybozu.com/kintone-rest-api-client/5.6.0/KintoneRestAPIClient.min.js');
      log('📦 STEP2: kintone-js-sdk スクリプト読み込み完了');
  
      // STEP3: canvas追加
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
      log('🖼️ STEP3: Canvas 追加');
  
      // STEP4: Babylon.js初期化
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
  

      log('🎥 STEP4: Babylonシーン作成');
  
      // STEP5: レコード取得とfileKey取得
      const record = event.record;
      const fileField = record.glb // ← あなたのファイルフィールドのフィールドコード
      log('📦 STEP5: レコード取得');
  
      if (!fileField || !fileField.value || fileField.value.length === 0) {
        return console.warn('❌ GLBファイルが登録されていません');
      }
  
      const fileKey = fileField.value[0].fileKey;
      log('🗝️ fileKey:', fileKey);
  
      try {
        // STEP6: ファイルをBlobで取得
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
        log('fileBlob:', fileBlob);

        // STEP7: BlobをURLに変換
        const blobUrl = URL.createObjectURL(fileBlob);
        log('🗝️ URL:', blobUrl);
  
        // STEP8: Babylon.jsでGLB読み込み
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

          
// パーティクルシステムの作成
const particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", scene);

// パーティクルの放出位置（エミッター）の設定
particleSystem.emitter = BABYLON.Vector3.Zero(); // 中心から放出

// パーティクルの放出方向の設定
particleSystem.minEmitBox = new BABYLON.Vector3(-1, -1, -1); // 放出位置の最小範囲
particleSystem.maxEmitBox = new BABYLON.Vector3(1, 1, 1);    // 放出位置の最大範囲

// パーティクルの色の設定
particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

// パーティクルのサイズの設定
particleSystem.minSize = 0.05;
particleSystem.maxSize = 0.3;

// パーティクルの寿命の設定
particleSystem.minLifeTime = 0.3;
particleSystem.maxLifeTime = 1.5;

// 放出率の設定
particleSystem.emitRate = 1000;

// ブレンドモードの設定
particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

// 重力の設定
particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

// パーティクルの方向の設定
particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);

// パーティクルの角度の設定
particleSystem.minAngularSpeed = 0;
particleSystem.maxAngularSpeed = Math.PI;

// パーティクルの速度の設定
particleSystem.minEmitPower = 0.2;
particleSystem.maxEmitPower = 0.5;
particleSystem.updateSpeed = 0.01;

// パーティクルシステムの開始
particleSystem.start();



      } catch (error) {
        console.error('❌ GLBの読み込みに失敗しました:', error);
      }
  
      // ウィンドウリサイズ対応
      window.addEventListener('resize', () => engine.resize());
    });
  })();
  