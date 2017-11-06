"use strict";

/**
 * LoadingAnimation class.
 */
class LoadingAnimation {

    /**
     * Constructor of the LoadingAnimation class.
     */
    constructor() {
        ////////////////////////////////////
        // Check jQuery
        if (typeof $ !== "function") {
            console.error("[LoadingAnimation] Error: jQuery is required.");
            return;
        }

        ////////////////////////////////////
        // Variables, do not change this by hand. As long as you dont want to chane the animation
        this.is_initialized = false;
        this.play_animation = false;
        this.element = undefined;
        this.size_default = undefined;
        this.mode = undefined;
        this.handle = undefined;
        this.ctx = undefined;
        this.size = undefined;

        this.STAGES = {
            FIRST_SQUARE: 0,
            SECOND_SQUARE: 1
        }
        this.timer = {
            counter: 0,
            stage: this.STAGES.FIRST_SQUARE
        };
        this.SQUARES = [
            [
                [-0.48, 0.0],
                [0.0, 0.48],
                [0.48, 0.0],
                [0.0, -0.48]
            ],
            [
                [-0.24, 0.24],
                [0.24, 0.24],
                [0.24, -0.24],
                [-0.24, -0.24]
            ]
        ];
    }


    /**
     * Function to more fluent aniamtion from linear arguments.
     * @param {number} x  - Current position.
     * @param {number} x1 - Min pozition.
     * @param {number} x2 - Max position.
     */
    cubic(x, x1, x2) {
        var p1 = ((x2 - x) / (x2 - x1) * Math.PI) - (Math.PI / 2.0);
        var si = -Math.sin(p1) * (x2 - x1) + (x2 - x1);
        return si / 2;
    }


    /**
     * Initialization of the object.
     * @param {object} settings - Settings object.
     * @param {object | string} settings.element - Id, class name or object itself where the animation will be added to.
     * @param {string} settings.mode - Mode of adding animation 'prepend' or 'append'.
     * @param {number} settings.size - Max size of the animation (canvas element).
     */
    init(settings) {
        if (typeof settings === "object") {
            if (settings.element !== null || settings.element !== undefined) {
                this.element = $(settings.element); // It have to be only one DOM element.
                if (this.element.length < 1) {
                    console.error("[LoadingAnimation] Error: No elements to add loading animation to.");
                    return;
                }
                if (this.element.length > 1) {
                    console.error("[LoadingAnimation] Error: Too much elements (" + this.elements.length + ") to add loading animation to.");
                    return;
                }
            } else {
                console.error("[LoadingAnimation] Initialization Error: Settings property: 'element': Value '" + settings.element + "' is not reconisable, use element id, class or send object instead instead.");
                return;
            }
        }

        // Counter is an unique number for id of canvas element.
        if (typeof LoadingAnimation.counter === "undefined") {
            LoadingAnimation.counter = 0;
        } else
            LoadingAnimation.counter++;

        // Create canvas element.
        this.handle = "<canvas class='LoadingAnimation' id='LoadingAnimation_" + LoadingAnimation.counter + "' width='50' height='50'></canvas>";
        this.handle = $(this.handle);
        this.ctx = this.handle[0].getContext("2d");

        // Default value of this.mode:
        this.mode = "prepend";
        if (typeof settings === "object" && settings.mode !== undefined) {
            if (settings.mode === "prepend") {
                this.mode = "prepend";
            } else if (settings.mode === "append") {
                this.mode = "append";
            } else {
                console.error("[LoadingAnimation] Initialization Error: Settings property: 'mode': Value '" + settings.mode + "' is not reconisable, use 'prepend' or 'append' instead.");
            }
        }

        if (this.mode === "prepend") {
            this.element.prepend(this.handle);
        } else {
            this.element.append(this.handle);
        }

        // Default value of this.size_default and this.size:
        this.size_default = 50;
        if (typeof settings === "object" && settings.size !== undefined) {
            if (typeof settings.size === "number") {
                if (settings.size > 0) {
                    this.size_default = settings.size;
                } else {
                    console.error("[LoadingAnimation] Initialization Error: Settings property: 'size': Value '" + settings.size + "' is out of the range, use number in range (0, inf) instead.");
                }
            } else {
                console.error("[LoadingAnimation] Initialization Error: Settings property: 'size': Value '" + settings.size + "' is not a number, use number in range (0, inf) instead.");
            }

        }
        this.size = this.size_default;

        // Handle resizing.
        this.resize();
        $(window).resize(() => this.resize());
        this.handle.css("display", "none");

        // Initialization compleated.
        this.is_initialized = true;
    }


    /**
     * Resize the canvas element (animation). Adjusting it to current parent size and saved in config size.
     */
    resize() {
        var w = this.element.width();
        if (w < this.size_default) {
            this.size = w;
        } else {
            this.size = this.size_default;
        }

        this.handle.attr("width", this.size + "px");
        this.handle.attr("height", this.size + "px");
    }


    /**
     * Starts (and show) the animation.
     */
    start() {
        if (this.play_animation === true) {
            return;
        }

        this.timer.counter = 0;
        this.timer.stage = this.STAGES.FIRST_SQUARE;

        this.play_animation = true;
        this.handle.css("display", "block");

        this.ctx.save();

        this.loop();
    }


    /**
     * Animation loop.
     */
    loop() {
        if (this.play_animation !== true) {
            return;
        }

        this.timer.counter += 2.0;

        this.ctx.save();
        this.ctx.clearRect(-this.size, -this.size, 2 * this.size, 2 * this.size);
        this.ctx.transform(1, 0, 0, 1, this.size / 2, this.size / 2);

        this.ctx.beginPath();

        var draw_square = (which) => {
            this.ctx.moveTo(this.SQUARES[which][0][0] * this.size, this.SQUARES[which][0][1] * this.size);
            for (var i = 1; i < this.SQUARES[0].length; i++) {
                this.ctx.lineTo(this.SQUARES[which][i][0] * this.size, this.SQUARES[which][i][1] * this.size);
            }
            this.ctx.lineTo(this.SQUARES[which][0][0] * this.size, this.SQUARES[which][0][1] * this.size);
            this.ctx.stroke();
        }

        this.ctx.rotate(27 * Math.PI / 180);

        switch (this.timer.stage) {
            case this.STAGES.FIRST_SQUARE:

                var rotate_by = this.cubic(this.timer.counter, 0, 90) * Math.PI / 180;

                // 1.
                this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
                this.ctx.lineWidth = 2;
                draw_square(0);
                this.ctx.strokeStyle = "rgba(0,0,0,0.8)";
                this.ctx.lineWidth = 1;
                draw_square(0);


                // 2.
                this.ctx.rotate(rotate_by);
                this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
                this.ctx.lineWidth = 2;
                draw_square(1);
                this.ctx.strokeStyle = "rgba(0,0,0,0.8)";
                this.ctx.lineWidth = 1;
                draw_square(1);


                if (this.timer.counter > 90) {
                    this.timer.counter = 0;
                    this.timer.stage = this.STAGES.SECOND_SQUARE;
                }
                break;



            case this.STAGES.SECOND_SQUARE:

                var rotate_by = this.cubic(this.timer.counter, 0, 90) * Math.PI / 180;

                // 1.
                this.ctx.rotate(-rotate_by);
                this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
                this.ctx.lineWidth = 2;
                draw_square(0);
                this.ctx.strokeStyle = "rgba(0,0,0,0.8)";
                this.ctx.lineWidth = 1;
                draw_square(0);

                // 2.
                this.ctx.rotate(rotate_by);
                this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
                this.ctx.lineWidth = 2;
                draw_square(1);
                this.ctx.strokeStyle = "rgba(0,0,0,0.8)";
                this.ctx.lineWidth = 1;
                draw_square(1);



                if (this.timer.counter > 90) {
                    this.timer.counter = 0;
                    this.timer.stage = this.STAGES.FIRST_SQUARE;
                }
                break;
        }

        this.ctx.restore();

        setTimeout(() => this.loop(), 15);
    }


    /**
     * Allows to stop animation play (including backgroud calculations). Also hides the animation object.
     */
    stop() {
        this.ctx.restore();
        this.play_animation = false;
        this.handle.css("display", "none");
    }


    /**
     * Allows to completly remove the animation object (including backgroud calculations).
     */
    remove() {
        this.is_initialized = false;
        $(window).off("resize", this.resize);
        this.handle.remove();
    }

}