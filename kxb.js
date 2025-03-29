kintone.proxy(glbUrl, 'GET', {}, {}, 
    function(body, status, headers) {
        if (status !== 200) {
            console.error("Proxy Error: Status", status);
            return;
        }

        const byteArray = new Uint8Array(body);
        const blob = new Blob([byteArray], {type: 'model/gltf-binary'});
        const blobUrl = URL.createObjectURL(blob);

        BABYLON.SceneLoader.Append('', blobUrl, scene, function() {
            scene.createDefaultCameraOrLight(true, true, true);
            engine.runRenderLoop(() => scene.render());
        }, null, function(scene, message) {
            console.error("Babylon.js Load Error:", message);
        });
    }, 
    function(error) {
        console.error("Proxy Fetch Error:", error);
    }
);
