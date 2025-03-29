const fileField = record['glb'];
if (!fileField || !fileField.value || fileField.value.length === 0) {
    console.log("GLBファイルが添付されていません。");
    return;
}
const glbUrl = fileField.value[0].url;
console.log("glbUrlの中身:", glbUrl);
