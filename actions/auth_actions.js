import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
    ACCOUNT_CREATED,
    BAD_PASSWORD,
    CHANGE_SERVER_STATUS_TEXT,
    CLIENT_SECRET,
    CLIENT_ID,
    CHANGE_LANG,
    SUBMIT_START,
    SERVER_STATUS,
    LOGIN_OR_SIGNUP_RESET,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    USER_FOUND,
    USERNAME_CHANGED,
    TOGGLE_USERNAME_MODAL,
    SUBMIT_END,
    STORE_CURRENT_APP_VERSION,
    ON_SEEN_FEATURE_TOUR,
    URL
} from './types';
import axios from 'axios';

export const changeLang = lang => {
    return {
        type: CHANGE_LANG,
        payload: lang
    };
};

/**
 * Check if the token is valid
 *
 * It will return "valid" if the user is logged in
 *
 * Or  "Unauthenticated." if they are logged out / not valid
 */
export const checkValidToken = token => {
    return async dispatch => {
        await axios({
            url: URL + '/api/validate-token',
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token,
                Accept: 'application/json'
            }
        })
            .then(response => {
                console.log('checkValidToken.response', response.data);

                if (
                    response.data.hasOwnProperty('message') &&
                    response.data.message === 'valid'
                ) {
                    dispatch({
                        type: 'TOKEN_IS_VALID',
                        payload: true
                    });
                }
            })
            .catch(error => {
                console.log(error);
                //  token is critical data
                // for any type of error that occurs during validating token
                // we should mark token as invalid
                dispatch({
                    type: 'TOKEN_IS_VALID',
                    payload: false
                });
            });
    };
};

export const storeCurrentAppVersion = text => {
    return {
        type: STORE_CURRENT_APP_VERSION,
        payload: text
    };
};

export const onSeenFeatureTour = text => {
    return {
        type: ON_SEEN_FEATURE_TOUR,
        payload: text
    };
};

/****
 *** CHECK IF TOKEN EXISTS - log in
 **  - fired on AuthScreen componentDidMount
 */

export const checkForToken = () => async dispatch => {
    console.log('auth_actions - checkForToken');
    let jwt;

    try {
        jwt = await AsyncStorage.getItem('jwt');
    } catch (e) {
        console.log('Error getting token - check for token');
    }

    if (jwt) {
        console.log('auth_actions - token exists');
        // Dispatch an action, login success
        await dispatch({ type: LOGIN_SUCCESS, payload: jwt });
    } else {
        console.log('auth_actions - token not found');
        return null;
    }
};

/**
 * Create an Account
 */
export const createAccount = data => {
    // console.log('action - attempting to create an account');
    return async dispatch => {
        // setting isSubmitting to true
        // shows loader on button
        dispatch({ type: SUBMIT_START });
        let response;

        try {
            response = await axios(URL + '/api/register', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                data: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'password',
                    username: data.username,
                    email: data.email,
                    password: data.password
                }
            });
        } catch (error) {
            let payload;
            console.log(JSON.stringify(error?.response?.data.errors));
            if (error?.response) {
                const errorData = error?.response?.data.errors;
                if (errorData?.email) {
                    payload = errorData?.email;
                } else if (errorData?.username) {
                    payload = errorData?.username;
                } else if (errorData?.password) {
                    payload = errorData?.password;
                } else {
                    payload = 'Something wwent wrong, please try again';
                }

                dispatch({
                    type: SERVER_STATUS,
                    payload: payload
                });
                return;
            } else {
                dispatch({
                    type: SERVER_STATUS,
                    payload:
                        'Network error, please check internet connection and try again'
                });
                return;
            }
        }
    };
};

/**
 * Reset the property for isButtonPressed
 */
export const loginOrSignupReset = () => {
    // console.log('action - login or signup reset');
    return {
        type: LOGIN_OR_SIGNUP_RESET
    };
};

/**
 * The user wants to log out.
 *
 * First, delete the auth token
 *
 * This action will call many reducers
 */
export const logout = () => {
    AsyncStorage.clear();

    // delete user from AsyncStorage?
    // state is reset on Logout => user: null
    return {
        type: LOGOUT
    };
};

/**
 * Change the text of serverStatusText
 *
 * @param text: string
 */
export const changeServerStatusText = text => {
    return {
        type: CHANGE_SERVER_STATUS_TEXT,
        payload: text
    };
};

/**
 * The user forgot their password and is submitting their email address to request a link
 */
export const sendResetPasswordRequest = email => {
    return dispatch => {
        // setting isSubmitting to true
        // shows loader on button
        dispatch({ type: SUBMIT_START });
        return axios(URL + '/api/password/email', {
            method: 'POST',
            data: {
                email: email,
                api: true // we need this to override the response
            },
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log('sendResetPasswordRequest', response.data);

                if (
                    response.data.message ===
                    'We have emailed your password reset link!'
                ) {
                    // setting isSubmitting to false
                    dispatch({ type: SUBMIT_END });
                    return {
                        success: true
                    };
                }
            })
            .catch(error => {
                console.log('sendResetPasswordRequest', error.response.data);

                if (
                    error.response.data.message ===
                    'The given data was invalid.'
                ) {
                    // setting isSubmitting to false
                    dispatch({ type: SUBMIT_END });
                    return {
                        success: false,
                        msg: error.response.data.errors.email // We can't find a user with that email address
                    };
                }

                return {
                    success: false,
                    msg: 'error'
                };
            });
    };
};

/**
 * A user is trying to login with email and password
 */
export const serverLogin = data => {
    return async dispatch => {
        // initial dispatch to show form isSubmitting state
        dispatch({ type: SUBMIT_START });
        // axios response
        let response;
        // jwt
        let token;
        try {
            response = await axios(URL + '/oauth/token', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                data: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'password',
                    username: data.email,
                    password: data.password
                }
            });
            if (response?.status === 200) {
                token = response?.data?.access_token;

                // save jwt to AsyncStore if status is 200
                try {
                    await AsyncStorage.setItem('jwt', token);
                } catch (error) {
                    console.log('serverLogin.saveJWT', error);
                    throw 'Unable to save token to asyncstore';
                }
            } else {
                throw 'Something went wront';
            }
        } catch (error) {
            if (error?.response) {
                if (error?.response?.status === 400) {
                    // handling wrong password response from backend
                    dispatch({ type: BAD_PASSWORD });
                    return;
                } else {
                    // handling other errors from backend and thrown from try block
                    dispatch({
                        type: LOGIN_FAIL,
                        payload: 'Login Unsuccessful. Please try again.'
                    });
                    return;
                }
            } else {
                // Handling network error
                dispatch({
                    type: LOGIN_FAIL,
                    payload:
                        'Network error, please check internet connection and try again'
                });
                return;
            }
        }
        // Dispatch success if no errors
        dispatch({ type: LOGIN_SUCCESS, payload: token });
        dispatch(fetchUser(token));
    };
};

export const toggleUsernameModal = () => {
    return {
        type: TOGGLE_USERNAME_MODAL
    };
};

/**
 * Make an API request to fetch the current user with an access token
 *
 * Todo - move this to axios, and use await
 */
export const fetchUser = token => {
    return async dispatch => {
        await fetch(URL + '/api/user', {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
            .then(response => {
                // console.log(response);
                // console.log(response.data);
                if (response.status === 200) {
                    // console.log("=== fetchUser - 200 ===");
                    const responseJson = response
                        .text() // returns a promise
                        .then(async responseJson => {
                            const userObj = JSON.parse(responseJson);

                            dispatch({
                                type: USER_FOUND,
                                payload: { userObj, token }
                            });
                            // INFO: no need to manually navigate -- handled in mainRoutes.js
                        })
                        .catch(error => {
                            // console.log('fetch user - error 2');
                            // console.log(error);
                        });
                } else {
                    // response.status not 200
                    const errorJson = response.text().then(async errorJson => {
                        const errorObj = JSON.parse(errorJson);
                        // console.log('Error object');
                        // console.log(errorObj);
                    });
                }
            })
            .catch(err => {
                // console.log('error 1');
                // console.log(err);
            });
    };
};

/**
 * User found in AsyncStorage - update state props
 */
export const userFound = data => {
    // console.log("action - user found");
    return {
        type: USER_FOUND,
        payload: data
    };
};

/**
 * Update the username
 */
export const usernameChanged = text => {
    return {
        type: USERNAME_CHANGED,
        payload: text
    };
};

/**
 * TO DO - FACEBOOK LOGIN
 */

// AsyncStorage.setItem('fbtoken', token);
// AsyncStorage.getItem('fbtoken');
// export const facebookLogin = () => async dispatch => {
//   try {
//     let token = await AsyncStorage.getItem("token");
//   } catch (e) {
//     console.log("error getting token, facebookLogin");
//   }
//   if (token) {
//     // Dispatch an action, login success
//     dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
//   } else {
//     // Start up Login process - helper
//     doFacebookLogin(dispatch);
//     // login(dispatch);
//   }
// }

// helper function
// async action
// 1. open login screen
// 2. wait for login success
// doFacebookLogin = async dispatch => {
//   let { type, token } = await Facebook.logInWithReadPermissionsAsync('2064390957175459', {
//     permissions: ['public_profile']
//   });
//
//   console.log(" === facebook login type ===");
//   console.log(type);
//
//   if (type === 'cancel') {
//     return dispatch({ type: FACEBOOK_LOGIN_FAIL });
//   }
//
//   await AsyncStorage.setItem("token", token);
//   dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
// }
