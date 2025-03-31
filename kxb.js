//2125
(function () {
    'use strict';
    console.log('kxb.js: 🚀 Babylon Viewer Start');
  
    // スクリプトを読み込む関数
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
  
    // kintoneのレコード詳細画面表示イベント
    kintone.events.on('app.record.detail.show', async function () {
      console.log('kxb.js: 📦 STEP1: スペースフィールド取得');
  
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      if (!spaceElement) {
        console.error("❌ スペースフィールド 'view3d_space' が見つかりません");
        return;
      }
  
      // 二重追加防止
      if (spaceElement.querySelector('canvas')) return;
  
      // Babylon.js 関連スクリプトの読み込み
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      console.log('kxb.js: 📦 STEP2: babylon.js スクリプト読み込み完了');
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
      console.log('kxb.js: 📦 STEP2: babylonjs.loaders.min.js スクリプト読み込み完了');
  
      // canvas 作成
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
  
      console.log('kxb.js: 🖼️ STEP3: Canvas 追加');
  
      // Babylon.js 初期化
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
      const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  
      console.log('kxb.js: 🎥 STEP4: Babylonシーン作成');
  
      // レコードからfileKey取得
      const record = kintone.app.record.get();
      const fileField = record.record['3dモデル'];
      if (!fileField || fileField.value.length === 0) {
        console.warn('⚠️ GLBファイルが登録されていません');
        return;
      }
  
      const fileKey = fileField.value[0].fileKey;
      console.log('kxb.js: 🗝️ fileKey:', fileKey);
  
      try {
        // GLBファイル取得（blob形式）
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
  
        // Babylon.jsでGLB読み込み
        await BABYLON.SceneLoader.AppendAsync('', blobUrl, scene);
  
        engine.runRenderLoop(() => {
          scene.render();
        });
  
      } catch (error) {
        console.error("❌ GLBの読み込みに失敗しました:", error);
      }
  
      // ウィンドウリサイズ対応
      window.addEventListener('resize', () => {
        engine.resize();
      });
    });
  })();
  