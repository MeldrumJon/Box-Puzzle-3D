// Assuming there will most likely be a click callback
// Assuming we begin with mouse initially up

export default class EventsHelper {
    /*
     * Callbacks = {
     *  click,
     *  dblclick,
     *  move,
     *  drag_start,
     *  drag,
     *  drag_end,
     *  tap,
     *  slide_start,
     *  slide,
     *  slide_end
     * }
     */
    constructor(element, callbacks) {
        this.element = element;
        this.callbacks = callbacks;

        let pass_obj = {passive: true};

        // Mouse
        this.dragged = false;
        this.startX = 0;
        this.startY = 0;
        this.mouseDown = function (e) {
            this.dragged = false;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.element.removeEventListener('mousemove', this.mouseMove_up);
            this.element.addEventListener('mousemove', this.mouseMove_down);
            if (this.callbacks.drag_start) { this.callbacks.drag_start(e.clientX, e.clientY); }
        }.bind(this);
        this.mouseUp = function (e) {
            if (this.callbacks.drag_end) { this.callbacks.drag_end(e.clientX, e.clientY);} 
            if (!this.dragged) {
                if (this.callbacks.click) { this.callbacks.click(e.clientX, e.clientY); }
            }
            this.element.removeEventListener('mousemove', this.mouseMove_down);
            if (this.callbacks.move) {
                this.element.addEventListener('mousemove', this.mouseMove_up);
            }
        }.bind(this);
        this.mouseMove_down = function (e) {
            if (!this.dragged 
                    && (Math.abs(this.startX - e.clientX) > 5 
                    || Math.abs(this.startY - e.clientY) > 5)) {
                this.dragged = true;
            }
            if (this.callbacks.drag) { this.callbacks.drag(e.clientX, e.clientY); }
        }.bind(this);
        this.mouseMove_up = function (e) {
            this.callbacks.move(e.clientX, e.clientY);
        }.bind(this);
        this.dblClick = function(e) {
            this.callbacks.dblclick(e.clientX, e.clientY);
        }.bind(this);
        // Touch
        this.lastX = 0;
        this.lastY = 0;
        this.touchStart = function (e) {
            if (e.touches.length > 1) {
                if (this.callbacks.slide_end) { this.callbacks.slide_end(null, null); }
                this.element.removeEventListener('touchmove', this.touchMove);
                this.element.removeEventListener('touchend', this.touchEnd);
                this.element.removeEventListener('touchcancel', this.touchCancel);
                return;
            }
            let touch = e.touches.item(0);
            this.dragged = false;
            this.startX = touch.clientX;
            this.startY = touch.clientY;
            this.lastX = touch.clientX; 
            this.lastY = touch.clientY; 
            this.element.addEventListener('touchmove', this.touchMove, {passive: true});
            this.element.addEventListener('touchend', this.touchEnd);
            this.element.addEventListener('touchcancel', this.touchCancel);
            if (this.callbacks.slide_start) { this.callbacks.slide_start(touch.clientX, touch.clientY); }
        }.bind(this);
        this.touchMove = function (e) {
            let touch = e.touches.item(0);
            if (!this.dragged 
                    && (Math.abs(this.startX - touch.clientX) > 5 
                    || Math.abs(this.startY - touch.clientY) > 5)) {
                this.dragged = true;
            }
            this.lastX = touch.clientX; 
            this.lastY = touch.clientY; 
            if (this.callbacks.slide) { this.callbacks.slide(e.clientX, e.clientY); }
        }.bind(this);
        this.touchEnd = function(e) {
            if (this.callbacks.slide_end) { this.callbacks.slide_end(this.lastX, this.lastY); }
            let touch = e.touches.item(0);
            if (this.callbacks.tap && !this.dragged) {
                if (e.cancelable) { e.preventDefault(); } // Don't do mouse events!
                this.callbacks.tap(this.lastX, this.lastY);
            }
            this.element.removeEventListener('touchmove', this.touchMove);
            this.element.removeEventListener('touchend', this.touchEnd);
            this.element.removeEventListener('touchcancel', this.touchCancel);
        }.bind(this);
        this.touchCancel = function(e) {
            if (this.callbacks.slide_end) { this.callbacks.slide_end(null, null); }
            this.element.removeEventListener('touchmove', this.touchMove);
            this.element.removeEventListener('touchend', this.touchEnd);
            this.element.removeEventListener('touchcancel', this.touchCancel);
        }.bind(this);

        this.reregister(); // Register events, assuming mouse is up
    }

    reregister() {
        this.element.addEventListener('mousedown', this.mouseDown);
        this.element.addEventListener('mouseup', this.mouseUp);
        if (this.callbacks.move) {
            this.element.addEventListener('mousemove', this.mouseMove_up);
        }
        if (this.callbacks.dblclick) {
            this.element.addEventListener('dblclick', this.dblClick);
        }

        this.element.addEventListener('touchstart', this.touchStart, {passive: true});
    }

    unregister() {
        this.element.removeEventListener('mousedown', this.mouseDown);
        this.element.removeEventListener('mouseup', this.mouseUp);
        this.element.removeEventListener('mousemove', this.mouseMove_up);
        this.element.removeEventListener('mousemove', this.mouseMove_down);
        this.element.removeEventListener('dblclick', this.dblClick);

        this.element.removeEventListener('touchstart', this.touchStart);
        this.element.removeEventListener('touchmove', this.touchMove);
        this.element.removeEventListener('touchend', this.touchEnd);
        this.element.removeEventListener('touchcancel', this.touchCancel);
    }
}

