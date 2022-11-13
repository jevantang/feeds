/*!
 * Fresns 微信小程序 (https://fresns.org)
 * Copyright 2021-Present Jarvis Tang
 * Licensed under the Apache-2.0 license
 */
import Api from '../../api/api';
import { base64_encode } from '../../libs/base64/base64';
import { globalInfo } from '../../configs/fresnsGlobalInfo';
import { getConfigItemValue } from '../../api/tool/replace-key';

const LoginType = {
    WeChat: '0',
    Password: '1',
    VerifyCode: '2',
};

const Type = {
    Mobile: '0',
    Email: '1',
};

Page({
    mixins: [require('../../mixin/themeChanged')],
    data: {
        loginType: LoginType.WeChat,
        type: Type.Mobile,

        // 邮箱地址
        emailAddress: '',

        // 手机相关信息
        mobileAreaRange: [],
        mobileAreaIndex: null,
        mobileNumber: '',

        // 密码
        password: '',

        // 验证码
        verifyCode: '',
        // 验证码等待中
        isVerifyCodeWaiting: false,
        waitingRemainSeconds: 60,
    },
    onLoad: async function (options) {
        const [defaultCode, codeArray] = await Promise.all([
            getConfigItemValue('send_sms_default_code'),
            getConfigItemValue('send_sms_supported_codes'),
        ]);
        this.setData({
            mobileAreaRange: codeArray,
            mobileAreaIndex: codeArray.indexOf(defaultCode + ''),
        });
    },
    onLoginTypeChange: function (e) {
        this.setData({
            loginType: e.detail.value,
        });
    },
    onTypeChange: function (e) {
        this.setData({
            type: e.detail.value,
            password: '',
        });
    },
    onEmailAddressChange: function (e) {
        const value = e.detail.value;
        this.setData({
            emailAddress: value,
        });
        return value;
    },
    onMobileAreaPickerChange: function (e) {
        const idxStr = e.detail.value;
        this.setData({
            mobileAreaIndex: +idxStr,
        });
    },
    onMobileNumberChange: function (e) {
        const value = e.detail.value;
        this.setData({
            mobileNumber: value,
        });
        return value;
    },
    onPasswordChange: function (e) {
        const value = e.detail.value;
        this.setData({
            password: value,
        });
        return value;
    },
    onVerifyCodeChange: function (e) {
        const value = e.detail.value;
        this.setData({
            verifyCode: value,
        });
        return value;
    },
    sendVerifyCode: async function (e) {
        const {
            type,
            emailAddress,
            mobileAreaRange,
            mobileAreaIndex,
            mobileNumber,
            isVerifyCodeWaiting,
            waitingRemainSeconds,
        } = this.data;
        if (isVerifyCodeWaiting) {
            wx.showToast({
                title: `发送冷却中 ${waitingRemainSeconds}s`,
                icon: 'none',
            });
            return;
        }

        let params = null;
        if (type === Type.Email) {
            params = {
                type: 1,
                useType: 2,
                templateId: 7,
                account: emailAddress,
            };
        }
        if (type === Type.Mobile) {
            params = {
                type: 2,
                useType: 2,
                templateId: 7,
                account: mobileNumber,
                countryCode: +mobileAreaRange[mobileAreaIndex],
            };
        }

        const sendVerifyRes = await Api.info.infoSendVerifyCode(params);
        if (sendVerifyRes.code === 0) {
            this.setData({ isVerifyCodeWaiting: true, waitingRemainSeconds: 60 });

            const interval = setInterval(() => {
                const now = this.data.waitingRemainSeconds - 1;
                this.setData({
                    waitingRemainSeconds: now,
                    isVerifyCodeWaiting: now > 0,
                });
                if (now <= 0) {
                    clearInterval(interval);
                }
            }, 1000);

            wx.showToast({
                title: '验证码发送成功',
                icon: 'none',
            });
        }
    },
    onSubmit: async function () {
        const { loginType, type, emailAddress, mobileAreaRange, mobileAreaIndex, mobileNumber, password, verifyCode } =
            this.data;
        let params = null;

        if (loginType === LoginType.Password) {
            if (type === Type.Email) {
                params = {
                    type: 1,
                    account: emailAddress,
                    password: base64_encode(password),
                };
            }
            if (type === Type.Mobile) {
                params = {
                    type: 2,
                    account: mobileNumber,
                    countryCode: +mobileAreaRange[mobileAreaIndex],
                    password: base64_encode(password),
                };
            }
        }
        if (loginType === LoginType.VerifyCode) {
            if (type === Type.Email) {
                params = {
                    type: 1,
                    account: emailAddress,
                    verifyCode: verifyCode,
                };
            }
            if (type === Type.Mobile) {
                params = {
                    type: 2,
                    account: mobileNumber,
                    countryCode: +mobileAreaRange[mobileAreaIndex],
                    verifyCode: verifyCode,
                };
            }
        }

        const isLogin = await globalInfo.login(params);
        if (isLogin) {
            // const pages = getCurrentPages()
            // pages[pages.length - 2].onLoad();
            // wx.navigateBack()
        } else {
            wx.showToast({
                title: '登录失败，请稍后重试',
                icon: 'none',
            });
        }
    },
});