// Global objects:
var animatedBackground;

// Background class:
class AnimatedBackground {
    constructor(wrap_id, canvas_id) {

        // Check jQuery:
        if (typeof $ !== "function") {
            console.error("[AnimatedBackground] Error: jQuery is required.");
            return;
        }


        // Properties:
        this.element_wrap = document.getElementById(wrap_id);
        this.element_canvas = document.getElementById(canvas_id);
        this.ctx = this.element_canvas.getContext("2d");
        this.width = undefined;
        this.height = undefined;
        this.refresh_time = 40;
        this.is_initialized = false;

        // Drawing properties:
        this.points_current = [];
        this.points_destination = [];
        this.points_speed = [];
        this.reach_distance = 0.05;
        this.points_speed_min = 0.0005;
        this.points_speed_max = 0.0020;

        this.max_points = 30;
        this.point_size = 4;
        this.point_size_correction = this.point_size / 2.0;
        this.point_color = "rgba(220, 220, 220, 1.0)";

        this.line_size = 1;
        this.line_color = "rgba(220, 220, 220, 1.0)";
        this.line_max_distance = 0.33;




        // Initialize:
        $(this.element_wrap).css({
            "position": "fixed",
            "margin": "0",
            "padding": "0",
            "z-index": "-100",
            "top": "0",
            "left": "0",
            "width": "100%",
            "height": "100vh"
        });
        this.init();




        // Resize:
        this.resize();
        $(window).resize(() => this.resize());

        // Redraw, loop begin:
        this.reDraw();
    }


    init() {
        if (this.is_initialized) {
            console.error("[AnimatedBackground] Error: Unable to re-initalize.");
            return;
        }

        for (var i = 0; i < this.max_points; i++) {
            this.points_current.push([Math.random(), Math.random()]);
            this.points_destination.push([Math.random(), Math.random()]);
            this.points_speed.push(Math.random() * (this.points_speed_max - this.points_speed_min) + this.points_speed_min);
        }

        this.is_initialized = true;
    }


    generate_new_point_destination_and_speed(index) {
        this.points_destination[index] = [Math.random(), Math.random()];
        this.points_speed[index] = Math.random() * (this.points_speed_max - this.points_speed_min) + this.points_speed_min;
    }


    resize() {
        var w = $(this.element_wrap).width();
        var h = $(this.element_wrap).height();

        if (this.width !== w || this.height !== h) {
            this.width = w;
            this.height = h;

            $(this.element_canvas).attr("width", this.width + "px");
            $(this.element_canvas).attr("height", this.height + "px");
        }
    }


    reDraw() {

        // Save:
        this.ctx.save();


        this.ctx.clearRect(0, 0, this.width, this.height);


        // Calculate next positions of points:
        for (var i = 0; i < this.max_points; i++) {
            var d_x = this.points_destination[i][0] - this.points_current[i][0];
            var d_y = this.points_destination[i][1] - this.points_current[i][1];

            this.points_current[i][0] += d_x * this.points_speed[i];
            this.points_current[i][1] += d_y * this.points_speed[i];

            if ((d_x * d_x) + (d_y * d_y) < (this.reach_distance * this.reach_distance)) {
                this.generate_new_point_destination_and_speed(i);
            }
        }




        // Draw points:
        this.ctx.fillStyle = this.point_color;
        this.ctx.globalAlpha = 1.0;
        for (var i = 0; i < this.max_points; i++) {
            this.ctx.fillRect(
                this.points_current[i][0] * this.width,
                this.points_current[i][1] * this.height,
                this.point_size,
                this.point_size
            );
        }




        // Collisions:
        this.ctx.lineWidth = this.line_size;
        this.ctx.strokeStyle = this.line_color;
        this.ctx.globalAlpha = 1.0;
        for (var i = 0; i < this.max_points; i++) {
            for (var j = i + 1; j < this.max_points; j++) {
                var d_x = this.points_current[i][0] - this.points_current[j][0];
                var d_y = this.points_current[i][1] - this.points_current[j][1];

                var d = Math.sqrt((d_x * d_x) + (d_y * d_y));
                if (d < this.line_max_distance) {
                    var alpha = 1.0 - (d / this.line_max_distance);

                    this.ctx.beginPath();
                    this.ctx.globalAlpha = alpha;
                    this.ctx.moveTo(
                        this.points_current[i][0] * this.width + this.point_size_correction,
                        this.points_current[i][1] * this.height + this.point_size_correction
                    );
                    this.ctx.lineTo(
                        this.points_current[j][0] * this.width + this.point_size_correction,
                        this.points_current[j][1] * this.height + this.point_size_correction
                    );
                    this.ctx.stroke();
                }
            }
        }





        // Restore:
        this.ctx.restore();


        // Loop:
        setTimeout(() => this.reDraw(), this.refresh_time);
    }
}

// Ready
$(document).ready(function() {
    animatedBackground = new AnimatedBackground("background_wrap", "background_canvas");
});