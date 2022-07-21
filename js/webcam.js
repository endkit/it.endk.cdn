window.webcam = {
    audio: null,
    media: null,
  
    global: {
        width: 1920,
        height: 0
    },
  
    constraints: {
        vertical: { video: {width: {exact: 1080}, height: {exact: 1920}} },
        horizontal: {
            video: {
                width: { min: 640, ideal: 1920, max: 4096 },
                height: { min: 400, ideal: 1080, max: 2160 },
                aspectRatio: { ideal: 1.7777777778 },
                facingMode: 'environment'
            }
        }
    },
  
    control: {
      play: (paths) => {
        return new Promise((resolve, reject) => { //console.log(link,arrayRemove(link,""));
          var camera = byId('camera');
          if(camera) {
            var video = camera.find("video");

            if(window.width < window.height) { constraints = webcam.constraints.horizontal; }
            else { constraints = webcam.constraints.horizontal; }

            navigator.mediaDevices.getUserMedia(constraints).then(async stream => {
                var track = stream.getVideoTracks()[0];
                video.srcObject = webcam.stream = stream;
                video.onloadedmetadata = data => { 
                  console.log({video,track});
                  //alert('play');
                  //var capabilities = track.getCapabilities(); console.log({capabilities});
                  //if(capabilities.zoom) { }
                  //if(capabilities.torch) { }

                  //webcam.enumerate();
                  //alert('play');

                  //$(all('.io')).addClass('i').removeClass('o');
                  dom.body.dataset.webcam = true;
                  $(camera).addClass('playing')[0].find('video').play();
                  camera.dataset.mode = 'camera';
                  resolve({paths});
                }
            }).catch(err => {
                $(camera).removeClass('playing');
                dom.body.dataset.cam = false;
                resolve({paths,err});
            });
          }
        });
    },
      stop: (paths) => {
        return new Promise((resolve, reject) => {
          if(webcam.stream) {
            var camera = byId('camera');
            var video = byId('webcam');
            var cam = byId('video');
            webcam.stream.getTracks().forEach(track => track.stop());
            $(camera).removeClass('playing');
            //$(all('.io')).removeClass('i').addClass('o');
            dom.body.dataset.webcam = false;
          }
        });
      },
      switch: () => {
        navigator.mediaDevices.enumerateDevices().then(devices => { //console.log({devices});
            var videos = [];
            if(devices.length > 0) {
                var i = 0, ii = 0; while(i < devices.length) {
                    var track = devices[i];
                    var kind = track.kind;
                    if(kind === 'videoinput') {
                        var tracks = webcam.stream.getTracks();
                        for(var iii = 0; iii < tracks.length; iii++){
                            if(track.deviceId === tracks[iii].getSettings().deviceId) {
                                var id = track.deviceId;
                            }
                        }                    
                        videos[ii] = track; ii++; 
                    }
                i++; }
                var next = objByKeyVal(videos,'deviceId',id); 
                var v = parseInt(keyByVal(videos,next))+1;
                var w = videos[v===videos.length?0:v].deviceId;
                const videoConstraints = {};
                videoConstraints.deviceId = { exact: w };
                const constraints = {
                    video: videoConstraints,
                    audio: false
                };
                navigator.mediaDevices
                    .getUserMedia(constraints)
                    .then(stream => {
                      var camera = byId('camera');
                      var video = camera.find('video');
                      webcam.stream = stream;
                      video.srcObject = stream;
                      return navigator.mediaDevices.enumerateDevices();
                    });
            }
        });
      },
    },
  
    load: {
      file: input => {
        return new Promise((resolve,reject) => {
          var files = input.files; //webcam.media = files[0];
          if(files.length > 0) {
              if(files.length === 1) {
                  var reader = new FileReader();
                  var file = files[0];
                  console.log({file});
                  reader.readAsDataURL(file);
                  reader.onload = () => onLoad(reader.result,file.type);
                  reader.onloadstart = () => { console.log(); };
                  reader.onprogress = evt => onProgress(evt);
                  reader.onabort = () => { };
                  reader.onerror = () => console.log(reader.error);
              }
          }
          function onLoad(file,type) { 
              var camera = byId('camera');
              var format = type;
              if(format.includes('image')) {
                var canvas = camera.find('canvas');
                var video = camera.find('video');
                var photo = camera.find('#camera-photo');
                var width = webcam.global.width;
                var context = canvas.getContext('2d');
                var img = new Image();
                img.src = file;
                img.addEventListener("load", () => {
                  webcam.global.width = photo.width = canvas.width = width;
                  var height = webcam.global.height = photo.height = canvas.height = img.height/(img.width/width);
                  context.drawImage(img, 0, 0, width, height); //console.log({width,height});
                  if(width && height) {
                    canvas.width = width;
                    canvas.height = height;
                    //var png = canvas.toDataURL(type);
                    context.drawImage(img, 0, 0, width, height);
                    webcam.media = file;
                    resolve({file,type});
                    //console.log(131,{file,type,elem});
                  }
                });
              }
              if(format.includes('video')) {
                var cam = byId('video');
                dom.camera.find('#camera-video').src = file
                //byId('camera-download').href = file;
                cam.closest('.camera').classList.add('snap');
                cam.closest('.create-form').classList.add('snap');
                resolve({file,type});
              }
              if(format.includes('audio')) {
                webcam.media = file;
                webcam.audio ? webcam.audio.destroy() : null;
                webcam.audio = WaveSurfer.create({container: '#camera-photo .waveform', cursorColor: '#777', progressColor: '#0096c7', responsive: true, waveColor: '#fff'});
                webcam.audio.loadBlob(files[0]);
                webcam.audio.on('ready',() => { 
                  webcam.audio.play();
                  byId('create-audio-play').classList.add('ing');
                });
                webcam.audio.on('play',() => {
                  byId('create-audio-play').classList.add('ing');
                });
                webcam.audio.on('pause',() => { 
                  byId('create-audio-play').classList.remove('ing');
                });
                //dom.camera.classList.add('snap');
                resolve({file,type});
              }
              var input = byId('post-file');
              var elem = input.parentElement;
              var html = input.outerHTML;
              input.remove();
              elem.insertAdjacentHTML('beforeend',html);
              //dom.file = byId('webcam').firstChild;
          }
          function onProgress(evt) {
              console.log({evt});
              if (evt.lengthComputable) {
                  var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
                  if(percentLoaded < 100) { console.log(percentLoaded); }
              }
          }
        });
      },
      down: target => { target.href = canvas.toDataURL('image/png'); }
    },
  
    record: {
      blob: event => {
        const recordingBlob = new Blob(webcam.record.chunks, { type: 'video/mp4', });
        const recordingUrl = URL.createObjectURL(recordingBlob);
        var preview = byId('camera-video');
        preview.srcObject = undefined;
        preview.src = recordingUrl;
        var cam = dom.camera;
        cam.classList.add('snap');
        cam.closest('.create-form').classList.add('snap');
      },
      chunks: [],
      chunk: event => { webcam.record.chunks.push(event.data); },
      er: null,
      ed: () => {
        webcam.record.er.stop();
        dom.camera.dataset.record = "ed";
      },
      ing: event => {
        if(webcam.playing() && webcam.stream && ('MediaRecorder' in window)) {
          webcam.record.er = new MediaRecorder(webcam.stream);
          webcam.record.er.start();
          webcam.record.er.ondataavailable = webcam.record.chunk;
          webcam.record.er.onstop = webcam.record.blob;
          dom.camera.dataset.record = "ing";
        }
        else {
          alert('Device not supported. Check the CanIUse MediaRecorder API browser compatibility chart.');
        }
      }
    },  
  
    blank: event => {
        console.log(event);
    },
    clear: target => {

        var cam = dom.camera;

        //CAMERA
        cam.classList.remove('snap');
        cam.closest('.camera').classList.remove('snap');
        cam.closest('.create-form').classList.remove('snap');

        //PHOTO
        dom.camera.find('#camera-photo img').removeAttribute('src');

        //VIDEO
        webcam.record.chunks = [];
        dom.camera.find('#camera-video').srcObject = undefined;
        dom.camera.find('#camera-video').removeAttribute('src');

        //AUDIO
        //webcam.audio ? webcam.audio.destroy() : null;

        //FILE
        var html = dom.file.outerHTML; console.log({file},file.parentNode);
               
    },
    canplay: event => {
        console.log('canplay');
        var video = event.target;
        if(!video.classList.contains('canplay')) {
            var width = webcam.global.width;
            var height = video.videoHeight / (video.videoWidth/width);
            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            video.classList.add('canplay');
        }
    },
    enumerate: () => {

        navigator.mediaDevices.enumerateDevices().then(devices => { console.log({devices});
            var videos = [];
            if(devices.length > 0) {
                var i = 0, ii = 0;
                var html = ``;
                while(i < devices.length) {
                    var track = devices[i];
                    var kind = track.kind;
                    if(kind === 'videoinput') { 
                        var tracks = webcam.stream.getTracks();
                        for(var iii = 0; iii < tracks.length; iii++){
                            if(track.deviceId === tracks[iii].getSettings().deviceId) {
                                var j = iii; //alert(j);
                                var id = track.deviceId;
                                console.log(tracks,{iii,j});
                            }
                            //console.log(track.deviceId, tracks[iii].getSettings().deviceId)
                        }
                        html += `<div>`+track.deviceId+`</div>`;               
                        videos[ii] = track; ii++; 
                    }

                i++; }
                byId('flip-cam').innerHTML = html;
            }
        });
    },
    io: cam => {
        return new Promise((resolve,reject) => {
            //dom.body.dataset.cam === "true" ? dom.body.dataset.cam = "false" : dom.body.dataset.cam = "true";
            webcam.switch();
        });
    },
    play: (paths) => {
        return new Promise((resolve, reject) => { //console.log(link,arrayRemove(link,""));
            var camera = dom.camera;
            var video = camera.find("#video");

            if(window.width < window.height) { constraints = webcam.constraints.horizontal; }
            else { constraints = webcam.constraints.horizontal; }

            navigator.mediaDevices.getUserMedia(constraints).then(async stream => {
                var track = stream.getVideoTracks()[0];
                video.srcObject = webcam.stream = stream;
                video.onloadedmetadata = data => { 
                  console.log({video,track});
                  //alert('play');
                    //var capabilities = track.getCapabilities(); console.log({capabilities});
                    //if(capabilities.zoom) { }
                    //if(capabilities.torch) { }

                    //webcam.enumerate();
                    //alert('play');

                    //$(all('.io')).addClass('i').removeClass('o');
                    dom.body.dataset.cam = true;
                    $(camera).addClass('playing')[0].find('video').play();
                    camera.dataset.mode = 'camera';
                    resolve({paths});
                }
            }).catch(err => {
                $(camera).removeClass('playing');
                dom.body.dataset.cam = false;
                resolve({paths,err});
            });
        });
    },
    playing: () => {
        return dom.camera.classList.contains('playing');
    },  
    resize: image => {

    },
    skip: () => {
        ('/create/'+byId('header-create').dataset.tab+'/').router();
    },
    save: format => {
        var image = byId('camera-photo').innerHTML;
        if(["audio"].includes(format)) {
            webcam.audio ? webcam.audio.destroy() : null
            webcam.audio = WaveSurfer.create({container: '#create-image-waveform', cursorColor: '#777', progressColor: '#0096c7', responsive: true, waveColor: '#fff'});
            webcam.audio.load(webcam.media);
            ('/create/audio/').router().then(() => {;      
                webcam.audio.on('ready',() => { 
                    //webcam.media = dom.file.files[0];
                    webcam.audio.pause();
                    byId('create-image').innerHTML = byId('camera-photo').find('img').outerHTML+byId('camera-photo').find('.controls').outerHTML;
                    byId('create-audio-play').classList.add('ing');    

                });     
                dom.camera.classList.remove('snap');
                dom.camera.closest('.create-form').classList.remove('snap');

                //byId('file').remove();
                //byId('webcam').insertAdjacentHTML('afterbegin','<input id="file" style="display:none;" type="file" onchange="webcam.file(this);">');
            });
            webcam.audio.on('play',() => {
                byId('create-audio-play').classList.add('ing');
            });
            webcam.audio.on('pause',() => { 
                byId('create-audio-play').classList.remove('ing');
            });
        }
        if(["merch","pages","photo"].includes(format)) {
            byId('create-image').innerHTML = image;
            dom.camera.classList.remove('snap');
            dom.camera.closest('.create-form').classList.remove('snap');
            webcam.clear();
        }
        if(format === 'video') {
            byId('create-image').insertAdjacentHTML('beforeend',byId('camera-video').outerHTML);
            dom.camera.classList.remove('snap');
            dom.camera.closest('.create-form').classList.remove('snap');
            webcam.clear();
            dom.camera.classList.remove('snap');
            dom.camera.closest('.create-form').classList.remove('snap');
            webcam.clear();
        }
        if(format === 'merch') {
            byId('camera').insertAdjacentHTML('beforebegin','<picture class="thumbnail">'+image+'</picture>');
            dom.camera.classList.remove('snap');
            dom.camera.closest('.create-form').classList.remove('snap');
            webcam.clear();
            dom.camera.classList.remove('snap');
            dom.camera.closest('.create-form').classList.remove('snap');
            webcam.clear();
            dom.camera.classList.remove('snap');
            dom.camera.closest('.create-form').classList.remove('snap');
            webcam.clear();
        }
        ('/create/'+format+'/').router().then(() => {            
          //byId('webcam').insertAdjacentHTML('afterbegin','<input class="file input" id="file" style="display:none" type="file" onchange="webcam.file(this);" accept="image/*">');
          //byId('webcam').children[1].remove();
        });
    },
    snap: format => {
        if(webcam.stream) {
            var cam = byId('camera');
            if(['photo'].includes(format)) {
                var vid = cam.find('video');
                var canvas = cam.find('canvas');
                var photo = cam.find('picture');
                var width = webcam.global.width;
                var context = canvas.getContext('2d');
                photo.width = canvas.width = width; //alert("width:" + width);
                webcam.global.height = 
                  photo.height = canvas.height = 
                  height = vid.videoHeight/(vid.videoWidth/width); //alert("height: " + height);
                //if(cam.clientHeight < cam.clientWidth) { }
                context.drawImage(vid, 0, 0, width, height);
                if(width && height) {
                  //alert(width + ":" + height);
                  //var data = canvas.toDataURL('image/png');
                  //canvas.width = width;
                  //canvas.height = height;
                  var image = canvas.toDataURL('image/png');
                  //context.drawImage(video, 0, 0, width, height);

                  //cam.closest('.camera').classList.add('snap');
                  //cam.closest('.create-form').classList.add('snap');

                  photo.find('img').src = image;
                  console.log('width:'+width+", height:"+height);
                }
            }
            if(format === 'video') {
              cam.closest('.camera').classList.add('snap');
              cam.closest('.create-form').classList.add('snap');
            }
        }
    },
    stream: null,
    camera: () => { return dom.body.dataset.cam === "true"; },
    capture: () => { return dom.camera.find('[type="file"]').capture !== undefined; },
    tags: target => {
        var button = target.closest('.tags');
        if(target.closest('.hash')) { $(button).toggleClass('hashtag'); }
    },
    upload: (format) => { console.log(webcam);
        var file = dom.file;
        webcam.media = file.input;
        if(format === 'merch') {
            file.accept = 'image/*';
            file.removeAttribute('capture');
        }
        if(format === 'photo') {
            file.accept = 'image/*';
            file.removeAttribute('capture');
        }
        if(format === 'video') {
            file.accept = 'video/*';
            file.removeAttribute('capture');
        }
        if(format === 'audio') {
            file.accept = 'image/*';
            file.removeAttribute('capture');
        }
        if(format === 'pages') {
            file.accept = 'image/*';
            file.removeAttribute('capture');
        }
        file.click();
    }
}
function keyByVal(object, value) { return Object.keys(object).find(key => object[key] === value); }
function objByKeyVal(object, key, value) { return Object.values(object).find(val => val[key] === value); }
