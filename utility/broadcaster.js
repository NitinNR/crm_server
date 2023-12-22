const cron = require('node-cron');
const broadcastModel = require("../models/broadcast.model");
const app = require("../models/app.model");
const label = require("../models/label.model");
const desk = require("../models/desk.model");

const bullmq = require("../utility/mybull")

const { getWaCloudChannelByFilter } = require("../models/channel.model")

//
const { sendMessage, getAccountTemplates,getAccountTemplateByID } = require("./whatsappscript")

function scheduleJob(cronSchedule) {
  cron.schedule(cronSchedule, () => {
    console.log('Running a task with cron schedule:', cronSchedule);
  });
}

function scheduleWhatsAppBroadCast(cronSchedule, account_id, broadcastId, source) {
  cron.schedule(cronSchedule, () => {
    console.log(`Running at ${new Date()} a task broadcastId : ${broadcastId}`);
    doPreperation(account_id, broadcastId, source)
  });
  // doPreperation(account_id, broadcastId, source)

}

function doPreperation(account_id, broadcastId, source) {
  // crm Applications details to get the space_id

  if (source === "Application") {
    app.GetApp(account_id, (ack, data) => {
      if (ack) {
        if (data.length === 1) {
          const space_id = data[0].configs.AccountID

          // Broadacst details from which to get the tags
          get_broadcast_details(account_id, broadcastId, async (ack, broadcast_details) => {

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
                  // get the contacts details based on the tags
                  desk.get_contacts_based_on_tags(account_id, space_id, tags, (ack, data) => {
                    if (ack && data.length > 0) {
                      contacts = data
                      sendWhatsApp(account_id, space_id, contacts, broadcast_details, 0)
                    } else {
                      console.log("eeeeeeeeeeeeetttttttt");
                      console.log(ack, data);
                    }
                  })

                } else if (broadcast_details.audience_type === 1) {
                  console.log("custome contacts");
                  contacts = broadcast_details.audience
                  contacts = contacts.split(",")
                  sendWhatsApp(account_id, space_id, contacts, broadcast_details, 1)
                } else {
                  sendWhatsApp(account_id, space_id, contacts, broadcast_details, 2)
                }

              } else {
                console.log("schedule time updated ----------------");
              }
            }

          })

        }
      }
    })

  } else if (source === "Channel") {

    get_broadcast_details(account_id, broadcastId, async (ack, broadcast_details) => {

      // console.log("broadcast_details:", broadcast_details);
      if (ack) {
        const currentTime = new Date().getTime()
        const schedule_date = broadcast_details.schedule_at;

        const currentDateTime = new Date(currentTime).setSeconds(0, 0)
        const scheduleDateTime = new Date(schedule_date).setSeconds(0, 0)

        // if (currentDateTime === scheduleDateTime) {
        if (scheduleDateTime) {
          console.log("going for schedule");
          let contacts = null;
          if (broadcast_details.audience_type === 0) {
            console.log("get tag based contacts");
            const tags = broadcast_details.audience.split(",")

            // get tag ids from thier name
            label.findLabels(account_id, tags, (label_ids) => {
              if (label_ids.status) {
                let tag_ids = label_ids.data;
                tag_ids = `(${tag_ids.map(tag_idobj => { return `'${tag_idobj.id}'` })})`;
                label.get_tag_based_users_only(account_id, tag_ids, async (data) => {
                  if (data.status) {

                    // credentials fetch from db here, one time
                    const getcreds = await getWaCloudChannelByFilter(account_id, [{ column: "provider", value: "\"WhatsApp Cloud\"", action: "eq" }])
                    if (!getcreds.status) return

                    const phone_number_id = getcreds.data.provider_config.phoneNumberID;
                    const whatsapp_account_id = getcreds.data.provider_config.businessAccID;
                    const access_token = getcreds.data.provider_config.ApiKey;

                    const TemplateNameAndCode = await getAccountTemplateByID(broadcast_details.template_id,access_token);
                    if(!TemplateNameAndCode) return;

                    const creds = { phone_number_id, access_token };
                    const contacts = data.data.users;
                    const bmq = new bullmq(`${account_id}-${broadcastId}-whamsg`);
                    contacts.forEach(async contact => {
                      const template_code = TemplateNameAndCode.language;
                      const template_name = TemplateNameAndCode.name;
                      await bmq.addJob({ contact, account_id, broadcastId, creds,template_code,template_name }, { delay: 1000 })
                    });


                    // bmq.start();
                  }
                })

              } else {
                console.log(">>>>>couldn't found tag ids");
              }



            });
          } else if (broadcast_details.audience_type === 1) {
            console.log("custome contacts");
            contacts = broadcast_details.audience
            contacts = contacts.split(",")
            sendWhatsApp(account_id, space_id, contacts, broadcast_details, 1)
          } else {
            sendWhatsApp(account_id, space_id, contacts, broadcast_details, 2)
          }

        } else {
          console.log("schedule time updated ----------------");
          return;
        }
      } else {
        return;
      }

    })

  }



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


function sendWhatsApp(admin_id, space_id, contacts, broadcast_details, contacts_type) {

  desk.get_whatsapp_channel_details(admin_id, space_id, async (ack, configs) => {
    if (ack) {
      const account_provider_configs = configs[0].provider_config;
      const account_configs = configs[0];

      const phone_number_id = account_provider_configs.phone_number_id;
      const api_key = account_provider_configs.api_key;
      const template_id = broadcast_details.template_id;
      const template_attrs = broadcast_details.template_attrs;
      const template = account_configs.message_templates.filter((template) => template.id === `${template_id}`)[0];
      const template_name = template.name
      const code = template.language

      if (contacts_type === 0) {
        for (let i = 0; i < contacts.length; i++) {
          sendMessage(phone_number_id, api_key, template_name, template_attrs, code, contacts[i].phone_number)
        }
      } else if (contacts_type === 1) {
        for (let i = 0; i < contacts.length; i++) {
          sendMessage(phone_number_id, api_key, template_name, template_attrs, code, contacts[i])
        }
      } else {
        console.log("sending to alll");
        // send to all
        for await (const dataChunk of getDataChunks(admin_id, space_id)) {
          dataChunk?.data.forEach(contact => {
            sendMessage(phone_number_id, api_key, template_name, template_attrs, code, contact.phone_number)
          });
          await new Promise(resolve => setTimeout(resolve, 6000));

        }
      }
    }
  })
}

async function* getDataChunks(admin_id, space_id) {
  let offset = 0;
  // let repeat = 0;
  const chunksize = 50;
  let hasMore = true

  // while (hasMore && repeat < 3) {
  while (hasMore) {
    const dataChunk = await desk.get_all_contacts(admin_id, space_id, offset, chunksize)
    if (dataChunk?.data.length > 0) {
      // repeat += 1;
      yield dataChunk
      offset += chunksize

    } else {
      hasMore = false
    }

  }
}

module.exports = { scheduleJob, scheduleWhatsAppBroadCast };
