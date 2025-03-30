//2053
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
  
    // ファイルキーからBlob URLを取得
    async function fetchBlobUrlFromFileKey(fileKey) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `/k/v1/file.json?fileKey=${fileKey}`);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.responseType = 'blob';
        xhr.onload = function () {
          if (xhr.status === 200) {
            const blob = xhr.response;
            const blobUrl = URL.createObjectURL(blob);
            resolve(blobUrl);
          } else {
            reject(new Error(`XHR Error: Status ${xhr.status}`));
          }
        };
        xhr.onerror = function () {
          reject(new Error('XHR Network Error'));
        };
        xhr.send();
      });
    }

    console.log("step1");

    // レコード詳細表示イベント
    kintone.events.on('app.record.detail.show', async function (event) {
      const record = event.record;
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      if (!spaceElement) {
        console.error("スペースフィールド 'view3d_space' が見つかりません");
        return;
      }
      console.log("step2");
  
      // canvas が既に存在していれば描画しない（再描画防止）
      if (spaceElement.querySelector('canvas')) return;
  
      console.log("step3");
      // Babylon.jsライブラリをロード
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');

      console.log("step4");
  
      // canvasを作成してスペースフィールドに追加
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
      console.log("step5");
  
      // Babylon.js 初期化処理
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
      const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  
      console.log("step6");
      // ファイルフィールドから fileKey を取得
      const fileField = record['glb'];
      if (!fileField || !fileField.value || fileField.value.length === 0) {
        console.error("GLBファイルが登録されていません");
        return;
      }
      console.log("step7");
  
      const fileKey = fileField.value[0].fileKey;
      console.log("fileKey:", fileKey);
  
      try {
        console.log("step8");
        const glbUrl = await fetchBlobUrlFromFileKey(fileKey);
  
        // GLBファイルの読み込み
        BABYLON.SceneLoader.ImportMesh(
            null,                // 全Meshを読み込む
            '',                  // ルートURL（空でOK）
            glbUrl,              // 取得したBlob URL
            scene,
            function (meshes) {
              console.log("GLB読み込み成功:", meshes);
              engine.runRenderLoop(() => {
                scene.render();
              });
            },
            null,
            function (scene, message) {
              console.error("Babylon.js Load Error:", message);
            }
          );
  
        // ウィンドウリサイズ対応
        window.addEventListener('resize', () => {
          engine.resize();
        });
      } catch (error) {
        console.error("GLBの読み込みに失敗しました:", error);
      }
    });
  })();
  