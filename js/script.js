// ========== imports ==========
import './default.js';

// ========== DOM references ==========


// ========== global variables ==========
const sectionInfos = [
    {
        // Section 0
        sectionNum: 0,
        type: 'sticky',
        heightTimes: 5, // Set section height to 5 times the browser height
        refs: {
            section: document.querySelector('.section-0'),
            text_0: document.querySelector('.section-0__text-0'),
            text_1: document.querySelector('.section-0__text-1'),
            text_2: document.querySelector('.section-0__text-2'),
            text_3: document.querySelector('.section-0__text-3'),
            canvas: document.querySelector('.section-0__canvas'),
            context: document.querySelector('.section-0__canvas').getContext('2d'),
            videoImgs: []
        },
        videoImgInfo: {
            folderName: '001',
            fileNumStart: 6726,
            totalImgCount: 300
        }
    },
    {
        // Section 1
        sectionNum: 1,
        type: 'normal',
        heightTimes: 5,
        refs: {
            section: document.querySelector('.section-1')
        }
    },
    {
        // Section 2
        sectionNum: 2,
        type: 'sticky',
        heightTimes: 5,
        refs: {
            section: document.querySelector('.section-2'),
            text_0: document.querySelector('.section-2__text-0'),
            text_1: document.querySelector('.section-2__desc-container-0'),
            text_2: document.querySelector('.section-2__desc-container-1'),
            pin_1: document.querySelector('.section-2__pin-1'),
            pin_2: document.querySelector('.section-2__pin-2'),
            canvas: document.querySelector('.section-2__canvas'),
            context: document.querySelector('.section-2__canvas').getContext('2d'),
            videoImgs: []
        },
        videoImgInfo: {
            folderName: '002',
            fileNumStart: 7027,
            totalImgCount: 980
        }
    },
    {
        // Section 3
        sectionNum: 3,
        type: 'sticky',
        heightTimes: 5,
        refs: {
            section: document.querySelector('.section-3'),
            text_1: document.querySelector('.section-3__text-1'),
            canvas: document.querySelector('.section-3__canvas'),
            context: document.querySelector('.section-3__canvas').getContext('2d'),
            blendImgs: []
        },
        blendImgInfo: {
            fileNumStart: 1,
            totalImgCount: 2
        }
    }
];
const globalNav = document.querySelector('.global-nav');
const localNav = document.querySelector('.local-nav');
const currentSectionNum = 0;

// ========== script ==========
// Set things
class Setter {
    constructor(sectionInfos) {
        this.sectionInfos = sectionInfos;
    }

    setSectionHeight() {
        this.sectionInfos.forEach(sectionInfo => {
            const section = sectionInfo.refs.section;
            const heightTimes = sectionInfo.heightTimes;
            const browserHeight = window.innerHeight;

            if (sectionInfo.type === 'sticky') {
                section.style.height = `${browserHeight * heightTimes}px`;
            };
        });
    }

    setVideoImgs(folderName, fileNumStart, videoImgs, totalImgCount) {
        for (let i = 0; i < totalImgCount; i++) {
            const videoImg = new Image();
            videoImg.src = `../video/${folderName}/IMG_${fileNumStart + i}.JPG`;
            videoImgs.push(videoImg);
        };
    }

    setBlendImgs(fileNumStart, blendImgs, totalImgCount) {
        for (let i = 0; i < totalImgCount; i++) {
            const blendImg = new Image();
            blendImg.src = `../img/blend-image-${fileNumStart + i}.jpg`;
            blendImgs.push(blendImg);
        };
    }
}

// Calculate values
class Calculator {
    constructor(sectionInfos, globalNav, localNav, currentSectionNum) {
        this.sectionInfos = sectionInfos;
        this.globalNav = globalNav;
        this.localNav = localNav;
        this.currentSectionNum = currentSectionNum;
    }

    getCurrentSectionNum(yOffset) {
        // Calculate section height
        const sectionHeights = [];
        this.sectionInfos.forEach(sectionInfo => {
            sectionHeights.push(sectionInfo.refs.section.scrollHeight);
        });

        // Calculate previous section height
        let prevSectionHeight = 0;
        for (let i = 0; i <= this.currentSectionNum; i++) {
            prevSectionHeight += sectionHeights[i];
        };

        // Calculate current section number
        if (yOffset > prevSectionHeight) {
            this.currentSectionNum++;
        } else if (yOffset < prevSectionHeight - sectionHeights[this.currentSectionNum]) {
            if (this.currentSectionNum === 0) {
                return;
            }
            this.currentSectionNum--;
        };

        return this.currentSectionNum;
    }

    calcScrollRatio(yOffset, currentSectionNum) {
        if (typeof (currentSectionNum) === 'number') {
            const section = this.sectionInfos[currentSectionNum].refs.section;
            const sectionTop = section.offsetTop;
            const sectionHeight = section.scrollHeight;

            const scrollRatio = (yOffset - sectionTop) / sectionHeight;
            return scrollRatio;
        };
    }

    calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, start, end) {
        if (typeof (currentSectionNum) === 'number') {
            const partScrollRatio = (scrollRatio - start) / (end - start);

            return partScrollRatio;
        };
    }

    calcCurrFrame(scrollRatio, totalImgCount) {
        const currentFrame = Math.round((totalImgCount - 1) * scrollRatio);

        return currentFrame;
    }
}

// Animate elements
class Animator {
    constructor() {
    }

    showStickyElements(currentSectionNum) {
        if (typeof (currentSectionNum) === 'number') {
            document.body.setAttribute('id', `show-section-${currentSectionNum}`);
        } else {
            document.body.setAttribute('id', '#');
        };
    }

    animateOpacityIn(element, partScrollRatio) {
        const start = 0;
        const end = 1;
        const value = (end - start) * partScrollRatio;
        element.style.opacity = value;
    }

    animateOpacityOut(element, partScrollRatio) {
        const start = 1;
        const end = 0;
        const value = (end - start) * (partScrollRatio - 1);
        element.style.opacity = value;
    }

    animateTranslateY_in(element, partScrollRatio, start, end) {
        const value = (end - start) * (partScrollRatio - 1);
        element.style.transform = `translateY(${value}%)`;
    }

    animateTranslateY_out(element, partScrollRatio, start, end) {
        const value = (end - start) * (partScrollRatio);
        element.style.transform = `translateY(${value}%)`;
    }

    animatePinScaleY(element, partScrollRatio, start, end) {
        const value = (end - start) * (partScrollRatio);
        element.style.height = `${value}px`;
    }

    animateVideoImg(currentFrame, context, videoImgs) {
        requestAnimationFrame(() => {
            context.drawImage(videoImgs[currentFrame], 0, 0);
        });
    }
    animateBlendImgWidth(element, partScrollRatio, start, end) {
        const value = Math.round(((end - start) * partScrollRatio) + start);
        element.style.width = `${value}vw`;
    }
    animateBlendImg(partScrollRatio, canvas, context, currentFrame, blendImgs, start, end) {
        const value = Math.round(((end - start) * partScrollRatio) + start);
        const sx = 0;
        const sy = canvas.height - value;
        const sWidth = canvas.width;
        const sHeight = value;
        const dx = 0;
        const dy = canvas.height - value;
        const dWidth = canvas.width;
        const dHeight = value;

        requestAnimationFrame(() => {
            context.drawImage(blendImgs[currentFrame], sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        });
    }
    animateBlendImgScale(element, partScrollRatio, start, end) {
        const value = ((end - start) * partScrollRatio) + start;

        element.style.transform = `scale(${value})`;
    }
}

// Main
const main = function () {
    const setter = new Setter(sectionInfos);
    const calculator = new Calculator(sectionInfos, globalNav, localNav, currentSectionNum);
    const animator = new Animator();

    // Set canvas images
    // For section 0
    setter.setVideoImgs(sectionInfos[0].videoImgInfo.folderName, sectionInfos[0].videoImgInfo.fileNumStart, sectionInfos[0].refs.videoImgs, sectionInfos[0].videoImgInfo.totalImgCount);
    // For section 2
    setter.setVideoImgs(sectionInfos[2].videoImgInfo.folderName, sectionInfos[2].videoImgInfo.fileNumStart, sectionInfos[2].refs.videoImgs, sectionInfos[2].videoImgInfo.totalImgCount);
    // For section 3
    setter.setBlendImgs(sectionInfos[3].blendImgInfo.fileNumStart, sectionInfos[3].refs.blendImgs, sectionInfos[3].blendImgInfo.totalImgCount);

    // Prevent scroll before loading
    document.body.style.overflow = 'hidden';

    // On load and re-load
    window.addEventListener('load', () => {
        setter.setSectionHeight();

        // Release overflow
        document.body.style.overflow = 'auto';

        // Show sticky
        const yOffset = window.pageYOffset;
        const currentSectionNum = calculator.getCurrentSectionNum(yOffset);
        animator.showStickyElements(currentSectionNum);

        // Show first video image
        animator.animateVideoImg(0, sectionInfos[0].refs.context, sectionInfos[0].refs.videoImgs);
    });

    // on resize
    window.addEventListener('resize', () => {
        setter.setSectionHeight();

        const yOffset = window.pageYOffset;
        const currentSectionNum = calculator.getCurrentSectionNum(yOffset);

        // Show sticky
        animator.showStickyElements(currentSectionNum);
    });

    // on scroll
    window.addEventListener('scroll', () => {
        const yOffset = window.pageYOffset;
        const currentSectionNum = calculator.getCurrentSectionNum(yOffset);

        // Show sticky
        animator.showStickyElements(currentSectionNum);

        // Calculate scroll ratio
        const scrollRatio = calculator.calcScrollRatio(yOffset, currentSectionNum);
        let currentFrame;

        // Animation
        switch (currentSectionNum) {
            case 0:
                // canvas video
                currentFrame = calculator.calcCurrFrame(scrollRatio, sectionInfos[currentSectionNum].videoImgInfo.totalImgCount);
                animator.animateVideoImg(currentFrame, sectionInfos[currentSectionNum].refs.context, sectionInfos[currentSectionNum].refs.videoImgs);
                if (scrollRatio >= 0.9 && scrollRatio <= 1) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.9, 1);
                    const element = sectionInfos[currentSectionNum].refs.canvas;

                    animator.animateOpacityOut(element, partScrollRatio);
                } else if (scrollRatio < 0.9 || scrollRatio > 1) {
                    sectionInfos[currentSectionNum].refs.canvas.style.opacity = 1;
                };

                // text-0
                if (scrollRatio >= 0.1 && scrollRatio <= 0.2) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.1, 0.2);
                    const element = sectionInfos[currentSectionNum].refs.text_0;

                    animator.animateOpacityIn(element, partScrollRatio);

                    const translateY_start = 30;
                    const translateY_end = 0;
                    animator.animateTranslateY_in(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio >= 0.25 && scrollRatio <= 0.3) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.25, 0.3);
                    const element = sectionInfos[currentSectionNum].refs.text_0;

                    animator.animateOpacityOut(element, partScrollRatio);

                    const translateY_start = 0;
                    const translateY_end = -30;
                    animator.animateTranslateY_out(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio < 0.1 || scrollRatio > 0.3) {
                    sectionInfos[currentSectionNum].refs.text_0.style.opacity = 0;
                };

                // text-1
                if (scrollRatio >= 0.3 && scrollRatio <= 0.4) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.3, 0.4);
                    const element = sectionInfos[currentSectionNum].refs.text_1;

                    animator.animateOpacityIn(element, partScrollRatio);

                    const translateY_start = 30;
                    const translateY_end = 0;
                    animator.animateTranslateY_in(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio >= 0.45 && scrollRatio <= 0.5) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.45, 0.5);
                    const element = sectionInfos[currentSectionNum].refs.text_1;

                    animator.animateOpacityOut(element, partScrollRatio);

                    const translateY_start = 0;
                    const translateY_end = -30;
                    animator.animateTranslateY_out(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio < 0.3 || scrollRatio > 0.5) {
                    sectionInfos[currentSectionNum].refs.text_1.style.opacity = 0;
                };

                // text-2
                if (scrollRatio >= 0.5 && scrollRatio <= 0.6) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.5, 0.6);
                    const element = sectionInfos[currentSectionNum].refs.text_2;

                    animator.animateOpacityIn(element, partScrollRatio);

                    const translateY_start = 30;
                    const translateY_end = 0;
                    animator.animateTranslateY_in(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio >= 0.65 && scrollRatio <= 0.7) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.65, 0.7);
                    const element = sectionInfos[currentSectionNum].refs.text_2;

                    animator.animateOpacityOut(element, partScrollRatio);

                    const translateY_start = 0;
                    const translateY_end = -30;
                    animator.animateTranslateY_out(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio < 0.5 || scrollRatio > 0.7) {
                    sectionInfos[currentSectionNum].refs.text_2.style.opacity = 0;
                };

                // text-3
                if (scrollRatio >= 0.7 && scrollRatio <= 0.8) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.7, 0.8);
                    const element = sectionInfos[currentSectionNum].refs.text_3;

                    animator.animateOpacityIn(element, partScrollRatio);

                    const translateY_start = 30;
                    const translateY_end = 0;
                    animator.animateTranslateY_in(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio >= 0.85 && scrollRatio <= 0.9) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.85, 0.9);
                    const element = sectionInfos[currentSectionNum].refs.text_3;

                    animator.animateOpacityOut(element, partScrollRatio);

                    const translateY_start = 0;
                    const translateY_end = -30;
                    animator.animateTranslateY_out(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio < 0.7 || scrollRatio > 0.9) {
                    sectionInfos[currentSectionNum].refs.text_3.style.opacity = 0;
                };
                break;
            case 2:
                // canvas video
                currentFrame = calculator.calcCurrFrame(scrollRatio, sectionInfos[currentSectionNum].videoImgInfo.totalImgCount);
                animator.animateVideoImg(currentFrame, sectionInfos[currentSectionNum].refs.context, sectionInfos[currentSectionNum].refs.videoImgs);

                if (scrollRatio >= 0 && scrollRatio <= 0.05) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0, 0.05);
                    const element = sectionInfos[currentSectionNum].refs.canvas;

                    animator.animateOpacityIn(element, partScrollRatio);
                } else if (scrollRatio >= 0.95 && scrollRatio <= 1) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.95, 1);
                    const element = sectionInfos[currentSectionNum].refs.canvas;

                    animator.animateOpacityOut(element, partScrollRatio);
                } else if (scrollRatio > 0.05 && scrollRatio < 0.95) {
                    sectionInfos[currentSectionNum].refs.canvas.style.opacity = 1;
                };

                // text-0
                if (scrollRatio >= 0.2 && scrollRatio <= 0.3) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.2, 0.3);
                    const element = sectionInfos[currentSectionNum].refs.text_0;

                    animator.animateOpacityIn(element, partScrollRatio);

                    const translateY_start = 20;
                    const translateY_end = 0;
                    animator.animateTranslateY_in(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio >= 0.35 && scrollRatio <= 0.4) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.35, 0.4);
                    const element = sectionInfos[currentSectionNum].refs.text_0;

                    animator.animateOpacityOut(element, partScrollRatio);

                    const translateY_start = 0;
                    const translateY_end = -20;
                    animator.animateTranslateY_out(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio < 0.2 || scrollRatio > 0.4) {
                    sectionInfos[currentSectionNum].refs.text_0.style.opacity = 0;
                };

                // text-1
                if (scrollRatio >= 0.6 && scrollRatio <= 0.7) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.6, 0.7);
                    const element = sectionInfos[currentSectionNum].refs.text_1;

                    animator.animateOpacityIn(element, partScrollRatio);

                    const translateY_start = 10;
                    const translateY_end = 0;
                    animator.animateTranslateY_in(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio >= 0.7 && scrollRatio <= 0.75) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.7, 0.75);
                    const element = sectionInfos[currentSectionNum].refs.text_1;

                    animator.animateOpacityOut(element, partScrollRatio);

                    const translateY_start = 0;
                    const translateY_end = -10;
                    animator.animateTranslateY_out(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio < 0.6 || scrollRatio > 0.75) {
                    sectionInfos[currentSectionNum].refs.text_1.style.opacity = 0;
                };

                // pin-1
                if (scrollRatio >= 0.6 && scrollRatio <= 0.7) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.6, 0.7);
                    const element = sectionInfos[currentSectionNum].refs.pin_1;
                    const heightStart = 0;
                    const heightEnd = 100;
                    animator.animatePinScaleY(element, partScrollRatio, heightStart, heightEnd);
                };

                // text-2
                if (scrollRatio >= 0.8 && scrollRatio <= 0.9) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.8, 0.9);
                    const element = sectionInfos[currentSectionNum].refs.text_2;

                    animator.animateOpacityIn(element, partScrollRatio);

                    const translateY_start = 10;
                    const translateY_end = 0;
                    animator.animateTranslateY_in(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio >= 0.9 && scrollRatio <= 0.95) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.9, 0.95);
                    const element = sectionInfos[currentSectionNum].refs.text_2;

                    animator.animateOpacityOut(element, partScrollRatio);

                    const translateY_start = 0;
                    const translateY_end = -10;
                    animator.animateTranslateY_out(element, partScrollRatio, translateY_start, translateY_end);
                } else if (scrollRatio < 0.8 || scrollRatio > 0.95) {
                    sectionInfos[currentSectionNum].refs.text_2.style.opacity = 0;
                };

                // pin-2
                if (scrollRatio >= 0.8 && scrollRatio <= 0.9) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, 0.8, 0.9);
                    const element = sectionInfos[currentSectionNum].refs.pin_2;
                    const heightStart = 0;
                    const heightEnd = 100;
                    animator.animatePinScaleY(element, partScrollRatio, heightStart, heightEnd);
                };
                break;
            case 3:
                const canvas = sectionInfos[currentSectionNum].refs.canvas;
                const context = sectionInfos[currentSectionNum].refs.context
                const section = sectionInfos[currentSectionNum].refs.section;
                const blendImgs = sectionInfos[currentSectionNum].refs.blendImgs;
                const text_1 = sectionInfos[currentSectionNum].refs.text_1;

                // animator.animateVideoImg(0, context, blendImgs);

                // Calculate scrollRatio range for each parts
                // Part 1
                const part_1_start = 0;
                const part_1_end = window.innerHeight / section.scrollHeight;
                // Part 2
                const part_2_start = part_1_end;
                const part_2_end = (window.innerHeight * 2) / section.scrollHeight;
                // Part 3
                const part_3_start = part_2_end;
                const part_3_end = (window.innerHeight * 3) / section.scrollHeight;
                // Part 4
                const part_4_start = part_3_end;
                // Part 5
                const part_5_start = part_4_start + 0.07;

                // Animate each part
                // Part 1
                if (scrollRatio > part_1_start && scrollRatio < part_1_end) {
                    canvas.style.width = '100vw';
                    canvas.style.height = '100vh';
                    canvas.style.transform = 'scale(1)';
                    canvas.style.marginTop = '0';
                    canvas.classList.remove('section-3__canvas--fixed');
                    text_1.style.opacity = '0';
                    text_1.style.transform = 'translateY(0)';

                    animator.animateVideoImg(0, context, blendImgs);
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, part_1_start, part_1_end);
                    animator.animateBlendImgWidth(canvas, partScrollRatio, 50, 100);
                };
                // Part 2
                if (scrollRatio > part_2_start && scrollRatio < part_2_end) {
                    canvas.style.width = '100vw';
                    canvas.style.height = '100vh';
                    canvas.style.transform = 'scale(1)';
                    canvas.style.marginTop = '0';
                    canvas.classList.add('section-3__canvas--fixed');
                    text_1.style.opacity = '0';
                    text_1.style.transform = 'translateY(0)';

                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, part_2_start, part_2_end);
                    animator.animateBlendImg(partScrollRatio, canvas, context, 1, blendImgs, 0, canvas.height);
                };
                // Part 3
                if (scrollRatio > part_3_start && scrollRatio < part_3_end) {
                    canvas.style.width = '100vw';
                    canvas.style.height = '100vh';
                    canvas.style.transform = 'scale(1)';
                    canvas.style.marginTop = '0';
                    canvas.classList.add('section-3__canvas--fixed');
                    animator.animateVideoImg(1, context, blendImgs);
                    text_1.style.opacity = '0';
                    text_1.style.transform = 'translateY(0)';
                    

                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, part_3_start, part_3_end);
                    animator.animateBlendImgScale(canvas, partScrollRatio, 1, 0.6);
                };
                // Part 4
                if (scrollRatio > part_4_start) {
                    canvas.classList.remove('section-3__canvas--fixed');
                    canvas.style.marginTop = `${window.innerHeight * 2}px`;
                    text_1.style.opacity = '0';
                    text_1.style.transform = 'translateY(0)';
                };

                // Last paragraph
                if (scrollRatio > part_5_start) {
                    const partScrollRatio = calculator.calcPartScrollRatio(yOffset, currentSectionNum, scrollRatio, part_5_start, part_5_start + 0.05);
                    
                    animator.animateOpacityIn(text_1, partScrollRatio);
                    text_1.style.transform = 'translateY(-20%)';
                    text_1.style.transition = 'transform 1s ease-in-out';
                };
                break;
        };
    });
};
main();