//2111
(function () {
    'use strict';
  
    async function loadScript(src) {
      return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
  
    async function fetchBlobUrlFromFileKey(fileKey) {
      console.log('🔽 fetchBlobUrlFromFileKey:', fileKey);
  
      const client = new kintoneJSSDK.KintoneRestAPIClient();
  
      const fileBlob = await client.file.downloadFile({ fileKey });
      const blobUrl = URL.createObjectURL(fileBlob);
      console.log('📦 Blob URL:', blobUrl);
      return blobUrl;
    }
  
    kintone.events.on('app.record.detail.show', async function () {
      console.log('🚀 Babylon Viewer Start');
  
      const spaceElement = kintone.app.record.getSpaceElement('view3d_space');
      if (!spaceElement) {
        console.error("❌ スペースフィールド 'view3d_space' が見つかりません");
        return;
      }
  
      if (spaceElement.querySelector('canvas')) return;
  
      await loadScript('https://cdn.jsdelivr.net/npm/@kintone/kintone-js-sdk@latest/dist/kintone-js-sdk.min.js');
      await loadScript('https://cdn.babylonjs.com/babylon.js');
      await loadScript('https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js');
  
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      spaceElement.appendChild(canvas);
  
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);
  
      const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 2, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, true);
      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  
      const record = kintone.app.record.get().record;
      const fileField = record.glb; // フィールドコードに合わせて変更してください
  
      if (!fileField || !fileField.value || fileField.value.length === 0) {
        console.warn('⚠️ GLBファイルが登録されていません');
        return;
      }
  
      const fileKey = fileField.value[0].fileKey;
      console.log('🗝️ fileKey:', fileKey);
  
      try {
        const blobUrl = await fetchBlobUrlFromFileKey(fileKey);
  
        BABYLON.SceneLoader.Append('', blobUrl, scene, function () {
          engine.runRenderLoop(() => scene.render());
        }, null, function (scene, message) {
          console.error('❌ Babylon.js Load Error:', message);
        });
  
        window.addEventListener('resize', () => {
          engine.resize();
        });
  
      } catch (error) {
        console.error('❌ GLBの読み込みに失敗しました:', error);
      }
    });
  })();
  