import React, { useEffect, useRef } from 'react';

const ParticleCanvas = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let dust = [];

        const colors = ['#3a4672', '#506dff', '#d1d4d6'];

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Bokeh / Light Orbs
        class Bokeh {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 150 + 50;
                this.speedX = (Math.random() - 0.5) * 0.2;
                this.speedY = (Math.random() - 0.5) * 0.2;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.1 + 0.05;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Subtle attraction to mouse
                const dx = mouseRef.current.x - this.x;
                const dy = mouseRef.current.y - this.y;
                this.x += dx * 0.001;
                this.y += dy * 0.001;

                if (this.x < -this.size) this.x = canvas.width + this.size;
                if (this.x > canvas.width + this.size) this.x = -this.size;
                if (this.y < -this.size) this.y = canvas.height + this.size;
                if (this.y > canvas.height + this.size) this.y = -this.size;
            }

            draw() {
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, 'transparent');

                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        // Film Dust / Scratches
        class Dust {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5;
                this.life = Math.random() * 100 + 50;
                this.maxLife = this.life;
                this.speedX = (Math.random() - 0.5) * 2;
                this.speedY = (Math.random() - 0.5) * 2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life--;

                // Only move near mouse
                const dx = mouseRef.current.x - this.x;
                const dy = mouseRef.current.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 300) {
                    this.x += (dx * 0.05);
                    this.y += (dy * 0.05);
                }

                if (this.life <= 0) this.reset();
            }

            draw() {
                const alpha = (this.life / this.maxLife) * 0.3;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();

                // Random "Film Scratch" line
                if (Math.random() > 0.999 && this.life > 0) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.moveTo(this.x, 0);
                    ctx.lineTo(this.x, canvas.height);
                    ctx.stroke();
                }

                ctx.globalAlpha = 1;
            }
        }

        const init = () => {
            setCanvasSize();
            particles = Array.from({ length: 15 }, () => new Bokeh());
            dust = Array.from({ length: 80 }, () => new Dust());
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Bokeh
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw Dust
            dust.forEach(d => {
                d.update();
                d.draw();
            });

            // Cursor "Lens Flare" glow
            const flareSize = 400;
            const gradient = ctx.createRadialGradient(
                mouseRef.current.x, mouseRef.current.y, 0,
                mouseRef.current.x, mouseRef.current.y, flareSize
            );
            gradient.addColorStop(0, 'rgba(80, 109, 255, 0.15)');
            gradient.addColorStop(0.5, 'rgba(58, 70, 114, 0.05)');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(mouseRef.current.x, mouseRef.current.y, flareSize, 0, Math.PI * 2);
            ctx.fill();

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY
            };
        };

        window.addEventListener('resize', init);
        window.addEventListener('mousemove', handleMouseMove);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', init);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-10"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default ParticleCanvas;
