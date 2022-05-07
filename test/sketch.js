function setup() {
  const cvs = createCanvas(windowWidth, windowHeight);
  cvs.mouseClicked(mouseClicked2);
}

// Need user action for WebBluetooth
function mouseClicked2() {
  window.alert('test')
}
