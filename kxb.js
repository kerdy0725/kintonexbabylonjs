//2354
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

      await loadScript('https://cdn.jsdelivr.net/npm/@kintone/kintone-js-sdk@0.7.8/dist/kintone-js-sdk.min.js');
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
      const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
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
        const client = new kintoneJSSDK.default.KintoneRestAPIClient();
        const fileBlob = await client.file.downloadFile({ fileKey });
  
        // STEP7: BlobをURLに変換
        const blobUrl = URL.createObjectURL(fileBlob);
  
        // STEP8: Babylon.jsでGLB読み込み
        BABYLON.SceneLoader.Append('', blobUrl, scene, function () {
          engine.runRenderLoop(() => scene.render());
        }, null, function (scene, message) {
          console.error("❌ Babylon.js Load Error:", message);
        });
      } catch (error) {
        console.error('❌ GLBの読み込みに失敗しました:', error);
      }
  
      // ウィンドウリサイズ対応
      window.addEventListener('resize', () => engine.resize());
    });
  })();
  