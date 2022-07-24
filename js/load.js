function Scripts(links) {
  var f = 0;
  do {
    var l = links[f];
    if(l) {
      var link = ``;
      var script = document.createElement("script");
      script.type = "text/javascript";
      if(l.link) {
        link += (link.includes('https:') ? `` : (link.charAt(0) !== "." && window.location.protocol === "file:" ? `.` : ``));
        link += l.link;
      }
      else {
        link += (link.includes('https:') ? `` : (link.charAt(0) !== "." && window.location.protocol === "file:" ? `.` : ``));
        link += l.cdn;
      }
      script.src = link;
      l && l.async ? script.async = true : null;
      document.head.appendChild(script);
    }
    f++;
  } while (f < links.length);
}
function Styles(links) {
  var f = 0;
  do {
    var l = links[f].link;
    var cdn = links[f].link;
    var sync = links[f].async;
    var link = ``;
    link += (l.includes('https:') ? `` : (l.charAt(0) !== "." && window.location.protocol === "file:" ? `.` : ``));
    link += links[f].link;
    var sync = links[f].sync ? links[f].sync : ``;
    var script = ``;
    if (link.includes('.css')) {
      script = `<link rel="stylesheet" href="` + link + `" ` + sync + `>`;
    }
    if (link.includes('.js')) {
      script = `<script src="` + link + `" ` + sync + `>` + atob('PC9zY3JpcHQ+');
    }
    document.head.insertAdjacentHTML('beforeend', script);
    f++;
  } while (f < links.length);
}
