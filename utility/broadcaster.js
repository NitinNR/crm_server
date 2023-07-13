const cron = require('node-cron');
const broadcastModel = require("../models/broadcast.model");
const app = require("../models/app.model");
const desk = require("../models/desk.model");



//
const { sendMessage } = require("./whatsappscript")

function scheduleJob(cronSchedule) {
  cron.schedule(cronSchedule, () => {
    console.log('Running a task with cron schedule:', cronSchedule);
  });
}

function scheduleWhatsAppBroadCast(cronSchedule, account_id, broadcastId) {
  cron.schedule(cronSchedule, () => {
    console.log(`Running at ${new Date()} a task broadcastId : ${broadcastId}`);
    doPreperation(account_id, broadcastId)
  });
}

function doPreperation(account_id, broadcastId) {
  // crm Applications details to get the space_id
  app.GetApp(account_id, (ack, data) => {
    if (ack) {
      if (data.length === 1) {
        const space_id = data[0].configs.AccountID

        // Broadacst details from which to get the tags
        get_broadcast_details(account_id, broadcastId, (ack, broadcast_details) => {

          // console.log("broadcast_details:", broadcast_details);
          if (ack) {
            const currentTime = new Date().getTime()
            const schedule_date = broadcast_details.schedule_at;

            const currentDateTime = new Date(currentTime).setSeconds(0, 0)
            const scheduleDateTime = new Date(schedule_date).setSeconds(0, 0)

            if (currentDateTime === scheduleDateTime) {
              console.log("going for schedule");
              let contacts = null;
              if (broadcast_details.audience_type === 0) {
                  console.log("get tag based contacts");
                  const tags = broadcast_details.audience.split(",")
                  console.log("space_id tags:",space_id,tags);
                  // get the contacts details based on the tags
                  desk.get_contacts_based_on_tags(account_id,space_id, tags, (ack, data) => {
                    if (ack && data.length > 0) {
                      contacts = data
                      sendWhatsApp(account_id,space_id, contacts, broadcast_details,0)
                    }else{
                      console.log("eeeeeeeeeeeeetttttttt");
                      console.log(ack,data);
                    }
                  })

              } else {
                  console.log("custome contacts");
                  contacts = broadcast_details.audience
                  contacts = contacts.split(",")
                  sendWhatsApp(account_id,space_id, contacts, broadcast_details,1)
              }

            } else {
              console.log("schedule time updated ----------------");
            }
          }

        })

      }
    }
  })


  function get_broadcast_details(account_id, broadcastId, callback) {

    broadcastModel.get_broadcast(account_id, broadcastId, (ack, data) => {
      if (ack && data.length === 1) {
        const broadcast_data = data[0]
        return callback(true, broadcast_data)
      } else {
        return callback(false, [])
      }
    })

  }

}


function sendWhatsApp(admin_id,space_id, contacts, broadcast_details,contacts_type) {

  console.log("===========contacts=========:",contacts);

  desk.get_whatsapp_channel_details(admin_id,space_id, (ack, configs) => {
    if (ack) {
      const account_provider_configs = configs[0].provider_config;
      const account_configs = configs[0];

      const phone_number_id = account_provider_configs.phone_number_id;
      const api_key = account_provider_configs.api_key;
      const template_id = broadcast_details.template_id;
      const template = account_configs.message_templates.filter((template) => template.id === `${template_id}`)[0];
      const template_name = template.name
      const code = template.language

      if(contacts_type === 0){
        for (let i = 0; i < contacts.length; i++) {
          console.log(phone_number_id, api_key, template_name, code, contacts[i].phone_number);
          sendMessage(phone_number_id,api_key,template_name,code,contacts[i].phone_number)
        }
      }else{
        for (let i = 0; i < contacts.length; i++) {
          sendMessage(phone_number_id,api_key,template_name,code,contacts[i])
        }
      }
    }
  })
}

module.exports = { scheduleJob, scheduleWhatsAppBroadCast };
