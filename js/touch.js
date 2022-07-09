window.touch = {
    local: {
        dbl: null,
        drag: {
            elem: null,
            start: { x:0, y:0 },
            offset: {},
            gable: { },
            ging: null,
            currentX: 0,
            currentY: 0,
            initialX: 0,
            initialY: 0,
            xOffset: 0,
            yOffset: 0
        },
        press: null,
        threshold: {
            drag: 72
        },
        type: null
    },
    handler: (e,event=e,type=event.type) => {
        
        var changedTouches = e.changedTouches[0];      

        if (type === "touchstart") {
          //console.log('touch.drag', e, [changedTouches[0].clientX, touch.local.drag.xOffset]);

          touch.local.drag.initialX = changedTouches.clientX - touch.local.drag.xOffset;
          touch.local.drag.initialY = changedTouches.clientY - touch.local.drag.yOffset

          if (e.target.closest('[data-drag]')) {
            touch.local.drag.elem = e.target.closest('[data-drag]')
            touch.local.drag.ging = true;
          }

        }

        if (touch.local.drag.ging) {

            if (type === "touchmove") {
              touch.local.drag.currentX = changedTouches.clientX - touch.local.drag.initialX;
              touch.local.drag.currentY = changedTouches.clientY - touch.local.drag.initialY;
            }

            touch.local.drag.xOffset = touch.local.drag.currentX;
            touch.local.drag.yOffset = touch.local.drag.currentY;

        }

        if(type === 'touchstart') {
            touch.local.drag.type = type;
            touch.local.drag.start.x = changedTouches.pageX, touch.local.drag.start.y = changedTouches.pageY;
            if(touch.local.dbl) {
              clearTimeout(touch.local.dbl);
              touch.local.dbl = null;
              touch.local.type = 'dbltap';
              //document.body.dataset.touch = touch.local.type;
              touch.events[touch.local.type](event);
            }
            else {
              touch.local.type = 'press';
              //document.body.dataset.touch = touch.local.type;
              touch.local.dbl = setTimeout(() => {
                touch.local.dbl = null;
                touch.local.type = touch.local.type ? touch.local.type : 'tap';
                touch.events[touch.local.type](event); },300);
              }
            //on.touch.start(event,touch.local.type);
        }
        else if (type === "touchmove") {
          touch.local.drag.type = type;
          //console.log('drag',touch.local.drag);
          clearTimeout(touch.local.dbl);
          touch.local.drag.offset = {},
          touch.local.drag.offset.x = Math.abs(touch.local.drag.start.x - changedTouches.pageX),
          touch.local.drag.offset.y = Math.abs(touch.local.drag.start.y - changedTouches.pageY);
          touch.local.dbl = null;
          touch.local.type = 'drag';
          //document.body.dataset.touch = touch.local.type;
          if(
            (touch.local.drag.offset.x > touch.local.threshold.drag) ||
            (touch.local.drag.offset.y > touch.local.threshold.drag))
          {
            touch.events[touch.local.type](event);
            //on.touch.move(event,touch.local.type);
          }
        }
        else if (type === "touchend") {
          //touch.local.drag.type = type;
          //console.log('dragEnd');
          touch.local.drag.initialX = touch.local.drag.currentX;
          touch.local.drag.initialY = touch.local.drag.currentY;
          touch.local.drag.ging = false;

          //on.touch.end(event,touch.local.type);

          event.target.focus();
          clearTimeout(touch.local.press);
          touch.local.press = null;
          touch.local.type = null;
          //e.target.closest('body').removeAttribute('data-touch');
        }
    },
    events: {
      dbltap: (e,target,t="dbltap") => {
        //console.log(58,'touch.events',{t});
        document.body.dataset.touch = t;
      },
      drag: (e,target,t="drag") => {
        //console.log(58,'touch.events',{t});
        document.body.dataset.touch = t;
      },
      press: (e,target,t="press") => {
        //console.log(58,'touch.events',{t});
        document.body.dataset.touch = t;
      },
      tap: (e,target,t="tap") => {
        //console.log(58,'touch.events',{t});
        document.body.dataset.touch = t;
      }
    }
}
