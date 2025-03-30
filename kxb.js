//2118
(function () {
    'use strict';
  
    // 外部スクリプトを順に読み込む関数
    function loadScript(src) {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
  
    kintone.events.on('app.record.detail.show', async function (event) {
      console.log('🚀 Babylon Viewer Start');
  
      // STEP1: スペースフィールドを取得
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      if (!spaceElement || spaceElement.querySelector('canvas')) return;
      console.log('📦 STEP1: スペースフィールド取得');
  
      // STEP2: スクリプトを読み込む
      await loadScript('https://cdn.jsdelivr.net/npm/@kintone/kintone-js-sdk@latest/dist/kintone-js-sdk.min.js');
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
      console.log('📦 STEP2: スクリプト読み込み完了');
  
      // STEP3: Canvas 作成
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
      console.log('🖼️ STEP3: Canvas 追加');
  
      // STEP4: Babylon.js 初期化
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
  
      const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
      console.log('🎥 STEP4: Babylonシーン作成');
  
      // STEP5: レコード取得（eventから）
      const record = event.record;
      const fileField = record.glb; // ← フィールドコードが「glbファイル」の場合
  
      if (!fileField || !fileField.value || fileField.value.length === 0) {
        console.warn('⚠️ GLBファイルが登録されていません');
        return;
      }
      console.log('📦 STEP5: レコード取得');
  
      // STEP6: fileKey取得
      const fileKey = fileField.value[0].fileKey;
      console.log('🗝️ fileKey:', fileKey);
  
      try {
        // STEP7: ファイル取得
        const client = new kintoneJSSDK.KintoneRestAPIClient();
        const fileBlob = await client.file.downloadFile({ fileKey });
        const blobUrl = URL.createObjectURL(fileBlob);
        console.log('🌐 STEP7: Blob URL 取得');
  
        // STEP8: GLB読込み
        BABYLON.SceneLoader.Append('', blobUrl, scene, function () {
          engine.runRenderLoop(() => scene.render());
          console.log('🎉 STEP8: GLBファイル読み込み成功');
        }, null, function (scene, message) {
          console.error('❌ Babylon.js Load Error:', message);
        });
  
        // STEP9: リサイズ対応
        window.addEventListener('resize', () => engine.resize());
      } catch (error) {
        console.error('❌ GLBの読み込みに失敗しました:', error);
      }
    });
  })();
  