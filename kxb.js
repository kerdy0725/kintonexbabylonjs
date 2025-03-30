//2033
(function () {
    'use strict';
  
    // スクリプトを読み込む関数
    function loadScript(src) {
      return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
  
    // fileKeyからBlob URLを生成する関数（GETに修正済み）
    const fetchBlobUrlFromFileKey = (fileKey) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/k/v1/file.json?fileKey=${fileKey}`);
        xhr.withCredentials = true;
        xhr.responseType = 'blob';

        console.log("STEP1");

        
        xhr.onload = function () {
          if (xhr.status === 200) {
            const blob = xhr.response;
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            console.error("XHR Error: Status", xhr.status);
            reject(new Error("XHR Error: Status " + xhr.status));
          }
        };
  
        xhr.onerror = function () {
            console.log("STEP2");
            reject(new Error("Network Error"));
        };
  
        xhr.send();
      });
    };
  
    // レコード詳細表示イベント
    console.log("STEP3");
    kintone.events.on('app.record.detail.show', async function () {
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      if (!spaceElement) {
        console.error("スペースフィールド 'view3d_space' が見つかりません");
        return;
      }
  
      // 二重描画を防止
      if (spaceElement.querySelector('canvas')) return;
  
      // Babylon.js & loaders 読み込み
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');

      console.log("STEP4");
  
      // canvas 作成
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
  
      // Babylon.js 初期化
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
  
      // カメラとライト設定
      const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  
      console.log("STEP5");


      // ファイルフィールドから fileKey を取得
      const record = kintone.app.record.get();
      const fileField = record.record['3dfile']; // ←ここはフィールドコードに合わせて変更してください
  
      if (!fileField || !fileField.value || fileField.value.length === 0) {
        console.error("GLBファイルが登録されていません");
        return;
      }

      console.log("STEP6");

      const fileKey = fileField.value[0].fileKey;
      console.log("fileKey:", fileKey);
  
      console.log("STEP7");

      try {
        // Blob URL取得
        const blobUrl = await fetchBlobUrlFromFileKey(fileKey);
        console.log("Blob URL:", blobUrl);
  
        // Babylon.jsでGLBファイル読み込み
        BABYLON.SceneLoader.Append('', blobUrl, scene, function () {
          engine.runRenderLoop(() => scene.render());
        }, null, function (scene, message) {
          console.error("Babylon.js Load Error:", message);
        });
  
      } catch (error) {
        console.error("GLBの読み込みに失敗しました:", error);
      }
      console.log("STEP8");
  
      // リサイズ対応
      window.addEventListener('resize', () => {
        engine.resize();
      });
    });
  })();
  