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
const axios = require("axios");
const {
  v4: uuidv4
} = require('uuid');

const Curation = require("./curation"),
  Order = require("./order"),
  Response = require("./response"),
  Care = require("./care"),
  Survey = require("./survey"),
  GraphApi = require("./graph-api"),
  i18n = require("../i18n.config");

const CONTROLDESK_HOST = process.env.CONTROLDESK_HOST
module.exports = class Receive {
  constructor(user, webhookEvent) {
    this.user = user;
    this.user.name === undefined ? this.user.name = this.user.username : null;
    // console.log("USER.name", this.user);
    this.webhookEvent = webhookEvent;
  }

  // Envia Mensagem
  async sendMessageUser() {

    let event = this.webhookEvent;

    let type = event.message?.attachment?.type !== undefined 
      ? event.message.attachment.type : event.message.type;

      
    console.log("EVENT", type);

    if (type !== 'text') {
      
      console.log("VEIO UM ", type);
      //console.log("event.message.tipo", event.message.attachment.type);
      //console.log("event.message.url", event.message.attachment.payload.url);

      let response = {
        attachment:
          {
            type: event.message.attachment.type,
            payload:
              {
                url: event.message.attachment.payload.url
              },
          }
      };
      this.sendMessage(response, 5);
    } else {
      console.log("VEIO UM TEXTO");

      let response = {
        text: event.message.text
      };
      return await this.sendMessage(response, 5);
    }

  }

  // Check if the event is a message or postback and
  // call the appropriate handler function
  async handleMessage() {
    let event = this.webhookEvent;

    // console.log("handleMessage", event);
    let responses;

    try {
      if (event.message) {
        let message = event.message;

        if (message.is_echo) {
          return;
        } else if (message.quick_reply) {
          responses = this.handleQuickReply();
        } else if (message.attachments) {
          responses = await this.handleAttachmentMessage();
        } else if (message.reply_to) {
          console.log("RESPOSTA DE STORY");
          responses = await this.handleReplyToMessage();
        } else if (message.text) {
          responses = this.handleTextMessage();
        }
      } else if (event.postback) {
        responses = this.handlePostback();
      } else if (event.referral) {
        responses = this.handleReferral();
      }
    } catch (error) {
      console.error(error);
      responses = {
        text: `An error has occured: '${error}'. We have been notified and \
         will fix the issue shortly!`
      };
    }

    console.log("RESPONNNNNNNNNNNNNNNNSE", responses);
    if (!responses) {
      return;
    }
    console.log("RESPONNNNNNNNNNNNNNNNSE", responses);

    if (Array.isArray(responses)) {
      let delay = 0;
      for (let response of responses) {
        this.sendMessage(response, delay * 2000);
        delay++;
      }
    } else {
      this.sendMessage(responses);
    }
  }

  /* 
    IG kaio: 5902033573149872 
    IG UltraFoco: 17841409546930920 

    Messenger kaio: 5651039768280043
    Messenger UltraFoco: 114738226879078
  */

  // Handles messages events with text
  handleTextMessage(empresa) {
    // console.log(`Received text from User: '${this.user.name}' Id: (${this.user.id}) \nMessage: ${this.webhookEvent.message.text}`);

    let message = this.webhookEvent.message.text.trim().toLowerCase();

    let response = undefined;

    if(!empresa){
      if (
        message.includes("start over") ||
        message.includes("get started") ||
        message.includes("hi")
      ) {
        response = Response.genNuxMessage(this.user);
      } else if (Number(message)) {
        // Assume numeric input ("123") to be an order number
        response = Order.handlePayload("ORDER_NUMBER");
      } else if (message.includes("#")) {
        // Input with # is treated as a suggestion
        response = Survey.handlePayload("CSAT_SUGGESTION");
      } else if (message.includes(i18n.__("care.help").toLowerCase())) {
        let care = new Care(this.user, this.webhookEvent);
        response = care.handlePayload("CARE_HELP");
      } else if (message.includes("alertaVirtual")) {
        response = [
          Response.genText(
            i18n.__("fallback.any", {
              message: this.webhookEvent.message.text
            })
          ),
          Response.genText(i18n.__("get_started.guidance")),
          Response.genQuickReply(i18n.__("get_started.help"), [{
              title: i18n.__("menu.suggestion"),
              payload: "CURATION"
            },
            {
              title: i18n.__("menu.help"),
              payload: "CARE_HELP"
            },
            {
              title: i18n.__("menu.start_over"),
              payload: "GET_STARTED"
            }
          ])
        ];
      }
    }

    // console.log("KAIO RESPONSE", response);
    /*{
       empresa_id: '4',
       phone: '556294767640',
       bot: true,
       mensagem: 'Já vamos começar o atendimento. Mas primeiro, preciso fazer algumas perguntas.\n' +
         '\n' +
         '*Você já é nosso cliente?* Aperte em um destes botões abaixo!<br>Sim eu sou!<br>Ainda nao.<br>',
       bot_url: 'http://127.0.0.1:5001',
       channel: '1',
       url: null,
       lat: null,
       lng: null
     }*/

    // Aciona o BackEnd pra adicionar a mensagem ao control
    console.log('this.webhookEvent.bot', this.webhookEvent);
    let bot = this.webhookEvent.bot ? this.webhookEvent.bot : false
    let channel = 401 // id da fila
    let tipo = "text"
    let idInterno = uuidv4()
    let url = null // url do arquivo caso exista 
    let atendente = null // id do atendente
    let fila = 2
    let lat = null
    let lng = null
    let phone = null

    let _data = {
      empresa_id: 18,
      phone,
      bot,
      mensagem: this.webhookEvent.message.text.trim(),
      bot_url: "http://dev.controldesk.com.br:5007",
      channel,
      atendente: atendente,
      fila,
      cliente: this.user.name,
      tipo,
      id_interno: idInterno,
      url,
      lat,
      lng,
      celular: null,
      timestamp: null,
      options: [],
      instagram_id: this.user.id,
      platform_id: 1,
      profile_pic: this.user.profile_pic,
    }

    if (empresa) {
      _data['celular'] = 1
    }

    console.log('Execute AXIOS');
    axios({
      method: 'post',
      url: `${CONTROLDESK_HOST}/api/hook`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: _data
    }).then().catch((err) => console.error('Erro ao mandar msg para o controldesk', err));
    console.log('Finish AXIOS');

    return response;
  }
  // Handle mesage events with attachments
  async handleAttachmentMessage() {

    // Get the attachment
    let attachment = this.webhookEvent.message.attachments[0];
    console.log("Received attachment:", `${attachment} for ${this.user.id}`);

    // Aciona o BackEnd pra adicionar a mensagem ao control
    console.log('this.webhookEvent.bot', this.webhookEvent.bot);
    let bot = this.webhookEvent.bot ? this.webhookEvent.bot : false
    let channel = 401 // id da fila
    let tipo = this.webhookEvent.message.attachments[0].type === 'image' ? 'img' : this.webhookEvent.message.attachments[0].type
    let idInterno = uuidv4()

    let url = `${this.webhookEvent.message.attachments[0].payload.url}` // url do arquivo caso exista 

    console.log("URLL", url);
    
    let atendente = null // id do atendente
    let fila = 2
    let lat = null
    let lng = null
    let phone = null

    let _data = {
      empresa_id: 18,
      phone,
      bot,
      mensagem: null,
      bot_url: "http://dev.controldesk.com.br:5007",
      channel,
      atendente: atendente,
      fila,
      cliente: this.user.name,
      tipo,
      id_interno: idInterno,
      url,
      lat,
      lng,
      celular: null,
      timestamp: null,
      options: [],
      instagram_id: this.user.id,
      platform_id: 1,
      profile_pic: this.user.profile_pic
    }

    console.log('Execute AXIOS ARQUIVO');
    axios({
      method: 'post',
      url: `${CONTROLDESK_HOST}/api/hook`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: _data
    }).then().catch((err) => console.error('Erro ao mandar msg para o controldesk', err));
    console.log('Finish AXIOS ARQUIVO');

    return;
  }

  // Handle mesage events with attachments
  async handleReplyToMessage() {

    // Get the attachment
    let reply_to = this.webhookEvent.message.reply_to.id;
    console.log("Received ReplyTo:", `${reply_to} for ${this.user.id}`);

    // Aciona o BackEnd pra adicionar a mensagem ao control
    console.log('this.webhookEvent.bot', this.webhookEvent.bot);
    let bot = this.webhookEvent.bot ? this.webhookEvent.bot : false
    let channel = 401 // id da fila
    let tipo = 'reply_to'
    let idInterno = uuidv4()

    let url = `${this.webhookEvent.message.reply_to.story.url}` // url do arquivo caso exista 
    let texto = `${this.webhookEvent.message.text}` // texto da resposta do story 

    console.log("URLL ReplyTo", url);
    console.log("TEXTO ReplyTo", texto);
    
    let atendente = null // id do atendente
    let fila = 2
    let lat = null
    let lng = null
    let phone = null

    let _data = {
      empresa_id: 18,
      phone,
      bot,
      mensagem: texto,
      bot_url: "http://dev.controldesk.com.br:5007",
      channel,
      atendente: atendente,
      fila,
      cliente: this.user.name,
      tipo,
      id_interno: idInterno,
      url,
      lat,
      lng,
      celular: null,
      timestamp: null,
      options: [],
      instagram_id: this.user.id,
      platform_id: 1,
      profile_pic: this.user.profile_pic
    }

    console.log('Execute AXIOS REPLY TO');
    axios({
      method: 'post',
      url: `${CONTROLDESK_HOST}/api/hook`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: _data
    }).then().catch((err) => console.error('Erro ao mandar msg para o controldesk', err));
    console.log('Finish AXIOS REPLY TO');

    return;
  }

  // Handle mesage events with quick replies
  handleQuickReply() {
    // Get the payload of the quick reply
    let payload = this.webhookEvent.message.quick_reply.payload;

    return this.handlePayload(payload);
  }

  // Handle postbacks events
  handlePostback() {
    let postback = this.webhookEvent.postback;

    // Check for the special Get Starded with referral
    let payload;
    if (postback.referral && postback.referral.type == "OPEN_THREAD") {
      payload = postback.referral.ref;
    } else {
      // Get the payload of the postback
      payload = postback.payload;
    }
    return this.handlePayload(payload.toUpperCase());
  }

  // Handles referral events
  handleReferral() {
    // Get the payload of the postback
    let payload = this.webhookEvent.referral.ref.toUpperCase();

    return this.handlePayload(payload);
  }

  handlePayload(payload) {
    // console.log(`Received Payload: ${payload} for user ${this.user.id}`);

    let response;

    // Set the response based on the payload
    if (
      payload === "GET_STARTED" ||
      payload === "DEVDOCS" ||
      payload === "GITHUB"
    ) {
      response = Response.genNuxMessage(this.user);
    } else if (payload.includes("CURATION") || payload.includes("COUPON")) {
      let curation = new Curation(this.user, this.webhookEvent);
      response = curation.handlePayload(payload);
    } else if (payload.includes("CARE")) {
      let care = new Care(this.user, this.webhookEvent);
      response = care.handlePayload(payload);
    } else if (payload.includes("ORDER")) {
      response = Order.handlePayload(payload);
    } else if (payload.includes("CSAT")) {
      response = Survey.handlePayload(payload);
    } else {
      response = {
        text: `This is a default postback message for payload: ${payload}!`
      };
    }

    return response;
  }

  handlePrivateReply(type, object_id) {
    // NOTE: For production, private replies must be sent by a human agent.
    // This code is for illustrative purposes only.

    let requestBody = {
      recipient: {
        [type]: object_id
      },
      message: Response.genText(i18n.__("private_reply.post")),
      tag: "HUMAN_AGENT"
    };

    GraphApi.callSendApi(requestBody);
  }

  async sendMessage(response, delay = 0) {
    // Check if there is delay in the response
    if ("delay" in response) {
      delay = response["delay"];
      delete response["delay"];
    }

    // Construct the message body
    let requestBody = { 
      recipient: {
        id: this.user.id
      },
      message: response
    };

    return await GraphApi.callSendApi(requestBody);
    console.log('idMsgSend', idMsgSend);
  }
};