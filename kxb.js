xhr.onload = function () {
    if (xhr.status !== 200) {
      console.error("XHR Error: Status", xhr.status);
      return;
    }
  
    const contentType = xhr.getResponseHeader('Content-Type');
    console.log("Content-Type:", contentType);
  
    // チェック用ログ
    const textPreview = new TextDecoder().decode(xhr.response.slice(0, 300));
    console.log("レスポンス先頭300文字:", textPreview);
  
    const arrayBuffer = xhr.response;
    const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
    const blobUrl = URL.createObjectURL(blob);
  
    BABYLON.SceneLoader.Append('', blobUrl, scene, function () {
      scene.createDefaultCameraOrLight(true, true, true);
      engine.runRenderLoop(() => scene.render());
    }, null, function (scene, message) {
      console.error("Babylon.js Load Error:", message);
    });
  };
  