//2018
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
  
    // kintoneイベント
    kintone.events.on('app.record.detail.show', async function (event) {
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      if (!spaceElement) {
        console.error("スペースフィールド 'view3d_space' が見つかりません");
        return;
      }
  
      // canvasが既にあるなら何もしない
      if (spaceElement.querySelector('canvas')) return;
  
      // ライブラリ読み込み
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
  
      // canvas作成
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
  
      // Babylonエンジン・シーン初期化
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
  
      const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  
      // 添付ファイル（GLB）のfileKey取得
      const record = event.record;
      const fileField = record['glb'];
      console.log("fileField:", fileField);
  
      if (!fileField || !fileField.value || fileField.value.length === 0) {
        console.error("GLBファイルが添付されていません。");
        return;
      }
  
      const fileKey = fileField.value[0].fileKey;
      console.log("fileKey:", fileKey);
  
      // ファイル取得 → Blob URLに変換
      const fetchBlobUrlFromFileKey = (fileKey) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/k/v1/file.json');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.withCredentials = true; // ログインセッションを利用
          xhr.responseType = 'blob';
  
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
            reject(new Error("Network Error"));
          };
  
          xhr.send(JSON.stringify({ fileKey }));
        });
      };
  
      try {
        const blobUrl = await fetchBlobUrlFromFileKey(fileKey);
        console.log("Blob URL:", blobUrl);
  
        BABYLON.SceneLoader.Append('', blobUrl, scene, function () {
          engine.runRenderLoop(() => scene.render());
        }, null, function (scene, message) {
          console.error("Babylon.js Load Error:", message);
        });
  
      } catch (error) {
        console.error("GLBの読み込みに失敗しました:", error);
      }
  
      // ウィンドウリサイズ対応
      window.addEventListener('resize', () => {
        engine.resize();
      });
    });
  })();
  