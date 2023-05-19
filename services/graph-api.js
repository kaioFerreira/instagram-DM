/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Instagram For Original Coast Clothing
 *
 */

"use strict";

// Import dependencies
const axios = require('axios');
const config = require("./config"),
  fetch = require("node-fetch"),
  {
    URL,
    URLSearchParams
  } = require("url");

module.exports = class GraphApi {
  static async callSendApi(requestBody) {
    // console.log("requestBody", requestBody);

    const url = `${config.apiUrl}/me/messages`;
    const params = new URLSearchParams({
      access_token: config.pageAccesToken
    });
    let idMessage = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      params: params
    })
      .then(response => {
        // Manipule a resposta aqui
        console.log('SEND Response kaio', response.data.message_id);
        return response.data.message_id;
      })
      .catch(error => {
        // Manipule erros aqui
        console.error(error);
      });
      
    return idMessage;

    if (!response.ok) {
      console.warn(`Could not sent message.`, response);
    }

  }

  static async getUserProfile(senderIgsid) {
    let url = new URL(`${config.apiUrl}/${senderIgsid}`);
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken,
      fields: "name, username, profile_pic"
    });
    let response = await fetch(url);
    if (response.ok) {
      let userProfile = await response.json();
      // console.log('[userProfile - KAIO]', userProfile);
      return {
        name: userProfile.name,
        username: userProfile.username,
        profile_pic: userProfile.profile_pic
      };
    } else {
      console.warn(
        `Could not load profile for ${senderIgsid}: ${response.statusText}`
      );
      return null;
    }
  }

  static async setIcebreakers(iceBreakers) {
    let url = new URL(`${config.apiUrl}/me/messenger_profile`);
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken
    });

    let json = {
      platform: "instagram",
      ice_breakers: iceBreakers
    };

    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    });

    if (response.ok) {
      console.log(`Icebreakers foram definidos.`);
    } else {
      console.warn(`Erro ao configurar os Icebreakers`, response);
    }
  }

  static async setPersistentMenu(persistentMenu) {
    let url = new URL(`${config.apiUrl}/me/messenger_profile`);
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken
    });
    let json = {
      platform: "instagram",
      persistent_menu: persistentMenu
    };
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    });
    if (response.ok) {
      console.log(`Persistent Menu has been set.`);
    } else {
      console.warn(`Error setting Persistent Menu`, response.statusText);
    }
  }

  static async setPageSubscriptions() {
    let url = new URL(`${config.apiUrl}/${config.pageId}/subscribed_apps`);
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken,
      subscribed_fields: "feed"
    });
    let response = await fetch(url, {
      method: "POST"
    });
    if (response.ok) {
      console.log(`Page subscriptions have been set.`);
    } else {
      console.warn(`Error setting page subscriptions`, response.statusText);
    }
  }
};