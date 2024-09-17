window.addEventListener("load", function () {
  var editor;
  var socket = io("/", { path: "/control/" });

  editor = ContentTools.EditorApp.get();
  editor.init("*[data-editable]", "data-name");
  editor.addEventListener("saved", function (ev) {
    var name, payload, regions, xhr;

    // Check that something changed
    regions = ev.detail().regions;
    if (Object.keys(regions).length == 0) {
      return;
    }

    // Set the editor as busy while we save our changes
    this.busy(true);

    // Collect the contents of each region into a FormData instance
    payload = "";
    for (name in regions) {
      if (regions.hasOwnProperty(name)) {
        payload += regions[name];
      }
    }
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "text/plain",
      },
      body: payload,
    };
    fetch("/control", options).then((res) => {
      if (res.ok) new ContentTools.FlashUI("ok");
      else new ContentTools.FlashUI("no");
    });

    this.busy(false);
  });
});
