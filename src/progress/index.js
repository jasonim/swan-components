/**
* @license
* Copyright Baidu Inc. All Rights Reserved.
*
* This source code is licensed under the Apache License, Version 2.0; found in the
* LICENSE file in the root directory of this source tree.
*/

/**
 * @file bdml's file's base elements <progress>
 * @author qiaolin(qiaolin@baidu.com)
 *         lijiahui(lijiahui02@baidu.com)
 *         jiamiao(jiamiao@baidu.com)
 * @date 2018/6/5
 */
import style from './index.css';
import {attrValBool} from '../utils';

export default {

    behaviors: ['userTouchEvents', 'noNativeBehavior'],

    initData() {
        return {
            active: false,
            percent: 0,
            width: 0,
            showInfo: false, // 是否展示文字信息
            strokeWidth: 2, // 滚动条宽度
            backgroundColor: '#e6e6e6', // 背景色
            activeColor: '', // 前景色
            color: '#09BB07', // 默认前景色
            animationStyle: '', // @private 用来设置进度条动画的属性
            activeMode: 'backwards' // backwards: 动画从头播；forwards：动画从上次结束点接着播
        };
    },

    template: `<swan-progress>
        <div class="${style['progress-bar']}"
        showInfo="{{showInfo}}"
        style="background-color: {{backgroundColor}}"
        active="{{active}}"
        percent="{{percent}}">
            <div class="${style['progress-inner-bar']}"
            style="height:{{strokeWidth + 'px'}};
            width:{{width}};background-color:{{activeColor || color}};{{animationStyle}}"></div>
        </div>
        <div style="{{showInfo && showInfo !== 'false' ? '' : 'display:none;'}}"
            class="${style['progress-info']}">
            {{percent + '%'}}
        </div>
        </swan-progress>`,

    attached() {
        let boolActive = attrValBool(this.data.get('active'));
        this.percentChange(this.data.get('percent'), boolActive);
        this.watch('percent', val => {
            // 重置progress宽度进行动画
            this.data.set('animationStyle', '');
            // 上一次的percent值
            const prePercent = parseInt(this.data.get('width').slice(0, -1), 10);
            // 当前的percent值
            const currentPercent = this.data.get('percent');
            // 若activeMode设置为forwards且当前改变的值比上一次的值小，则没有动画，直接返回到当前的数值，只有大于时才有动画
            const isNeedActive = this.data.get('activeMode') === 'forwards' ? currentPercent > prePercent : true;
            // 只有当activeMode为backwards时，每次变动要重置进度条从0开始
            if (this.data.get('activeMode') === 'backwards') {
                this.data.set('width', 0 + '%');
            }
            this.percentChange(val, boolActive && isNeedActive);
        });
    },

    /**
     * 对传入的percent数据进行矫正
     * @param {string} percent 进度条百分比
     * @param {boolean} active  是否需要动画
     */
    percentChange(percent, active) {
        if (percent > 100) {
            percent = 100;
        } else if (percent < 0) {
            percent = 0;
        }
        this.activeAnimation(percent, active);
    },

    /**
     * progress 动画处理函数
     * @param {string} percent 进度条百分比
     * @param {boolean} active  是否需要动画
     */
    activeAnimation(percent, active) {
        let that = this;
        // setData 无cb的兼容方法，解决单progress change 的粘黏问题
        setTimeout(() => {
            if (active && !isNaN(percent)) {
                that.data.set('animationStyle', 'transition:width 2s;');
            }
            that.data.set('width', percent + '%');
        }, 0);
    }
};
