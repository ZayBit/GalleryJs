class gallery {
    constructor(class_name, config) {
        this.class_name = class_name;
        this.config_gallery = config;
        this.init();
    }
    init() {
        const { selector } = this.config_gallery;
        const container = document.querySelector(this.class_name), img = container.querySelectorAll(selector), img_length = img.length;
        const lightbox = this.getLightbox;
        const controls = this.createControls;
        const wait = this.wait;
        const getParams = this.getParams;
        const resize = this.resize;
        const closeGallery = this.closeGallery;
        for (let i = 0; i < img_length; i++) {
            img[i].addEventListener('click', function () {
                let current_image = this, clone = current_image.cloneNode();
                const el_lightbox = lightbox();
                controls(el_lightbox);
                current_image.style.opacity = 0;
                let index = i;
                let main_index = index;
                let currentCount = document.querySelector('.current-count');
                currentCount.innerHTML = `${index + 1} / ${img_length}`;
                const { boundin_x, boundin_y, width, height } = getParams(current_image);
                const resizeParams = {
                    getParams,
                    current_image,
                    el_lightbox,
                    resize
                };
                const { calc_x, calc_y, naturalHeight, naturalWidth } = resize(resizeParams);
                clone.style = `width:${width}px;height:${height}px;transform:translate(${boundin_x}px,${boundin_y}px)`;
                el_lightbox.classList.add('lightbox-visible');
                el_lightbox.appendChild(clone);
                let bgLightbox = document.querySelector('.bg-lightbox');
                bgLightbox.addEventListener('click', function () {
                    closeGallery(closeParams);
                });
                wait(10, () => {
                    const { boundin_x, boundin_y } = getParams(clone);
                    clone.style = `transform:translate(${calc_x + boundin_x}px,${calc_y + boundin_y}px);top:0px;bottom:0px;width:${naturalWidth}px;height:${naturalHeight}px;`;
                });
                window.onresize = function () {
                    const { calc_x, calc_y, x, y, naturalHeight, naturalWidth } = resize(resizeParams);
                    clone.style = `transform:translate(${calc_x + x}px,${calc_y + y}px);width:${naturalWidth}px;height:${naturalHeight}px;transition: none;`;
                };
                let btn_close = document.querySelector('.btn-close');
                let closeParams = {
                    getParams,
                    current_image,
                    clone,
                    el_lightbox,
                    wait
                };
                btn_close.addEventListener('click', () => {
                    closeGallery(closeParams);
                });
                document.addEventListener('keyup', (e) => {
                    if (e.key === 'Escape') {
                        closeGallery(closeParams);
                    }
                });
                const arrows = document.querySelectorAll('.btn-arrow');
                arrows.forEach(btn => {
                    btn.addEventListener('click', () => {
                        direction(btn);
                    });
                });
                function direction(btn) {
                    img[main_index].style.opacity = '1';
                    img[index].style.opacity = '1';
                    if (btn.classList.contains('left-arrow') || btn == 'left') {
                        if (index <= 0) {
                            index = img_length - 1;
                        }
                        else {
                            index--;
                        }
                    }
                    else if (btn.classList.contains('right-arrow') || btn == 'right') {
                        if (index >= img_length - 1) {
                            index = 0;
                        }
                        else {
                            index++;
                        }
                    }
                    arrowEvent(resizeParams);
                }
                const arrowEvent = resizeParams => {
                    currentCount.innerHTML = `${index + 1} / ${img_length}`;
                    let el_img = img[index];
                    clone.src = el_img.src;
                    current_image = el_img;
                    const { getParams, resize } = resizeParams;
                    closeParams.current_image = current_image;
                    const { boundin_x, boundin_y } = getParams(el_img);
                    let newParamsResize = { getParams, current_image, el_lightbox };
                    const { calc_x, calc_y, naturalHeight, naturalWidth } = resize(newParamsResize);
                    clone.style = `transform:translate(${calc_x + boundin_x}px,${calc_y + boundin_y}px);top:0px;bottom:0px;width:${naturalWidth}px;height:${naturalHeight}px;transition:none;`;
                    el_img.style.opacity = '0';
                };
            });
        }
    }
    getLightbox() {
        const el_lightbox = document.querySelector('.lightbox');
        if (!el_lightbox) {
            const lightbox = document.createElement('div');
            lightbox.innerHTML = `<span class="bg-lightbox"></span>`;
            lightbox.classList.add('lightbox');
            let body = document.body;
            body.appendChild(lightbox);
            return lightbox;
        }
        else {
            return el_lightbox;
        }
    }
    createControls(lightbox) {
        lightbox.innerHTML += `<div class="controls"><span class="current-count">0</span><button class="btn-close"><i class="fas fa-times"></i></button><button class="btn-arrow left-arrow"><i class="fas fa-chevron-left"></i></button><button class="btn-arrow right-arrow"><i class="fas fa-chevron-right"></i></button></div>`;
    }
    getParams(element) {
        let boundin = element.getBoundingClientRect(), boundin_x = boundin.x, boundin_y = boundin.y, boundin_width = boundin.width, boundin_height = boundin.height;
        return {
            boundin_x: boundin_x,
            boundin_y: boundin_y,
            width: boundin_width,
            height: boundin_height
        };
    }
    wait(time, func) {
        let count = 0;
        let interval = setInterval(() => {
            count++;
            if (count >= time) {
                func();
                clearInterval(interval);
            }
        });
    }
    resize(resizeParams) {
        const { getParams, current_image, el_lightbox } = resizeParams;
        let ratio = 0;
        const { boundin_x, boundin_y } = getParams(current_image);
        let naturalWidth = current_image.naturalWidth, naturalHeight = current_image.naturalHeight;
        let current_width = el_lightbox.clientWidth;
        let current_height = window.innerHeight;
        if (naturalWidth > current_width) {
            ratio = (current_width / naturalWidth);
            naturalWidth = naturalWidth * ratio;
            naturalHeight = naturalHeight * ratio;
        }
        if (naturalHeight > current_height) {
            ratio = (current_height / naturalHeight);
            naturalWidth = naturalWidth * ratio;
            naturalHeight = naturalHeight * ratio;
        }
        return {
            calc_x: (current_width + naturalWidth) / 2 - (naturalWidth + boundin_x),
            calc_y: (current_height + naturalHeight) / 2 - (naturalHeight + boundin_y),
            naturalWidth: naturalWidth,
            naturalHeight: naturalHeight,
            x: boundin_x,
            y: boundin_y
        };
    }
    closeGallery(closeParams) {
        const { getParams, current_image, clone, el_lightbox, wait } = closeParams;
        const { boundin_x, boundin_y, width, height } = getParams(current_image);
        clone.style = `transform:translate(${boundin_x}px,${boundin_y}px);width:${width}px;height:${height}px;transition: all 300ms ease;`;
        wait(80, () => {
            current_image.style.opacity = 1;
            clone.remove();
            el_lightbox.classList.remove('lightbox-visible');
            el_lightbox.remove();
        });
    }
}
new gallery('.gallery',{
    selector:'img'
})