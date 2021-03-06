/**
* @license
* Copyright Baidu Inc. All Rights Reserved.
*
* This source code is licensed under the Apache License, Version 2.0; found in the
* LICENSE file in the root directory of this source tree.
*/

/**
 * @file bdml's file's base elements <audio>
 * @author  raowenjuan(raowenjuan@baidu.com)
 *          mabin(mabin03@baidu.com)
 */

import style from './index.css';
import {attrValBool, formatTime, privateKey} from '../utils';

export default {
    constructor(props) {
        this.timer = null;
        this.audio = null;
        this.src = null;
    },

    initData() {
        return {
            id: this.id,
            src: '',
            controls: false,
            loop: false,
            poster: '',
            author: '未知作者',
            name: '未知音频',
            [privateKey]: {
                currentTime: '00:00',
                playState: 0
            }
        };
    },

    computed: {

        /**
         * 根据播放状态修改播放按钮的 className
         * @return {string} playStateClassName
         */
        playStateClassName() {
            return `${this.data.get(`${privateKey}.playState`) === 1 ? style.playing : style.pause}`;
        },

        /**
         * 根据控件显示状态修改组件的 className
         * @return {string} audioShowClassName
         */
        audioShowClassName() {
            return attrValBool(this.data.get('controls')) ? '' : style.hide;
        },

        /**
         * 创建私有属性，供模板使用
         * @return {Object} provideData
         */
        provideData() {
            return this.data.get(privateKey);
        }
    },

    template: `<swan-audio class="${style['swan-audio-common']} {{audioShowClassName}}"
        id="{{id}}"
        author="{{author}}"
        name="{{name}}"
        poster="{{poster}}"
        src="{{src}}"
        controls="{{controls}}"
        loop="{{loop}}">
        <div class="${style['swan-audio-wrapper']}">
            <div class="${style['swan-audio-left']}">
                <div class="${style.imgwrap}">
                    <img s-if="poster && poster.length" src="{{poster}}"/>
                    <span class="{{playStateClassName}}" on-click="onClick($event)"></span>
                </div>
                <div class="${style['swan-audio-songinfo']}">
                    <p class="${style['swan-audio-title']}">{{name}}</p>
                    <p class="${style['swan-audio-name']}">{{author}}</p>
                </div>
            </div>
            <div class="${style['swan-audio-right']}">{{provideData.currentTime}}</div>
        </div>
    </swan-audio>`,

    /**
     * 组件创建
     */
    attached() {
        this.audio = new global.Audio();
        this.audio.onerror = e => {
            const code = e.srcElement.error.code;
            let msg = '';
            switch (code) {
                case 1: msg = 'MEDIA_ERR_ABORTED';
                    break;
                case 2: msg = 'MEDIA_ERR_NETWORK';
                    break;
                case 3: msg = 'MEDIA_ERR_DECODE';
                    break;
                case 4: msg = 'MEDIA_ERR_SRC_NOT_SUPPORTED';
            }
            this.dispatchEvent('binderror', {
                detail: {
                    errMsg: msg,
                    code
                }
            });
        };
        this.audio.onload = e => {
            this.dispatchEvent('bindload', {
                detail: {
                    msg: 'load audio resource'
                }
            });
        };
    },

    /**
     * 组件销毁
     */
    detached() {
        if (this.audio) {
            this.audio.pause();
            this.timer = null;
            this.audio = null;
            this.src = null;
        }
    },

    /**
     * 响应数据变化
     */
    slaveRendered() {
        this.nextTick(() => {
            const src = this.data.get('src');
            if (src !== this.src && this.audio) {
                this.audio.pause();
                this.data.set(`${privateKey}.currentTime`, '00:00');
                this.audio = new global.Audio();
                this.audio.src = src;
                this.src = src;
                this.onended()
                    .onplay()
                    .onpause()
                    .ontimeupdate();
            }
        });
    },

    /**
     * 播放结束
     *
     * @return {Object} 链式调用对象
     */
    onended() {
        const loop = this.data.get('loop');
        this.audio.onended = () => {
            this.data.set(`${privateKey}.playState`, 0);
            this.getEndTime();
            if (attrValBool(loop)) {
                this.audio.play();
            }
            this.dispatchEvent('bindended', {
                detail: {
                    duration: this.audio.duration
                }
            });
        };
        return this;
    },

    /**
     * 播放
     *
     * @return {Object} 链式调用对象
     */
    onplay() {
        this.audio.onplay = () => {
            this.data.set(`${privateKey}.playState`, 1);
            this.getCurrentTime();
            this.dispatchEvent('bindplay', {
                detail: {
                    duration: this.audio.duration
                }
            });
        };
        return this;
    },

    /**
     * 暂停
     *
     * @return {Object} 链式调用对象
     */
    onpause() {
        this.audio.onpause = () => {
            this.data.set(`${privateKey}.playState`, 0);
            this.getEndTime();
            this.dispatchEvent('bindpause', {
                detail: {
                    duration: this.audio.duration
                }
            });
        };
        return this;
    },

    /**
     * 更新时间当前播放时刻和剩余时间
     *
     * @return {Object} 链式调用对象
     */
    ontimeupdate() {
        this.audio.ontimeupdate = () => {
            this.dispatchEvent('bindtimeupdate', {
                detail: {
                    currentTime: this.audio.currentTime,
                    duration: this.audio.duration
                }
            });
        };
        return this;
    },

    /**
     * 计算当前播放时间
     */
    getCurrentTime() {
        this.timer = setInterval(() => {
            this.data.set(`${privateKey}.currentTime`, formatTime(Math.floor(this.audio.currentTime)));
        }, 1000);
    },

    /**
     * 停止设置当前播放时间
     */
    getEndTime() {
        clearInterval(this.timer);
    },

    /**
     * 播放按钮点击事件处理器
     *
     * @param {Event} $event 事件对象
     */
    onClick($event) {
        if (this.data.get(`${privateKey}.playState`) === 1) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
    }
};
